import { installReferenceReveals } from './reveals.js';
import { installConnectionScene } from './connection-scene.js';
import { installAboutStory } from './about-story.js';
import { installSolutions } from './solutions.js';
import { installServices } from './services.js';
import { installSmoothScroll } from './smooth-scroll.js';
import { installProducts } from './products.js';
import { installHeroGraphics } from './hero-graphics.js';
import { installBackToTop } from './back-to-top.js';
import { installFooterMotion } from './footer.js';

document.documentElement.classList.add('has-js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const heroAnimations = new Set();
function stopHero() {
  heroAnimations.forEach(animation => animation.cancel());
  heroAnimations.clear();
}
if (!reduced.matches && scrollY < 80 && document.visibilityState !== 'hidden') {
  document.querySelectorAll('[data-hero]').forEach((element, index) => {
    // Transform-only: content is never hidden late while fonts or media load.
    const animation = element.animate([{ transform: `translateY(${index === 3 ? 12 : 16}px)` }, { transform: 'none' }], {
      duration: 650, delay: Math.min(index * 70, 210), easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards',
    });
    heroAnimations.add(animation);
    animation.onfinish = () => { heroAnimations.delete(animation); animation.cancel(); };
  });
}
const onMotionPreference = () => { if (reduced.matches) stopHero(); };
reduced.addEventListener('change', onMotionPreference);
const cleanupReveals = installReferenceReveals();
let cleanupConnection = installConnectionScene();
let cleanupAboutStory = installAboutStory();
let cleanupSolutions = installSolutions();
let cleanupServices = installServices();
let cleanupProducts = installProducts();
let cleanupHeroGraphics = installHeroGraphics();
let cleanupSmoothScroll = installSmoothScroll();
let cleanupBackToTop = installBackToTop();
let cleanupFooter = installFooterMotion();
addEventListener('pagehide', event => {
  stopHero();
  cleanupReveals();
  cleanupConnection();
  cleanupAboutStory({ preserveLayout: event.persisted });
  cleanupSolutions();
  cleanupServices();
  cleanupProducts();
  cleanupHeroGraphics();
  cleanupSmoothScroll();
  cleanupBackToTop();
  cleanupFooter();
  reduced.removeEventListener('change', onMotionPreference);
});
addEventListener('pageshow', event => {
  if (event.persisted) {
    cleanupConnection = installConnectionScene();
    cleanupAboutStory = installAboutStory();
    cleanupSolutions = installSolutions();
    cleanupServices = installServices();
    cleanupProducts = installProducts();
    cleanupHeroGraphics = installHeroGraphics();
    cleanupSmoothScroll = installSmoothScroll();
    cleanupBackToTop = installBackToTop();
    cleanupFooter = installFooterMotion();
  }
});

const menu = document.querySelector('.menu-toggle');
const navigation = document.getElementById('site_navigation');
function closeMenu(returnFocus = false) {
  navigation.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
  if (returnFocus) menu.focus();
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
});

const form = document.getElementById('consultation_form');
if (form) {
  const messages = JSON.parse(document.getElementById('form_messages').textContent);
  const requestedProduct = new URLSearchParams(location.search).get('product');
  const selectedProduct = Object.hasOwn(messages.products || {}, requestedProduct) ? messages.products[requestedProduct] : null;
  if (selectedProduct && !form.elements.requirement.value.trim()) form.elements.requirement.value = selectedProduct;
  const status = document.getElementById('form_status');
  const fallback = document.getElementById('copy_fallback');
  const copyText = document.getElementById('copy_text');
  const copyButton = document.getElementById('copy_button');
  function validateField(field) {
    const message = field.id === 'name' && !field.value.trim() ? messages.nameRequired
      : field.id === 'requirement' && !field.value.trim() ? messages.requirementRequired
        : field.id === 'email' && field.validity.typeMismatch ? messages.emailInvalid : '';
    const error = document.getElementById(`${field.id}_error`);
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) { error.textContent = message; error.hidden = !message; }
    return !message;
  }
  form.addEventListener('input', event => {
    status.textContent = '';
    fallback.hidden = true;
    if (event.target.getAttribute('aria-invalid') === 'true') validateField(event.target);
  });
  const prepareInquiry = async event => {
    event.preventDefault();
    status.textContent = '';
    fallback.hidden = true;
    const fields = ['name', 'email', 'requirement'].map(id => document.getElementById(id));
    const invalid = fields.filter(field => !validateField(field));
    if (invalid.length) { invalid[0].focus(); return; }
    const labels = messages.labels;
    const text = Object.entries(labels).map(([id, label]) => {
      const value = form.elements.namedItem(id).value.trim();
      return value ? `${label}: ${value}` : '';
    }).filter(Boolean).join('\n');
    const button = copyButton;
    button.disabled = true;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = messages.copied;
    } catch {
      copyText.value = text;
      fallback.hidden = false;
      status.textContent = messages.manualCopy;
      copyText.focus();
      copyText.select();
    } finally { button.disabled = false; }
  };
  form.addEventListener('submit', prepareInquiry);
  copyButton.addEventListener('click', prepareInquiry);
  copyButton.disabled = false;
}
