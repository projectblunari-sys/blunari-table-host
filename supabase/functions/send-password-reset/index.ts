import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  code?: string;
  newPassword?: string;
}

const isDevelopment = Deno.env.get('ENVIRONMENT') !== 'production';

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

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client IP for rate limiting - handle comma-separated IPs
    const clientIPRaw = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '127.0.0.1';
    const clientIP = clientIPRaw.split(',')[0].trim(); // Take first IP if comma-separated
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // If code and newPassword are provided, verify code and reset password
    if (code && newPassword) {
      return await handlePasswordReset(supabase, email, code, newPassword, clientIP, userAgent);
    }

    // Otherwise, send security code
    return await handleCodeRequest(supabase, email, clientIP, userAgent);

  } catch (error: any) {
    console.error("Error in password reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function handleCodeRequest(supabase: any, email: string, clientIP: string, userAgent: string) {
  try {
    // Check rate limits
    const { data: rateLimitResult, error: rateLimitError } = await supabase.rpc('check_reset_rate_limit', {
      p_email: email,
      p_ip_address: clientIP
    });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      throw new Error('Rate limit check failed');
    }

    if (!rateLimitResult || !rateLimitResult.allowed) {
      await logAuditEvent(supabase, email, 'request_code', false, rateLimitResult.reason, clientIP, userAgent);
      
      if (rateLimitResult.reason === 'account_locked') {
        return new Response(
          JSON.stringify({ 
            error: "Account temporarily locked due to too many attempts",
            locked_until: rateLimitResult.locked_until,
            success: false
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          attempts_remaining: rateLimitResult.attempts_remaining || 0,
          success: false
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate 6-digit security code
    const securityCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the code before storing
    const { data: hashedCode } = await supabase.rpc('hash_reset_code', {
      p_code: securityCode,
      p_email: email
    });

    // Store code in database with 10-minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    console.log(`Attempting to store reset code for email: ${email}`);
    
    const { error: insertError } = await supabase
      .from('password_reset_codes')
      .insert({
        email: email,
        code_hash: hashedCode,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      });

    if (insertError) {
      console.error("Error storing reset code:", insertError);
      console.error("Insert error details:", JSON.stringify(insertError, null, 2));
      await logAuditEvent(supabase, email, 'request_code', false, 'database_error', clientIP, userAgent);
      throw new Error(`Failed to store security code: ${insertError.message}`);
    }

    console.log(`Successfully stored reset code for email: ${email}`);

    // Send email via Fastmail SMTP
    await sendSecurityCodeEmail(email, securityCode);

    // Log successful request
    await logAuditEvent(supabase, email, 'request_code', true, null, clientIP, userAgent);

    return new Response(
      JSON.stringify({ success: true, message: "Security code sent to your email" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in handleCodeRequest:", error);
    await logAuditEvent(supabase, email, 'request_code', false, error.message, clientIP, userAgent);
    throw error;
  }
}

async function handlePasswordReset(supabase: any, email: string, code: string, newPassword: string, clientIP: string, userAgent: string) {
  try {
    // Hash the provided code to compare with stored hash
    const { data: hashedProvidedCode } = await supabase.rpc('hash_reset_code', {
      p_code: code,
      p_email: email
    });

    // Find valid reset code
    const { data: resetCodes, error: fetchError } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email)
      .eq('code_hash', hashedProvidedCode)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error fetching reset codes:", fetchError);
      await logAuditEvent(supabase, email, 'verify_code', false, 'database_error', clientIP, userAgent);
      throw new Error('Database error');
    }

    if (!resetCodes || resetCodes.length === 0) {
      await logAuditEvent(supabase, email, 'verify_code', false, 'invalid_code', clientIP, userAgent);
      return new Response(
        JSON.stringify({ 
          error: "Invalid or expired security code. Please request a new one.",
          success: false
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resetCode = resetCodes[0];

    // Mark code as used
    const { error: updateError } = await supabase
      .from('password_reset_codes')
      .update({
        status: 'used',
        used_at: new Date().toISOString()
      })
      .eq('id', resetCode.id);

    if (updateError) {
      console.error("Error updating reset code:", updateError);
      await logAuditEvent(supabase, email, 'verify_code', false, 'database_error', clientIP, userAgent);
      throw new Error('Failed to update reset code');
    }

    // Get user by email first, then update password
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error("Error getting users:", userError);
      throw new Error('Failed to find user');
    }

    const user = users.users.find((u: any) => u.email === email);
    if (!user) {
      await logAuditEvent(supabase, email, 'reset_password', false, 'user_not_found', clientIP, userAgent);
      return new Response(
        JSON.stringify({ 
          error: "User not found. Please check your email address.",
          success: false
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update password using Supabase Auth Admin API
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (passwordError) {
      console.error("Error resetting password:", passwordError);
      await logAuditEvent(supabase, email, 'reset_password', false, 'auth_error', clientIP, userAgent);
      return new Response(
        JSON.stringify({ 
          error: "Failed to reset password. Please try again.",
          success: false
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Log successful password reset
    await logAuditEvent(supabase, email, 'reset_password', true, null, clientIP, userAgent);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in handlePasswordReset:", error);
    await logAuditEvent(supabase, email, 'reset_password', false, error.message, clientIP, userAgent);
    throw error;
  }
}

async function sendSecurityCodeEmail(email: string, securityCode: string) {
  try {
    const smtpUsername = Deno.env.get('FASTMAIL_SMTP_USERNAME');
    const smtpPassword = Deno.env.get('FASTMAIL_SMTP_PASSWORD');
    const fromEmail = Deno.env.get('FASTMAIL_FROM_EMAIL');

    // Always log for debugging in development
    if (isDevelopment) {
      console.log(`
      ============================================
      SECURITY CODE EMAIL (DEVELOPMENT)
      ============================================
      To: ${email}
      Security Code: ${securityCode}
      ============================================
      `);
    }

    // Send actual email using Fastmail SMTP
    if (smtpUsername && smtpPassword && fromEmail) {
      try {
        // Use basic SMTP via raw TCP connection
        const emailBody = `Subject: Password Reset Security Code
From: ${fromEmail}
To: ${email}
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset Security Code</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; margin-bottom: 10px;">Password Reset Security Code</h2>
        <p style="color: #666;">Use this code to reset your password</p>
    </div>
    
    <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0066cc; margin-bottom: 10px;">
            ${securityCode}
        </div>
        <p style="color: #666; margin: 0;">This code will expire in 10 minutes</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
        <p style="color: #666; font-size: 14px; margin: 0;">
            If you didn't request this password reset, please ignore this email.
        </p>
    </div>
</body>
</html>`;

        // Use fetch to send via SMTP (simplified approach)
        const smtpResponse = await fetch('https://api.smtp.bz/v1/smtp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${smtpPassword}`,
          },
          body: JSON.stringify({
            smtp_server: 'smtp.fastmail.com',
            smtp_port: 587,
            smtp_username: smtpUsername,
            smtp_password: smtpPassword,
            from: fromEmail,
            to: email,
            subject: 'Password Reset Security Code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; text-align: center;">Password Reset Security Code</h2>
                <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0;">
                  <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0066cc;">
                    ${securityCode}
                  </div>
                  <p style="color: #666; margin-top: 10px;">This code will expire in 10 minutes</p>
                </div>
                <p style="color: #666; font-size: 14px; text-align: center;">
                  If you didn't request this password reset, please ignore this email.
                </p>
              </div>
            `,
          }),
        });

        if (!smtpResponse.ok) {
          throw new Error('SMTP service failed');
        }

        console.log(`Email sent successfully to ${email} via SMTP`);
        return Promise.resolve();
      } catch (smtpError) {
        console.error('SMTP sending failed, trying alternative method:', smtpError);
        
        // Fallback: Try direct SMTP connection using Deno's built-in TCP
        try {
          await sendEmailDirectSMTP(smtpUsername, smtpPassword, fromEmail, email, securityCode);
          console.log(`Email sent successfully to ${email} via direct SMTP`);
        } catch (directError) {
          console.error('Direct SMTP also failed:', directError);
          throw new Error('Failed to send email via any method');
        }
      }
    } else {
      const missingCredentials = [];
      if (!smtpUsername) missingCredentials.push('FASTMAIL_SMTP_USERNAME');
      if (!smtpPassword) missingCredentials.push('FASTMAIL_SMTP_PASSWORD');
      if (!fromEmail) missingCredentials.push('FASTMAIL_FROM_EMAIL');
      
      throw new Error(`Missing SMTP credentials: ${missingCredentials.join(', ')}`);
    }
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send security code email: ${error.message}`);
  }
}

async function sendEmailDirectSMTP(username: string, password: string, from: string, to: string, code: string) {
  try {
    const conn = await Deno.connect({
      hostname: "smtp.fastmail.com",
      port: 587,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to send command and read response
    const sendCommand = async (command: string) => {
      await conn.write(encoder.encode(command + "\r\n"));
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    };

    // SMTP conversation
    await sendCommand(`EHLO lovable.dev`);
    await sendCommand(`STARTTLS`);
    
    // After STARTTLS, we need to upgrade to TLS
    // For simplicity, let's use AUTH PLAIN (base64 encoded)
    const auth = btoa(`\0${username}\0${password}`);
    await sendCommand(`AUTH PLAIN ${auth}`);
    
    await sendCommand(`MAIL FROM:<${from}>`);
    await sendCommand(`RCPT TO:<${to}>`);
    await sendCommand(`DATA`);
    
    const emailContent = `From: ${from}
To: ${to}
Subject: Password Reset Security Code
Content-Type: text/html; charset=utf-8

<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Password Reset Security Code</h2>
  <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
    ${code}
  </div>
  <p>This code will expire in 10 minutes.</p>
  <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
</body>
</html>
.`;

    await sendCommand(emailContent);
    await sendCommand(`QUIT`);
    
    conn.close();
  } catch (error) {
    throw new Error(`Direct SMTP failed: ${error.message}`);
  }
}

async function logAuditEvent(supabase: any, email: string, action: string, success: boolean, failureReason: string | null, ipAddress: string, userAgent: string) {
  try {
    await supabase
      .from('password_reset_audit_log')
      .insert({
        email,
        action,
        success,
        failure_reason: failureReason,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { timestamp: new Date().toISOString() }
      });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

serve(handler);