// Email service utility for sending OTP and verification emails
// Supports Resend, SendGrid, or SMTP

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // Check which email service is configured
    const emailService = process.env.EMAIL_SERVICE || "resend"; // resend, sendgrid, or smtp

    if (emailService === "resend") {
      return await sendViaResend(options);
    } else if (emailService === "sendgrid") {
      return await sendViaSendGrid(options);
    } else if (emailService === "smtp") {
      return await sendViaSMTP(options);
    } else {
      // Fallback: Log email in development (for testing without email service)
      if (process.env.NODE_ENV === "development") {
        console.log("📧 Email (dev mode - not sent):", {
          to: options.to,
          subject: options.subject,
          text: options.text || options.html.substring(0, 100),
        });
        return { success: true };
      }
      return { success: false, error: "Email service not configured" };
    }
  } catch (error: any) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}

async function sendViaResend(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // In development or if no API key, just log and return success (email won't be sent)
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email (dev mode - RESEND_API_KEY not configured):", {
        to: options.to,
        subject: options.subject,
      });
      return { success: true };
    }
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "TigerPayX <noreply@tigerpayx.com>",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      console.error("Resend API error:", errorData);
      // In development, still return success to allow testing
      if (process.env.NODE_ENV === "development") {
        console.log("📧 Email (dev mode - Resend failed, but continuing):", {
          to: options.to,
          subject: options.subject,
        });
        return { success: true };
      }
      return { success: false, error: errorData.message || "Failed to send email via Resend" };
    }

    const data = await response.json();
    return { success: true };
  } catch (error: any) {
    console.error("Resend API exception:", error);
    // In development, still return success to allow testing
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email (dev mode - exception caught, but continuing):", {
        to: options.to,
        subject: options.subject,
      });
      return { success: true };
    }
    return { success: false, error: error.message || "Resend API error" };
  }
}

async function sendViaSendGrid(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return { success: false, error: "SENDGRID_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: process.env.EMAIL_FROM || "noreply@tigerpayx.com" },
        subject: options.subject,
        content: [
          { type: "text/html", value: options.html },
          ...(options.text ? [{ type: "text/plain", value: options.text }] : []),
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText || "Failed to send email via SendGrid" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "SendGrid API error" };
  }
}

async function sendViaSMTP(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // For SMTP, you would use nodemailer or similar
  // This is a placeholder - implement if needed
  return { success: false, error: "SMTP not yet implemented. Please use Resend or SendGrid." };
}

/**
 * Generate OTP email HTML template
 */
export function generateOTPEmail(otp: string, name?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - TigerPayX</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff6b00 0%, #ff8c42 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">TigerPayX</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
        ${name ? `<p>Hi ${name},</p>` : '<p>Hello,</p>'}
        <p>Thank you for signing up for TigerPayX! Please verify your email address by entering the following code:</p>
        <div style="background: white; border: 2px solid #ff6b00; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #ff6b00; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't create an account with TigerPayX, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} TigerPayX. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

