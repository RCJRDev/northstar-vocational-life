# Pathways to Employment

Professional website for Pathways to Employment, an Employment Success Program offering
job readiness training and workplace success coaching: "From Getting the Job to Keeping the Job."

## Overview

A responsive, accessible website built with HTML, CSS, and JavaScript. Features include:

- Contact form powered by a self-hosted Vercel serverless function (`api/contact.js`) that
  emails submissions via Gmail SMTP — no third-party form service (no online booking widget
  for now — inquiries come in through the form or by phone)
- Mobile-friendly design
- WCAG accessibility compliance

## Pages

- `index.html` — Home
- `getting-hired.html` — Job readiness: assessment, job search strategy, resume & interview prep
- `workplace-success.html` — Soft skills: communication, professionalism, self-advocacy, career advancement
- `about.html` — About the program
- `contact.html` — Contact form and phone/email

## Before Launch

- Replace the placeholder phone `(555) 123-4567` and email `info@pathwaystoemployment.com`
  with real contact details throughout the HTML files.
- Set up the contact form's email delivery (see "Contact Form Email Setup" below).
- Update the canonical/OG URLs (`https://pathwaystoemployment.com/...`) once a real domain is set.
- If you want online self-scheduling later (Cal.com or similar), re-add the embed and
  restore its allowance in `vercel.json`'s Content-Security-Policy header.
- Consider adding a CSP `report-uri`/`report-to` directive once a real reporting endpoint exists, to catch any future inline-script regressions.

## Contact Form Email Setup

The contact form is handled by `api/contact.js`, a Vercel serverless function that sends
submissions as an email via Gmail SMTP (using the `nodemailer` package) — no third-party
form service involved. It requires a Gmail "App Password" and a couple of environment
variables set in the Vercel dashboard.

### 1. Generate a Gmail App Password

1. Sign in to the Google Account that will send the emails (`jnet3461@gmail.com`).
2. Go to **Google Account > Security**.
3. Make sure **2-Step Verification** is turned ON (App Passwords require it).
4. Go to **Security > App Passwords** (search "App Passwords" if you don't see it).
5. Create a new app password, choosing "Mail" as the app. Google will generate a
   16-character password — copy it (you won't be able to view it again).

### 2. Set environment variables in Vercel

In the Vercel dashboard: **Project Settings > Environment Variables**, add:

| Variable           | Value                                              | Required |
|---------------------|-----------------------------------------------------|----------|
| `SMTP_USER`         | `jnet3461@gmail.com`                                 | Yes |
| `SMTP_PASS`          | The 16-character App Password generated above (NOT the normal Gmail login password) | Yes |
| `CONTACT_TO_EMAIL`  | A different recipient address, if you don't want submissions to go to `jnet3461@gmail.com` | No |

### 3. Redeploy

After adding or changing environment variables, trigger a new deployment (push a commit,
or use "Redeploy" in the Vercel dashboard) — serverless functions only pick up environment
variable changes on a fresh deployment, not on existing ones.

## Deployment

Static site deployable to any hosting platform (Vercel, Netlify, GitHub Pages, or traditional web hosting).

## License

All rights reserved. Pathways to Employment.
