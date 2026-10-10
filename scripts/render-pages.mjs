import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { icon, badge, solutionIcon, productIcon, illustration, lifecycle, solutionOverview, technologyOverview, connectionScene } from './visuals.mjs';
import { translate, languageRoute, localizeContent, formMessages } from './localize.mjs';
import { aboutStoryScene } from './about-story-markup.mjs';
import { solutionSections } from './solutions-markup.mjs';
import { serviceSections } from './services-markup.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workbook = JSON.parse(await fs.readFile(path.join(root, 'content/workbook.json'), 'utf8'));
const text = (sheet, cell) => workbook.sheets[sheet][cell];
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const paragraph = (sheet, cell, attributes = '') => `<p${attributes}>${escape(text(sheet, cell))}</p>`;
const button = (label, href, classes = 'button-primary') => `<a class="button ${classes}" href="${href}">${href.startsWith('tel:') ? icon('phone') : ''}<span>${escape(label)}</span>${href.startsWith('tel:') ? '' : icon('arrow-up-right')}</a>`;
const links = [['Trang chủ', '/'], ['Giới thiệu', '/about/'], ['Giải pháp', '/solutions/'], ['Dịch vụ', '/services/'], ['Sản phẩm & công nghệ', '/products/'], ['Liên hệ', '/contact/']];
const solutions = [
  ['enterprise-networking', 'Mạng doanh nghiệp', 'Kết nối văn phòng, chi nhánh và người dùng bằng hạ tầng mạng dễ quản trị và có khả năng mở rộng.'],
  ['data-center-networking', 'Mạng trung tâm dữ liệu', 'Kết nối máy chủ, lưu trữ và ứng dụng, chú trọng dự phòng và khả năng giám sát vận hành.'],
  ['cybersecurity', 'An ninh mạng', 'Tăng cường bảo vệ hệ thống bằng tường lửa, kiểm soát truy cập và phân đoạn mạng.'],
  ['cloud-security', 'Bảo mật Cloud', 'Bảo vệ workload và tăng khả năng quan sát trên môi trường Public, Private và Hybrid Cloud.'],
];
const services = [
  ['consulting', 'Tư vấn công nghệ', ['Đánh giá yêu cầu', 'Rà soát hiện trạng', 'Kiến trúc tổng thể', 'Đề xuất giải pháp']],
  ['design', 'Thiết kế giải pháp', ['Thiết kế kiến trúc', 'Đầu vào danh mục vật tư (BoM)', 'Phương án tích hợp', 'Kế hoạch triển khai']],
  ['supply', 'Cung cấp sản phẩm', ['Thiết bị', 'Bản quyền phần mềm', 'Subscription', 'Cung ứng theo dự án']],
  ['implementation', 'Triển khai và tích hợp', ['Cài đặt', 'Cấu hình', 'Tích hợp', 'Chuyển đổi', 'Kiểm thử', 'Nghiệm thu']],
  ['support', 'Hỗ trợ kỹ thuật', ['Xử lý sự cố', 'Tối ưu hệ thống', 'Hỗ trợ cấu hình', 'Phối hợp với hãng công nghệ']],
];
const products = ['Switching doanh nghiệp và trung tâm dữ liệu', 'Routing và WAN', 'Wireless', 'Collaboration', 'Bảo mật mạng', 'Bảo mật Cloud', 'Vận hành an ninh'];
const brandSymbol = () => '<img class="brand-symbol" src="/assets/brand/pay-orbit-mark-web.png" width="40" height="40" alt="" aria-hidden="true" decoding="async">';
const companyPhoto = (attributes = 'data-reveal="slide" data-duration="700"', lazy = true) => `<figure class="company-media" ${attributes}><img src="/assets/images/company_infrastructure_photo.png" width="1536" height="1024" alt="Switch, patch panel và cáp mạng doanh nghiệp" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></figure>`;
const intro = (heading, description, extra = '', art = '', artOptions = {}) => `<section class="page-intro"><div class="container${art ? ' intro-grid' : ''}"><div class="intro-copy"><h1 data-hero>${escape(heading)}</h1><p data-hero>${escape(description)}</p>${extra}</div>${art ? illustration(art, artOptions) : ''}</div></section>`;
const jumpLinks = items => `<nav class="page-jumps" aria-label="Trong trang này">${items.map(([id, label]) => `<a href="#${id}">${escape(label)}</a>`).join('')}</nav>`;
const contactInvitation = () => `<section class="section closing-cta"><div class="container closing-layout"><div><h2>Trao đổi nhu cầu của doanh nghiệp</h2><p>Hãy chia sẻ nhu cầu về hạ tầng mạng hoặc an ninh mạng.</p></div>${button('Liên hệ tư vấn', '/contact/')}</div></section>`;

