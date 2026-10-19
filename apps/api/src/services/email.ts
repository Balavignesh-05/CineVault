import { Resend } from 'resend';
import { config } from '../config/env';

const resend = config.email.resendApiKey ? new Resend(config.email.resendApiKey) : null;

export interface EmailResult {
  sent: boolean;
  reason?: string;
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<EmailResult> {
  const resetUrl = `${config.appUrl}/reset-password?token=${resetToken}`;

  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not configured — password reset email not sent');
    // DO NOT log the token itself
    return { sent: false, reason: 'EMAIL_NOT_CONFIGURED' };
  }

  try {
    const { error } = await resend.emails.send({
      from: config.email.from,
      to: email,
      subject: 'Reset your CineVault password',
      html: buildResetEmailHtml(resetUrl),
    });

    if (error) {
      console.error('[Email] Resend delivery error:', error.message);
      return { sent: false, reason: 'DELIVERY_FAILED' };
    }

    return { sent: true };
  } catch (err) {
    console.error('[Email] Resend send error:', (err as Error).message);
    return { sent: false, reason: 'SEND_ERROR' };
  }
}

function buildResetEmailHtml(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0F14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F14;padding:40px 20px;">
    <tr><td align="center">
      <table width="460" cellpadding="0" cellspacing="0" style="background:#131A22;border:1px solid #273442;border-radius:16px;padding:40px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="font-size:24px;font-weight:800;color:#F4F3EC;letter-spacing:-0.5px;">🎬 CineVault</div>
          <div style="font-size:10px;color:#9AA8B7;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">The Cinema Social Platform</div>
        </td></tr>
        <tr><td>
          <h1 style="color:#F4F3EC;font-size:20px;font-weight:700;margin:0 0 12px;">Reset your password</h1>
          <p style="color:#9AA8B7;font-size:14px;line-height:1.6;margin:0 0 24px;">We received a request to reset your CineVault password. Click the button below to choose a new password.</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">
            <a href="${resetUrl}" style="display:inline-block;background:#35D6A0;color:#0B0F14;font-weight:700;font-size:14px;padding:12px 32px;border-radius:12px;text-decoration:none;">Reset Password</a>
          </td></tr></table>
          <p style="color:#9AA8B7;font-size:12px;line-height:1.5;margin:0 0 16px;">This link will expire in <strong style="color:#F4F3EC;">1 hour</strong>. If you didn't request this, you can safely ignore this email — your password will remain unchanged.</p>
          <div style="border-top:1px solid #273442;padding-top:16px;margin-top:8px;">
            <p style="color:#9AA8B7;font-size:11px;line-height:1.4;margin:0;">If the button doesn't work, copy and paste this URL into your browser:</p>
            <p style="color:#35D6A0;font-size:11px;word-break:break-all;margin:4px 0 0;">${resetUrl}</p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
