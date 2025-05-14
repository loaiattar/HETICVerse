'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("./services/websocket"));
exports.default = {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     */
    register({ strapi }) {
        // Register middleware or additional features here
    },
    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     */
    bootstrap({ strapi }) {
        // Initialize WebSocket service
        websocket_1.default.initialize({ strapi });
    },
};
