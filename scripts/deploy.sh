#!/bin/bash
set -e

echo "Deploying RAT server to $SERVER_IP..."

# Transfer files
rsync -avz --delete -e ssh \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='files' \
  ./server/ $SERVER_USER@$SERVER_IP:$SERVER_DIR/

# Install dependencies and restart service
ssh $SERVER_USER@$SERVER_IP << EOF
  set -e
  cd $SERVER_DIR
  npm install --production
  pm2 restart rat-server || pm2 start server/src/app.js --name "rat-server"
EOF

echo "Deployment complete! Server running at:"
echo "http://$SERVER_IP"
echo "WebSocket: ws://$SERVER_IP"