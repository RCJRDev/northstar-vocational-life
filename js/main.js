/**
 * Pathways to Employment
 * Main JavaScript File
 */

(function() {
  'use strict';

  // ==========================================
  // Mobile Navigation
  // ==========================================
  const initMobileNav = () => {
    const toggle = document.querySelector('.header__mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav__link');
    const spans = toggle ? toggle.querySelectorAll('span') : null;
    const body = document.body;

    // Landmarks that sit behind the full-screen mobile-nav overlay once it's
    // open. The header itself (logo + toggle button) stays visually on top
    // of the overlay (higher z-index) and stays interactive, but the
    // desktop `.nav`/CTA (relevant if the viewport is resized while the
    // menu is open) plus <main> and <footer> are covered by the overlay and
    // must not be reachable via Tab/Shift+Tab or AT while it's open.
    const desktopNav = document.querySelector('.nav');
    const headerCta = document.querySelector('.header__cta');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const backgroundEls = [desktopNav, headerCta, main, footer].filter(Boolean);

    if (!toggle || !mobileNav) return;

    // The mobile nav panel is moved off-screen with a CSS transform (not
    // display:none), so without this it stays reachable via Tab/AT even
    // while visually hidden. `inert` + aria-hidden remove it from the
    // focus order and accessibility tree until it's actually open.
    const setNavOpen = (open) => {
      mobileNav.classList.toggle('mobile-nav--open', open);
      toggle.setAttribute('aria-expanded', String(open));
      body.style.overflow = open ? 'hidden' : '';

      if (open) {
        mobileNav.removeAttribute('aria-hidden');
        mobileNav.removeAttribute('inert');
      } else {
        mobileNav.setAttribute('aria-hidden', 'true');
        mobileNav.setAttribute('inert', '');
      }

      // Trap focus inside the open overlay: everything behind it becomes
      // inert so Tab/Shift+Tab can't escape past the mobile nav's links
      // into content sitting underneath. The toggle button itself is left
      // alone (it's outside backgroundEls) so it stays operable to close
      // the menu.
      backgroundEls.forEach((el) => {
        if (open) {
          el.setAttribute('aria-hidden', 'true');
          el.setAttribute('inert', '');
        } else {
          el.removeAttribute('aria-hidden');
          el.removeAttribute('inert');
        }
      });

      // Animate hamburger icon
      if (spans && spans.length === 3) {
        if (open) {
          spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
          spans[1].style.opacity = '0';
          spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
          spans[0].style.transform = '';
          spans[1].style.opacity = '';
          spans[2].style.transform = '';
        }
      }
    };

    toggle.addEventListener('click', () => {
      setNavOpen(!mobileNav.classList.contains('mobile-nav--open'));
    });

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => setNavOpen(false));
    });

    // Close on escape key and return focus to the toggle button
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('mobile-nav--open')) {
        setNavOpen(false);
        toggle.focus();
      }
    });
  };

  // ==========================================
  // Header Scroll Effect
  // ==========================================
  const initHeaderScroll = () => {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }, { passive: true });
  };

  // ==========================================
  // Smooth Scroll for Anchor Links
  // ==========================================
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const header = document.querySelector('.header');
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Move focus to the target (e.g. the "Skip to main content" link)
          // so keyboard/screen-reader users actually land where the page
          // scrolled to, instead of focus staying on the link they clicked.
          const hadTabIndex = target.hasAttribute('tabindex');
          if (!hadTabIndex) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          if (!hadTabIndex) {
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
          }
        }
      });
    });
  };

  // ==========================================
  // Contact Form Handling (self-hosted /api/contact)
  // ==========================================
  const initContactForm = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Record when the form loaded, for the server's timing-based anti-spam check.
    const formLoadedAtField = form.querySelector('#form-loaded-at');
    if (formLoadedAtField) formLoadedAtField.value = String(Date.now());

    const submitBtn = form.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('form-success');
    const errorMessage = document.getElementById('form-error');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Rate limiting - prevent rapid submissions
    let lastSubmitTime = 0;
    const RATE_LIMIT_MS = 30000; // 30 seconds between submissions

    // Sanitize input - strip potentially dangerous characters
    const sanitizeInput = (str) => {
      if (!str) return '';
      return str
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
    };

    // Form validation
    const validateField = (field) => {
      const value = field.value.trim();
      const errorEl = field.parentElement.querySelector('.form-error');
      let isValid = true;
      let errorMsg = '';

      // Skip hidden fields
      if (field.type === 'hidden' || field.type === 'checkbox') {
        return true;
      }

      // Required check
      if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMsg = 'This field is required';
      }

      // Name validation - letters (incl. accented/Spanish characters), spaces, hyphens, apostrophes
      if (field.id === 'name' && value) {
        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/;
        if (!nameRegex.test(value)) {
          isValid = false;
          errorMsg = 'Please enter a valid name (letters only)';
        } else if (value.length < 2) {
          isValid = false;
          errorMsg = 'Name must be at least 2 characters';
        }
      }

      // Email validation - stricter regex
      if (field.type === 'email' && value) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(value) || value.length > 254) {
          isValid = false;
          errorMsg = 'Please enter a valid email address';
        }
      }

      // Phone validation (optional but if filled, validate format)
      if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        const digitsOnly = value.replace(/\D/g, '');
        if (!phoneRegex.test(value) || digitsOnly.length < 10 || digitsOnly.length > 15) {
          isValid = false;
          errorMsg = 'Please enter a valid phone number (10-15 digits)';
        }
      }

      // Message validation
      if (field.id === 'message' && value) {
        if (value.length < 10) {
          isValid = false;
          errorMsg = 'Message must be at least 10 characters';
        }
      }

      // Show/hide error
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.style.display = isValid ? 'none' : 'block';
      }

      // Visual feedback
      if (!isValid) {
        field.style.borderColor = 'var(--color-error)';
      } else {
        field.style.borderColor = '';
      }

      return isValid;
    };

    // Add blur validation to fields
    const fields = form.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]), select, textarea');
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.style.borderColor) {
          validateField(field);
        }
      });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check honeypot - if filled, silently reject (it's a bot)
      const honeypot = form.querySelector('#botcheck');
      if (honeypot && honeypot.checked) {
        // Fake success for bots
        if (successMessage) successMessage.style.display = 'block';
        form.reset();
        return;
      }

      // Rate limiting check
      const now = Date.now();
      if (now - lastSubmitTime < RATE_LIMIT_MS) {
        const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
        if (errorMessage) {
          errorMessage.textContent = `Please wait ${waitTime} seconds before submitting again.`;
          errorMessage.style.display = 'block';
        }
        return;
      }

      // Validate all fields
      let isFormValid = true;
      fields.forEach(field => {
        if (!validateField(field)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        // Focus first invalid field
        const firstInvalid = form.querySelector('[style*="border-color"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnLoader) btnLoader.style.display = 'inline-flex';

      // Hide previous messages
      if (successMessage) successMessage.style.display = 'none';
      if (errorMessage) errorMessage.style.display = 'none';

      try {
        // Build a sanitized JSON payload for our own /api/contact endpoint
        const formData = new FormData(form);

        const payload = {
          name: sanitizeInput(formData.get('name')),
          email: sanitizeInput(formData.get('email')),
          phone: sanitizeInput(formData.get('phone')),
          service: formData.get('service') || '',
          message: sanitizeInput(formData.get('message')),
          botcheck: honeypot ? honeypot.checked : false,
          formLoadedAt: formData.get('formLoadedAt') || ''
        };

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Parse the response body separately from the fetch itself: a JSON
        // parse failure means the server sent something unexpected (e.g. an
        // HTML error page), not an API-supplied message — never surface that
        // raw parser error to the user.
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          throw new Error('__unexpected_response__');
        }

        if (result.success) {
          // Update last submit time for rate limiting
          lastSubmitTime = Date.now();

          // Show success message
          if (successMessage) successMessage.style.display = 'block';
          form.reset();

          // Scroll to success message
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // result.message here is always a safe, human-written string from
          // our own /api/contact endpoint (validation errors, etc.)
          throw new Error(result.message || 'Something went wrong');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          if (errorMessage) {
            errorMessage.textContent = 'Request timed out. Please check your internet connection and try again.';
            errorMessage.style.display = 'block';
          }
        } else {
          console.error('Form submission error:', error);
          if (errorMessage) {
            const isSafeApiMessage = error.message
              && error.message !== 'Something went wrong'
              && error.message !== '__unexpected_response__';
            errorMessage.textContent = isSafeApiMessage
              ? error.message
              : 'There was an error sending your message. Please try again or contact us directly by phone.';
            errorMessage.style.display = 'block';
          }
        }
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
      }
    });
  };

  // ==========================================
  // Accordion Functionality
  // ==========================================
  const initAccordion = () => {
    const accordionHeaders = document.querySelectorAll('.accordion__header');

    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const isOpen = item.classList.contains('accordion__item--open');

        // Close all other items (optional - remove for multi-open)
        // item.parentElement.querySelectorAll('.accordion__item').forEach(i => {
        //   i.classList.remove('accordion__item--open');
        // });

        // Toggle current item
        item.classList.toggle('accordion__item--open', !isOpen);
        header.setAttribute('aria-expanded', !isOpen);
      });

      // Keyboard accessibility
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  };

  // ==========================================
  // Set Active Navigation Link
  // ==========================================
  const setActiveNavLink = () => {
    // Normalize both the current URL and each link's href to a bare page
    // name (no leading/trailing slashes, no .html extension) so this still
    // matches correctly whether the site is served with the .html
    // extension or via Vercel's cleanUrls (e.g. "/about" instead of
    // "/about.html") - the raw pathname comparison used previously only
    // ever matched the homepage under cleanUrls.
    const normalize = (path) => {
      const clean = path.split('#')[0].split('?')[0]
        .replace(/^\/+|\/+$/g, '')
        .replace(/\.html$/i, '');
      return clean === '' ? 'index' : clean;
    };

    const currentPage = normalize(window.location.pathname);

    document.querySelectorAll('.nav__link, .mobile-nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const isActive = normalize(href) === currentPage;
      // Only toggle the class that matches this link's own nav (desktop vs
      // mobile) rather than applying both to every match.
      const activeClass = link.classList.contains('mobile-nav__link')
        ? 'mobile-nav__link--active'
        : 'nav__link--active';

      link.classList.toggle(activeClass, isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  // ==========================================
  // Initialize All Modules
  // ==========================================
  const init = () => {
    initMobileNav();
    initHeaderScroll();
    initSmoothScroll();
    initContactForm();
    initAccordion();
    setActiveNavLink();
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
