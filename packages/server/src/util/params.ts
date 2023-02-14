import { HttpError, RouterContext } from "@oakserver/oak";

export function getParam<T extends string>(
  context: RouterContext<T>,
  key: string
) {
  const path = context.request.url.searchParams.get(key);
  if (!path) {
    throw new HttpError(`Missing [${key}] search param`);
  }

  return path;
}