function home() {
  const solutionGroup = (start, heading, visual) => `<div class="solution-panel ${start === 0 ? 'network-panel' : 'security-panel'}" data-reveal="rise" data-duration="600" data-delay="${start * 45}">
    ${visual}<div class="solution-panel-copy"><h3>${heading}</h3><div class="solution-group">${solutions.slice(start, start + 2).map(([id, title, description], index) => `<article class="solution-card">${icon(solutionIcon(start + index))}<div><h4>${escape(title)}</h4><p>${escape(description)}</p><a class="card-link" href="/solutions/#${id}"><span>Tìm hiểu ${escape(title.toLocaleLowerCase('vi'))}</span>${icon('arrow-up-right')}</a></div></article>`).join('')}</div></div>
  </div>`;
  return `<section class="hero home-hero" id="hero" aria-labelledby="hero_heading">
    <div class="container"><div class="hero-content">
      <span class="hero-domain">Mạng doanh nghiệp &amp; an ninh mạng</span>
      <h1 id="hero_heading" data-hero><span>Kết nối vững.</span><span>Bảo mật sâu.</span></h1>
      <p data-hero>Giải pháp mạng và bảo mật, thiết kế theo nhu cầu doanh nghiệp.</p>
      <div class="actions" data-hero>${button('Liên hệ tư vấn', '/contact/')}${button('Khám phá giải pháp', '/solutions/', 'button-secondary')}</div>
    </div></div>
    <figure class="hero-media" data-hero><picture><source media="(min-width: 1024px)" srcset="/assets/images/hero_infrastructure_photo.webp"><img src="/assets/images/hero_infrastructure_photo.webp" srcset="/assets/images/hero_infrastructure_photo-720.webp 720w, /assets/images/hero_infrastructure_photo.webp 1672w" sizes="100vw" width="1672" height="941" alt="Rack mạng và hành lang trung tâm dữ liệu" fetchpriority="high" decoding="async"></picture></figure>
  </section>
  <section class="section company home-company" id="company_intro" aria-labelledby="company_heading"><div class="container company-layout">
    <div class="company-copy"><h2 id="company_heading">Hạ tầng tốt bắt đầu từ nhu cầu thực tế.</h2>${paragraph('02_Company_Intro', 'C5')}${button('Tìm hiểu PAY ORBIT', '/about/', 'button-outline section-action')}</div><figure class="company-media team-media" data-reveal="slide" data-duration="700"><img src="/assets/images/infrastructure-team-illustration.webp" srcset="/assets/images/infrastructure-team-illustration-720.webp 720w, /assets/images/infrastructure-team-illustration.webp 1536w" sizes="(max-width: 1023px) 100vw, 45vw" width="1536" height="1024" alt="Kỹ sư phối hợp kiểm tra kết nối tại tủ mạng" loading="lazy" decoding="async"></figure>
  </div></section>
  <section class="section solutions home-solutions" id="core_solutions" aria-labelledby="solutions_heading"><div class="container">
    <h2 id="solutions_heading">Giải pháp theo nhu cầu hạ tầng</h2>
    <div class="solution-panels">${solutionGroup(0, 'Kết nối doanh nghiệp', '<div class="panel-visual"><img src="/assets/images/company_infrastructure_photo.webp" srcset="/assets/images/company_infrastructure_photo-720.webp 720w, /assets/images/company_infrastructure_photo.webp 1536w" sizes="(max-width: 767px) 100vw, 45vw" width="1536" height="763" alt="Switch, patch panel và cáp mạng doanh nghiệp" loading="lazy" decoding="async"></div>')}${solutionGroup(2, 'Bảo vệ hạ tầng số', '<div class="panel-visual"><img src="/assets/images/digital-infrastructure-protection.webp" srcset="/assets/images/digital-infrastructure-protection-720.webp 720w, /assets/images/digital-infrastructure-protection.webp 1672w" sizes="(max-width: 767px) 100vw, 45vw" width="1672" height="941" alt="Minh họa lớp khiên bảo mật bảo vệ máy chủ và hạ tầng Cloud" loading="lazy" decoding="async"></div>')}</div>
    ${button('Xem tất cả giải pháp', '/solutions/', 'button-primary section-action')}
  </div></section>
  <section class="section company home-technology" id="technology_focus" aria-labelledby="technology_heading"><div class="container technology-feature-grid">
    <div><h2 id="technology_heading">Công nghệ Cisco và Palo Alto Networks</h2>${paragraph('01_Home', 'C7', ' class="section-description"')}${technologyOverview()}${button('Khám phá công nghệ', '/products/', 'button-outline section-action')}</div>${connectionScene()}
  </div></section>
  <section class="section technology home-approach" id="why_pay_orbit" aria-labelledby="approach_heading"><div class="container">
    <h2 id="approach_heading">Cách tiếp cận của PAY ORBIT</h2>${paragraph('01_Home', 'C8', ' class="section-description"')}
    <ul class="principle-list"><li>${badge('target')}<h3>Tập trung vào giải pháp</h3><p>Tìm hiểu nhu cầu và môi trường vận hành trước khi đề xuất.</p></li><li>${badge('layers')}<h3>Thiết kế để mở rộng</h3><p>Xem xét khả năng quản lý và phát triển trong vòng đời hạ tầng.</p></li><li>${badge('headset')}<h3>Hỗ trợ xuyên suốt</h3><p>Từ tư vấn, cung cấp sản phẩm đến triển khai và hỗ trợ kỹ thuật.</p></li></ul>
    <div class="actions section-action">${button('Trao đổi với PAY ORBIT', '/contact/')}${button('Xem phạm vi dịch vụ', '/services/', 'button-outline')}</div>
  </div></section>`;
}

