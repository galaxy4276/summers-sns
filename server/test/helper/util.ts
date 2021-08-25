import { Response } from 'supertest';

export function expectBadStatusCode({ statusCode }: Response): void {
  expect(statusCode).toBe(400);
}

export function expectCreatedStatusCode({ statusCode }: Response): void {
  expect(statusCode).toBe(201);
}

export function expectOkStatusCode({ statusCode }: Response): void {
  expect(statusCode).toBe(200);
}
