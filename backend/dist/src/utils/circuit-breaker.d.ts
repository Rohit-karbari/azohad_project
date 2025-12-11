interface CircuitBreakerOptions {
    failureThreshold: number;
    resetTimeout: number;
    name: string;
}
export declare class CircuitBreaker {
    private options;
    private state;
    private failureCount;
    private lastFailureTime;
    private successCount;
    constructor(options: CircuitBreakerOptions);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): string;
}
export {};
//# sourceMappingURL=circuit-breaker.d.ts.map