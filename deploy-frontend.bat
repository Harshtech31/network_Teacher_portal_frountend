@echo off
echo ========================================
echo    BITS Event Portal - Frontend Deploy
echo ========================================
echo.

echo Building React app for production...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Please fix the errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo 📦 Your production files are ready in the 'build' folder
echo.
echo 🚀 Next steps for AWS S3 deployment:
echo.
echo 1. Go to AWS S3 Console
echo 2. Create bucket: bits-event-portal-frontend
echo 3. Enable static website hosting
echo    - Index document: index.html
echo    - Error document: index.html
echo 4. Upload all files from 'build' folder
echo 5. Set bucket policy for public access
echo 6. Your website will be available at:
echo    http://bits-event-portal-frontend.s3-website-us-east-1.amazonaws.com
echo.
echo 📋 Bucket policy to use:
echo {
echo     "Version": "2012-10-17",
echo     "Statement": [
echo         {
echo             "Sid": "PublicReadGetObject",
echo             "Effect": "Allow",
echo             "Principal": "*",
echo             "Action": "s3:GetObject",
echo             "Resource": "arn:aws:s3:::bits-event-portal-frontend/*"
echo         }
echo     ]
echo }
echo.
pause
