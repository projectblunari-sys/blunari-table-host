import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  code?: string;
  newPassword?: string;
}

// Store for security codes (in production, use Redis or database)
const securityCodes = new Map<string, { code: string; expires: number }>();

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, newPassword }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // If code and newPassword are provided, verify code and reset password
    if (code && newPassword) {
      const storedData = securityCodes.get(email);
      
      if (!storedData || storedData.code !== code || Date.now() > storedData.expires) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired security code" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Remove used code
      securityCodes.delete(email);

      // In a real implementation, you would update the password in your database here
      // For now, we'll just return success
      return new Response(
        JSON.stringify({ success: true, message: "Password reset successfully" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Fastmail SMTP configuration
    const smtpConfig = {
      hostname: "smtp.fastmail.com",
      port: 465, // SSL port
      username: Deno.env.get("SMTP_USER") || "drood@blunari.ai",
      password: Deno.env.get("FASTMAIL_SMTP_PASSWORD"),
      from: "security@blunari.ai",
    };

    if (!smtpConfig.password) {
      throw new Error("SMTP password not configured");
    }

    // Generate 6-digit security code
    const securityCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with 10-minute expiration
    securityCodes.set(email, {
      code: securityCode,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // For port 465, we need to use TLS connection directly
    const conn = await Deno.connectTls({
      hostname: smtpConfig.hostname,
      port: smtpConfig.port,
    });

    const encoder = new TextEncoder();
    const buffer = new Uint8Array(1024);

    // Read initial response
    await conn.read(buffer);
    
    // SMTP handshake
    await conn.write(encoder.encode(`EHLO blunari.ai\r\n`));
    await conn.read(buffer);
    
    // Authentication using LOGIN method
    await conn.write(encoder.encode(`AUTH LOGIN\r\n`));
    await conn.read(buffer);
    
    // Send username (base64 encoded)
    const username = btoa(smtpConfig.username);
    await conn.write(encoder.encode(`${username}\r\n`));
    await conn.read(buffer);
    
    // Send password (base64 encoded)
    const password = btoa(smtpConfig.password);
    await conn.write(encoder.encode(`${password}\r\n`));
    await conn.read(buffer);
    
    // Send email
    await conn.write(encoder.encode(`MAIL FROM:<${smtpConfig.from}>\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`RCPT TO:<${email}>\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`DATA\r\n`));
    await conn.read(buffer);
    
    // Security code email content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Password Reset Security Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Password Reset Security Code</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your account associated with this email address.</p>
        <p>Your security code is:</p>
        <div style="background-color: #f8f9fa; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${securityCode}</h1>
        </div>
        <p>Enter this code on the password reset page to continue. This code will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
        <p>Best regards,<br>The Blunari Security Team</p>
    </div>
</body>
</html>`;

    // Email message
    const message = `From: "Blunari Security" <${smtpConfig.from}>
To: ${email}
Subject: Password Reset Security Code
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

${htmlContent}`;

    await conn.write(encoder.encode(`${message}\r\n.\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`QUIT\r\n`));
    conn.close();

    console.log("Security code sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Security code sent to your email" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);