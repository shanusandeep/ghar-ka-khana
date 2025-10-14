#!/bin/bash

# SSH Setup Script for Ghar Ka Khana Deployment
# This script helps you set up SSH key authentication for passwordless deployment

set -e

# Configuration
SERVER="45.76.60.120"
USERNAME="root"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "=========================================="
echo "    SSH KEY SETUP FOR DEPLOYMENT"
echo "=========================================="
echo ""

# Check if SSH key already exists
if [ -f "$SSH_KEY_PATH" ]; then
    print_warning "SSH key already exists at $SSH_KEY_PATH"
    echo "Would you like to:"
    echo "1) Use existing key"
    echo "2) Generate new key"
    echo "3) Exit"
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            print_status "Using existing SSH key"
            ;;
        2)
            print_status "Generating new SSH key..."
            ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N ""
            ;;
        3)
            print_status "Exiting setup"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
else
    print_status "SSH key not found. Generating new key..."
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N ""
    print_success "SSH key generated successfully"
fi

# Display public key
echo ""
print_status "Your public SSH key:"
echo "----------------------------------------"
cat "$SSH_KEY_PATH.pub"
echo "----------------------------------------"
echo ""

# Test connection
print_status "Testing SSH connection..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes $USERNAME@$SERVER "echo 'SSH connection successful'" 2>/dev/null; then
    print_success "SSH key authentication is already working!"
    echo ""
    print_status "You can now run the deployment script:"
    echo "  ./deploy.sh"
    echo "  or"
    echo "  ./deploy-advanced.sh"
    exit 0
fi

# Instructions for manual setup
print_warning "SSH key authentication is not yet configured on the server."
echo ""
echo "To complete the setup, please run ONE of the following commands:"
echo ""
echo "OPTION 1 - Copy key to server (recommended):"
echo "ssh-copy-id -i $SSH_KEY_PATH.pub $USERNAME@$SERVER"
echo ""
echo "OPTION 2 - Manual copy:"
echo "1. SSH to your server:"
echo "   ssh $USERNAME@$SERVER"
echo ""
echo "2. Create .ssh directory if it doesn't exist:"
echo "   mkdir -p ~/.ssh"
echo "   chmod 700 ~/.ssh"
echo ""
echo "3. Add your public key to authorized_keys:"
echo "   echo '$(cat $SSH_KEY_PATH.pub)' >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "4. Exit SSH and test:"
echo "   exit"
echo "   ssh $USERNAME@$SERVER"
echo ""

# Ask if user wants to try automatic copy
read -p "Would you like to try automatic key copy? (y/n): " auto_copy
if [[ "$auto_copy" =~ ^[Yy]$ ]]; then
    print_status "Attempting to copy SSH key to server..."
    if ssh-copy-id -i "$SSH_KEY_PATH.pub" $USERNAME@$SERVER; then
        print_success "SSH key copied successfully!"
        print_status "Testing connection..."
        if ssh -o ConnectTimeout=10 $USERNAME@$SERVER "echo 'SSH connection successful'"; then
            print_success "SSH key authentication is now working!"
            echo ""
            print_status "You can now run the deployment script:"
            echo "  ./deploy.sh"
            echo "  or"
            echo "  ./deploy-advanced.sh"
        else
            print_error "Connection test failed. Please check the manual setup instructions above."
        fi
    else
        print_error "Automatic key copy failed. Please follow the manual setup instructions above."
    fi
fi

echo ""
print_status "SSH setup completed. You may need to follow the manual instructions above."
