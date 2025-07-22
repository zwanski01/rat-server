# RAT Project - Remote Administration Tool

**Warning: This project is for educational purposes only. Unauthorized access to computer systems is illegal.**

## Overview
A Remote Administration Tool (RAT) with:
- Node.js command and control server
- Android client agent
- Telegram-based control interface

## Features
- Secure WebSocket communication with AES-256 encryption
- Remote command execution
- Device management
- File transfer capabilities
- Stealth operation
- Auto-start on device boot

## Server Setup
1. Create Telegram bot with [BotFather](https://t.me/botfather)
2. Copy your bot token and chat ID
3. Generate encryption key: `npm run keygen` in server directory
4. Create `.env` file based on `.env.example`
5. Install dependencies: `npm install`
6. Start server: `npm start`

## Android Client Setup
1. Open project in Android Studio
2. Update WebSocket URL in `MainService.kt`
3. Build and install on device: `./scripts/build-apk.sh`

## Deployment
- Server: Use `scripts/deploy.sh` for DigitalOcean
- Client: Use `scripts/build-apk.sh` to build APK

## Legal Notice
This software is provided for educational purposes only. The developer is not responsible for any misuse of this tool. Always obtain proper authorization before testing on any systems.
