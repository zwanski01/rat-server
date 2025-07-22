const crypto = require('crypto');

module.exports = {
  encryptData: (data, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(JSON.stringify(data));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString('base64');
  },

  decryptData: (data, key) => {
    const buffer = Buffer.from(data, 'base64');
    const iv = buffer.slice(0, 16);
    const encrypted = buffer.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  },

  validateEnv: () => {
    const required = ['TELEGRAM_TOKEN', 'ADMIN_CHAT_ID', 'ENCRYPTION_KEY'];
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
    
    // Validate encryption key length
    if (Buffer.from(process.env.ENCRYPTION_KEY, 'hex').length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes in hex format');
    }
  },

  generateKey: () => {
    return crypto.randomBytes(32).toString('hex');
  }
};