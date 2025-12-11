export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function validateInput(schema: any, data: any): void {
  const { error } = schema.validate(data);
  if (error) {
    throw new ApiError(400, 'VALIDATION_ERROR', error.details.map((d: any) => d.message).join(', '));
  }
}
