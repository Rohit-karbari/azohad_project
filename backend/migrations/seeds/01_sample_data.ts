import type { Knex } from 'knex';
// Update the import path if the correct location is different, for example:
import { hashPassword } from '../../src/middleware/auth';
// Or, if the file is named differently or located elsewhere, adjust accordingly:
// import { hashPassword } from '../../middleware/auth';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('audit_logs').del();
  await knex('clinical_notes').del();
  await knex('appointments').del();
  await knex('patients').del();
  await knex('doctors').del();

  // Sample patient
  const [patientRow] = await knex('patients')
    .insert({
      email: 'patient1@example.com',
      password_hash: await hashPassword('Patient123!'),
      first_name: 'Alice',
      last_name: 'Johnson',
      date_of_birth: '1990-05-15',
      phone: '+1-555-1001',
      gender: 'female',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94102',
      status: 'active',
      email_verified: true,
    })
    .returning('id');
  const patient =
    typeof patientRow === 'object' && patientRow !== null ? (patientRow as any).id : patientRow;

  // Sample doctors
  const [doctor1Row] = await knex('doctors')
    .insert({
      email: 'doctor1@example.com',
      password_hash: await hashPassword('Doctor123!'),
      first_name: 'Bob',
      last_name: 'Smith',
      license_number: 'MD-001',
      specialization: 'Cardiology',
      bio: 'Experienced cardiologist with 10+ years of practice',
      phone: '+1-555-2001',
      status: 'active',
      email_verified: true,
    })
    .returning('id');
  const doctor1 =
    typeof doctor1Row === 'object' && doctor1Row !== null ? (doctor1Row as any).id : doctor1Row;

  const [doctor2Row] = await knex('doctors')
    .insert({
      email: 'doctor2@example.com',
      password_hash: await hashPassword('Doctor123!'),
      first_name: 'Carol',
      last_name: 'Davis',
      license_number: 'MD-002',
      specialization: 'Neurology',
      bio: 'Specialist in neurological disorders',
      phone: '+1-555-2002',
      status: 'active',
      email_verified: true,
    })
    .returning('id');
  const doctor2 =
    typeof doctor2Row === 'object' && doctor2Row !== null ? (doctor2Row as any).id : doctor2Row;

  // Sample appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await knex('appointments').insert([
    {
      patient_id: patient,
      doctor_id: doctor1,
      scheduled_at: tomorrow.toISOString(),
      status: 'scheduled',
      duration_minutes: 30,
      reason_for_visit: 'Routine checkup',
      appointment_type: 'in-person',
    },
    {
      patient_id: patient,
      doctor_id: doctor2,
      scheduled_at: new Date(tomorrow.getTime() + 86400000).toISOString(),
      status: 'scheduled',
      duration_minutes: 45,
      reason_for_visit: 'Headache consultation',
      appointment_type: 'telehealth',
    },
  ]);

  console.log('✅ Database seeded with sample data');
}
