import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { icon, badge, solutionIcon, productIcon, illustration, lifecycle, solutionOverview, technologyOverview, technologyGraphic, connectionScene } from './visuals.mjs';
import { aboutStoryScene } from './about-story-markup.mjs';
import { solutionSections } from './solutions-markup.mjs';
import { serviceIntro, serviceSections } from './services-markup.mjs';
import { footerGraphic } from './footer-graphic.mjs';
import { home } from './home-markup.mjs';
import { contactInvitation } from './contact-invitation-markup.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workbook = JSON.parse(await fs.readFile(path.join(root, 'content/workbook.json'), 'utf8'));
const serviceContent = JSON.parse(await fs.readFile(path.join(root, 'content/services.json'), 'utf8'));
const text = (sheet, cell) => workbook.sheets[sheet][cell];
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const paragraph = (sheet, cell, attributes = '') => `<p${attributes}>${escape(text(sheet, cell))}</p>`;
function formatCompanyIntroduction(copy, hero = false) {
  const keywords = ['enterprise networking,', 'cybersecurity', 'digital infrastructure.', 'secure,', 'scalable', 'resilient'];
  const paragraphs = copy.split(/(?<=\.)\s+(?=We support)/u);
  return `<div class="company-introduction"${hero ? ' data-hero' : ''}>${paragraphs.map(value => `<p>${keywords.reduce((markup, keyword) => markup.replace(escape(keyword), `<strong>${escape(keyword)}</strong>`), value)}</p>`).join('')}</div>`;
}
const button = (label, href, classes = 'button-primary') => `<a class="button ${classes}" href="${href}">${href.startsWith('tel:') ? icon('phone') : ''}<span>${escape(label)}</span>${href.startsWith('tel:') ? '' : icon('arrow-up-right')}</a>`;
const links = [["Home", '/'], ["About Us", '/about/'], ["Solutions", '/solutions/'], ["Services", '/services/'], ["Products & Technology", '/products/'], ["Contact", '/contact/']];
const solutions = [
  ['enterprise-networking', "Enterprise Networking", "Connect offices, branches and users with manageable, scalable network infrastructure."],
  ['data-center-networking', "Data Center Networking", "Connect compute, storage and applications with redundancy and operational visibility."],
  ['cybersecurity', "Cybersecurity", "Strengthen system protection with firewalls, access controls and network segmentation."],
  ['cloud-security', "Cloud Security", "Protect workloads and improve visibility across public, private and hybrid cloud environments."],
];
const products = ["Enterprise & Data Center Switching", "Routing & WAN", 'Wireless', 'Collaboration', "Network Security", "Cloud Security", "Security Operations"];
const productIds = ['switching', 'routing', 'wireless', 'collaboration', 'network-security', 'cloud-security', 'security-operations'];
const brandSymbol = (light = false) => `<img class="brand-symbol" src="/assets/brand/pay-orbit-mark${light ? '-on-light' : ''}.svg" width="32" height="32" alt="" aria-hidden="true" decoding="async">`;
const companyPhoto = (attributes = 'data-reveal="slide" data-duration="700"', lazy = true) => `<figure class="company-media" ${attributes}><img src="/assets/images/company_infrastructure_photo.webp" srcset="/assets/images/company_infrastructure_photo-720.webp 720w, /assets/images/company_infrastructure_photo.webp 1536w" sizes="(max-width: 767px) calc(100vw - 40px), 45vw" width="1536" height="1024" alt="Enterprise switch, patch panel and network cabling" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></figure>`;
const intro = (heading, description, extra = '', art = '', artOptions = {}) => `<section class="page-intro"><div class="container${art ? ' intro-grid' : ''}"><div class="intro-copy"><h1 data-hero>${escape(heading)}</h1><p data-hero>${escape(description)}</p>${extra}</div>${art === 'technology' ? technologyGraphic() : art ? illustration(art, artOptions) : ''}</div></section>`;
const jumpLinks = items => `<nav class="page-jumps" aria-label="On this page">${items.map(([id, label]) => `<a href="#${id}">${escape(label)}</a>`).join('')}</nav>`;


