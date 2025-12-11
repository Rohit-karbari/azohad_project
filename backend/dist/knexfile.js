"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'mediconnect',
        },
        migrations: {
            directory: './migrations',
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
        seeds: {
            directory: './migrations/seeds',
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
    },
    test: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'mediconnect_test',
        },
        migrations: {
            directory: './migrations',
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
    },
    production: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false },
        },
        migrations: {
            directory: './migrations',
            extension: 'js',
        },
        seeds: {
            directory: './migrations/seeds',
            extension: 'js',
        },
    },
};
exports.default = config;
//# sourceMappingURL=knexfile.js.map