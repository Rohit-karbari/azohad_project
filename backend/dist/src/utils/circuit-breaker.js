"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
const logging_1 = require("../logging");
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (CircuitState = {}));
class CircuitBreaker {
    constructor(options) {
        this.options = options;
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.successCount = 0;
    }
    async execute(fn) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
                logging_1.logger.info(`Circuit breaker ${this.options.name} transitioning to HALF_OPEN`);
                this.state = CircuitState.HALF_OPEN;
                this.successCount = 0;
            }
            else {
                throw new Error(`Circuit breaker ${this.options.name} is OPEN`);
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= 2) {
                logging_1.logger.info(`Circuit breaker ${this.options.name} transitioning to CLOSED`);
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
            }
        }
    }
    onFailure() {
        this.lastFailureTime = Date.now();
        this.failureCount++;
        if (this.failureCount >= this.options.failureThreshold) {
            logging_1.logger.warn(`Circuit breaker ${this.options.name} transitioning to OPEN`, {
                failureCount: this.failureCount,
                threshold: this.options.failureThreshold,
            });
            this.state = CircuitState.OPEN;
        }
    }
    getState() {
        return this.state;
    }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=circuit-breaker.js.map