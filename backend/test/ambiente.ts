import fs from "fs";
import os from "os";
import path from "path";

export const SEGREDO = "segredo-usado-somente-nos-testes-automatizados";

export const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "dc-ecommerce-test-"));

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = SEGREDO;
process.env.JWT_EXPIRES_IN = "1h";
process.env.SALT_HASH = "4";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.DATA_DIR = dataDir;
