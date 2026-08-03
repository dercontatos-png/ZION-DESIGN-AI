export default (req: any, res: any) => {
  res.json({ pong: true, status: "alive" });
};
