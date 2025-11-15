# MongoDB Setup Guide

## Installation

### Windows
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB will be installed to `C:\Program Files\MongoDB\Server\<version>\bin`
4. Add to PATH or use full path

### Mac
```bash
brew tap mongodb/brew
brew install mongodb-community
```

### Linux
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# Or use official MongoDB repository
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

## Start MongoDB

### Windows
```bash
# As a service (default)
net start MongoDB

# Or manually
"C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" --dbpath="C:\data\db"
```

### Mac
```bash
brew services start mongodb-community
```

### Linux
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Verify Installation

```bash
mongod --version
mongo --version  # or mongosh for newer versions
```

## Connection String

Default connection string:
```
mongodb://localhost:27017/treasury
```

Update in `backend/.env`:
```env
DATABASE_URL=mongodb://localhost:27017/treasury
```

## MongoDB Compass (GUI)

Download from: https://www.mongodb.com/products/compass

Useful for:
- Viewing collections
- Querying data
- Managing indexes
- Monitoring performance

## Collections Created

The app will automatically create:
- `users` - User accounts
- `organizations` - Treasury organizations
- `departments` - Department data
- `transactions` - Transaction history
- `wallets` - User wallet balances

## Troubleshooting

### Port 27017 already in use
```bash
# Find process
netstat -ano | findstr :27017  # Windows
lsof -i :27017  # Mac/Linux

# Kill process or change port in mongod.conf
```

### Permission errors
```bash
# Create data directory
mkdir -p /data/db  # Linux/Mac
mkdir C:\data\db  # Windows

# Set permissions (Linux/Mac)
sudo chown -R mongodb:mongodb /data/db
```

### Connection refused
- Check MongoDB is running
- Verify port 27017 is open
- Check firewall settings

