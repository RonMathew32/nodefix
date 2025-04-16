"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require('net');
var fix = require('fix-protocol');
var config_1 = require("./config");
var client = new net.Socket();
console.log(config_1.config, 'config');
client.connect(config_1.config.port, config_1.config.host, function () {
    console.log('Connected to PSX MDGW');
    var logonMsg = fix.createMessage([
        ['8', config_1.config.fixVersion],
        ['35', 'A'],
        ['49', config_1.config.sender],
        ['56', config_1.config.target],
        ['34', 1],
        ['52', new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')],
        ['98', 0],
        ['108', 30],
    ], true);
    client.write(logonMsg);
});
// Handle incoming data
client.on('data', function (data) {
    var messages = data.toString().split('\x01');
    var parsed = fix.parseMessage(messages.join('|'));
    if (parsed && parsed['35'] === 'W') { // Market Data Snapshot
        console.log('Stock:', parsed['55'], 'Price:', parsed['270']);
    }
    else {
        console.log('Received:', parsed);
    }
});
// Handle errors
client.on('error', function (err) {
    console.error('Error:', err.message);
});
// Reconnect on close
client.on('close', function () {
    console.log('Disconnected, retrying...');
    setTimeout(function () {
        client.connect(config_1.config.port, config_1.config.host);
    }, 5000);
});
