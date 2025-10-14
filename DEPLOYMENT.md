# Ghar Ka Khana - Deployment Guide

This guide explains how to deploy your Ghar Ka Khana application to your server automatically.

## Server Information
- **Server IP**: 45.76.60.120
- **Username**: root
- **Deployment Path**: /var/www/gharkakhanarva.com

## Quick Start

### Option 1: Password Authentication (Recommended)

#### Install sshpass (Required for password authentication)

**macOS:**
```bash
brew install hudochenkov/sshpass/sshpass
```

**Ubuntu/Debian:**
```bash
sudo apt-get install sshpass
```

**CentOS/RHEL:**
```bash
sudo yum install sshpass
```

#### Deploy with Password
```bash
./deploy-password.sh
```

### Option 2: SSH Key Authentication

#### 1. Setup SSH Key (One-time setup)

Run the SSH setup script to configure passwordless authentication:

```bash
./setup-ssh.sh
```

This will:
- Generate an SSH key if you don't have one
- Help you copy it to your server
- Test the connection

#### 2. Deploy Your Application

##### Option A: Simple Deployment
```bash
./deploy.sh
```

##### Option B: Advanced Deployment (Recommended)
```bash
./deploy-advanced.sh
```

## Deployment Scripts

### 1. `deploy-password.sh` - Password-based Deployment (Recommended)
- **No SSH key setup required**
- Prompts for password once per deployment
- Builds the project
- Creates backup with current date (MM-DD-YYYY format)
- Deploys to server using SCP
- Sets proper permissions
- Simple and reliable

### 2. `deploy.sh` - Basic SSH Key Deployment
- Builds the project
- Creates backup with current date (MM-DD-YYYY format)
- Deploys to server
- Sets proper permissions
- Requires SSH key setup

### 3. `deploy-advanced.sh` - Advanced SSH Key Deployment
- All features of basic deployment
- Progress indicators
- Better error handling
- Automatic cleanup of old backups (keeps 7 days)
- Website accessibility testing
- Command line options
- Requires SSH key setup

#### Advanced Script Options:
```bash
./deploy-advanced.sh --help           # Show help
./deploy-advanced.sh --no-backup      # Skip backup creation
./deploy-advanced.sh --no-build       # Use existing build
./deploy-advanced.sh --test-only      # Test connection only
```

### 4. `setup-ssh.sh` - SSH Key Setup
- Generates SSH key if needed
- Helps configure server authentication
- Tests connection

## What Happens During Deployment

### Backup Process
1. Creates a backup folder: `/var/www/gharkakhanarva.com/backup/MM-DD-YYYY/`
2. Creates a compressed backup of all files except the backup folder itself
3. Backup filename format: `backup_YYYY-MM-DD_HH-MM-SS.tar.gz`

### Deployment Process
1. **Build**: Runs `npm run build` to create production files
2. **Backup**: Creates timestamped backup of current site
3. **Upload**: Syncs build files to server using rsync
4. **Permissions**: Sets proper file permissions (755) and ownership
5. **Verification**: Checks that key files exist on server
6. **Cleanup**: Removes backups older than 7 days

## File Structure on Server

```
/var/www/gharkakhanarva.com/
├── backup/
│   └── MM-DD-YYYY/
│       ├── backup_YYYY-MM-DD_HH-MM-SS.tar.gz
│       └── ...
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── other build files...
```

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection
ssh root@45.76.60.120

# If password is required, run setup again
./setup-ssh.sh
```

### Build Issues
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Permission Issues
```bash
# Fix permissions on server
ssh root@45.76.60.120
cd /var/www/gharkakhanarva.com
chmod -R 755 .
chown -R www-data:www-data .
```

### Website Not Loading
1. Check if files are uploaded: `ssh root@45.76.60.120 "ls -la /var/www/gharkakhanarva.com/"`
2. Check web server configuration
3. Restart web server: `ssh root@45.76.60.120 "systemctl restart nginx"` (or apache)

## Security Notes

- SSH keys are stored in `~/.ssh/id_rsa`
- Backups are stored on the server in the backup folder
- Old backups are automatically cleaned up after 7 days
- The deployment scripts exclude sensitive files like `.env`

## Manual Deployment (if scripts fail)

1. Build locally:
   ```bash
   npm run build
   ```

2. Create backup on server:
   ```bash
   ssh root@45.76.60.120
   cd /var/www/gharkakhanarva.com
   tar -czf backup_$(date +%Y-%m-%d).tar.gz --exclude=backup .
   ```

3. Upload files:
   ```bash
   rsync -avz dist/ root@45.76.60.120:/var/www/gharkakhanarva.com/
   ```

4. Set permissions:
   ```bash
   ssh root@45.76.60.120 "cd /var/www/gharkakhanarva.com && chmod -R 755 . && chown -R www-data:www-data ."
   ```

## Support

If you encounter issues:
1. Check the error messages in the deployment output
2. Verify SSH connection: `ssh root@45.76.60.120`
3. Check server disk space: `ssh root@45.76.60.120 "df -h"`
4. Review web server logs: `ssh root@45.76.60.120 "tail -f /var/log/nginx/error.log"`
