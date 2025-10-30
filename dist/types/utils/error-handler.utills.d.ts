export declare class ErrorHandler extends Error {
    statusCode: number;
    context?: Record<string, unknown>;
    constructor(message: string, statusCode: number, context?: Record<string, unknown>);
}
