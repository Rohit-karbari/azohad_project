"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTelemetry = initializeTelemetry;
exports.getTracer = getTracer;
const logging_1 = require("../logging");
function initializeTelemetry() {
    logging_1.logger.info('Telemetry module initialized (OpenTelemetry optional)');
}
function getTracer() {
    return require('@opentelemetry/api').trace.getTracer('mediconnect-backend');
}
//# sourceMappingURL=index.js.map