/**
 * Contact form handler — sends submissions as email via Gmail SMTP (nodemailer).
 *
 * Required environment variables (set in Vercel Project Settings > Environment
 * Variables, never committed to the repo):
 *   SMTP_USER        - the sending Gmail address (e.g. jnet3461@gmail.com)
 *   SMTP_PASS        - a Gmail "App Password" for that account (NOT the normal
 *                       account login password). Generate one at
 *                       Google Account > Security > 2-Step Verification > App Passwords.
 *   CONTACT_TO_EMAIL - optional; recipient address. Defaults to jnet3461@gmail.com
 *                       (same account sends to itself) if not set.
 *
 * After adding/changing these in the Vercel dashboard, redeploy the project —
 * serverless functions only pick up env var changes on a new deployment.
 */

const nodemailer = require('nodemailer');

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const PHONE_REGEX = /^[\d\s\-()+]+$/;

const MIN_FORM_FILL_MS = 3000; // reject submissions faster than this as likely bots

const fakeSuccess = (res) => res.status(200).json({ success: true });

function validate(body) {
  const errors = [];

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const service = typeof body.service === 'string' ? body.service.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length < 2 || name.length > 100 || !NAME_REGEX.test(name)) {
    errors.push('Please enter a valid name.');
  }

  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    errors.push('Please enter a valid email address.');
  }

  if (phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    if (phone.length > 20 || !PHONE_REGEX.test(phone) || digitsOnly.length < 10 || digitsOnly.length > 15) {
      errors.push('Please enter a valid phone number.');
    }
  }

  if (!service) {
    errors.push('Please select a program of interest.');
  }

  if (!message || message.length < 10 || message.length > 2000) {
    errors.push('Message must be between 10 and 2000 characters.');
  }

  return { errors, name, email, phone, service, message };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot: bots fill hidden fields. Pretend success, do nothing.
  if (body.botcheck) {
    return fakeSuccess(res);
  }

  // Timing check: humans take at least a few seconds to fill out the form.
  const formLoadedAt = Number(body.formLoadedAt);
  if (Number.isFinite(formLoadedAt) && Date.now() - formLoadedAt < MIN_FORM_FILL_MS) {
    return fakeSuccess(res);
  }

  const { errors, name, email, phone, service, message } = validate(body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0] });
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error('Contact form: missing SMTP_USER/SMTP_PASS environment variables.');
    return res.status(500).json({
      success: false,
      message: 'There was a problem sending your message. Please try again or contact us by phone.',
    });
  }

  const toEmail = process.env.CONTACT_TO_EMAIL || 'jnet3461@gmail.com';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const textBody = [
    `New contact form submission from Pathways to Employment`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Program Interest: ${service}`,
    ``,
    `Message:`,
    message,
  ].join('\n');

  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const htmlBody = `
    <p><strong>New contact form submission from Pathways to Employment</strong></p>
    <p>
      <strong>Name:</strong> ${escapeHtml(name)}<br>
      <strong>Email:</strong> ${escapeHtml(email)}<br>
      <strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}<br>
      <strong>Program Interest:</strong> ${escapeHtml(service)}
    </p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: toEmail,
      replyTo: email,
      subject: `New inquiry: ${service} — from ${name}`,
      text: textBody,
      html: htmlBody,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form: failed to send email via SMTP.', err);
    return res.status(500).json({
      success: false,
      message: 'There was a problem sending your message. Please try again or contact us by phone.',
    });
  }
};
