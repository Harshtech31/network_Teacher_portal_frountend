#!/bin/bash

# BITS Pilani Teacher Portal - Frontend EC2 Deployment Script
# This script creates a new EC2 instance and deploys the React frontend

set -e

# Configuration
INSTANCE_NAME="bits-teacher-portal-frontend"
KEY_NAME="teacher-portal-frontend-key"
SECURITY_GROUP_NAME="teacher-portal-frontend-sg"
REGION="us-east-1"
AMI_ID="ami-0bb4c991fa89d4b9b"  # Amazon Linux 2023
INSTANCE_TYPE="t3.micro"

echo "🚀 Starting BITS Teacher Portal Frontend EC2 Deployment..."

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

# Create key pair for SSH access
echo "🔑 Creating key pair: $KEY_NAME"
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME --region $REGION &> /dev/null; then
    aws ec2 create-key-pair --key-name $KEY_NAME --region $REGION --query 'KeyMaterial' --output text > ${KEY_NAME}.pem
    chmod 400 ${KEY_NAME}.pem
    echo "✅ Key pair created: ${KEY_NAME}.pem"
else
    echo "✅ Key pair already exists: $KEY_NAME"
fi

# Create security group
echo "🛡️ Creating security group: $SECURITY_GROUP_NAME"
if ! aws ec2 describe-security-groups --group-names $SECURITY_GROUP_NAME --region $REGION &> /dev/null; then
    SECURITY_GROUP_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP_NAME \
        --description "Security group for BITS Teacher Portal Frontend" \
        --region $REGION \
        --query 'GroupId' --output text)
    
    # Add inbound rules
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $REGION
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $REGION
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $REGION
    
    echo "✅ Security group created: $SECURITY_GROUP_ID"
else
    SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --group-names $SECURITY_GROUP_NAME --region $REGION --query 'SecurityGroups[0].GroupId' --output text)
    echo "✅ Security group already exists: $SECURITY_GROUP_ID"
fi

# Launch EC2 instance
echo "🖥️ Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --count 1 \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SECURITY_GROUP_ID \
    --region $REGION \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
    --user-data file://frontend-user-data.sh \
    --query 'Instances[0].InstanceId' --output text)

echo "✅ EC2 instance launched: $INSTANCE_ID"

# Wait for instance to be running
echo "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --region $REGION --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

echo ""
echo "🎉 Frontend EC2 Instance Created Successfully!"
echo "=============================================="
echo "📊 Instance Details:"
echo "  • Instance ID: $INSTANCE_ID"
echo "  • Public IP: $PUBLIC_IP"
echo "  • Key Pair: ${KEY_NAME}.pem"
echo "  • Security Group: $SECURITY_GROUP_NAME"
echo "  • Region: $REGION"
echo ""
echo "🔗 SSH Access:"
echo "  ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP"
echo ""
echo "⏳ The instance is being configured automatically..."
echo "📱 Frontend will be available at: http://$PUBLIC_IP"
echo ""
echo "✅ Next steps:"
echo "  1. Wait 5-10 minutes for setup to complete"
echo "  2. SSH into the instance to deploy your frontend code"
echo "  3. Configure Nginx to serve the React build"
