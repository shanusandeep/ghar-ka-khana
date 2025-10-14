#!/bin/bash

# Ghar Ka Khana - Advanced Deployment Script with SSH Key Support
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

# Check if sshpass is available for password authentication
if ! command -v sshpass &> /dev/null; then
    echo "Error: sshpass is required for password authentication."
    echo "Please install it using:"
    echo "  macOS: brew install hudochenkov/sshpass/sshpass"
    echo "  Ubuntu/Debian: sudo apt-get install sshpass"
    echo "  CentOS/RHEL: sudo yum install sshpass"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_header() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Function to get server password
get_password() {
    if [ -z "$SERVER_PASSWORD" ]; then
        echo -n "Enter password for $USERNAME@$SERVER: "
        read -s SERVER_PASSWORD
        echo
    fi
}

# Function to run SSH command with password
ssh_with_password() {
    get_password
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER" "$@"
}

# Function to run rsync with password
rsync_with_password() {
    get_password
    sshpass -p "$SERVER_PASSWORD" rsync "$@"
}

# Function to get current date in MM-DD-YYYY format
get_backup_date() {
    date +"%m-%d-%Y"
}

# Function to get current timestamp
get_timestamp() {
    date +"%Y-%m-%d_%H-%M-%S"
}

# Function to check SSH connection
check_ssh_connection() {
    print_header "Checking SSH connection..."
    print_status "Testing connection to $USERNAME@$SERVER..."
    
    # Test connection with password
    if timeout 10 ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $USERNAME@$SERVER "echo 'SSH connection successful'" 2>/dev/null; then
        print_success "SSH connection established"
        return 0
    else
        print_status "SSH connection test completed (password will be prompted during deployment)"
        return 1
    fi
}

