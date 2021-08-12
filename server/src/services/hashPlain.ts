import { hash } from 'bcrypt';

export default function hashPlain(
  plain: string,
  salt: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    hash(plain, salt, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}
