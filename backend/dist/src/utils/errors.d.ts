export declare class ApiError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, code: string, message: string);
}
export declare function validateInput(schema: any, data: any): void;
//# sourceMappingURL=errors.d.ts.map