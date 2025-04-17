const net = require('net');
const { FIXParser, Field, Message, Messages } = require('fixparser');
const fixVersions = require('./config/index.ts');
require('dotenv').config();

const client = new net.Socket();

// Create a FIX message using fixparser
const createLogonMessage = () => {
  const message = new Message();
  message.addField(Messages.BeginString, fixVersions.FIXT.BEGIN_STRING);
  message.addField(Messages.SenderCompID, process.env.FIX_SENDER);
  message.addField(Messages.TargetCompID, process.env.FIX_TARGET);
  message.addField(Messages.MsgSeqNum, "1");
  message.addField(Messages.SendingTime, new Date().toISOString());
  message.addField(Messages.MsgType, fixVersions.MSG_TYPES.LOGON);
  message.addField(Messages.EncryptMethod, "0");
  message.addField(Messages.HeartBtInt, "30");
  message.addField(Messages.ResetSeqNumFlag, "Y");
  message.addField(Messages.DefaultApplVerID, fixVersions.DEFAULT_APPL_VER_ID);

  // Log the message content
  console.log('Logon Message:', JSON.stringify(message.toString(), null, 2));
  
  return message;
};

// Connect to FIX server
client.connect(process.env.FIX_PORT, process.env.FIX_HOST, () => {
  console.log("Connected to PSX MDGW");

  // Create the logon message
  const logonMsg = createLogonMessage();

  // Send the logon message
  client.write(logonMsg.toString());
});

// Handle incoming data and parse it
client.on('data', (data) => {
  const messages = data.toString().split("\x01");
  const parsedMessages = messages.map((msg) => {
    const parsed = FIXParser.parseMessage(msg);
    return parsed;
  });

  parsedMessages.forEach((parsed) => {
    if (parsed && parsed["35"] === "W") {
      // Market Data Snapshot
      console.log("Stock:", parsed["55"], "Price:", parsed["270"]);
    } else {
      console.log("Received:", parsed);
    }
  });
});

// Handle errors
client.on('error', (err) => {
  console.error('Error:', err.message);
});

// Reconnect on close
client.on('close', () => {
  console.log('Disconnected, retrying...');
  setTimeout(() => {
    client.connect(process.env.FIX_PORT, process.env.FIX_HOST);
  }, 5000);
});
