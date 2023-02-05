import { HttpError, RouterContext } from "@oakserver/oak";

export function getParam(context: RouterContext<any, any>, key: string) {
  const path = context.request.url.searchParams.get(key);
  if (!path) {
    throw new HttpError(`Missing [${key}] search param`);
  }

  return path;
}
