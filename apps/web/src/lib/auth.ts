import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://siakad.alfida.or.id",
    trustedOrigins: [
        "https://siakad.alfida.or.id",
        "http://siakad.alfida.or.id",
        "http://localhost:3000",
    ],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    databaseHooks: {
        user: {
            create: {
                before: async (data) => {
                    data.id = crypto.randomUUID();
                    return { data };
                }
            }
        },
        session: {
            create: {
                before: async (data) => {
                    data.id = crypto.randomUUID();
                    return { data };
                }
            }
        },
        account: {
            create: {
                before: async (data) => {
                    data.id = crypto.randomUUID();
                    return { data };
                }
            }
        },
        verification: {
            create: {
                before: async (data) => {
                    data.id = crypto.randomUUID();
                    return { data };
                }
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        password: {
            hash: async (password: string) => {
                return await bcrypt.hash(password, 10);
            },
            verify: async (data: { hash: string; password: string }) => {
                // Fallback jika hash berformat scrypt (salt:key)
                if (data.hash && data.hash.includes(":")) {
                    const [saltStr, storedKey] = data.hash.split(":");
                    const config = { N: 16384, r: 16, p: 1, dkLen: 64 };
                    const crypto = await import("crypto");
                    return new Promise((resolve) => {
                        crypto.scrypt(
                            data.password.normalize("NFKC"),
                            saltStr,
                            config.dkLen,
                            { N: config.N, r: config.r, p: config.p, maxmem: 128 * config.N * config.r * 2 },
                            (err, key) => {
                                if (err) return resolve(false);
                                resolve(key.toString("hex") === storedKey);
                            }
                        );
                    });
                }
                // Standar bcrypt
                return await bcrypt.compare(data.password, data.hash);
            }
        }
    },
    user: {
        additionalFields: {
            fullName: { type: "string" },
            isActive: { type: "boolean" },
            passwordHash: { type: "string" },
            firstName: { type: "string", required: false },
            lastName: { type: "string", required: false },
            phone: { type: "string", required: false },
            leaveQuota: { type: "number" },
            groups: { type: "string[]" },
        }
    }
});
