/**
 * Seed default admin users on startup — Self-hosted only.
 *
 * Automatically creates admin accounts directly in the database on API boot,
 * so you can log in immediately with hardcoded credentials without needing
 * the registration form.
 *
 * Hardcoded default accounts seeded:
 *   1. admin@edutok.online / admin123456
 *   2. iyedjebara@gmail.com / admin123456
 */

import { registerStartupHook } from "./index";
import { db, schema, eq } from "@repo/db";
import { generateId } from "@repo/core";
import { provisionUser } from "../provision-user";

const DEFAULT_USERS = [
  {
    email: process.env.ADMIN_EMAIL?.trim() || "admin@edutok.online",
    password: process.env.ADMIN_PASSWORD?.trim() || "admin123456",
  },
  {
    email: "iyedjebara@gmail.com",
    password: "admin123456",
  },
];

async function seedAdmin(): Promise<void> {
  for (const account of DEFAULT_USERS) {
    const email = account.email.toLowerCase();
    const password = account.password;

    try {
      // Check if user already exists
      const [existing] = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.email, email))
        .limit(1);

      if (existing) {
        console.log(`[seed-admin] User ${email} already exists — skipping.`);
        continue;
      }

      const hashedPassword = await hashWithScrypt(password);
      const userId = generateId("usr");

      await db.transaction(async (tx) => {
        await tx.insert(schema.user).values({
          id: userId,
          name: email.split("@")[0],
          email,
          emailVerified: true,
          role: "admin",
          autoProvisioned: false,
          image: null,
        });

        await tx.insert(schema.account).values({
          id: generateId("acc"),
          userId,
          accountId: userId,
          providerId: "credential",
          password: hashedPassword,
        });
      });

      await provisionUser({
        id: userId,
        name: email.split("@")[0],
        email,
        emailVerified: true,
        role: "admin",
        autoProvisioned: false,
      });

      console.log(`[seed-admin] ✅ Default admin created: ${email}`);
    } catch (err) {
      console.error(`[seed-admin] Failed to seed ${email}:`, err);
    }
  }
}

/** Fallback: Node built-in scrypt password hasher (compatible with Better Auth) */
async function hashWithScrypt(password: string): Promise<string> {
  const { scrypt, randomBytes } = await import("crypto");
  const salt = randomBytes(16).toString("hex");
  const hash = await new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key))),
  );
  return `${salt}:${hash.toString("hex")}`;
}

export function registerSeedAdmin(): void {
  registerStartupHook({
    id: "seed-admin",
    modes: ["selfhosted"],
    run: seedAdmin,
  });
}