function about() {
  const marker = index => `<span class="story-mobile-step" aria-hidden="true"><span>${String(index + 1).padStart(2, '0')}</span>${icon(['network', 'shield-check', 'cable', 'headset'][index])}</span>`;
  const heading = title => `<h2><span class="story-heading-label">${escape(title)}</span><span class="story-heading-measure" aria-hidden="true">${escape(title)}</span></h2>`;
  return `<section class="section company about-opening"><div class="container company-layout">
    <div class="company-copy"><h1 data-hero>Giới thiệu PAY ORBIT</h1>${paragraph('02_Company_Intro', 'C5', ' data-hero')}<div class="actions section-action" data-hero>${button('Liên hệ tư vấn', '/contact/')}</div></div>${companyPhoto('data-hero', false)}
  </div></section>
  <section class="section about-story" id="about_story"><div class="container story-shell" data-about-story>
    ${aboutStoryScene({ desktop: true })}
    <div class="story-chapters">
      <article class="story-chapter" data-story-chapter="0">${aboutStoryScene()}${marker(0)}<div class="story-chapter-copy">${heading('Hiểu nhu cầu doanh nghiệp')}<div class="story-summary">
        <p class="story-summary-lead">Chúng tôi kết hợp kết nối, bảo mật và dịch vụ kỹ thuật trong một giải pháp hạ tầng thống nhất.</p>
        <ul class="story-summary-list">
          <li><strong>Kết nối:</strong> <span>mạng doanh nghiệp và trung tâm dữ liệu.</span></li>
          <li><strong>Bảo mật:</strong> <span>truy cập an toàn, an ninh mạng và Cloud.</span></li>
          <li><strong>Dịch vụ:</strong> <span>tư vấn, triển khai và hỗ trợ kỹ thuật.</span></li>
        </ul>
        <p>Bắt đầu từ môi trường vận hành thực tế, PAY ORBIT đề xuất giải pháp phù hợp, dễ triển khai và quản lý.</p>
      </div>${button('Khám phá giải pháp', '/solutions/', 'button-outline section-action')}</div></article>
      <article class="story-chapter" data-story-chapter="1">${aboutStoryScene({ stage: 1 })}${marker(1)}<div class="story-chapter-copy">${heading('Xây kiến trúc thống nhất')}<div class="story-summary">
        <p class="story-summary-lead">PAY ORBIT tập trung vào công nghệ doanh nghiệp phổ biến của Cisco và Palo Alto Networks.</p>
        <ul class="story-summary-list">
          <li><strong>Kết nối:</strong> <span>đáp ứng nhu cầu kết nối cốt lõi.</span></li>
          <li><strong>Bảo mật:</strong> <span>giải quyết các yêu cầu an ninh mạng hiện đại.</span></li>
        </ul>
        <p>Kết hợp hai nhu cầu trong một kiến trúc công nghệ thống nhất.</p>
      </div>${button('Xem sản phẩm & công nghệ', '/products/', 'button-outline section-action')}</div></article>
      <article class="story-chapter" data-story-chapter="2">${aboutStoryScene({ stage: 2 })}${marker(2)}<div class="story-chapter-copy">${heading('Triển khai vào thực tế')}<div class="story-summary">
        <p class="story-summary-lead">Đồng hành từ khảo sát nhu cầu đến hỗ trợ sau khi đưa hệ thống vào vận hành.</p>
        <div class="about-lifecycle">${lifecycle({ compact: true })}</div>
        <p>Hạ tầng đáp ứng yêu cầu kỹ thuật khi triển khai, dễ quản lý và có khả năng mở rộng trong suốt vòng đời sử dụng.</p>
      </div>${button('Tìm hiểu dịch vụ', '/services/', 'button-outline section-action')}</div></article>
      <article class="story-chapter" data-story-chapter="3">${aboutStoryScene({ stage: 3 })}${marker(3)}<div class="story-chapter-copy">${heading('Đồng hành dài hạn')}<div class="story-summary">
        <p class="story-summary-lead">Ba nguyên tắc xuyên suốt cách PAY ORBIT đồng hành cùng khách hàng.</p>
        <ul class="story-summary-list">
          <li><strong>Giải pháp rõ ràng.</strong></li>
          <li><strong>Triển khai tin cậy.</strong></li>
          <li><strong>Hỗ trợ kỹ thuật dài hạn.</strong></li>
        </ul>
        <p>Đơn giản hóa các lựa chọn công nghệ để khách hàng tập trung vào kinh doanh, với một nền tảng số an toàn và ổn định.</p>
      </div>${button('Xem phạm vi hỗ trợ', '/services/#support', 'button-outline section-action')}</div></article>
    </div>
  </div></section>
  ${contactInvitation()}`;
}