function about() {
  const marker = index => `<span class="story-mobile-step" aria-hidden="true"><span>${String(index + 1).padStart(2, '0')}</span>${icon(['network', 'shield-check', 'cable', 'headset'][index])}</span>`;
  const heading = title => `<h2><span class="story-heading-label">${escape(title)}</span><span class="story-heading-measure" aria-hidden="true">${escape(title)}</span></h2>`;
  return `<section class="section company about-opening"><div class="container company-layout">
    <div class="company-copy"><h1 data-hero>About PAY ORBIT</h1>${paragraph('02_Company_Intro', 'B5', ' data-company-introduction data-hero')}<div class="actions section-action" data-hero>${button("Contact Us", '/contact/')}</div></div>${companyPhoto('data-hero', false)}
  </div></section>
  <section class="section about-story" id="about_story"><div class="container story-shell" data-about-story>
    ${aboutStoryScene({ desktop: true })}
    <div class="story-chapters">
      <article class="story-chapter" data-story-chapter="0">${aboutStoryScene()}${marker(0)}<div class="story-chapter-copy">${heading("Understand business needs")}<div class="story-summary">
        <p class="story-summary-lead">We bring connectivity, security and technical services together in one integrated infrastructure solution.</p>
        <ul class="story-summary-list">
          <li><strong>Connectivity:</strong> <span>enterprise and data center networking.</span></li>
          <li><strong>Security:</strong> <span>secure access, cybersecurity and cloud security.</span></li>
          <li><strong>Services:</strong> <span>consulting, implementation and technical support.</span></li>
        </ul>
        <p>Starting with your operating environment, PAY ORBIT recommends a suitable solution that is easy to deploy and manage.</p>
      </div>${button("Explore Our Solutions", '/solutions/', 'button-outline section-action')}</div></article>
      <article class="story-chapter" data-story-chapter="1">${aboutStoryScene({ stage: 1 })}${marker(1)}<div class="story-chapter-copy">${heading("Build a unified architecture")}<div class="story-summary">
        <p class="story-summary-lead">PAY ORBIT focuses on widely adopted enterprise technologies from Cisco and Palo Alto Networks.</p>
        <ul class="story-summary-list">
          <li><strong>Connectivity:</strong> <span>meet core connectivity requirements.</span></li>
          <li><strong>Security:</strong> <span>address modern cybersecurity needs.</span></li>
        </ul>
        <p>Bring both needs together within a coherent technology architecture.</p>
      </div>${button("Products & Technology", '/products/', 'button-outline section-action')}</div></article>
      <article class="story-chapter" data-story-chapter="2">${aboutStoryScene({ stage: 2 })}${marker(2)}<div class="story-chapter-copy">${heading("Bring the design into operation")}<div class="story-summary">
        <p class="story-summary-lead">We work with you from requirement assessment through post-implementation support.</p>
        <div class="about-lifecycle">${lifecycle({ compact: true })}</div>
        <p>Infrastructure that meets technical requirements at deployment and remains manageable and scalable throughout its operating lifecycle.</p>
      </div>${button("Explore Services", '/services/', 'button-outline section-action')}</div></article>
      <article class="story-chapter" data-story-chapter="3">${aboutStoryScene({ stage: 3 })}${marker(3)}<div class="story-chapter-copy">${heading("Support for the long term")}<div class="story-summary">
        <p class="story-summary-lead">Three principles guide how PAY ORBIT works with customers.</p>
        <ul class="story-summary-list">
          <li><strong>Solution clarity.</strong></li>
          <li><strong>Reliable execution.</strong></li>
          <li><strong>Long-term technical support.</strong></li>
        </ul>
        <p>Simplify technology choices so customers can focus on business operations with a secure, dependable digital foundation.</p>
      </div>${button("Explore support scope", '/services/#support', 'button-outline section-action')}</div></article>
    </div>
  </div></section>
  ${contactInvitation()}`;
}

function solutionPage() {
  return `<div class="solutions-page">${intro("Networking & cybersecurity solutions", "Enterprise networking, data center networking, cybersecurity and cloud security for your operational needs.", solutionOverview(), 'ecosystem', { responsive: true, connectionMotion: true })}
  ${solutionSections(solutions, workbook.sheets['03_Solutions'], button)}${contactInvitation()}</div>`;
}

function servicePage() {
  return `<div class="services-page">${serviceIntro(serviceContent, button)}
  ${serviceSections(serviceContent, button)}${contactInvitation()}</div>`;
}

