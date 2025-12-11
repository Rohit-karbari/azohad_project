import { PatientRepository } from '../../../src/repositories/patient.repository';
import knex from 'knex';

describe('PatientRepository', () => {
  let db: any;
  let repo: PatientRepository;

  beforeAll(async () => {
    db = knex({
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
    repo = new PatientRepository(db);
  });

  afterAll(async () => {
    await db.migrate.rollback();
    await db.destroy();
  });

  afterEach(async () => {
    await db('patients').del();
  });

  test('should create a new patient', async () => {
    const patientData = {
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      phone: '555-1234',
      gender: 'male',
      status: 'active',
      emailVerified: false,
    };

    const patient = await repo.create(patientData);

    expect(patient).toBeDefined();
    expect(patient.email).toBe(patientData.email);
    expect(patient.firstName).toBe(patientData.firstName);
  });

  test('should find patient by email', async () => {
    const patientData = {
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      phone: '555-1234',
      gender: 'male',
      status: 'active',
      emailVerified: false,
    };

    await repo.create(patientData);
    const found = await repo.findByEmail(patientData.email);

    expect(found).toBeDefined();
    expect(found?.email).toBe(patientData.email);
  });

  test('should return null for non-existent patient', async () => {
    const found = await repo.findByEmail('nonexistent@example.com');
    expect(found).toBeNull();
  });

  test('should update patient', async () => {
    const patientData = {
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      phone: '555-1234',
      gender: 'male',
      status: 'active',
      emailVerified: false,
    };

    const patient = await repo.create(patientData);
    const updated = await repo.update(patient.id, { ...patient, firstName: 'Jane' });

    expect(updated?.firstName).toBe('Jane');
  });

  test('should delete patient', async () => {
    const patientData = {
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      phone: '555-1234',
      gender: 'male',
      status: 'active',
      emailVerified: false,
    };

    const patient = await repo.create(patientData);
    const deleted = await repo.delete(patient.id);

    expect(deleted).toBe(true);
    const found = await repo.findById(patient.id);
    expect(found).toBeNull();
  });
});