function solutionPage() {
  return `<div class="solutions-page">${intro('Giải pháp mạng và an ninh mạng', 'Kết nối mạng doanh nghiệp, trung tâm dữ liệu, an ninh mạng và bảo mật Cloud theo nhu cầu vận hành.', solutionOverview(), 'ecosystem', { responsive: true, lazy: true })}
  ${solutionSections(solutions, workbook.sheets['03_Solutions'], button)}${contactInvitation()}</div>`;
}

function servicePage() {
  return `<div class="services-page">${intro('Dịch vụ công nghệ', 'Đồng hành từ tư vấn, thiết kế đến triển khai và hỗ trợ vận hành hạ tầng.', `<div class="actions" data-hero>${button('Trao đổi nhu cầu', '/contact/#consultation_form')}<a class="service-explore" href="#consulting"><span>Khám phá dịch vụ</span>${icon('arrow-right')}</a></div>`, 'lifecycle', { lazy: true, responsive: true })}
  ${serviceSections(services, workbook.sheets['04_Services'], button)}
  <section class="section closing-cta"><div class="container closing-layout"><div><h2>Trao đổi nhu cầu của doanh nghiệp</h2><p>Phạm vi dịch vụ được thống nhất theo nhu cầu và môi trường vận hành.</p></div>${button('Trao đổi nhu cầu', '/contact/#consultation_form')}</div></section></div>`;
}

function productPage() {
  const vendor = (name, start, count, id) => `<section class="section product-section" id="${id}" aria-labelledby="${id}_heading"><div class="container"><h2 id="${id}_heading">${name}</h2><div class="product-grid">${Array.from({ length: count }, (_, index) => {
    const productIndex = start + index;
    return `<article class="solution-card product-card" data-reveal="rise" data-duration="520" data-delay="${index * 70}">${badge(productIcon(productIndex))}<h3>${escape(products[productIndex])}</h3>${paragraph('05_Products_Tech', `C${productIndex + 5}`)}${button('Yêu cầu báo giá', '/contact/', 'button-outline')}</article>`;
  }).join('')}</div></div></section>`;
  return `${intro('Sản phẩm & công nghệ', text('01_Home', 'C7'), technologyOverview(), 'ecosystem')}${vendor('Cisco', 0, 4, 'cisco')}${vendor('Palo Alto Networks', 4, 3, 'palo-alto-networks')}${contactInvitation()}`;
}

