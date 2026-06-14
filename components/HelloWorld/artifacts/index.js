const express = require("express");
const { GreengrassCoreIPCClient } = require("aws-greengrass-core-sdk");

console.log("Starting HTTP → IPC → IoT Core bridge");

const app = express();
app.use(express.json());

// IPC client (Greengrass local runtime)
const ipcClient = new GreengrassCoreIPCClient();

app.post("/publish", async (req, res) => {
    try {
        const payload = {
            timestamp: new Date().toISOString(),
            data: req.body
        };

        console.log("Received HTTP request:", payload);

        await ipcClient.publishToIoTCore({
            topicName: "edge/telemetry",
            qos: "1",
            payload: Buffer.from(JSON.stringify(payload))
        });

        res.json({ status: "published via IPC" });

    } catch (err) {
        console.error("IPC publish error:", err);
        res.status(500).json({ error: err.message });
    }
});

// HTTP server
app.listen(3000, () => {
    console.log("HTTP server running on port 3000");
});

// test stream
setInterval(() => {
    console.log("heartbeat:", new Date().toISOString());
}, 10000);