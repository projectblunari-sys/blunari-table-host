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
      port: 465, // SSL port
      username: Deno.env.get("SMTP_USER") || "drood@blunari.ai",
      password: Deno.env.get("FASTMAIL_SMTP_PASSWORD"),
      from: "security@blunari.ai",
    };

    // For port 465, we need to use TLS connection directly
    const conn = await Deno.connectTls({
      hostname: smtpConfig.hostname,
      port: smtpConfig.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Read initial response
    const buffer = new Uint8Array(1024);
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
    const password = btoa(smtpConfig.password || "");
    await conn.write(encoder.encode(`${password}\r\n`));
    await conn.read(buffer);
    
    // Send email
    await conn.write(encoder.encode(`MAIL FROM:<${smtpConfig.from}>\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`RCPT TO:<${to}>\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`DATA\r\n`));
    await conn.read(buffer);
    
    // Email message
    const message = `From: "Blunari Security" <${smtpConfig.from}>
To: ${to}
Subject: ${subject}
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

${html}`;

    await conn.write(encoder.encode(`${message}\r\n.\r\n`));
    await conn.read(buffer);
    
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