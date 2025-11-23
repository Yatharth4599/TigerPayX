/**
 * Script to set a user as admin
 * Usage: npx ts-node scripts/set-admin.ts <email>
 * 
 * This script bypasses the admin middleware since we need to set the first admin
 */

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function setAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    if (user.isAdmin) {
      console.log(`✅ User ${email} is already an admin`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
    });

    console.log(`✅ Successfully set ${email} as admin`);
  } catch (error: any) {
    console.error("Error setting admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx ts-node scripts/set-admin.ts <email>");
  process.exit(1);
}

setAdmin(email);

