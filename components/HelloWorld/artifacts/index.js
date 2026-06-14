const { mqtt, iot } = require("aws-iot-device-sdk-v2");

console.log("Starting IPC MQTT bridge");

const client = new mqtt.MqttClient();

const connection = client.new_connection({
    region: "ap-southeast-1",
    clientId: "greengrass-edge"
});

// Greengrass provides credentials automatically via IPC
async function start() {
    await connection.connect();

    setInterval(async () => {
        const payload = {
            timestamp: new Date().toISOString(),
            message: "heartbeat"
        };

        console.log("publishing:", payload);

        await connection.publish(
            "edge/telemetry",
            JSON.stringify(payload),
            mqtt.QoS.AtLeastOnce
        );
    }, 10000);
}

start().catch(console.error);