function productPage() {
  const vendor = (name, start, count, id) => `<section class="section product-section" id="${id}" aria-labelledby="${id}_heading"><div class="container"><h2 id="${id}_heading">${name}</h2><div class="product-grid">${Array.from({ length: count }, (_, index) => {
    const productIndex = start + index;
    return `<article class="solution-card product-card" data-product-kind="${productIds[productIndex]}" data-reveal="rise" data-duration="520" data-delay="${index % 2 * 70}">${badge(productIcon(productIndex))}<h3>${escape(products[productIndex])}</h3>${paragraph('05_Products_Tech', `B${productIndex + 5}`)}${button("Request a Quote", `/contact/?product=${productIds[productIndex]}#consultation_form`, 'button-outline')}</article>`;
  }).join('')}</div></div></section>`;
  return `<div class="products-page" data-products>${intro("Products & Technology", text('01_Home', 'B7'), technologyOverview(), 'technology')}${vendor('Cisco', 0, 4, 'cisco')}${vendor('Palo Alto Networks', 4, 3, 'palo-alto-networks')}${contactInvitation()}</div>`;
}

function contact() {
  return `<section class="section contact" id="contact"><div class="container contact-layout">
    <div class="contact-copy"><h1 data-hero>Discuss your infrastructure needs with PAY ORBIT</h1><p class="contact-invitation" data-hero>Tell us about your networking or cybersecurity requirements.</p>
      <p class="company-name">${escape(text('06_Contact', 'B5'))}</p><address><p class="contact-detail">${icon('phone')}<span>Phone: <a href="tel:+61433024689">${escape(text('06_Contact', 'B8'))}</a></span></p><p class="contact-detail">${icon('map-pin')}<span>Address: ${escape(text('06_Contact', 'B7'))}</span></p></address><p class="contact-detail">${icon('user-round')}<span>Representative: ${escape(text('06_Contact', 'B6'))}</span></p>
      ${button("Contact Us", 'tel:+61433024689', 'button-primary section-action')}
    </div>
    <form id="consultation_form" class="consultation-form" novalidate>
      <h2 class="form-heading">Prepare your enquiry</h2><p class="form-introduction">Complete the fields to copy your enquiry for a conversation with PAY ORBIT.</p>
      <div class="form-grid">
        <div class="field"><label for="name">Name <span class="required-label">(required)</span></label><input id="name" name="name" autocomplete="name" required maxlength="160" aria-describedby="name_error"><p class="field-error" id="name_error" hidden></p></div>
        <div class="field"><label for="company">Company</label><input id="company" name="company" autocomplete="organization" maxlength="200"></div>
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" aria-describedby="email_error"><p class="field-error" id="email_error" hidden></p></div>
        <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel" maxlength="60"></div>
        <div class="field field-wide"><label for="requirement">Requirement <span class="required-label">(required)</span></label><textarea id="requirement" name="requirement" rows="4" required maxlength="6000" aria-describedby="requirement_error"></textarea><p class="field-error" id="requirement_error" hidden></p></div>
      </div>
      <button id="copy_button" class="button button-outline" type="button" disabled>${icon('clipboard-copy')}<span>Copy enquiry</span></button>
      <p id="form_status" class="form-status" role="status" aria-live="polite"></p>
      <div id="copy_fallback" class="copy-fallback" hidden><label for="copy_text">Enquiry to copy</label><textarea id="copy_text" rows="7" readonly></textarea></div>
    </form>
  </div></section>`;
}

