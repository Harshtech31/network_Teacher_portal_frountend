#!/bin/bash

# BITS Event Portal - AWS S3 Deployment Script
# Usage: ./deploy-aws.sh [bucket-name]

set -e

# Configuration
BUCKET_NAME=${1:-"bits-event-portal-$(date +%s)"}
REGION="us-east-1"
BUILD_DIR="build"

echo "🚀 BITS Event Portal Deployment"
echo "================================"
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "📦 Building React app..."
    npm install
    npm run build
fi

# Create S3 bucket
echo "📦 Creating S3 bucket..."
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb s3://$BUCKET_NAME --region $REGION
    echo "✅ Bucket created: $BUCKET_NAME"
else
    echo "ℹ️  Bucket already exists: $BUCKET_NAME"
fi

# Configure website hosting
echo "🌐 Configuring website hosting..."
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Create and apply bucket policy
echo "🔓 Setting bucket policy..."
cat > /tmp/bucket-policy.json << EOF
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

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json

# Upload files
echo "📤 Uploading files..."
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME --delete --cache-control "max-age=31536000,public" --exclude "*.html" --exclude "service-worker.js"
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME --delete --cache-control "max-age=0,no-cache,no-store,must-revalidate" --include "*.html" --include "service-worker.js"

# Get website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo ""
echo "✅ Deployment successful!"
echo "🌐 Website URL: $WEBSITE_URL"
echo "🔗 Backend API: http://54.197.165.209:3001/api/events"
echo ""
echo "📋 Next steps:"
echo "1. Test your website: $WEBSITE_URL"
echo "2. Update DNS if needed"
echo "3. Consider setting up CloudFront for better performance"
echo ""

# Save deployment info
echo "BUCKET_NAME=$BUCKET_NAME" > .deployment-info
echo "WEBSITE_URL=$WEBSITE_URL" >> .deployment-info
echo "DEPLOYED_AT=$(date)" >> .deployment-info

echo "💾 Deployment info saved to .deployment-info"
