const net = require("net");
const fix = require("fix-protocol");
const fixVersions = require("./config/index.ts");
const { Messages } = require("fixparser");
require('dotenv').config();

const client = new net.Socket();

client.connect(process.env.FIX_PORT, process.env.FIX_HOST, () => {
  console.log("Connected to PSX MDGW");
  const logonMsg = fix.createMessage(
    [
      [Messages.BeginString, fixVersions.FIXT.BEGIN_STRING],
      [Messages.SenderCompID, process.env.FIX_SENDER],
      [Messages.TargetCompID, process.env.FIX_TARGET],
      [Messages.MsgSeqNum, "1"],
      [Messages.SendingTime, new Date().toISOString()],
      [Messages.MsgType, fixVersions.MSG_TYPES.LOGON],
      [Messages.EncryptMethod, "0"],
      [Messages.HeartBtInt, "30"],
      [Messages.ResetSeqNumFlag, "Y"],
      [Messages.DefaultApplVerID, fixVersions.DEFAULT_APPL_VER_ID],
    ],
    true
  );
  client.write(logonMsg);
});

// Handle incoming data
client.on("data", (data) => {
  const messages = data.toString().split("\x01");
  const parsed = fix.parseMessage(messages.join("|"));
  if (parsed && parsed["35"] === "W") {
    // Market Data Snapshot
    console.log("Stock:", parsed["55"], "Price:", parsed["270"]);
  } else {
    console.log("Received:", parsed);
  }
});

// Handle errors
client.on("error", (err) => {
  console.error("Error:", err.message);
});

// Reconnect on close
client.on("close", () => {
  console.log("Disconnected, retrying...");
  setTimeout(() => {
    client.connect(process.env.FIX_PORT, process.env.FIX_HOST);
  }, 5000);
});
