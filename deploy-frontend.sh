#!/bin/bash

# BITS Pilani Teacher Portal - Frontend AWS Deployment Script
# This script deploys the React frontend to AWS S3 + CloudFront

set -e

# Configuration
BUCKET_NAME="bits-teacher-portal-frontend"
REGION="us-east-1"
CLOUDFRONT_COMMENT="BITS Teacher Portal Frontend"

echo "🚀 Starting BITS Teacher Portal Frontend Deployment to AWS..."

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured successfully"

# Build the React application
echo "📦 Building React application for production..."
npm run build

if [ ! -d "build" ]; then
    echo "❌ Build directory not found. Build failed."
    exit 1
fi

echo "✅ React application built successfully"

# Create S3 bucket for static website hosting
echo "🪣 Creating S3 bucket: $BUCKET_NAME"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null || echo "Bucket already exists"

# Configure bucket for static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Set bucket policy for public read access
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json

# Disable block public access
aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo "✅ S3 bucket configured for static website hosting"

# Upload build files to S3
echo "📤 Uploading build files to S3..."
aws s3 sync build/ s3://$BUCKET_NAME --delete --cache-control "public, max-age=31536000" --exclude "*.html"
aws s3 sync build/ s3://$BUCKET_NAME --delete --cache-control "public, max-age=0, must-revalidate" --include "*.html"

echo "✅ Files uploaded to S3 successfully"

# Create CloudFront distribution
echo "☁️ Creating CloudFront distribution..."

# Create CloudFront distribution configuration
cat > cloudfront-config.json << EOF
{
    "CallerReference": "teacher-portal-$(date +%s)",
    "Comment": "$CLOUDFRONT_COMMENT",
    "DefaultCacheBehavior": {
        "TargetOriginId": "$BUCKET_NAME-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "$BUCKET_NAME-origin",
                "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100",
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    }
}
EOF

# Create CloudFront distribution
DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --query 'Distribution.Id' --output text)
rm cloudfront-config.json

echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"

# Get CloudFront domain name
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)

# Get S3 website URL
S3_WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo ""
echo "🎉 Frontend Deployment Complete!"
echo "=================================="
echo "📊 Deployment Summary:"
echo "  • S3 Bucket: $BUCKET_NAME"
echo "  • S3 Website URL: $S3_WEBSITE_URL"
echo "  • CloudFront Distribution ID: $DISTRIBUTION_ID"
echo "  • CloudFront URL: https://$CLOUDFRONT_DOMAIN"
echo "  • Region: $REGION"
echo ""
echo "⏳ Note: CloudFront distribution may take 10-15 minutes to fully deploy"
echo "🔗 Your frontend will be accessible at: https://$CLOUDFRONT_DOMAIN"
echo ""
echo "🔧 Backend API: http://44.220.141.14:3001"
echo "📱 Frontend: https://$CLOUDFRONT_DOMAIN"
echo ""
echo "✅ BITS Pilani Teacher Portal is now fully deployed on AWS!"
