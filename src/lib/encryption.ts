import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Generate a random key for local testing if not provided in ENV.
// In production, this MUST be provided via ENV and be exactly 32 bytes (hex or base64 encoded).
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    console.warn("WARNING: ENCRYPTION_KEY environment variable is not set. Using a fallback key for development only. DO NOT USE IN PRODUCTION.");
    return crypto.scryptSync("development_fallback_password", "salt", 32);
  }
  
  if (key.length === 64) {
    // Assuming hex
    return Buffer.from(key, "hex");
  } else {
    // Assuming base64 or raw string padded/truncated to 32 bytes
    const buf = Buffer.from(key, "base64");
    if (buf.length === 32) return buf;
    
    // Last resort fallback: hash the string to 32 bytes
    return crypto.createHash("sha256").update(key).digest();
  }
};

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
};

export const decrypt = (encryptedData: string): string => {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) throw new Error("Invalid encrypted data format");
    
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];
    
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return ""; // Return empty string or throw error depending on desired UX
  }
};
