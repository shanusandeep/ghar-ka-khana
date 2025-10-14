#!/bin/bash

# Ghar Ka Khana - Password-based Deployment Script
# Server: 45.76.60.120
# Username: root
# Location: /var/www/gharkakhanarva.com

set -e  # Exit on any error

# Configuration
SERVER="45.76.60.120"
USERNAME="root"
REMOTE_PATH="/var/www/gharkakhanarva.com"
BACKUP_FOLDER="backup"
BUILD_FOLDER="dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get server password
get_password() {
    if [ -z "$SERVER_PASSWORD" ]; then
        echo -n "Enter password for $USERNAME@$SERVER: "
        read -s SERVER_PASSWORD
        echo
    fi
}

# Function to get current date in MM-DD-YYYY format
get_backup_date() {
    date +"%m-%d-%Y"
}

# Function to check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v ssh &> /dev/null; then
        print_error "SSH is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v scp &> /dev/null; then
        print_error "SCP is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install it first."
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# Function to build the project
build_project() {
    print_status "Building the project..."
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Build the project
    npm run build
    
    if [ ! -d "$BUILD_FOLDER" ]; then
        print_error "Build failed - $BUILD_FOLDER folder not found"
        exit 1
    fi
    
    print_success "Project built successfully"
}

# Function to create backup on server
create_backup() {
    print_status "Creating backup on server..."
    
    BACKUP_DATE=$(get_backup_date)
    BACKUP_PATH="$REMOTE_PATH/$BACKUP_FOLDER/$BACKUP_DATE"
    
    get_password
    
    # Create backup directory if it doesn't exist
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER" "mkdir -p $BACKUP_PATH"
    
    # Create backup excluding backup folder
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER" "
        cd $REMOTE_PATH
        if [ -d '$BACKUP_FOLDER' ]; then
            # Move backup folder temporarily
            mv $BACKUP_FOLDER ${BACKUP_FOLDER}_temp
        fi
        
        # Create backup of everything except backup folder
        tar -czf $BACKUP_PATH/backup_$BACKUP_DATE.tar.gz --exclude='$BACKUP_FOLDER*' --exclude='*.log' .
        
        # Restore backup folder
        if [ -d '${BACKUP_FOLDER}_temp' ]; then
            mv ${BACKUP_FOLDER}_temp $BACKUP_FOLDER
        fi
        
        echo 'Backup created successfully at $BACKUP_PATH/backup_$BACKUP_DATE.tar.gz'
    "
    
    print_success "Backup created: $BACKUP_PATH/backup_$BACKUP_DATE.tar.gz"
}

# Function to deploy to server
deploy_to_server() {
    print_status "Deploying to server..."
    
    get_password
    
    # Create a temporary tar file
    TEMP_TAR="temp_deploy_$(date +%s).tar.gz"
    
    print_status "Creating deployment package..."
    tar -czf "$TEMP_TAR" -C "$BUILD_FOLDER" .
    
    print_status "Uploading files to server..."
    sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no "$TEMP_TAR" "$USERNAME@$SERVER:$REMOTE_PATH/"
    
    print_status "Extracting files on server..."
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER" "
        cd $REMOTE_PATH
        tar -xzf $TEMP_TAR
        rm $TEMP_TAR
        chmod -R 755 .
        chown -R www-data:www-data . 2>/dev/null || chown -R nginx:nginx . 2>/dev/null || true
        echo 'Files extracted and permissions set'
    "
    
    # Clean up local temp file
    rm -f "$TEMP_TAR"
    
    print_success "Files uploaded and extracted successfully"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    get_password
    
    # Check if files exist on server
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER" "
        cd $REMOTE_PATH
        if [ -f 'index.html' ]; then
            echo 'index.html exists'
        else
            echo 'ERROR: index.html not found'
            exit 1
        fi
        
        if [ -d 'assets' ]; then
            echo 'assets directory exists'
        else
            echo 'WARNING: assets directory not found'
        fi
    "
    
    print_success "Deployment verification completed"
}

# Function to show deployment summary
show_summary() {
    BACKUP_DATE=$(get_backup_date)
    
    echo ""
    echo "=========================================="
    echo "           DEPLOYMENT SUMMARY"
    echo "=========================================="
    echo "Server: $SERVER"
    echo "Path: $REMOTE_PATH"
    echo "Backup Date: $BACKUP_DATE"
    echo "Backup Location: $REMOTE_PATH/$BACKUP_FOLDER/$BACKUP_DATE/"
    echo "Deployment Time: $(date)"
    echo "=========================================="
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    echo "You can access your site at: http://$SERVER"
    echo "Or your domain if configured."
}

# Main deployment function
main() {
    echo "=========================================="
    echo "    GHAR KA KHANA - DEPLOYMENT SCRIPT"
    echo "=========================================="
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Run deployment steps
    check_dependencies
    build_project
    create_backup
    deploy_to_server
    verify_deployment
    show_summary
}

# Handle script interruption
trap 'print_error "Deployment interrupted!"; exit 1' INT TERM

# Run main function
main "$@"
