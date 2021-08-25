import { Response } from 'supertest';

export function checkBadStatusCode({ statusCode }: Response): void {
  expect(statusCode).toBe(400);
}

export default {};
