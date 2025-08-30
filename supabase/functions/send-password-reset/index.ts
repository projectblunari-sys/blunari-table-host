import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
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
    
    // Password reset email content
    const resetLink = `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?token=PASSWORD_RESET&type=recovery&redirect_to=${encodeURIComponent("https://kbfbbkcaxhzlnbqxwgoz.supabase.co/")}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Password Reset Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your account associated with this email address.</p>
        <p>If you made this request, please click the link below to reset your password:</p>
        <p style="margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </p>
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>Best regards,<br>The Blunari Security Team</p>
    </div>
</body>
</html>`;

    // Email message
    const message = `From: "Blunari Security" <${smtpConfig.from}>
To: ${email}
Subject: Password Reset Request
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

${htmlContent}`;

    await conn.write(encoder.encode(`${message}\r\n.\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`QUIT\r\n`));
    conn.close();

    console.log("Password reset email sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent" }),
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