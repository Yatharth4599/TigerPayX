/**
 * Script to check if a user is admin
 * Usage: npx ts-node scripts/check-admin.ts <email>
 */

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function checkAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isAdmin: true,
      },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`\n📧 User: ${user.email}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`👑 Admin: ${user.isAdmin ? "✅ YES" : "❌ NO"}`);
    
    if (!user.isAdmin) {
      console.log(`\n💡 To set as admin, run: npx ts-node scripts/set-admin.ts ${email}`);
    }
  } catch (error: any) {
    console.error("Error checking admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx ts-node scripts/check-admin.ts <email>");
  process.exit(1);
}

checkAdmin(email);

