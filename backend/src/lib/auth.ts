import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "../prisma/db"; //  prisma client instance

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql", // or "mysql", "sqlite", ...etc
    }),
    emailAndPassword:{
        enabled:true
    }
});