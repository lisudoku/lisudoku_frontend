import { camelCase, snakeCase } from 'lodash-es';

const changeKeys = (obj: any, keyChangeFn: (string?: string) => string): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => changeKeys(v, keyChangeFn));
  } else if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [keyChangeFn(key)]: changeKeys(obj[key], keyChangeFn),
      }),
      {},
    );
  }
  return obj;
};

export const camelCaseKeys = (obj: any): any => changeKeys(obj, camelCase)

export const snakeCaseKeys = (obj: any): any => changeKeys(obj, snakeCase)
