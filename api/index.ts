export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: any, res: any) => {
  try {
    const module = await import("../server.ts");
    const app = await module.getApp();
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Serverless Function Error:", error);
    res.status(500).json({
      error: "VERCEL_BOOTSTRAP_ERROR",
      message: error.message,
      stack: error.stack
    });
  }
};
