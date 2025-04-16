const net = require('net');
const fix = require('fix-protocol');
import { config } from "./config";

const client = new net.Socket();

client.connect(config.port, config.host, () => {
  console.log('Connected to PSX MDGW');
  const logonMsg = fix.createMessage(
    [
      ['8', config.fixVersion],
      ['35', 'A'],
      ['49', config.sender],
      ['56', config.target],
      ['34', 1],
      ['52', new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')],
      ['98', 0],
      ['108', 30],
    ],
    true
  );
  client.write(logonMsg);
});

// Handle incoming data
client.on('data', (data) => {
  const messages = data.toString().split('\x01');
  const parsed = fix.parseMessage(messages.join('|'));
  if (parsed && parsed['35'] === 'W') { // Market Data Snapshot
    console.log('Stock:', parsed['55'], 'Price:', parsed['270']);
  } else {
    console.log('Received:', parsed);
  }
});

// Handle errors
client.on('error', (err) => {
  console.error('Error:', err.message);
});

// Reconnect on close
client.on('close', () => {
  console.log('Disconnected, retrying...');
  setTimeout(() => {
    client.connect(config.port, config.host);
  }, 5000);
});