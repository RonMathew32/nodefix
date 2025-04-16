"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require('dotenv').config();
exports.config = {
    fixVersion: process.env.FIX_VERSION,
    host: process.env.FIX_HOST,
    port: process.env.FIX_PORT,
    sender: process.env.FIX_SENDER,
    target: process.env.FIX_TARGET,
};
