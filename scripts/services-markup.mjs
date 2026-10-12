import { icon, badge } from './visuals.mjs';
import { escape } from './html.mjs';
const assets = {
  hero: ['hero', 1717, 916, 'Network and security services connected to design, deployment and support'],
  consulting: ['network', 1448, 1086, 'Enterprise network topology connecting users, wireless and data center infrastructure'],
  'cybersecurity-consulting': ['security', 1448, 1086, 'Coordinated protection across networks, users and cloud environments'],
  design: ['design-flow', 2022, 778, 'Requirement → Architecture → Technology → Implementation Plan'],
  implementation: ['deployment', 1385, 1136, 'Illustrative network equipment and cabling in a server rack'],
  support: ['support', 1586, 992, 'Illustrative network operations monitoring workstation'],
};
function image(id, hero = false) {
  const [name, width, height, alt] = assets[id];
  const base = `/assets/images/services-editorial-${name}`;
  return `<figure class="service-art service-art-${name}" ${hero ? 'data-hero' : 'data-reveal="slide" data-duration="700"'}><img src="${base}.webp" srcset="${base}-720.webp 720w, ${base}.webp ${width}w" sizes="(max-width: 767px) calc(100vw - 40px), 600px" width="${width}" height="${height}" alt="${alt}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></figure>`;
}
const heading = item => `<div class="service-heading">${badge(item.icon)}<h2 id="${item.id}-heading">${escape(item.title)}</h2></div>`;
const scope = item => `<div class="service-scope"><h3>Key areas</h3><div class="service-area-columns">${[item.keyAreas.slice(0,4),item.keyAreas.slice(4)].map(column => `<ul>${column.map(area => `<li>${icon('check')}<span>${escape(area)}</span></li>`).join('')}</ul>`).join('')}</div></div>`;
const description = item => `<details class="service-description" id="${item.id}-description"><summary><span>Read the full description</span>${icon('arrow-right')}</summary><div class="service-description-copy">${item.paragraphs.map(copy => `<p>${escape(copy)}</p>`).join('')}</div></details>`;
const action = (item, button) => `<div class="service-action">${button(item.cta, '/contact/#consultation_form', 'button-outline')}</div>`;
export function serviceIntro(data, button) {
  const paragraphs = data.intro.description.split(/(?<=\.)\s+(?=From technical)/u);
  return `<section class="page-intro services-intro"><div class="container services-intro-grid"><div class="services-intro-copy"><h1 data-hero><span>Technology services</span><span>for <em>connectivity</em></span><span>and <em>security</em></span></h1><div class="services-intro-description" data-hero>${paragraphs.map(copy => `<p>${escape(copy).replace('enterprise networking and cybersecurity', '<strong>enterprise networking</strong> and <strong>cybersecurity</strong>').replace('secure, reliable and scalable', '<strong>secure, reliable and scalable</strong>')}</p>`).join('')}</div><div class="actions" data-hero>${button(data.intro.cta, '#consulting')}</div></div>${image('hero', true)}</div></section>`;
}
export function serviceSections(data, button) {
  return `<div class="service-experience" data-service-experience><nav class="service-journey" data-service-nav aria-label="Service navigation"><div class="container"><ol>${data.services.map(item => `<li><a href="#${item.id}">${icon(item.icon)}<span>${escape(item.navLabel)}</span></a></li>`).join('')}</ol></div></nav><section class="service-sections" data-service-track id="service_track" aria-label="Five services in detail">${data.services.map(item => `<article class="service-detail" data-service id="${item.id}" aria-labelledby="${item.id}-heading"><div class="container service-detail-grid${item.id === 'design' ? ' service-design-grid' : ''}">${item.id === 'design' ? `<div class="service-design-intro">${heading(item)}<p class="service-lead">${escape(item.summary)}</p>${image(item.id)}</div><div class="service-detail-body">${scope(item)}${description(item)}${action(item, button)}</div>` : `${image(item.id)}<div class="service-detail-body">${heading(item)}<p class="service-lead">${escape(item.summary)}</p>${scope(item)}${description(item)}${action(item, button)}</div>`}</div></article>`).join('')}</section></div>`;
}
