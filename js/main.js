/**
 * NorthStar Vocational & Life Services
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
    const body = document.body;

    if (!toggle || !mobileNav) return;

    const toggleNav = () => {
      const isOpen = mobileNav.classList.contains('mobile-nav--open');
      mobileNav.classList.toggle('mobile-nav--open');
      toggle.setAttribute('aria-expanded', !isOpen);
      body.style.overflow = isOpen ? '' : 'hidden';

      // Animate hamburger icon
      const spans = toggle.querySelectorAll('span');
      if (!isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    };

    toggle.addEventListener('click', toggleNav);

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('mobile-nav--open');
        toggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
        const spans = toggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('mobile-nav--open')) {
        toggleNav();
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
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  };

  // ==========================================
  // Contact Form Handling with Web3Forms
  // ==========================================
  const initContactForm = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

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

      // Name validation - only letters, spaces, hyphens, apostrophes
      if (field.id === 'name' && value) {
        const nameRegex = /^[A-Za-z\s\-']+$/;
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
        // Create sanitized form data
        const formData = new FormData(form);

        // Sanitize text inputs
        formData.set('name', sanitizeInput(formData.get('name')));
        formData.set('email', sanitizeInput(formData.get('email')));
        formData.set('phone', sanitizeInput(formData.get('phone')));
        formData.set('message', sanitizeInput(formData.get('message')));

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (result.success) {
          // Update last submit time for rate limiting
          lastSubmitTime = Date.now();

          // Show success message
          if (successMessage) successMessage.style.display = 'block';
          form.reset();

          // Scroll to success message
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
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
            errorMessage.textContent = 'There was an error sending your message. Please try again or contact us directly by phone.';
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
  // Intersection Observer for Animations
  // ==========================================
  const initScrollAnimations = () => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements with animation class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  };

  // ==========================================
  // Set Active Navigation Link
  // ==========================================
  const setActiveNavLink = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav__link, .mobile-nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('nav__link--active', 'mobile-nav__link--active');
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
    initScrollAnimations();
    setActiveNavLink();
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
