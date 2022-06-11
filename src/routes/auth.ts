import express from "express";

const router = express.Router();

router.post('/signup', (req: any, res: any) => {
  return res.json({
    message: "Hi there"
  });
});

export default router;
