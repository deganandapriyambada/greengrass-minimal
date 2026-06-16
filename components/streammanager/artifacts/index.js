const express = require("express");
const {
    StreamManagerClient,
    MessageStreamDefinition,
    StrategyOnFull,
    ExportDefinition,
    Persistence
} = require("./stream-manager-sdk");

const app = express();
app.use(express.json());

let smClient;
let isReady = false;

const STREAM_NAME = "pi-data-stream";

// -------------------- init Stream Manager --------------------
async function init() {
    try {
        smClient = new StreamManagerClient();
        smClient.onConnected(async () => {
            console.log("Stream Manager client created and connected");
            console.log("Get list of streams");
            const existingStreams = await smClient.listStreams();
            console.log(existingStreams);
            if (existingStreams.includes(STREAM_NAME)) {
                console.log(`Stream ${STREAM_NAME} already exists.`);
            } else {
                console.log(`Stream ${STREAM_NAME} is not exists.`);
                console.log(`Creating Streams`);
                await smClient.createMessageStream(
                    new MessageStreamDefinition()
                        .withName(STREAM_NAME) // Required.
                        .withMaxSize(268435456)  // Default is 256 MB.
                        .withStreamSegmentSize(16777216)  // Default is 16 MB.
                        .withTimeToLiveMillis(null)  // By default, no TTL is enabled.
                        .withStrategyOnFull(StrategyOnFull.OverwriteOldestData)  // Required.
                        .withPersistence(Persistence.File)  // Default is File.
                        .withFlushOnWrite(false)  // Default is false.
                );
                console.log(`Stream ${STREAM_NAME} created.`);
                isReady = true;
            }
        });

        smClient.onError((err) => {
            isReady = false;
            console.log(`StreamManager Error : ${err} `);
        });

    } catch (err) {
        console.error("Stream Manager init failed:", err);
        process.exit(1);
    }
}

// -------------------- HTTP endpoint --------------------
app.post("/pi-data", async (req, res) => {
    try {

        if (!isReady || !smClient) {
            return res.status(503).json({
                error: "Stream Manager not ready yet"
            });
        }
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