import { icon, solutionIcon } from './visuals.mjs';
import { contactInvitation } from './contact-invitation-markup.mjs';
import { escape } from './html.mjs';

const arrow = () => icon('arrow-up-right', 'home-action-arrow');
const link = (label, href, classes = 'home-text-link', contextId = '') => `<a class="${classes}" href="${href}"${contextId ? ` aria-labelledby="solution-link-${contextId} solution-title-${contextId}"` : ''}><span${contextId ? ` id="solution-link-${contextId}"` : ''}>${label}</span>${arrow()}</a>`;
const solutions = [
  ['enterprise-networking', "Enterprise Networking", "Flexible, reliable and manageable connectivity."],
  ['data-center-networking', "Data Center Networking", "Connect compute, storage and applications."],
  ['cybersecurity', "Cybersecurity", "Control access and protect network resources."],
  ['cloud-security', "Cloud Security", "Protect workloads across cloud environments."],
];
const needs = [
  ["Connect offices &amp; branches", "Connect your people and workplaces.", 'enterprise-networking'],
  ["Upgrade data center networking", "Scalable infrastructure that is easier to manage.", 'data-center-networking'],
  ["Protect your systems &amp; cloud", "Control access and protect your digital environment.", 'cybersecurity'],
];

/** Home A keeps all destinations and diagram labels in native HTML. */
export function home(serviceContent) {
  return `<section class="home-hero" id="hero" aria-labelledby="hero_heading">
    <div class="container"><div class="home-hero-copy">
      <span class="hero-domain">Enterprise networking &amp; cybersecurity</span>
      <h1 id="hero_heading" data-hero><span>Built to Connect.</span><span>Designed to Protect.</span></h1>
      <p data-hero>Networking and security solutions, designed around your business.</p>
      <div class="actions" data-hero>${link("Discuss your needs", '/contact/#consultation_form', 'button button-primary')}</div>
    </div></div>
    <figure class="home-panorama" data-hero><div class="container">
      <div class="connection-art-frame" data-hero-graphic="panorama"><img src="/assets/images/home-a-network-panorama.webp" srcset="/assets/images/home-a-network-panorama-720.webp 720w, /assets/images/home-a-network-panorama.webp 2172w" sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 64px), 1200px" width="2172" height="724" alt="Illustration connecting an office, branch, gateway, data center and cloud" fetchpriority="high" decoding="async">
        <svg class="connection-signal-graphic" data-connection-graphic viewBox="0 0 2172 724" aria-hidden="true" focusable="false">
          <path data-connection-signal d="M530 538 C550 535 555 540 574 550 C590 564 601 567 618 567 L660 567" pathLength="100"/>
          <path data-connection-signal d="M903 536 C922 536 928 549 942 549 L1023 549" pathLength="100"/>
          <path data-connection-signal d="M1165 549 L1246 549 C1254 549 1260 526 1286 526 L1294 526" pathLength="100"/>
          <path data-connection-signal d="M1705 541 Q1719 550 1730 549 C1744 549 1750 504 1796 504" pathLength="100"/>
        </svg>
      </div>
      <ul class="home-panorama-labels" aria-hidden="true"><li>Head office</li><li>Branch</li><li>Gateway</li><li>Data Center</li><li>Cloud</li></ul>
    </div></figure>
  </section>
  <section class="home-section home-needs" id="customer_needs" aria-labelledby="needs_heading"><div class="container home-needs-layout">
    <div><h2 id="needs_heading">What does your business need?</h2><p>Start with your real needs.</p></div>
    <ol class="home-needs-list">${needs.map(([title, copy, anchor], index) => `<li data-reveal="rise" data-duration="600"><a href="/solutions/#${anchor}"><span class="need-number" aria-hidden="true">0${index + 1}</span><span class="need-copy"><strong>${title}</strong><span>${copy}</span></span>${arrow()}</a></li>`).join('')}</ol>
  </div></section>
  <section class="home-section home-solutions" id="core_solutions" aria-labelledby="solutions_heading"><div class="container">
    <div class="home-section-heading"><h2 id="solutions_heading">Connectivity and security, together</h2><p>Coordinated, flexible solutions built around your business.</p></div>
    <div class="home-solution-map">
      <figure class="home-map-art" data-reveal="slide" data-duration="700"><img src="/assets/images/home-a-solutions-map.webp" srcset="/assets/images/home-a-solutions-map-720.webp 720w, /assets/images/home-a-solutions-map.webp 1448w" sizes="(max-width: 767px) 80vw, 38vw" width="1448" height="1086" alt="Illustration of business infrastructure with connectivity and security layers" loading="lazy" decoding="async"></figure>
      ${solutions.map(([id, title, copy], index) => `<article class="solution-card home-solution-node node-${index}"><span class="home-node-symbol">${icon(solutionIcon(index))}</span><div><h3 id="solution-title-${id}">${title}</h3><p>${copy}</p>${link("Explore Our Solutions", '/solutions/#' + id, 'home-text-link', id)}</div></article>`).join('')}
    </div>
  </div></section>
  <section class="home-section home-approach" id="why_pay_orbit" aria-labelledby="approach_heading"><div class="container">
    <h2 id="approach_heading">Network and cybersecurity services</h2><p>Consulting, solution design, deployment and ongoing support for your infrastructure.</p>
    <ol class="home-service-steps">${serviceContent.services.map(({ title, id }, index) => `<li><a href="/services/#${escape(id)}"><span class="home-step-number" aria-hidden="true">0${index + 1}</span><strong>${escape(title)}</strong></a></li>`).join('')}</ol>
    ${link("Explore Our Services", '/services/')}
  </div></section>
  <section class="home-section home-technology" id="technology_focus" aria-labelledby="technology_heading"><div class="container">
    <h2 id="technology_heading">Technology that fits your needs</h2><p>Select the right technology for your business requirements.</p>
    <div class="home-vendors" aria-label="Technology groups by vendor">
      <a href="/products/#cisco"><span class="vendor-brand"><img class="vendor-logo vendor-logo-cisco" src="/assets/brand/vendors/cisco.svg" width="40" height="40" alt="Cisco" loading="lazy" decoding="async"></span><span class="vendor-capabilities">Networking · Wireless · Collaboration</span>${arrow()}</a>
      <a href="/products/#palo-alto-networks"><span class="vendor-brand"><img class="vendor-logo vendor-logo-palo-alto" src="/assets/brand/vendors/palo-alto.svg" width="348" height="65" alt="Palo Alto Networks" loading="lazy" decoding="async"></span><span class="vendor-capabilities">Network Security · Cloud Security · Security Operations</span>${arrow()}</a>
    </div>
  </div></section>
  <section class="home-section home-company" id="company_intro" aria-labelledby="company_heading"><div class="container">
    <h2 id="company_heading">PAY ORBIT — starting with real needs.</h2><p>An Australia-based technology company focused on enterprise networking, cybersecurity and digital infrastructure.</p>${link("About PAY ORBIT", '/about/')}
  </div></section>
  ${contactInvitation({ home: true })}`;
}