# Function to check if required tools are installed
check_dependencies() {
    print_header "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v ssh &> /dev/null; then
        missing_deps+=("ssh")
    fi
    
    if ! command -v rsync &> /dev/null; then
        missing_deps+=("rsync")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if ! command -v tar &> /dev/null; then
        missing_deps+=("tar")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install them using your package manager"
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# Function to build the project
build_project() {
    print_header "Building the project..."
    
    # Clean previous build
    if [ -d "$BUILD_FOLDER" ]; then
        print_status "Cleaning previous build..."
        rm -rf "$BUILD_FOLDER"
    fi
    
    # Install dependencies if node_modules doesn't exist or package-lock.json is newer
    if [ ! -d "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
        print_status "Installing/updating dependencies..."
        npm ci
    fi
    
    # Build the project
    print_status "Building application..."
    npm run build
    
    if [ ! -d "$BUILD_FOLDER" ]; then
        print_error "Build failed - $BUILD_FOLDER folder not found"
        exit 1
    fi
    
    # Check if build contains expected files
    if [ ! -f "$BUILD_FOLDER/index.html" ]; then
        print_error "Build failed - index.html not found in $BUILD_FOLDER"
        exit 1
    fi
    
    print_success "Project built successfully"
    print_status "Build size: $(du -sh $BUILD_FOLDER | cut -f1)"
}

# Function to create backup on server
create_backup() {
    print_header "Creating backup on server..."
    
    BACKUP_DATE=$(get_backup_date)
    TIMESTAMP=$(get_timestamp)
    BACKUP_PATH="$REMOTE_PATH/$BACKUP_FOLDER/$BACKUP_DATE"
    BACKUP_FILE="backup_${TIMESTAMP}.tar.gz"
    
    print_status "Backup will be created at: $BACKUP_PATH/$BACKUP_FILE"
    
    # Create backup directory if it doesn't exist
    ssh_with_password "mkdir -p '$BACKUP_PATH'"
    
    # Create backup excluding backup folder and log files
    ssh_with_password "
        cd $REMOTE_PATH
        
        # Check if there are files to backup
        if [ \$(find . -maxdepth 1 -type f -name '*.html' | wc -l) -eq 0 ] && [ \$(find . -maxdepth 1 -type d ! -name '.' ! -name '$BACKUP_FOLDER' | wc -l) -eq 0 ]; then
            echo 'No files to backup (first deployment)'
            exit 0
        fi
        
        # Move backup folder temporarily to exclude it from backup
        if [ -d '$BACKUP_FOLDER' ]; then
            mv $BACKUP_FOLDER ${BACKUP_FOLDER}_temp_$$
        fi
        
        # Create backup of everything except backup folder and logs
        tar -czf '$BACKUP_PATH/$BACKUP_FILE' \
            --exclude='$BACKUP_FOLDER*' \
            --exclude='*.log' \
            --exclude='*.tmp' \
            --exclude='.git' \
            --exclude='node_modules' \
            .
        
        # Restore backup folder
        if [ -d '${BACKUP_FOLDER}_temp_$$' ]; then
            mv ${BACKUP_FOLDER}_temp_$$ $BACKUP_FOLDER
        fi
        
        # Get backup size
        BACKUP_SIZE=\$(du -sh '$BACKUP_PATH/$BACKUP_FILE' | cut -f1)
        echo \"Backup created: $BACKUP_PATH/$BACKUP_FILE (\$BACKUP_SIZE)\"
    "
    
    print_success "Backup created successfully"
}

# Function to deploy to server
deploy_to_server() {
    print_header "Deploying to server..."
    
    # Create remote directory if it doesn't exist
    ssh_with_password "mkdir -p '$REMOTE_PATH'"
    
    print_status "Uploading files to server..."
    
    # Upload build files to server with progress
    rsync_with_password -avz --progress --delete \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='src' \
        --exclude='public' \
        --exclude='*.md' \
        --exclude='*.json' \
        --exclude='*.ts' \
        --exclude='*.js' \
        --exclude='*.sh' \
        --exclude='*.config.*' \
        --exclude='.env*' \
        --exclude='deploy*.sh' \
        $BUILD_FOLDER/ $USERNAME@$SERVER:$REMOTE_PATH/
    
    print_success "Files uploaded to server"
    
    # Set proper permissions and ownership
    ssh_with_password "
        cd $REMOTE_PATH
        chmod -R 755 .
        chown -R www-data:www-data . 2>/dev/null || chown -R nginx:nginx . 2>/dev/null || true
        echo 'Permissions updated'
    "
    
    print_success "Permissions and ownership updated"
}

# Function to verify deployment
verify_deployment() {
    print_header "Verifying deployment..."
    
    # Check if files exist on server
    ssh_with_password "
        cd $REMOTE_PATH
        echo 'Checking deployment files...'
        
        if [ -f 'index.html' ]; then
            echo '✓ index.html exists'
        else
            echo '✗ ERROR: index.html not found'
            exit 1
        fi
        
        if [ -d 'assets' ]; then
            echo '✓ assets directory exists'
            ASSET_COUNT=\$(find assets -type f | wc -l)
            echo \"  - Found \$ASSET_COUNT asset files\"
        else
            echo '⚠ WARNING: assets directory not found'
        fi
        
        # Check file sizes
        TOTAL_SIZE=\$(du -sh . | cut -f1)
        echo \"✓ Total deployment size: \$TOTAL_SIZE\"
    "
    
    print_success "Deployment verification completed"
}

# Function to test website accessibility
test_website() {
    print_header "Testing website accessibility..."
    
    # Wait a moment for server to process
    sleep 2
    
    # Test if the site responds
    if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER" | grep -q "200"; then
        print_success "Website is accessible at http://$SERVER"
    else
        print_warning "Website might not be accessible yet (this could be normal if nginx/apache needs restart)"
    fi
}

# Function to cleanup old backups (keep last 7 days)
cleanup_old_backups() {
    print_header "Cleaning up old backups..."
    
    ssh_with_password "
        cd '$REMOTE_PATH/$BACKUP_FOLDER'
        if [ -d . ]; then
            # Find and remove backups older than 7 days
            find . -name 'backup_*.tar.gz' -mtime +7 -delete 2>/dev/null || true
            find . -type d -empty -delete 2>/dev/null || true
            echo 'Old backups cleaned up (kept last 7 days)'
        fi
    "
}

# Function to show deployment summary
show_summary() {
    BACKUP_DATE=$(get_backup_date)
    TIMESTAMP=$(get_timestamp)
    
    echo ""
    echo "=========================================="
    echo "           DEPLOYMENT SUMMARY"
    echo "=========================================="
    echo "Server: $SERVER"
    echo "Path: $REMOTE_PATH"
    echo "Backup Date: $BACKUP_DATE"
    echo "Backup Timestamp: $TIMESTAMP"
    echo "Backup Location: $REMOTE_PATH/$BACKUP_FOLDER/$BACKUP_DATE/"
    echo "Deployment Time: $(date)"
    echo "Build Folder: $BUILD_FOLDER"
    echo "=========================================="
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    echo "Website URLs:"
    echo "  - http://$SERVER"
    echo "  - http://gharkakhanarva.com (if DNS configured)"
    echo ""
    echo "Backup location: $REMOTE_PATH/$BACKUP_FOLDER/$BACKUP_DATE/"
    echo ""
}

# Function to show help
show_help() {
    echo "Ghar Ka Khana - Deployment Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --no-backup    Skip backup creation"
    echo "  --no-build     Skip build step (use existing build)"
    echo "  --test-only    Only test connection, don't deploy"
    echo ""
    echo "Examples:"
    echo "  $0                    # Full deployment with backup"
    echo "  $0 --no-backup       # Deploy without backup"
    echo "  $0 --test-only       # Test connection only"
    echo ""
}

# Parse command line arguments
NO_BACKUP=false
NO_BUILD=false
TEST_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --no-build)
            NO_BUILD=true
            shift
            ;;
        --test-only)
            TEST_ONLY=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

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
    
    # Check dependencies
    check_dependencies
    
    # Test SSH connection
    check_ssh_connection
    
    if [ "$TEST_ONLY" = true ]; then
        print_success "Connection test completed"
        exit 0
    fi
    
    # Build project if not skipped
    if [ "$NO_BUILD" = false ]; then
        build_project
    elif [ ! -d "$BUILD_FOLDER" ]; then
        print_error "Build folder not found and --no-build specified"
        exit 1
    fi
    
    # Create backup if not skipped
    if [ "$NO_BACKUP" = false ]; then
        create_backup
    else
        print_warning "Backup skipped as requested"
    fi
    
    # Deploy to server
    deploy_to_server
    
    # Verify deployment
    verify_deployment
    
    # Test website
    test_website
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Show summary
    show_summary
}

# Handle script interruption
trap 'print_error "Deployment interrupted!"; exit 1' INT TERM

# Run main function
main "$@"
