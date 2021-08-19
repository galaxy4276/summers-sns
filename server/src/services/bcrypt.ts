import { hash, compare } from 'bcrypt';
import { debug as log } from 'loglevel';

export function hashPlain(plain: string, salt: number): Promise<string> {
  return new Promise((resolve, reject) => {
    hash(plain, salt, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

export function compareHash(
  compareString: string,
  origin: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    compare(compareString, origin, (err, same) => {
      if (err) {
        log(err);
        reject(err);
      }
      resolve(same);
    });
  });
}
