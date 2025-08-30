import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, text, html }: EmailData = await req.json();

    // Fastmail SMTP configuration
    const smtpConfig = {
      hostname: "smtp.fastmail.com",
      port: 587,
      username: "no-reply@blunari.ai",
      password: Deno.env.get("FASTMAIL_SMTP_PASSWORD"),
    };

    // Create email message
    const message = `From: "Blunari" <no-reply@blunari.ai>
To: ${to}
Subject: ${subject}
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

${html}`;

    // Send email via SMTP
    const conn = await Deno.connect({
      hostname: smtpConfig.hostname,
      port: smtpConfig.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // SMTP handshake
    await conn.write(encoder.encode(`EHLO blunari.ai\r\n`));
    await conn.write(encoder.encode(`STARTTLS\r\n`));
    
    // Authentication
    const authString = btoa(`${smtpConfig.username}:${smtpConfig.password}`);
    await conn.write(encoder.encode(`AUTH PLAIN ${authString}\r\n`));
    
    // Send email
    await conn.write(encoder.encode(`MAIL FROM:<no-reply@blunari.ai>\r\n`));
    await conn.write(encoder.encode(`RCPT TO:<${to}>\r\n`));
    await conn.write(encoder.encode(`DATA\r\n`));
    await conn.write(encoder.encode(`${message}\r\n.\r\n`));
    await conn.write(encoder.encode(`QUIT\r\n`));

    conn.close();

    console.log("Password reset email sent successfully to:", to);

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