import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { hashPassword, verifyPassword } from "@/utils/password";
import { generateToken } from "@/utils/jwt";
import { sendEmail, generateOTPEmail } from "@/utils/email";
import crypto from "crypto";
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

        // Check if user exists - handle Prisma client sync issues
        let existingUser;
        try {
          existingUser = await prisma.user.findUnique({
            where: { email },
          });
        } catch (prismaError: any) {
          // If error is due to missing column, try raw query
          if (prismaError.code === "P2022" && prismaError.message?.includes("emailVerified")) {
            const rawUser = await prisma.$queryRaw`
              SELECT id, email FROM "User" WHERE email = ${email}
            ` as any[];
            existingUser = rawUser.length > 0 ? { id: rawUser[0].id, email: rawUser[0].email } : null;
          } else {
            throw prismaError;
          }
        }

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

        // Generate 6-digit OTP
        let otp: string;
        let expiresAt: Date;
        try {
          otp = crypto.randomInt(100000, 999999).toString();
          expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry
        } catch (otpError: any) {
          console.error("OTP generation error:", otpError);
          return res.status(500).json({ error: "Failed to generate verification code" });
        }

        // Create user
        let user;
        try {
          // Try to create user with email verification fields
          // If migration hasn't run yet, this will fail and we'll retry without those fields
          user = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: name.trim(),
              handle: finalHandle,
              avatarInitials,
              emailVerified: false,
              emailVerificationToken: otp,
              emailVerificationTokenExpires: expiresAt,
              // solanaAddress will be set when user creates wallet client-side
            },
          });
        } catch (createError: any) {
          console.error("User creation error:", createError);
          console.error("Error details:", {
            message: createError.message,
            code: createError.code,
            name: createError.name,
            meta: createError.meta,
          });
          
          // Check if error is due to missing columns (migration not run)
          // Prisma errors for unknown fields can come in different formats
          const errorMessage = String(createError.message || "");
          const errorCode = String(createError.code || "");
          const errorName = String(createError.name || "");
          
          // Try fallback for ANY error (safer approach)
          // If it's not a duplicate user error, try creating without email verification fields
          const isDuplicateError = createError.code === "P2002";
          const isUnknownFieldError = 
            !isDuplicateError && (
              errorMessage.includes("Unknown arg") ||
              errorMessage.includes("emailVerified") ||
              errorMessage.includes("emailVerificationToken") ||
              errorMessage.includes("Unknown field") ||
              errorCode === "P2009" || // Prisma validation error
              errorCode === "P2012" || // Missing required value
              errorName.includes("Prisma") ||
              errorMessage.toLowerCase().includes("column") ||
              errorMessage.toLowerCase().includes("field")
            );
            
          // Always try fallback if it's not a duplicate user error
          if (!isDuplicateError) {
            console.warn("Email verification columns not found - migration may not have run. Creating user without verification.");
            console.warn("Original error:", createError.message, createError.code);
            // Fallback: create user without email verification fields (for backward compatibility)
            try {
              user = await prisma.user.create({
                data: {
                  email,
                  password: hashedPassword,
                  name: name.trim(),
                  handle: finalHandle,
                  avatarInitials,
                  // Skip email verification fields if migration hasn't run
                },
              });
              // Send OTP email anyway (it will just log in dev mode)
              await sendEmail({
                to: email,
                subject: "Verify Your Email - TigerPayX",
                html: generateOTPEmail(otp, name.trim()),
              });
              // Return success but note that verification is not enforced
              return res.status(201).json({
                success: true,
                message: "Account created! Please run database migration to enable email verification.",
                requiresVerification: false,
                email: user.email,
                token: generateToken({
                  userId: user.id,
                  email: user.email,
                }),
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  handle: user.handle,
                },
              });
            } catch (fallbackError: any) {
              console.error("Fallback user creation error:", fallbackError);
              console.error("Fallback error details:", {
                message: fallbackError.message,
                code: fallbackError.code,
                name: fallbackError.name,
                meta: fallbackError.meta,
              });
              if (fallbackError.code === "P2002") {
                if (fallbackError.meta?.target?.includes("email")) {
                  return res.status(400).json({ error: "User with this email already exists" });
                }
              }
              // If fallback also fails, return the original error message
              return res.status(500).json({ 
                error: fallbackError.message || "Failed to create user. Please check server logs.",
                details: process.env.NODE_ENV === "development" ? {
                  originalError: createError.message,
                  fallbackError: fallbackError.message,
                } : undefined,
              });
            }
          }
          
          // Handle duplicate user error
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
                    emailVerified: false,
                    emailVerificationToken: otp,
                    emailVerificationTokenExpires: expiresAt,
                  },
                });
              } catch (retryError: any) {
                return res.status(500).json({ error: "Failed to create user. Please try again." });
              }
            } else {
              return res.status(400).json({ error: "User already exists" });
            }
          } else {
            // If we get here, it's an unexpected error
            // Log it and return a user-friendly error
            console.error("Unexpected user creation error:", createError);
            return res.status(500).json({ 
              error: "Failed to create account. Please try again.",
              details: process.env.NODE_ENV === "development" ? {
                message: createError.message,
                code: createError.code,
              } : undefined,
            });
          }
        }

        // Send OTP email (non-blocking - don't fail signup if email fails)
        let emailSent = false;
        try {
          const emailResult = await sendEmail({
            to: email,
            subject: "Verify Your Email - TigerPayX",
            html: generateOTPEmail(otp, name.trim()),
          });

          if (!emailResult.success) {
            console.error("Failed to send OTP email:", emailResult.error);
            // In development, log the OTP so user can test
            if (process.env.NODE_ENV === "development") {
              console.log("📧 OTP for testing (dev mode):", otp);
            }
          } else {
            console.log("OTP email sent successfully to:", email);
            emailSent = true;
          }
        } catch (emailError: any) {
          console.error("Error sending OTP email (non-fatal):", emailError);
          // In development, log the OTP so user can test
          if (process.env.NODE_ENV === "development") {
            console.log("📧 OTP for testing (dev mode, email failed):", otp);
          }
          // Don't throw - allow signup to proceed even if email fails
        }

        // Don't generate token yet - user needs to verify email first
        return res.status(201).json({
          success: true,
          message: emailSent 
            ? "Account created! Please check your email for verification code."
            : "Account created! Please check your email for verification code. If you don't receive it, check server logs (dev mode) or contact support.",
          requiresVerification: true,
          email: user.email,
          ...(process.env.NODE_ENV === "development" && { 
            devModeOTP: otp // Only in dev mode for testing
          }),
        });
      } else {
        // Login - handle Prisma client sync issues
        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email },
          });
        } catch (prismaError: any) {
          // If error is due to missing column (P2022), use raw query
          if (prismaError.code === "P2022" && prismaError.message?.includes("emailVerified")) {
            console.warn("Prisma client out of sync - using raw query for login");
            // Try to include emailVerified if column exists in DB
            try {
              const rawUsers = await prisma.$queryRaw`
                SELECT id, email, password, name, handle, "emailVerified"
                FROM "User"
                WHERE email = ${email}
              ` as any[];
              user = rawUsers.length > 0 ? rawUsers[0] : null;
            } catch (rawError: any) {
              // If emailVerified column doesn't exist in DB either, query without it
              const rawUsers = await prisma.$queryRaw`
                SELECT id, email, password, name, handle
                FROM "User"
                WHERE email = ${email}
              ` as any[];
              user = rawUsers.length > 0 ? rawUsers[0] : null;
              if (user) {
                user.emailVerified = undefined;
              }
            }
          } else {
            throw prismaError;
          }
        }

        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check if email is verified (only if the column exists)
        // If emailVerified field doesn't exist (migration not run), skip verification check
        if (user.emailVerified !== undefined && !user.emailVerified) {
          return res.status(403).json({ 
            error: "Please verify your email address before logging in.",
            requiresVerification: true,
            email: user.email,
          });
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
            emailVerified: user.emailVerified,
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
