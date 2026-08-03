// @ts-ignore
import { getApp } from "../dist/server.cjs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: any, res: any) => {
  const app = await getApp();
  app(req, res);
};