function contact() {
  return `<section class="section contact" id="contact"><div class="container contact-layout">
    <div class="contact-copy"><h1 data-hero>Trao đổi nhu cầu hạ tầng với PAY ORBIT</h1><p class="contact-invitation" data-hero>Hãy chia sẻ nhu cầu về hạ tầng mạng hoặc an ninh mạng.</p>
      <p class="company-name">${escape(text('06_Contact', 'C5'))}</p><address><p class="contact-detail">${icon('phone')}<span>Điện thoại: <a href="tel:+61433024689">${escape(text('06_Contact', 'C8'))}</a></span></p><p class="contact-detail">${icon('map-pin')}<span>Địa chỉ: ${escape(text('06_Contact', 'C7'))}</span></p></address><p class="contact-detail">${icon('user-round')}<span>Người đại diện: ${escape(text('06_Contact', 'C6'))}</span></p>
      ${button('Liên hệ tư vấn', 'tel:+61433024689', 'button-primary section-action')}
    </div>
    <form id="consultation_form" class="consultation-form" novalidate>
      <h2 class="form-heading">Chuẩn bị nội dung trao đổi</h2><p class="form-introduction">Điền thông tin để sao chép nội dung khi trao đổi với PAY ORBIT.</p>
      <div class="form-grid">
        <div class="field"><label for="name">Họ tên <span class="required-label">(bắt buộc)</span></label><input id="name" name="name" autocomplete="name" required maxlength="160" aria-describedby="name_error"><p class="field-error" id="name_error" hidden></p></div>
        <div class="field"><label for="company">Công ty</label><input id="company" name="company" autocomplete="organization" maxlength="200"></div>
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" aria-describedby="email_error"><p class="field-error" id="email_error" hidden></p></div>
        <div class="field"><label for="phone">Điện thoại</label><input id="phone" name="phone" type="tel" autocomplete="tel" maxlength="60"></div>
        <div class="field field-wide"><label for="requirement">Nhu cầu <span class="required-label">(bắt buộc)</span></label><textarea id="requirement" name="requirement" rows="4" required maxlength="6000" aria-describedby="requirement_error"></textarea><p class="field-error" id="requirement_error" hidden></p></div>
      </div>
      <button id="copy_button" class="button button-outline" type="button" disabled>${icon('clipboard-copy')}<span>Sao chép nội dung trao đổi</span></button>
      <p id="form_status" class="form-status" role="status" aria-live="polite"></p>
      <div id="copy_fallback" class="copy-fallback" hidden><label for="copy_text">Nội dung để sao chép</label><textarea id="copy_text" rows="7" readonly></textarea></div>
    </form>
  </div></section>`;
}

