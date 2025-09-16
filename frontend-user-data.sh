#!/bin/bash

# User data script for frontend EC2 instance
# This script runs automatically when the instance starts

# Update system
yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Git
yum install -y git

# Install Nginx
yum install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Create directory for the application
mkdir -p /opt/teacher-portal-frontend
cd /opt/teacher-portal-frontend

# Set permissions
chown -R ec2-user:ec2-user /opt/teacher-portal-frontend

# Configure Nginx for React app
cat > /etc/nginx/conf.d/teacher-portal.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /opt/teacher-portal-frontend/build;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Remove default Nginx config
rm -f /etc/nginx/conf.d/default.conf

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Log completion
echo "Frontend EC2 instance setup completed at $(date)" >> /var/log/setup.log
