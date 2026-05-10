'use strict';

const CONFIG = {
  WHATSAPP: '5512999999999',
  DEFAULT_MESSAGE: 'Ola! Quero saber mais sobre os passeios em Ilhabela.'
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function buildWhatsAppLink(message) {
  const text = (message && message.trim()) || CONFIG.DEFAULT_MESSAGE;
  return `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(text)}`;
}

function setCurrentYear() {
  const yearEl = $('#current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

function initWhatsAppLinks() {
  $$('.js-whatsapp').forEach((link) => {
    const customMessage = link.dataset.message || CONFIG.DEFAULT_MESSAGE;
    link.setAttribute('href', buildWhatsAppLink(customMessage));
  });
}

function initHeaderScroll() {
  const header = $('.site-header');
  if (!header) return;

  const updateHeaderState = () => {
    header.classList.toggle('scrolled', window.scrollY > 18);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

function initMobileMenu() {
  const menuToggle = $('#menu-toggle');
  const nav = $('#main-nav');

  if (!menuToggle || !nav) return;

  const overlay = document.createElement('button');
  overlay.type = 'button';
  overlay.className = 'menu-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.tabIndex = -1;
  document.body.appendChild(overlay);

  const setMenuOpen = (isOpen) => {
    nav.classList.toggle('is-open', isOpen);
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    overlay.classList.toggle('is-visible', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  };

  const closeMenu = () => setMenuOpen(false);

  menuToggle.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('is-open');
    setMenuOpen(willOpen);
  });

  overlay.addEventListener('click', closeMenu);

  $$('a[href^="#"]', nav).forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && nav.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

function initRevealAnimations() {
  const revealElements = $$('[data-reveal]');
  if (!revealElements.length) return;

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

function initImageFadeIn() {
  const images = $$('.js-image-fade');
  images.forEach((img) => {
    const markAsLoaded = () => img.classList.add('is-loaded');

    if (img.complete) {
      markAsLoaded();
      return;
    }

    img.addEventListener('load', markAsLoaded, { once: true });
    img.addEventListener('error', markAsLoaded, { once: true });
  });
}

function getHeaderHeight() {
  const header = $('.site-header');
  return header ? header.getBoundingClientRect().height : 0;
}

function initSmoothScroll() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = $(href);
    if (!target) return;

    event.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - getHeaderHeight();
    window.scrollTo({ top, behavior: 'smooth' });

    if (history.replaceState) {
      history.replaceState(null, '', href);
    }
  });
}

function initActiveNavLinks() {
  const sections = $$('main section[id]');
  const navLinks = $$('.main-nav a[href^="#"]');

  if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const currentHash = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === currentHash);
        });
      });
    },
    {
      root: null,
      threshold: 0.01,
      rootMargin: '-45% 0px -45% 0px'
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function initGalleryModal() {
  const modal = $('#gallery-modal');
  const closeBtn = $('#modal-close');
  const modalImage = $('#modal-image');
  const modalCaption = $('#modal-caption');
  const items = $$('.gallery-item');

  if (!modal || !closeBtn || !modalImage || !modalCaption || !items.length) {
    return;
  }

  let lastTrigger = null;

  const closeModal = () => {
    if (modal.hidden) return;

    modal.hidden = true;
    modalImage.src = '';
    modalImage.alt = '';
    modalCaption.textContent = '';
    document.body.classList.remove('modal-open');

    if (lastTrigger) {
      lastTrigger.focus();
    }
  };

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const source = item.dataset.modalImage;
      if (!source) return;

      const alt = item.dataset.modalAlt || item.querySelector('img')?.alt || 'Imagem da galeria';
      const caption = item.dataset.modalCaption || '';

      modalImage.src = source;
      modalImage.alt = alt;
      modalCaption.textContent = caption;

      modal.hidden = false;
      document.body.classList.add('modal-open');

      lastTrigger = item;
      closeBtn.focus();
    });
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatDateBr(yyyyMmDd) {
  if (!yyyyMmDd) return 'A combinar';
  const [year, month, day] = yyyyMmDd.split('-');
  return `${day}/${month}/${year}`;
}

function setDateMinInput(dateInput) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  dateInput.min = `${year}-${month}-${day}`;
}

function initBookingForm() {
  const form = $('#booking-form');
  const feedback = $('#form-feedback');
  const nameInput = $('#nome');
  const phoneInput = $('#whatsapp');
  const peopleInput = $('#pessoas');
  const tourInput = $('#passeio');
  const dateInput = $('#data');
  const messageInput = $('#mensagem');

  if (!form || !feedback || !nameInput || !phoneInput || !peopleInput || !tourInput || !dateInput || !messageInput) {
    return;
  }

  setDateMinInput(dateInput);

  phoneInput.addEventListener('input', (event) => {
    const field = event.target;
    field.value = formatPhone(field.value);
  });

  const setFeedback = (message, type) => {
    feedback.textContent = message;
    feedback.style.color = type === 'error' ? '#8c1f1f' : '#24583a';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const people = peopleInput.value.trim();
    const tour = tourInput.value.trim();
    const date = dateInput.value;
    const extraMessage = messageInput.value.trim();

    if (!name || !phone || !people || !tour || !date) {
      setFeedback('Preencha os campos obrigatorios para continuar.', 'error');
      return;
    }

    if (Number(people) < 1) {
      setFeedback('A quantidade de pessoas precisa ser maior que zero.', 'error');
      return;
    }

    const text = [
      'Ola! Quero reservar um passeio na Sallet Tour.',
      '',
      `Nome: ${name}`,
      `WhatsApp: ${phone}`,
      `Quantidade de pessoas: ${people}`,
      `Passeio desejado: ${tour}`,
      `Data desejada: ${formatDateBr(date)}`,
      extraMessage ? `Mensagem: ${extraMessage}` : null
    ]
      .filter(Boolean)
      .join('\n');

    const url = buildWhatsAppLink(text);
    window.open(url, '_blank', 'noopener,noreferrer');

    setFeedback('Perfeito! Abrimos o WhatsApp com sua mensagem.', 'success');
    form.reset();
    setDateMinInput(dateInput);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  initWhatsAppLinks();
  initHeaderScroll();
  initMobileMenu();
  initRevealAnimations();
  initImageFadeIn();
  initSmoothScroll();
  initActiveNavLinks();
  initGalleryModal();
  initBookingForm();
});
