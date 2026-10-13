import { icon } from './visuals.mjs';

/** One approved contact invitation shared by Home and the four detail pages. */
export function contactInvitation({ home = false } = {}) {
  const id = home ? 'home_contact' : 'contact_invitation';
  return `<section class="${home ? 'home-section' : 'section closing-cta'} home-contact" id="${id}" aria-labelledby="${id}_heading"><div class="container home-contact-layout closing-layout" data-reveal="cta" data-duration="960">
    <div><h2 id="${id}_heading">Let's talk about your infrastructure.</h2><p>The right solution starts with a conversation.</p><a class="button home-contact-button" href="/contact/#consultation_form"><span>Talk to Our Team</span>${icon('arrow-up-right', home ? 'home-action-arrow' : '')}</a></div>
    <ul class="home-contact-checklist">${['Your current environment', 'Your priorities', 'Your expected scope'].map(copy => `<li>${icon('shield-check')}<span>${copy}</span></li>`).join('')}</ul>
  </div></section>`;
}
