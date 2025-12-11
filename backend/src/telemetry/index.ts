import { logger } from '../logging';

export function initializeTelemetry(): void {
  logger.info('Telemetry module initialized (OpenTelemetry optional)');
}

export function getTracer() {
  return require('@opentelemetry/api').trace.getTracer('mediconnect-backend');
}
