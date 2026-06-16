const express = require("express");
const {
    StreamManagerClient,
    MessageStreamDefinition,
    StrategyOnFull,
    IoTCoreConfig,
    ExportDefinition,
    AppendMessageRequest
} = require("./stream-manager-sdk");

const payload = JSON.stringify({
    "test": "test"
});

const STREAM_NAME = "pi-data-stream";

const request = new AppendMessageRequest(
    "128371923791",          // requestId (string)
    STREAM_NAME,             // name (NOT streamName)
    Buffer.from(payload)     // payload (Buffer)
);