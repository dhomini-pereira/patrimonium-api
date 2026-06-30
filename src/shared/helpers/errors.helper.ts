type ErrorResult<T> = [Error | null, T | null];

export function errorHelper<T>(fn: () => T): ErrorResult<T>;

export function errorHelper<T>(fn: () => Promise<T>): Promise<ErrorResult<T>>;

export function errorHelper<T>(
  fn: () => T | Promise<T>,
): ErrorResult<T> | Promise<ErrorResult<T>> {
  try {
    const result = fn();

    if (result instanceof Promise) {
      return result
        .then((value) => [null, value] as ErrorResult<T>)
        .catch(
          (err) =>
            [
              err instanceof Error ? err : new Error(String(err)),
              null,
            ] as ErrorResult<T>,
        );
    }

    return [null, result];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), null];
  }
}
