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

// -------------------- utils --------------------
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// -------------------- init Stream Manager --------------------
async function init() {
    try {
        smClient = new StreamManagerClient();
        console.log("Stream Manager client created");

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
                1024 * 1024 * 100,
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

        // IMPORTANT: await the real Stream Manager call
        await smClient.appendMessage(
            STREAM_NAME,
            Buffer.from(payload)
        );

        console.log("Message sent to Stream Manager:", payload);

        res.json({
            status: "sent",
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
    console.log("Do Health Check");
    res.send("Greengrass Stream Manager bridge alive");
});

console.log("Starting data ingestion pipeline");


async function start() {
    console.log("Starting service...");

    await init();

    app.listen(4002, () => {
        console.log("Listening on port 4002");
    });

    // keep alive in Greengrass
    setInterval(() => { }, 3600000);
}

start();