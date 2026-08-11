import "server-only";
import bcrypt from "bcryptjs";

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !expectedHash) {
    throw new Error("ADMIN_USERNAME or ADMIN_PASSWORD_HASH not configured");
  }

  if (username !== expectedUsername) {
    // Still hash to keep timing roughly constant regardless of username validity.
    await bcrypt.compare(password, expectedHash);
    return false;
  }

  return bcrypt.compare(password, expectedHash);
}
