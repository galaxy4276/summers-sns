import { debug as log } from 'loglevel';

export const getBoolAnyPromise = (
  promise: Promise<any>,
  isError: boolean,
): Promise<boolean> =>
  promise
    .then((data) => {
      log(data);
      return true;
    })
    .catch((err) => {
      if (isError) log(err);
      return false;
    });

export const getBoolAnyQueryPromise = (
  promise: Promise<any>,
  checkProp: string,
  isError: boolean,
): Promise<boolean> =>
  promise
    .then((data) => data[0][checkProp] !== undefined)
    .catch((err) => {
      if (isError) log(err);
      return false;
    });

export const getBoolAnyQueryByTargetPromise = (
  promise: Promise<any>,
  checkProp: string,
  target: string | number,
  isError: boolean,
): Promise<boolean> =>
  promise
    .then((data) => data[0][checkProp] === target)
    .catch((err) => {
      if (isError) log(err);
      return false;
    });
