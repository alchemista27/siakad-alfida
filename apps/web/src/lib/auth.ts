import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
