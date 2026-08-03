// @ts-ignore
import { getApp } from "../dist/server.cjs";

export default async (req: any, res: any) => {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({
      error: "VERCEL_BOOTSTRAP_ERROR",
      message: error.message,
      stack: error.stack
    });
  }
};
