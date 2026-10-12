import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'public/assets/icons/lucide');
const ledger = JSON.parse(await fs.readFile(path.join(directory, 'provenance.json'), 'utf8'));
const icons = new Map(await Promise.all(ledger.files.map(async ({ name }) => [name, await fs.readFile(path.join(directory, `${name}.svg`), 'utf8')])));

export function icon(name, className = '') {
  if (!icons.has(name)) throw new Error(`Unknown icon: ${name}`);
  return icons.get(name).replace('<svg', `<svg class="icon ${className}" data-icon="${name}" aria-hidden="true" focusable="false"`);
}
export const badge = name => `<span class="icon-badge">${icon(name)}</span>`;

const solutionKeys = ['network', 'server', 'shield-check', 'cloud'];
export const solutionIcon = index => solutionKeys[index];
const serviceKeys = ['search', 'workflow', 'package-check', 'cable', 'headset'];
export const serviceIcon = index => serviceKeys[index];
const productKeys = ['layers', 'router', 'wifi', 'video', 'shield-check', 'cloud-cog', 'scan-eye'];
export const productIcon = index => productKeys[index];

export function lifecycle({ compact = false, linked = true } = {}) {
  const steps = [
    ["Assess", "Understand requirements and current infrastructure", 'consulting'],
    ["Design", "Develop a suitable solution approach", 'design'],
    ["Supply", "Hardware, licenses and subscriptions", 'supply'],
    ["Deploy", "Integration, testing and commissioning", 'implementation'],
    ["Support", "Within the agreed service scope", 'support'],
  ];
  return `<ol class="lifecycle${compact ? ' lifecycle-compact' : ''}">${steps.map(([label, description, anchor], index) => `<li><${linked ? `a href="${anchor === 'supply' ? '/products/' : `/services/#${anchor}`}"` : 'div'} class="lifecycle-step"><span class="step-symbol">${icon(serviceIcon(index))}<span class="step-number">${index + 1}</span></span><strong>${label}</strong><span class="step-description">${description}</span></${linked ? 'a' : 'div'}>${index < steps.length - 1 ? icon('arrow-right', 'step-arrow') : ''}</li>`).join('')}</ol>`;
}

function connectionGraphic(image) {
  // These graphic paths follow the visible cables in the source illustration.
  // They are a decorative motion overlay, separate from library-sourced icons.
  return `<div class="connection-art-frame" data-hero-graphic="connection">${image}<svg class="connection-signal-graphic" data-connection-graphic viewBox="0 0 1536 1024" aria-hidden="true" focusable="false">
    <path data-connection-signal d="M486 700 L563 657 Q575 650 575 641 Q575 637 583 636 L593 632" pathLength="100"/>
    <path data-connection-signal d="M716 600 L800 554 Q811 548 811 536 L812 532 L846 514" pathLength="100"/>
    <path data-connection-signal d="M1040 440 L1180 359 Q1190 353 1190 336 L1190 328 Q1190 324 1198 320 L1220 308" pathLength="100"/>
    <ellipse class="connection-firewall-pulse" data-connection-firewall cx="626" cy="604" rx="46" ry="58"/>
  </svg></div>`;
}

export function illustration(name, { reveal = false, lazy = false, responsive = false, connectionMotion = false } = {}) {
  const labels = {
    ecosystem: "Illustration of enterprise networking, data center networking, cybersecurity and cloud solution groups.",
    lifecycle: "Illustration of the assess, design, supply, deploy and support stages.",
  };
  if (!labels[name]) throw new Error(`Unknown illustration: ${name}`);
  const basename = name === 'ecosystem' ? 'enterprise-ecosystem' : 'service-lifecycle';
  const image = `<img src="/assets/images/${basename}.${responsive ? 'webp' : 'png'}"${responsive ? ` srcset="/assets/images/${basename}-720.webp 720w, /assets/images/${basename}.webp 1536w" sizes="(max-width: 1023px) 100vw, 45vw"` : ''} width="1536" height="1024" alt="${labels[name]}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`;
  const media = connectionMotion ? connectionGraphic(image) : image;
  return `<figure class="infographic-art"${reveal ? ' data-reveal="slide" data-duration="700"' : ''}>${media}</figure>`;
}

export function technologyGraphic() {
  const groups = [
    ['Cisco', "Connect your business", ['Switching', 'Routing', 'Wireless', 'Collaboration']],
    ['Palo Alto Networks', "Protect your infrastructure", ["Network Security", "Cloud Security", "Security Operations"]],
  ];
  let index = 0;
  return `<figure class="infographic-art technology-art" aria-label="Technology groups by vendor"><div class="technology-stage" data-hero-graphic="technology" aria-hidden="true">${groups.map(([name, family, labels], group) => `<div class="technology-board technology-board-${group}"><div class="technology-board-heading"><strong>${name}</strong><span>${family}</span></div><div class="technology-modules">${labels.map(label => `<div class="technology-module" data-technology-module>${icon(productIcon(index++))}<span>${label}</span></div>`).join('')}</div></div>`).join('')}</div></figure>`;
}

export function solutionOverview() {
  return `<div class="solution-overview" aria-label="Four infrastructure solution groups"><span class="overview-core">${icon('building')}<strong>Business requirements</strong></span><ul>${[
    ["Enterprise Networking", "Offices, branches and users", 'enterprise-networking'],
    ["Data Center", "Compute, storage and applications", 'data-center-networking'],
    ["Cybersecurity", "Access and network resources", 'cybersecurity'],
    ["Cloud Security", "Workloads in cloud environments", 'cloud-security'],
  ].map(([label, description, anchor], index) => `<li><a href="/solutions/#${anchor}">${icon(solutionIcon(index))}<span><strong>${label}</strong><span>${description}</span></span>${icon('arrow-up-right', 'overview-arrow')}</a></li>`).join('')}</ul></div>`;
}

export function technologyOverview() {
  return `<div class="technology-overview" aria-label="Technology groups by vendor">${[
    ['Cisco', ["Networking", 'Wireless', 'Collaboration'], 'network', 'cisco'],
    ['Palo Alto Networks', ["Network Security", "Cloud Security", "Security Operations"], 'shield-check', 'palo-alto-networks'],
  ].map(([name, groups, symbol, anchor]) => `<a href="/products/#${anchor}" class="vendor-summary">${badge(symbol)}<span><strong>${name}</strong><span>${groups.join(' · ')}</span></span>${icon('arrow-up-right')}</a>`).join('')}</div>`;
}

export function connectionScene() {
  const stages = [['network', "Enterprise Networking"], ['server', "Data Center"], ['shield-check', "Cybersecurity"], ['cloud', "Cloud Security"]];
  const image = "<img class=\"connection-art\" src=\"/assets/images/enterprise-ecosystem.webp\" srcset=\"/assets/images/enterprise-ecosystem-720.webp 720w, /assets/images/enterprise-ecosystem.webp 1536w\" sizes=\"(max-width: 1023px) 100vw, 45vw\" width=\"1536\" height=\"1024\" alt=\"Illustration of enterprise networking, data center networking, cybersecurity and cloud solution groups.\" loading=\"lazy\" decoding=\"async\">";
  return `<figure class="connection-scene" data-connection-scene aria-label="Layers of connectivity and security">
    ${connectionGraphic(image)}
    <div class="connection-diagram" data-connection-diagram>
      <span class="connection-track" aria-hidden="true"><span class="connection-flow" data-connection-flow></span></span>
      <ol class="connection-stages">${stages.map(([symbol, label]) => `<li data-connection-stage><span class="connection-symbol">${icon(symbol)}<span class="connection-halo" data-connection-halo aria-hidden="true"></span></span><span>${label}</span></li>`).join('')}</ol>
    </div>
  </figure>`;
}