function documentPage(route, title, description, content, language = 'vi') {
  const t = value => escape(translate(value, language));
  const url = languageRoute(route, language);
  let localizedContent = localizeContent(content, language);
  if (localizedContent.includes('id="consultation_form"')) {
    const messages = JSON.stringify(formMessages(language)).replaceAll('<', '\\u003c');
    localizedContent = localizedContent.replace('</form>', `<script type="application/json" id="form_messages">${messages}</script></form>`);
  }
  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${t(description)}">
    <meta name="theme-color" content="#02060F">
    <link rel="icon" type="image/png" href="/assets/brand/pay-orbit-favicon.png">
    <title>${t(title)}</title>
    <link rel="alternate" hreflang="vi" href="${route}">
    <link rel="alternate" hreflang="en" href="${languageRoute(route, 'en')}">
    <link rel="alternate" hreflang="x-default" href="${route}">
    <link rel="preload" href="/assets/fonts/bricolage-grotesque/BricolageGrotesque-Variable.ttf" as="font" type="font/ttf" crossorigin>
    <link rel="preload" href="/assets/fonts/be-vietnam-pro/be-vietnam-pro-400-latin.woff2" as="font" type="font/woff2" crossorigin>
${language === 'vi' ? '    <link rel="preload" href="/assets/fonts/be-vietnam-pro/be-vietnam-pro-400-vietnamese.woff2" as="font" type="font/woff2" crossorigin>\n' : ''}    <link rel="stylesheet" href="/src/fonts.css">
    <link rel="stylesheet" href="/src/site.css">
${route === '/' ? '    <link rel="stylesheet" href="/src/home.css">\n' : route === '/about/' ? '    <link rel="stylesheet" href="/src/about-story.css">\n' : route === '/solutions/' ? '    <link rel="stylesheet" href="/src/solutions.css">\n' : route === '/services/' ? '    <link rel="stylesheet" href="/src/services.css">\n' : ''}    <script type="module" src="/src/main.js"></script>
  </head>
  <body>
    <a class="skip-link" href="#main">${t('Đến nội dung chính')}</a>
    <header class="site-header"><div class="container header-inner">
      <a class="wordmark" href="${languageRoute('/', language)}" aria-label="${t('PAY ORBIT, trang chủ')}">${brandSymbol()}<span>PAY ORBIT</span></a>
      <nav id="site_navigation" aria-label="${t('Điều hướng chính')}">${links.map(([label, href]) => `<a href="${languageRoute(href, language)}"${href === route ? ' aria-current="page"' : ''}${href === '/contact/' ? ' class="navigation-contact"' : ''}>${t(label)}</a>`).join('')}</nav>
      <div class="header-actions"><div class="language-switch" role="group" aria-label="${t('Ngôn ngữ')}">${['vi', 'en'].map(locale => `<a data-language="${locale}" href="${languageRoute(route, locale)}" hreflang="${locale}" lang="${locale}" aria-label="${locale === 'vi' ? 'Tiếng Việt' : 'English'}"${locale === language ? ' aria-current="true"' : ''}>${locale.toUpperCase()}</a>`).join('')}</div><button class="menu-toggle" type="button" aria-controls="site_navigation" aria-expanded="false">Menu</button></div>
    </div></header>
    <main id="main">${localizedContent}</main>
    <footer class="site-footer" id="footer"><div class="container footer-inner">
      <div><p class="footer-name"><span class="brand-lockup">${brandSymbol()}<span>${escape(text('00_Overview', 'B4'))}</span></span></p><p class="tagline">${t(text('00_Overview', 'B7'))}</p></div>
      <a href="${languageRoute('/contact/', language)}">${t('Liên hệ')}</a><p class="trademark-notice">${t(text('07_SEO_Dev_Notes', 'C7'))}</p>
    </div></footer>
  </body>
</html>
`;
}

const baseRoutes = ['/', '/about/', '/solutions/', '/services/', '/products/', '/contact/'];
export const pageRoutes = [...baseRoutes, ...baseRoutes.map(route => languageRoute(route, 'en'))];
export async function renderPages() {
  const pages = [
    ['/', text('07_SEO_Dev_Notes', 'C5'), text('07_SEO_Dev_Notes', 'C6'), home()],
    ['/about/', 'Giới thiệu | PAY ORBIT', 'Tìm hiểu PAY ORBIT PTY. LTD, cách tiếp cận giải pháp, công nghệ và hỗ trợ trong vòng đời hạ tầng.', about()],
    ['/solutions/', 'Giải pháp | PAY ORBIT', 'Giải pháp mạng doanh nghiệp, mạng trung tâm dữ liệu, an ninh mạng và bảo mật Cloud của PAY ORBIT.', solutionPage()],
    ['/services/', 'Dịch vụ | PAY ORBIT', 'Tư vấn công nghệ, thiết kế giải pháp, cung cấp sản phẩm, triển khai và tích hợp, hỗ trợ kỹ thuật.', servicePage()],
    ['/products/', 'Sản phẩm & công nghệ | PAY ORBIT', 'Bảy nhóm công nghệ Cisco và Palo Alto Networks cho kết nối doanh nghiệp, an ninh mạng và bảo mật Cloud.', productPage()],
    ['/contact/', 'Liên hệ | PAY ORBIT', 'Liên hệ PAY ORBIT PTY. LTD tại Australia qua số điện thoại +61 433 024 689 để trao đổi nhu cầu hạ tầng.', contact()],
  ];
  for (const language of ['vi', 'en']) {
    for (const [route, title, description, content] of pages) {
      const url = languageRoute(route, language);
      const filename = path.join(root, url === '/' ? 'index.html' : url.slice(1) + 'index.html');
      await fs.mkdir(path.dirname(filename), { recursive: true });
      await fs.writeFile(filename, documentPage(route, title, description, content, language));
    }
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await renderPages();
  console.log('Rendered six pages in Vietnamese and English from the supplied workbook content');
}
