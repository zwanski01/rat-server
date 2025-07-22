🛡️ RAT Project - Remote Administration Tool
⚠️ Warning: This project is intended for educational purposes only. Unauthorized access to computer systems is illegal and unethical. Please use responsibly.

📖 Overview
This project develops a sophisticated Remote Administration Tool (RAT) designed for learning about cybersecurity, network communication, and system control. It comprises three core components:

Node.js Command and Control (C2) Server: The central hub for managing connected devices.

Android Client Agent: A stealthy agent deployed on target Android devices.

Telegram-based Control Interface: A convenient and secure way to interact with the RAT from anywhere.

✨ Features
The RAT project boasts a robust set of features engineered for secure and efficient remote administration:

🔒 Secure WebSocket Communication: All communications between the client and server are encrypted using AES-256, ensuring data confidentiality and integrity.

💻 Remote Command Execution: Execute commands on the remote Android device directly from the C2 server.

📱 Device Management: Gain control over various aspects of the connected Android device.

📂 File Transfer Capabilities: Seamlessly upload and download files to and from the remote device.

👻 Stealth Operation: Designed to operate discreetly on the target device.

🚀 Auto-start on Device Boot: The client agent automatically starts when the Android device boots up, ensuring persistent access.

⚙️ Server Setup
Getting your C2 server up and running is straightforward:

🤖 Create Telegram Bot:

Initiate a conversation with @BotFather on Telegram.

Follow the instructions to create a new bot and obtain your unique Bot Token.

Find your Chat ID (you can send a message to your new bot and then use a service like https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates to find your chat ID).

🔑 Generate Encryption Key:

Navigate to the server directory.

Run the command: npm run keygen to generate a strong AES-256 encryption key.

📝 Configure Environment Variables:

Create a .env file in the server directory.

Populate it based on the .env.example file, inserting your Telegram Bot Token, Chat ID, and the generated encryption key.

📦 Install Dependencies:

In the server directory, execute: npm install

▶️ Start Server:

Launch the server with: npm start

🤖 Android Client Setup
Prepare the Android client agent for deployment:

💻 Open in Android Studio:

Open the Android client project in Android Studio.

🌐 Update WebSocket URL:

Locate the MainService.kt file.

Update the WebSocket URL within this file to point to your Node.js C2 server's address.

🛠️ Build and Install:

Execute the build script: ./scripts/build-apk.sh

Install the generated APK on your target Android device.

🚀 Deployment
Streamline the deployment process for both server and client:

Server Deployment:

Utilize the provided script for automated deployment to DigitalOcean: scripts/deploy.sh

Client Deployment:

Use the build script to generate the installable APK: scripts/build-apk.sh

⚖️ Legal Notice
This software is provided strictly for educational and research purposes. The developer assumes no responsibility for any misuse, damage, or illegal activities resulting from the use of this tool. Always ensure you have explicit, proper authorization before deploying or testing this software on any system or device.
