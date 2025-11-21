import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { hashPassword, verifyPassword } from "@/utils/password";
import { generateToken } from "@/utils/jwt";
// Wallet generation removed - users create wallets client-side

type AuthRequest = {
  email: string;
  password: string;
  name?: string;
  handle?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { email, password, name, handle } = req.body as AuthRequest;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      if (req.query.action === "signup") {
        // Sign up
        if (!name || !name.trim()) {
          return res.status(400).json({ error: "Name is required" });
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate handle from provided handle, name, or email
        let finalHandle: string;
        try {
          if (handle && handle.trim()) {
            // User provided a handle
            const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9._]/g, "");
            if (cleanHandle.length === 0) {
              return res.status(400).json({ error: "Invalid handle format" });
            }
            finalHandle = `@${cleanHandle}`;
          } else {
            // Auto-generate from name
            const handleBase = name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9._]/g, "");
            // Fallback to email if name doesn't generate a valid handle
            if (handleBase.length === 0) {
              const emailBase = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._]/g, "");
              finalHandle = `@${emailBase || "user"}`;
            } else {
              finalHandle = `@${handleBase}`;
            }
          }

          // Validate handle is not empty
          if (!finalHandle || finalHandle.length <= 1) {
            // Ultimate fallback
            const emailBase = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._]/g, "");
            finalHandle = `@${emailBase || "user"}`;
          }

          // Check if handle exists and generate unique one
          let handleExists = await prisma.user.findUnique({ where: { handle: finalHandle } });
          let counter = 1;
          while (handleExists) {
            const baseHandle = finalHandle.slice(1); // Remove @
            finalHandle = `@${baseHandle}${counter}`;
            handleExists = await prisma.user.findUnique({ where: { handle: finalHandle } });
            counter++;
            // Prevent infinite loop
            if (counter > 1000) {
              return res.status(500).json({ error: "Could not generate unique handle. Please try again." });
            }
          }
        } catch (handleError: any) {
          console.error("Handle generation error:", handleError);
          // Fallback to email-based handle
          const emailBase = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._]/g, "");
          finalHandle = `@${emailBase || "user"}`;
        }

        // Generate avatar initials
        const avatarInitials = name
          ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
          : email.slice(0, 2).toUpperCase();

        // Create user
        let user;
        try {
          user = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: name.trim(),
              handle: finalHandle,
              avatarInitials,
              // solanaAddress will be set when user creates wallet client-side
            },
          });
        } catch (createError: any) {
          console.error("User creation error:", createError);
          if (createError.code === "P2002") {
            // Unique constraint violation
            if (createError.meta?.target?.includes("email")) {
              return res.status(400).json({ error: "User with this email already exists" });
            }
            if (createError.meta?.target?.includes("handle")) {
              // Handle collision, try one more time with a random suffix
              const randomSuffix = Math.floor(Math.random() * 10000);
              finalHandle = `${finalHandle}${randomSuffix}`;
              try {
                user = await prisma.user.create({
                  data: {
                    email,
                    password: hashedPassword,
                    name: name.trim(),
                    handle: finalHandle,
                    avatarInitials,
                  },
                });
              } catch (retryError: any) {
                return res.status(500).json({ error: "Failed to create user. Please try again." });
              }
            } else {
              return res.status(400).json({ error: "User already exists" });
            }
          } else {
            throw createError;
          }
        }

        // Generate JWT token
        let token;
        try {
          token = generateToken({
            userId: user.id,
            email: user.email,
          });
        } catch (tokenError: any) {
          console.error("Token generation error:", tokenError);
          return res.status(500).json({ error: "Failed to generate authentication token" });
        }

        return res.status(201).json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            handle: user.handle,
          },
        });
      } else {
        // Login
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = generateToken({
          userId: user.id,
          email: user.email,
        });

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            handle: user.handle,
          },
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        name: error?.name,
      });
      
      // Return detailed error in development, generic in production
      const errorMessage = process.env.NODE_ENV === "development" 
        ? error?.message || "Internal server error"
        : "Internal server error";
      
      return res.status(500).json({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && {
          details: {
            code: error?.code,
            name: error?.name,
            stack: error?.stack?.split('\n').slice(0, 5),
          }
        })
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
