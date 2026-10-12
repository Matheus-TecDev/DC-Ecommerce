import { Router } from "express";
import type { RespostaStatus } from "../types/api";

const router = Router();

router.get<Record<string, never>, RespostaStatus>("/", (_req, res) => {
  res.json({ servico: "Digital Store API", status: "ok" });
});

export default router;
