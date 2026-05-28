import bcrypt from "bcryptjs";

export class BcryptCryptoEngine {
  private readonly SALT_ROUNDS = 10;

  async hash(value: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return await bcrypt.hash(value, salt);
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    try {
      return await bcrypt.compare(value, hashedValue);
    } catch {
      return false;
    }
  }
}
