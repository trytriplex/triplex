/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import Cors from "cors";
import { type NextApiRequest, type NextApiResponse } from "next";

const corsMiddleware = Cors({
  allowedHeaders: "*",
  methods: "*",
  origin: "*",
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: typeof corsMiddleware,
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export function cors(req: NextApiRequest, res: NextApiResponse) {
  return runMiddleware(req, res, corsMiddleware);
}
