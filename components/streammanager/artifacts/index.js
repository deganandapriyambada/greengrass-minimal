const express = require("express");
const {
    StreamManagerClient,
    MessageStreamDefinition,
    StrategyOnFull,
    IoTCoreConfig,
    ExportDefinition
} = require("./stream-manager-sdk");

const app = express();
app.use(express.json());

let smClient;
const STREAM_NAME = "pi-data-stream";

async function init() {
    try {
        // ✅ Correct: no .connect()
        smClient = new StreamManagerClient();

        console.log("Stream Manager client created");

        // List existing streams
        const listResp = await smClient.listStreams();

        const existingStreams = (listResp.streamNames || []);

        console.log("Existing streams:", existingStreams);

        if (!existingStreams.includes(STREAM_NAME)) {

            const streamDefinition = new MessageStreamDefinition(
                STREAM_NAME,
                StrategyOnFull.OverwriteOldestData,
                1024 * 1024 * 100, // 100MB
                undefined,
                new ExportDefinition([
                    new IoTCoreConfig(
                        "pi/system/data",
                        1
                    )
                ])
            );

            await smClient.createMessageStream(streamDefinition);

            console.log("Created stream:", STREAM_NAME);
        } else {
            console.log("Stream already exists:", STREAM_NAME);
        }

        console.log("Stream Manager ready");
    } catch (err) {
        console.error("Stream Manager init failed:", err);
        process.exit(1);
    }
}

app.post("/pi-data", async (req, res) => {
    try {
        const payload = JSON.stringify(req.body);

        await smClient.appendMessage({
            streamName: STREAM_NAME,
            data: Buffer.from(payload)
        });

        res.json({
            status: "buffered",
            size: payload.length
        });

    } catch (err) {
        console.error("appendMessage error:", err);

        res.status(500).json({
            error: err.message
        });
    }
});

app.get("/", (req, res) => {
    res.send("Stream Manager bridge alive");
});

app.listen(4002, async () => {
    await init();
    console.log("Listening on port 4002");
});