const express = require("express");
const {
    StreamManagerClient,
    MessageStreamDefinition,
    StrategyOnFull,
    IoTCoreConfig,
    ExportDefinition,
    AppendMessageRequest
} = require("./stream-manager-sdk");

const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

let smClient;

const STREAM_NAME = "pi-data-stream";

// -------------------- utils --------------------
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// -------------------- init Stream Manager --------------------
async function init() {
    try {
        smClient = new StreamManagerClient();
        console.log("Stream Manager client created");

        // wait for Stream Manager to be ready (important in Greengrass)
        let listResp;
        let existingStreams = [];

        for (let i = 0; i < 10; i++) {
            try {
                listResp = await smClient.listStreams();

                existingStreams =
                    listResp.streams ||
                    listResp.streamNames ||
                    [];

                break;
            } catch (err) {
                console.log("Waiting for Stream Manager...");
                await sleep(2000);
            }
        }

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

// -------------------- HTTP endpoint --------------------
app.post("/pi-data", async (req, res) => {
    try {
        const payload = JSON.stringify(req.body);

        const request = new AppendMessageRequest(
            "128371923791",          // requestId (string)
            STREAM_NAME,             // name (NOT streamName)
            Buffer.from(payload)     // payload (Buffer)
        );

        await smClient.appendMessage(request);

        res.json({
            status: "buffered",
            stream: STREAM_NAME,
            size: payload.length
        });

    } catch (err) {
        console.error("appendMessage error:", err);

        res.status(500).json({
            error: err.message
        });
    }
});

// -------------------- health check --------------------
app.get("/", (req, res) => {
    res.send("Greengrass Stream Manager bridge alive");
});

// -------------------- start --------------------
app.listen(4002, async () => {
    await init();
    console.log("Listening on port 4002");
});