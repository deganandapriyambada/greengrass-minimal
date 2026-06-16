const {
    StreamManagerClient,
    ReadMessagesOptions
} = require("./stream-manager-sdk");

let smClient;
let isReady = false;

const STREAM_NAME = "pi-data-stream";

// -------------------- utils --------------------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// -------------------- wait for stream --------------------
async function waitForStream(streamName) {
    while (true) {
        try {
            const streams = await smClient.listStreams();

            if (streams.includes(streamName)) {
                console.log(`Stream exists: ${streamName}`);
                return;
            }

            console.log(`Waiting for stream: ${streamName}`);
        } catch (err) {
            console.log("listStreams error (retrying):", err.message);
        }

        await sleep(1000);
    }
}

// -------------------- drain consumer --------------------
async function drainStream() {
    console.log("Drain stream started");

    let idleRounds = 0;

    while (true) {
        try {
            const messages = await smClient.readMessages(
                STREAM_NAME,
                new ReadMessagesOptions()
                    .withMaxMessageCount(50)
                    .withReadTimeoutMillis(2000)
            );

            if (messages && messages.length > 0) {
                idleRounds = 0;

                for (const msg of messages) {
                    const payload = JSON.parse(
                        Buffer.from(msg.payload).toString("utf8")
                    );

                    console.log("Consumed:", payload);
                }
            } else {
                idleRounds++;
                await sleep(500);

                // optional stop condition
                if (idleRounds >= 10) {
                    console.log("Drain idle, continuing polling...");
                    idleRounds = 0;
                }
            }

        } catch (err) {
            console.error("readMessages error:", err.message);

            // backoff on error
            await sleep(1000);
        }
    }
}

// -------------------- init --------------------
async function init() {
    smClient = new StreamManagerClient();

    smClient.onConnected(async () => {
        console.log("Stream Manager connected");

        // IMPORTANT: wait until Stream Manager is actually ready
        await waitForStream(STREAM_NAME);

        isReady = true;

        console.log("Starting drainStream...");
        drainStream();
    });

    smClient.onError((err) => {
        isReady = false;
        console.log("StreamManager Error:", err);
    });
}

// -------------------- start --------------------
async function start() {
    console.log("Starting stream consumer service...");

    await init();

    // keep process alive in Greengrass
    setInterval(() => { }, 3600000);
}

start();