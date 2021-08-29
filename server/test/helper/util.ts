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

export function expectMissFormStatusCode({ statusCode }: Response): void {
  expect(statusCode).toBe(422);
}

export function expectAlreadyStatusCode({ statusCode }: Response): void {
  expect(statusCode).toBe(409);
}
