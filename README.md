# Pathways to Employment

Professional website for Pathways to Employment, an Employment Success Program offering
job readiness training and workplace success coaching: "From Getting the Job to Keeping the Job."

## Overview

A responsive, accessible website built with HTML, CSS, and JavaScript. Features include:

- Contact form via Web3Forms (no online booking widget for now — inquiries come in through
  the form or by phone)
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
- Replace the Web3Forms `access_key` value in `contact.html` with your own key.
- Update the canonical/OG URLs (`https://pathwaystoemployment.com/...`) once a real domain is set.
- If you want online self-scheduling later (Cal.com or similar), re-add the embed and
  restore its allowance in `vercel.json`'s Content-Security-Policy header.
- Consider adding a CSP `report-uri`/`report-to` directive once a real reporting endpoint exists, to catch any future inline-script regressions.

## Deployment

Static site deployable to any hosting platform (Vercel, Netlify, GitHub Pages, or traditional web hosting).

## License

All rights reserved. Pathways to Employment.
