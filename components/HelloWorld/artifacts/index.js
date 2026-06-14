console.log("Hello World");
console.log("Now Timestamp:", new Date().toISOString());

setInterval(() => {
    console.log("sending SAMPLING:", new Date().toISOString());
}, 10000);