function documentPage(route, title, description, content) {
  const t = escape;
  let pageContent = content.replace(/<p data-company-introduction( data-hero)?>(.*?)<\/p>/gs, (_, hero, copy) => formatCompanyIntroduction(copy, Boolean(hero)));
  if (pageContent.includes('id="consultation_form"')) {
    const messages = JSON.stringify({
      labels: { name: 'Name', company: 'Company', email: 'Email', phone: 'Phone', requirement: 'Requirement' },
      nameRequired: 'Enter your name.', requirementRequired: 'Enter your requirements.', emailInvalid: 'Enter a valid email address.',
      copied: 'Enquiry copied.', manualCopy: 'Select the text below to copy it manually.',
      products: Object.fromEntries(productIds.map((id, index) => [id, `${index < 4 ? 'Cisco' : 'Palo Alto Networks'}: ${products[index]}`])),
    }).replaceAll('<', '\\u003c');
    pageContent = pageContent.replace('</form>', `<script type="application/json" id="form_messages">${messages}</script></form>`);
  }
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${t(description)}">
    <meta name="theme-color" content="#02060F">
    <link rel="icon" type="image/svg+xml" href="/assets/brand/pay-orbit-favicon.svg">
    <link rel="alternate icon" type="image/png" href="/assets/brand/pay-orbit-favicon.png">
    <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
    <link rel="manifest" href="/assets/brand/site.webmanifest">
    <link rel="preload" href="/assets/fonts/manrope/Manrope-600-brand.woff2" as="font" type="font/woff2" crossorigin>
    <title>${t(title)}</title>
    <link rel="preload" href="/assets/fonts/bricolage-grotesque/BricolageGrotesque-Variable.ttf" as="font" type="font/ttf" crossorigin>
    <link rel="preload" href="/assets/fonts/be-vietnam-pro/be-vietnam-pro-400-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/src/fonts.css">
    <link rel="stylesheet" href="/src/site.css">
    <link rel="stylesheet" href="/src/footer.css">
    <link rel="stylesheet" href="/assets/vendor/lenis/lenis.css">
${['/', '/solutions/', '/products/'].includes(route) ? '    <link rel="stylesheet" href="/src/hero-graphics.css">\n' : ''}
${route === '/' ? '    <link rel="stylesheet" href="/src/home.css">\n' : route === '/about/' ? '    <link rel="stylesheet" href="/src/about-story.css">\n' : route === '/solutions/' ? '    <link rel="stylesheet" href="/src/solutions.css">\n' : route === '/services/' ? '    <link rel="stylesheet" href="/src/services.css">\n' : route === '/products/' ? '    <link rel="stylesheet" href="/src/products.css">\n' : ''}    <script type="module" src="/src/main.js"></script>
  </head>
  <body${route === '/' ? ' class="home-page"' : ''}>
    <span class="back-to-top-sentinel" data-back-to-top-sentinel aria-hidden="true"></span>
    <a class="skip-link" href="#main">${t("Skip to main content")}</a>
    <header class="site-header"><div class="container header-inner">
      <a class="wordmark" href="/" aria-label="${t("PAY ORBIT, home")}">${brandSymbol()}<span class="brand-name">PAY ORBIT</span></a>
      <nav id="site_navigation" aria-label="${t("Main navigation")}">${links.map(([label, href]) => `<a href="${href}"${href === route ? ' aria-current="page"' : ''}${href === '/contact/' ? ' class="navigation-contact"' : ''}>${t(label)}</a>`).join('')}</nav>
      <div class="header-actions"><button class="menu-toggle" type="button" aria-controls="site_navigation" aria-expanded="false">Menu</button></div>
    </div></header>
    <main id="main">${pageContent}</main>
    <footer class="site-footer" id="footer">${footerGraphic()}<div class="container footer-inner">
      <div><p class="footer-name"><span class="brand-lockup">${brandSymbol()}<span>${escape(text('00_Overview', 'B4'))}</span></span></p><p class="tagline">${t(text('00_Overview', 'B6'))}</p></div>
      <a class="button footer-contact" href="/contact/">${t("Contact")}</a><p class="trademark-notice">${t(text('07_SEO_Dev_Notes', 'B7'))}</p>
    </div></footer>
    <button class="back-to-top" data-back-to-top type="button" aria-label="${t("Back to top")}" title="${t("Back to top")}" hidden>${icon('arrow-right')}</button>
  </body>
</html>
`;
}

const baseRoutes = ['/', '/about/', '/solutions/', '/services/', '/products/', '/contact/'];
export const pageRoutes = baseRoutes;
export async function renderPages() {
  const pages = [
    ['/', text('07_SEO_Dev_Notes', 'B5'), text('07_SEO_Dev_Notes', 'B6'), home(serviceContent)],
    ['/about/', "About Us | PAY ORBIT", "Learn about PAY ORBIT PTY. LTD, our solution and technology approach, and support throughout the infrastructure lifecycle.", about()],
    ['/solutions/', "Solutions | PAY ORBIT", "PAY ORBIT solutions for enterprise networking, data center networking, cybersecurity and cloud security.", solutionPage()],
    ['/services/', "Services | PAY ORBIT", "Network and cybersecurity consulting, solution design, deployment and integration, and security and network support.", servicePage()],
    ['/products/', "Products & Technology | PAY ORBIT", "Seven Cisco and Palo Alto Networks technology groups for enterprise connectivity, cybersecurity and cloud security.", productPage()],
    ['/contact/', "Contact | PAY ORBIT", "Contact PAY ORBIT PTY. LTD in Australia at +61 433 024 689 to discuss your infrastructure requirements.", contact()],
  ];
  for (const [route, title, description, content] of pages) {
    const filename = path.join(root, route === '/' ? 'index.html' : route.slice(1) + 'index.html');
    await fs.mkdir(path.dirname(filename), { recursive: true });
    await fs.writeFile(filename, documentPage(route, title, description, content));
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await renderPages();
  console.log('Rendered six English-only pages from the supplied workbook content');
}
