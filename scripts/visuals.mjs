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
    ['Khảo sát', 'Hiểu nhu cầu và hiện trạng', 'consulting'],
    ['Thiết kế', 'Xây dựng phương án phù hợp', 'design'],
    ['Cung cấp', 'Thiết bị, bản quyền và subscription', 'supply'],
    ['Triển khai', 'Tích hợp, kiểm thử và nghiệm thu', 'implementation'],
    ['Hỗ trợ', 'Theo phạm vi đã thỏa thuận', 'support'],
  ];
  return `<ol class="lifecycle${compact ? ' lifecycle-compact' : ''}">${steps.map(([label, description, anchor], index) => `<li><${linked ? `a href="/services/#${anchor}"` : 'div'} class="lifecycle-step"><span class="step-symbol">${icon(serviceIcon(index))}<span class="step-number">${index + 1}</span></span><strong>${label}</strong><span class="step-description">${description}</span></${linked ? 'a' : 'div'}>${index < steps.length - 1 ? icon('arrow-right', 'step-arrow') : ''}</li>`).join('')}</ol>`;
}

export function illustration(name, { reveal = false, caption = true, lazy = false } = {}) {
  const labels = {
    ecosystem: ['Hạ tầng kết nối và bảo mật', 'Minh họa các nhóm giải pháp: mạng doanh nghiệp, trung tâm dữ liệu, an ninh mạng và Cloud.'],
    lifecycle: ['Từ nhu cầu đến vận hành', 'Minh họa các giai đoạn khảo sát, thiết kế, cung cấp, triển khai và hỗ trợ.'],
  };
  if (!labels[name]) throw new Error(`Unknown illustration: ${name}`);
  return `<figure class="infographic-art"${reveal ? ' data-reveal="slide" data-duration="700"' : ''}><img src="/assets/images/${name === 'ecosystem' ? 'enterprise-ecosystem' : 'service-lifecycle'}.png" width="1536" height="1024" alt="${labels[name][1]}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">${caption ? `<figcaption>${labels[name][0]}<span>Ảnh minh họa</span></figcaption>` : ''}</figure>`;
}

export function solutionOverview() {
  return `<div class="solution-overview" aria-label="Bốn nhóm giải pháp hạ tầng"><span class="overview-core">${icon('building')}<strong>Nhu cầu doanh nghiệp</strong></span><ul>${[
    ['Mạng doanh nghiệp', 'Văn phòng, chi nhánh, người dùng', 'enterprise-networking'],
    ['Trung tâm dữ liệu', 'Máy chủ, lưu trữ, ứng dụng', 'data-center-networking'],
    ['An ninh mạng', 'Truy cập và tài nguyên mạng', 'cybersecurity'],
    ['Bảo mật Cloud', 'Workload trên môi trường Cloud', 'cloud-security'],
  ].map(([label, description, anchor], index) => `<li><a href="/solutions/#${anchor}">${icon(solutionIcon(index))}<span><strong>${label}</strong><span>${description}</span></span>${icon('arrow-up-right', 'overview-arrow')}</a></li>`).join('')}</ul></div>`;
}

export function technologyOverview() {
  return `<div class="technology-overview" aria-label="Nhóm công nghệ theo hãng">${[
    ['Cisco', ['Kết nối mạng', 'Không dây', 'Cộng tác'], 'network', 'cisco'],
    ['Palo Alto Networks', ['Bảo mật mạng', 'Bảo mật Cloud', 'Vận hành an ninh'], 'shield-check', 'palo-alto-networks'],
  ].map(([name, groups, symbol, anchor]) => `<a href="/products/#${anchor}" class="vendor-summary">${badge(symbol)}<span><strong>${name}</strong><span>${groups.join(' · ')}</span></span>${icon('arrow-up-right')}</a>`).join('')}</div>`;
}
