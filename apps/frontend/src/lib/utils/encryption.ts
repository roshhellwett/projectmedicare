import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
// The key should be a 32-byte hex string (64 characters)
const ENCRYPTION_KEY = process.env.APP_ENCRYPTION_KEY || "";

if (!ENCRYPTION_KEY) {
  console.warn("APP_ENCRYPTION_KEY is not set in the environment.");
}

export function encrypt(text: string) {
  if (!ENCRYPTION_KEY) {
    throw new Error("Missing APP_ENCRYPTION_KEY");
  }

  const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
  if (keyBuffer.length !== 32) {
    throw new Error("APP_ENCRYPTION_KEY must be a 32-byte hex string");
  }

  // 12 bytes is standard for GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encryptedValue: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag,
  };
}

export function decrypt(encryptedText: string, ivHex: string, authTagHex: string) {
  if (!ENCRYPTION_KEY) {
    throw new Error("Missing APP_ENCRYPTION_KEY");
  }

  const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
  const ivBuffer = Buffer.from(ivHex, "hex");
  const authTagBuffer = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, ivBuffer);
  decipher.setAuthTag(authTagBuffer);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
