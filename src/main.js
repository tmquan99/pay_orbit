import { installEnquiryForm } from './enquiry-form.js';
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

installEnquiryForm();
