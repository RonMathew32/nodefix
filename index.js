var _this = this;
var net = require("net");
var fix = require("fix-protocol");
var fixVersions = require("./config/index.ts");
var Messages = require("fixparser").Messages;
require('dotenv').config();
var client = new net.Socket();
client.connect(process.env.FIX_PORT, process.env.FIX_HOST, function () {
    console.log("Connected to PSX MDGW");
    var logonMsg = fix.createMessage([
        [Messages.BeginString, fixVersions.FIXT.BEGIN_STRING][(Messages.SenderCompID, _this.config.senderCompID)][(Messages.TargetCompID, _this.config.targetCompID)][(Messages.MsgSeqNum, "1")][(Messages.SendingTime, new Date().toISOString())][(Messages.MsgType, fixVersions.MSG_TYPES.LOGON)][(Messages.EncryptMethod, "0")][(Messages.HeartBtInt, "30")][(Messages.ResetSeqNumFlag, "Y")][(Messages.DefaultApplVerID, fixVersions.DEFAULT_APPL_VER_ID)],
    ], true);
    client.write(logonMsg);
});
// Handle incoming data
client.on("data", function (data) {
    var messages = data.toString().split("\x01");
    var parsed = fix.parseMessage(messages.join("|"));
    if (parsed && parsed["35"] === "W") {
        // Market Data Snapshot
        console.log("Stock:", parsed["55"], "Price:", parsed["270"]);
    }
    else {
        console.log("Received:", parsed);
    }
});
// Handle errors
client.on("error", function (err) {
    console.error("Error:", err.message);
});
// Reconnect on close
client.on("close", function () {
    console.log("Disconnected, retrying...");
    setTimeout(function () {
        client.connect(process.env.FIX_PORT, process.env.FIX_HOST);
    }, 5000);
});
