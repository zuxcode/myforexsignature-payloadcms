/**
 * Plain HTML email templates with inline CSS.
 * No React Email – pure strings for maximum compatibility & zero server/client issues.
 *
 * All styles are inlined (email clients hate <style> tags).
 * Layout uses tables (gold standard for email reliability across Gmail, Outlook, etc.).
 *
 * Branding: Blue gradient header simulated with solid color + subtle shadow.
 * Replace logo URL with your real hosted white logo.
 */

const BRAND_COLOR = '#FFCC00' // Official brand gold – premium & luxurious
const BRAND_SHADOW = 'rgba(255, 204, 0, 0.3)' // Soft gold glow
const TEXT_ON_BRAND = '#1f2937' // Dark gray for excellent contrast/readability on gold
const LINK_COLOR = '#FFCC00'
const currentYear = new Date().getFullYear()

export function getVerificationEmailHTML({
  userFullname,
  verificationUrl,
}: {
  userFullname: string
  verificationUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify your ${process.env.NEXT_PUBLIC_APP_NAME} account</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header – gold brand -->
          <tr>
            <td align="center" style="background:${BRAND_COLOR}; padding:40px 20px;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="${process.env.NEXT_PUBLIC_APP_NAME}" width="180" style="display:block;" />
              <h1 style="color:${TEXT_ON_BRAND}; font-size:28px; margin:20px 0 0;">Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}!</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="font-size:22px; color:#111827; margin:0 0 20px;">Hello ${userFullname},</h2>
              <p style="font-size:16px; line-height:1.6; color:#374151; margin:0 0 20px;">
                Thank you for signing up! We're excited to have you on board.<br />
                To complete your registration and secure your account, please verify your email address.
              </p>
              <p style="font-size:16px; line-height:1.6; color:#374151; margin:0 0 30px;">
                This step helps us keep your account safe and ensures you receive important trading updates.
              </p>
              <!-- CTA -->
              <div style="text-align:center; margin:30px 0;">
                <a href="${verificationUrl}" style="display:inline-block; background:${BRAND_COLOR}; color:${TEXT_ON_BRAND}; font-size:18px; font-weight:bold; padding:16px 32px; border-radius:8px; text-decoration:none; box-shadow:0 4px 10px ${BRAND_SHADOW};">Verify Email Address</a>
              </div>
              <p style="font-size:14px; color:#6b7280; margin:30px 0 0;">
                Or copy and paste this link:<br />
                <a href="${verificationUrl}" style="color:${LINK_COLOR}; word-break:break-all;">${verificationUrl}</a>
              </p>
              <p style="font-size:14px; color:#6b7280; margin:30px 0 0;">
                If you didn't create an account, ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f3f4f6; padding:20px; font-size:13px; color:#6b7280;">
              © ${currentYear} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.<br />
              Lagos, Nigeria • <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:${LINK_COLOR};">${process.env.NEXT_PUBLIC_APP_DOMAIN}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function getPasswordResetEmailHTML({
  userFullname,
  resetUrl,
}: {
  userFullname: string
  resetUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset your ${process.env.NEXT_PUBLIC_APP_NAME} password</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header – gold brand -->
          <tr>
            <td align="center" style="background:${BRAND_COLOR}; padding:40px 20px;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="${process.env.NEXT_PUBLIC_APP_NAME}" width="180" style="display:block;" />
              <h1 style="color:${TEXT_ON_BRAND}; font-size:28px; margin:20px 0 0;">Password Reset Request</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="font-size:22px; color:#111827; margin:0 0 20px;">Hello ${userFullname},</h2>
              <p style="font-size:16px; line-height:1.6; color:#374151; margin:0 0 20px;">
                We received a request to reset your password.<br />
                If you made this request, set a new password below.
              </p>
              <p style="font-size:16px; line-height:1.6; color:#374151; margin:0 0 30px;">
                This link expires in 1 hour for security.
              </p>
              <!-- CTA -->
              <div style="text-align:center; margin:30px 0;">
                <a href="${resetUrl}" style="display:inline-block; background:${BRAND_COLOR}; color:${TEXT_ON_BRAND}; font-size:18px; font-weight:bold; padding:16px 32px; border-radius:8px; text-decoration:none; box-shadow:0 4px 10px ${BRAND_SHADOW};">Reset Password</a>
              </div>
              <p style="font-size:14px; color:#6b7280; margin:30px 0 0;">
                Or copy and paste:<br />
                <a href="${resetUrl}" style="color:${LINK_COLOR}; word-break:break-all;">${resetUrl}</a>
              </p>
              <p style="font-size:14px; color:#6b7280; margin:30px 0 0; font-weight:bold;">
                If you didn't request this, ignore or contact support. Your account is secure.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f3f4f6; padding:20px; font-size:13px; color:#6b7280;">
              © ${currentYear} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.<br />
              Lagos, Nigeria • <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:${LINK_COLOR};">${process.env.NEXT_PUBLIC_APP_DOMAIN}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Welcome Series – now fully branded with #FFCC00 gold
 *
 * Gold evokes wealth, success, and premium quality – perfect for a forex trading platform.
 * Header, buttons, links, and shadows all use the brand color for strong consistency.
 */

export function getWelcomeEmail1HTML({ userFullname }: { userFullname: string }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header – gold brand -->
          <tr>
            <td align="center" style="background:${BRAND_COLOR}; padding:40px 20px;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="${process.env.NEXT_PUBLIC_APP_NAME}" width="180" style="display:block;" />
              <h1 style="color:#1f2937; font-size:28px; margin:20px 0 0;">Welcome aboard, ${userFullname}!</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <p style="font-size:18px; line-height:1.6; color:#111827; margin:0 0 20px;">
                Congratulations on joining ${process.env.NEXT_PUBLIC_APP_NAME} – the premium platform for serious forex traders.
              </p>
              <p style="font-size:16px; line-height:1.6; color:#374151; margin:0 0 30px;">
                Your account is now fully activated. You're ready to explore high-quality signals, secure account management tools, and expert insights.
              </p>
              <!-- CTA -->
              <div style="text-align:center; margin:40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block; background:${BRAND_COLOR}; color:#1f2937; font-size:18px; font-weight:bold; padding:16px 32px; border-radius:8px; text-decoration:none; box-shadow:0 4px 10px ${BRAND_SHADOW};">Go to Your Dashboard</a>
              </div>
              <p style="font-size:16px; line-height:1.6; color:#374151; margin:30px 0 0;">
                Over the next few days, we'll send you tips to help you get the most out of the platform.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f3f4f6; padding:20px; font-size:13px; color:#6b7280;">
              © ${currentYear} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.<br />
              Lagos, Nigeria • <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:${BRAND_COLOR};">${process.env.NEXT_PUBLIC_APP_DOMAIN}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function getWelcomeEmail2HTML({ userFullname }: { userFullname: string }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ready for premium signals?</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header – gold brand -->
          <tr>
            <td align="center" style="background:${BRAND_COLOR}; padding:40px 20px;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="${process.env.NEXT_PUBLIC_APP_NAME}" width="180" style="display:block;" />
              <h1 style="color:#1f2937; font-size:28px; margin:20px 0 0;">Ready for premium signals, ${userFullname}?</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <p style="font-size:18px; line-height:1.6; color:#111827; margin:0 0 20px;">Hi ${userFullname},</p>
              <p style="font-size:16px; line-height:1.6; color:#374151; margin:0 0 20px;">
                You've been with us for a few days – hope you're enjoying the platform!
              </p>
              <p style="font-size:16px; line-height:1.6; color:#374151; margin:0 0 20px;">
                Upgrade to Premium for:
              </p>
              <ul style="font-size:16px; line-height:1.8; color:#374151; margin:0 0 30px; padding-left:20px;">
                <li>Unlimited high-accuracy signals</li>
                <li>Real-time alerts via email</li>
                <li>Advanced risk management tools</li>
                <li>Priority support</li>
              </ul>
              <!-- CTA -->
              <div style="text-align:center; margin:40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="display:inline-block; background:${BRAND_COLOR}; color:#1f2937; font-size:18px; font-weight:bold; padding:16px 32px; border-radius:8px; text-decoration:none; box-shadow:0 4px 10px ${BRAND_SHADOW};">View Pricing Plans</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f3f4f6; padding:20px; font-size:13px; color:#6b7280;">
              © ${currentYear} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.<br />
              Lagos, Nigeria • <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:${BRAND_COLOR};">${process.env.NEXT_PUBLIC_APP_DOMAIN}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
