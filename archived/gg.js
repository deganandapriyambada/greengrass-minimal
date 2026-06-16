const express = require("express");
const { greengrasscoreipc } = require("aws-iot-device-sdk-v2");

const app = express();
app.use(express.json());

const client = greengrasscoreipc.createClient();

async function init() {
    await client.connect();
    console.log("IPC connected");
}

async function publishToIoTCore(topic, payload) {
    return client.publishToIoTCore({
        topicName: topic,
        qos: greengrasscoreipc.model.QOS.AT_LEAST_ONCE,
        payload: Buffer.from(JSON.stringify(payload))
    });
}

app.post("/pi-data", async (req, res) => {
    try {
        const data = req.body;
        await publishToIoTCore("pi/system/data", data);
        res.json({ status: "published", data });
    } catch (err) {
        console.error(`publish error: ${err}`);
        res.status(500).send({ error: err.message });
    }
});

app.get("/", (req, res) => {
    res.send("Greengrass bridge is alive");
});

app.listen(4001, async () => {
    try {
        await init();
        console.log("Express running on port 4001");
    } catch (e) {
        console.error("IPC initialization failed failed:", e);
        process.exit(1);
    }
});