@echo off
echo ========================================
echo    AWS S3 Deployment Script
echo ========================================

set BUCKET_NAME=bits-event-portal

echo Building React app...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed!
    exit /b 1
)

echo Creating S3 bucket...
aws s3 mb s3://%BUCKET_NAME% --region us-east-1

echo Uploading files to S3...
aws s3 sync build/ s3://%BUCKET_NAME% --delete

echo Configuring website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document index.html

echo Setting bucket policy...
echo {^
    "Version": "2012-10-17",^
    "Statement": [^
        {^
            "Sid": "PublicReadGetObject",^
            "Effect": "Allow",^
            "Principal": "*",^
            "Action": "s3:GetObject",^
            "Resource": "arn:aws:s3:::%BUCKET_NAME%/*"^
        }^
    ]^
} > bucket-policy.json

aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://bucket-policy.json

echo.
echo ✅ Deployment complete!
echo 🌐 Your Event Portal is live at:
echo http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
echo.
pause
