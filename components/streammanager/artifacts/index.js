const express = require("express");
const {
    StreamManagerClient,
    MessageStreamDefinition,
    StrategyOnFull,
    ExportDefinition,
    Persistence,
    ReadMessagesOptions
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
        smClient.readMessage
        smClient.onConnected(async () => {
            console.log("Stream Manager client created and connected");
            console.log("Get list of streams");
            const existingStreams = await smClient.listStreams();
            console.log(existingStreams);
            if (existingStreams.includes(STREAM_NAME)) {
                console.log(`Stream ${STREAM_NAME} already exists. update stream config`);
                await smClient.updateMessageStream(
                    new MessageStreamDefinition()
                        .withName(STREAM_NAME) // Required.
                        .withMaxSize(268435456)  // Default is 256 MB.
                        .withStreamSegmentSize(16777216)  // Default is 16 MB.
                        .withTimeToLiveMillis(null)  // By default, no TTL is enabled.
                        .withStrategyOnFull(StrategyOnFull.OverwriteOldestData)  // Required.
                        .withPersistence(Persistence.File)  // Default is File.
                        .withFlushOnWrite(false)  // Default is false.
                        .withExportDefinition(
                            new ExportDefinition()
                                .withS3(
                                    new S3ExportTaskDefinition()
                                        .withBucket("greengrass-artifact-dega-test")
                                        .withRegion("ap-southeast-1")
                                        .withIdentifier("pi-stream-export")
                                        .withPrefix("pi-data/")
                                )
                        )
                );
                isReady = true;
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
                        .withExportDefinition(
                            new ExportDefinition()
                                .withS3(
                                    new S3ExportTaskDefinition()
                                        .withBucket("greengrass-artifact-dega-test")
                                        .withRegion("ap-southeast-1")
                                        .withIdentifier("pi-stream-export")
                                        .withPrefix("pi-data/")
                                )
                        )
                );
                console.log(`Stream ${STREAM_NAME} created.`);
                isReady = true;
            }
            drainStream().catch(err => {
                console.error("drainStream crashed:", err);
            });
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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function drainStream() {
    let idleRounds = 0;

    while (idleRounds < 3) { // stop after being idle 3 times
        const messages = await smClient.readMessages(
            STREAM_NAME,
            new ReadMessagesOptions()
                .withMaxMessageCount(50)
                .withReadTimeoutMillis(2000)
        );

        if (messages && messages.length > 0) {
            idleRounds = 0;

            for (const msg of messages) {
                console.log(msg);
                const payload = JSON.parse(
                    Buffer.from(msg.payload).toString("utf8")
                );
                console.log(payload);
            }
        } else {
            idleRounds++;
            await sleep(500); // small backoff when idle
        }
    }

    console.log("Stream caught up (idle).");
}

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