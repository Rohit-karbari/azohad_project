"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../../src/services/auth.service");
const knex_1 = __importDefault(require("knex"));
describe('AuthService', () => {
    let db;
    let service;
    beforeAll(async () => {
        db = (0, knex_1.default)({
            client: 'pg',
            connection: {
                host: 'localhost',
                port: 5432,
                user: 'postgres',
                password: 'postgres',
                database: 'mediconnect_test',
            },
        });
        await db.migrate.latest();
        service = new auth_service_1.AuthService(db);
    });
    afterAll(async () => {
        await db.migrate.rollback();
        await db.destroy();
    });
    afterEach(async () => {
        await db('patients').del();
    });
    test('should register a new patient', async () => {
        const result = await service.registerPatient({
            email: 'newuser@example.com',
            password: 'SecurePassword123!',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            phone: '555-1234',
            gender: 'male',
        }, '127.0.0.1', 'test-correlation-id');
        expect(result.token).toBeDefined();
        expect(result.patient.email).toBe('newuser@example.com');
    });
    test('should fail on duplicate email', async () => {
        await service.registerPatient({
            email: 'duplicate@example.com',
            password: 'SecurePassword123!',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            phone: '555-1234',
            gender: 'male',
        }, '127.0.0.1', 'test-correlation-id-1');
        await expect(service.registerPatient({
            email: 'duplicate@example.com',
            password: 'AnotherPassword123!',
            firstName: 'Jane',
            lastName: 'Doe',
            dateOfBirth: '1992-01-01',
            phone: '555-5678',
            gender: 'female',
        }, '127.0.0.1', 'test-correlation-id-2')).rejects.toThrow('Email already registered');
    });
    test('should login with correct credentials', async () => {
        const password = 'SecurePassword123!';
        await service.registerPatient({
            email: 'login@example.com',
            password,
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            phone: '555-1234',
            gender: 'male',
        }, '127.0.0.1', 'test-correlation-id-1');
        const result = await service.loginPatient('login@example.com', password, '127.0.0.1', 'test-correlation-id-2');
        expect(result.token).toBeDefined();
        expect(result.patient.email).toBe('login@example.com');
    });
    test('should fail login with incorrect password', async () => {
        const password = 'SecurePassword123!';
        await service.registerPatient({
            email: 'login2@example.com',
            password,
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            phone: '555-1234',
            gender: 'male',
        }, '127.0.0.1', 'test-correlation-id-1');
        await expect(service.loginPatient('login2@example.com', 'WrongPassword123!', '127.0.0.1', 'test-correlation-id-2')).rejects.toThrow('Invalid email or password');
    });
});
//# sourceMappingURL=auth.service.test.js.map