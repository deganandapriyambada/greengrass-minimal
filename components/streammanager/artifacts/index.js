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

const STREAM_NAME = "pi-data-stream";

// -------------------- utils --------------------
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// -------------------- init Stream Manager --------------------
async function init() {
    try {
        smClient = new StreamManagerClient();
        smClient.onConnected(async () => {
            console.log("Stream Manager client created and connected");
            await smClient.createMessageStream(
                new MessageStreamDefinition()
                    .withName(STREAM_NAME) // Required.
                    .withMaxSize(268435456)  // Default is 256 MB.
                    .withStreamSegmentSize(16777216)  // Default is 16 MB.
                    .withTimeToLiveMillis(null)  // By default, no TTL is enabled.
                    .withStrategyOnFull(StrategyOnFull.OverwriteOldestData)  // Required.
                    .withPersistence(Persistence.File)  // Default is File.
                    .withFlushOnWrite(false)  // Default is false.
                    .withExportDefinition(  // Optional. Choose where/how the stream is exported to the AWS Cloud.
                        new ExportDefinition()
                            .withKinesis(null)
                            .withIotAnalytics(null)
                            .withIotSiteWise(null)
                            .withS3(null)
                    )
            );
            console.log(`Stream ${STREAM_NAME} created.`);
        });

        smClient.onError((err) => {
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