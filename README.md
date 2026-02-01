# NorthStar Vocational & Life Services Website

A professional, production-ready website for NorthStar Vocational & Life Services offering life coaching and vocational counseling.

## Project Structure

```
/
├── index.html              # Home page
├── life-coaching.html      # Life Coaching services page
├── vocational-counseling.html  # Vocational Counseling services page
├── about.html              # About page with credentials
├── contact.html            # Contact page with Web3Forms
├── css/
│   └── styles.css          # Main stylesheet with color system
├── js/
│   └── main.js             # JavaScript for interactions
└── README.md               # This file
```

## Features

- **Responsive Design**: Mobile-first approach, works on all devices
- **Accessibility**: WCAG-friendly with semantic HTML, ARIA labels, skip links, and keyboard navigation
- **Performance**: No heavy frameworks, optimized CSS, minimal JavaScript
- **SEO**: Meta tags, semantic structure, Open Graph tags
- **Contact Form**: Web3Forms integration with validation and spam protection

## Color Palette

The website uses a calming blue color scheme:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary 900 | `#0c2340` | Dark backgrounds, headings |
| Primary 700 | `#234e7a` | Hero gradients |
| Primary 600 | `#2b6cb0` | Primary buttons, links |
| Primary 500 | `#3182ce` | Focus states |
| Primary 100 | `#e0f2fe` | Light backgrounds |
| Primary 50 | `#f0f9ff` | Alt section backgrounds |
| Neutral 800 | `#2d3748` | Body text |
| Neutral 600 | `#718096` | Secondary text |

## Setup Instructions

### 1. Web3Forms Integration

To enable the contact form:

1. Go to [Web3Forms](https://web3forms.com)
2. Sign up for a free account
3. Create a new form with email: `northstarvocationallife@gmail.com`
4. Copy your Access Key
5. Open `contact.html` and replace `YOUR_WEB3FORMS_ACCESS_KEY` with your actual key:

```html
<input type="hidden" name="access_key" value="YOUR_ACTUAL_KEY_HERE">
```

### 2. Cal.com Scheduling Integration

The website uses [Cal.com](https://cal.com) for online scheduling. To configure:

1. Sign up for a free account at [Cal.com](https://cal.com)
2. Create an event type (e.g., "Free Consultation" - 30 min)
3. Note your Cal.com link (e.g., `cal.com/your-username/consultation`)
4. Open `contact.html` and find this line (~line 387):

```javascript
calLink: "YOUR-CALCOM-USERNAME/consultation"
```

5. Replace `YOUR-CALCOM-USERNAME/consultation` with your actual Cal.com link path (e.g., `jane-smith/free-consultation`)

### 3. Deployment

The website is static HTML/CSS/JS and can be deployed to any hosting service:

**GitHub Pages:**
1. Create a new repository
2. Push all files to the `main` branch
3. Go to Settings > Pages > Deploy from `main` branch

**Netlify:**
1. Drag and drop the project folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository

**Vercel:**
1. Import your GitHub repository at [Vercel](https://vercel.com)
2. Deploy with default settings

**Traditional Hosting:**
1. Upload all files via FTP to your `public_html` folder

## Customization

### Fonts

The website uses:
- **Inter** - Body text (Google Fonts)
- **Merriweather** - Headings (Google Fonts)

To change fonts, update the Google Fonts link in each HTML file's `<head>` and the CSS variables in `styles.css`.

### Colors

All colors are defined as CSS custom properties in `:root` at the top of `styles.css`. Modify these values to change the color scheme site-wide.

### Content

All content is in the HTML files. Key areas to customize:
- Phone number: `(860) 265-6437` (search and replace)
- Email: `northstarvocationallife@gmail.com`
- Business name and taglines
- Service descriptions
- About page biography

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Accessibility Features

- Skip to main content link
- Semantic HTML5 structure
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Reduced motion preference support
- Color contrast compliance
- Form validation with screen reader announcements

## License

This website was created for NorthStar Vocational & Life Services. All rights reserved.
