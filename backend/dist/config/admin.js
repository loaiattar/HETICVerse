"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET', 'l5gie/AYLcRwAuWb5zWUrw=='),
    },
    apiToken: {
        salt: 'R/AAAmbaYejfXNO0tGkJbg==', // Hardcoded value from your .env
    },
    transfer: {
        token: {
            salt: env('TRANSFER_TOKEN_SALT', 'VIk2k6tmtjZnCW8plaR2EA=='),
        },
    },
    secrets: {
        encryptionKey: env('ENCRYPTION_KEY', ''),
    },
    flags: {
        nps: env.bool('FLAG_NPS', true),
        promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
});
