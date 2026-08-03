export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: any, res: any) => {
  try {
    const module = await import("../dist/server.cjs");
    const app = await module.getApp();
    app(req, res);
  } catch (error: any) {
    res.status(500).json({
      error: "VERCEL_BOOTSTRAP_ERROR",
      message: error.message,
      stack: error.stack
    });
  }
};
