import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Patients table
  await knex.schema.createTable('patients', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.date('date_of_birth').notNullable();
    table.string('phone').notNullable();
    table.string('gender').notNullable();
    table.text('address');
    table.string('city');
    table.string('state');
    table.string('zip_code');
    table.string('status').defaultTo('active');
    table.boolean('email_verified').defaultTo(false);
    table.timestamps(true, true);
  });

  // Doctors table
  await knex.schema.createTable('doctors', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('license_number').unique().notNullable();
    table.string('specialization').notNullable();
    table.text('bio');
    table.string('phone').notNullable();
    table.string('status').defaultTo('active');
    table.boolean('email_verified').defaultTo(false);
    table.timestamps(true, true);
  });

  // Appointments table
  await knex.schema.createTable('appointments', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE');
    table.uuid('doctor_id').notNullable().references('id').inTable('doctors').onDelete('CASCADE');
    table.dateTime('scheduled_at').notNullable();
    table.string('status').defaultTo('scheduled'); // scheduled, completed, cancelled, no-show
    table.integer('duration_minutes').defaultTo(30);
    table.text('reason_for_visit');
    table.text('notes');
    table.string('appointment_type').defaultTo('in-person'); // in-person, telehealth
    table.timestamps(true, true);
    table.index(['patient_id']);
    table.index(['doctor_id']);
    table.index(['scheduled_at']);
  });

  // Clinical Notes table
  await knex.schema.createTable('clinical_notes', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('appointment_id').notNullable().references('id').inTable('appointments').onDelete('CASCADE');
    table.uuid('doctor_id').notNullable().references('id').inTable('doctors').onDelete('CASCADE');
    table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE');
    table.text('chief_complaint');
    table.text('history_of_present_illness');
    table.text('physical_examination');
    table.text('assessment');
    table.text('plan');
    table.text('medications');
    table.text('follow_up');
    table.string('status').defaultTo('draft'); // draft, finalized, signed
    table.timestamps(true, true);
    table.index(['patient_id']);
    table.index(['doctor_id']);
    table.index(['appointment_id']);
  });

  // Audit Logs table
  await knex.schema.createTable('audit_logs', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('user_id').notNullable();
    table.string('user_type'); // patient, doctor, admin
    table.string('action').notNullable();
    table.string('resource_type').notNullable();
    table.string('resource_id');
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.string('ip_address');
    table.string('correlation_id');
    table.text('description');
    table.string('status'); // success, failure
    table.timestamps(true, true);
    table.index(['user_id']);
    table.index(['resource_type']);
    table.index(['created_at']);
    table.index(['correlation_id']);
  });

  // Create indexes for better performance
  await knex.schema.table('patients', (table: Knex.TableBuilder) => {
    table.index('email');
    table.index('created_at');
  });

  await knex.schema.table('doctors', (table: Knex.TableBuilder) => {
    table.index('email');
    table.index('specialization');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('clinical_notes');
  await knex.schema.dropTableIfExists('appointments');
  await knex.schema.dropTableIfExists('doctors');
  await knex.schema.dropTableIfExists('patients');
}
