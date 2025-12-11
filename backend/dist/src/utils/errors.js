"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.validateInput = validateInput;
class ApiError extends Error {
    constructor(statusCode, code, message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
exports.ApiError = ApiError;
function validateInput(schema, data) {
    const { error } = schema.validate(data);
    if (error) {
        throw new ApiError(400, 'VALIDATION_ERROR', error.details.map((d) => d.message).join(', '));
    }
}
//# sourceMappingURL=errors.js.map