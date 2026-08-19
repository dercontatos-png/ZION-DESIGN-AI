// @ts-ignore
import { getApp } from "../dist/server.cjs";

// Official Vercel way to set max function duration (60s on Hobby, up to 300s on Pro)
export const maxDuration = 300;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default async (req: any, res: any) => {
  const app = await getApp();
  app(req, res);
};
