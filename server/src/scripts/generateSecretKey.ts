// src/scripts/generateSecretKey.ts
import crypto from "crypto";

function generateSecretKey() {
  // Generate a random 256-bit key
  const secretKey = crypto.randomBytes(32).toString("hex");

  console.info(`[${new Date().toISOString()}] Generated SECRET_KEY:`);
  console.info(secretKey);
  console.info("\nPlease add the following line to your .env file:");
  console.info(`TOKEN_SECRET=${secretKey}`);
  console.info("\nMake sure to keep your .env file secure and do not commit it to version control.");
}

generateSecretKey();
