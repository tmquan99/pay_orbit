import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workbook = JSON.parse(await fs.readFile(path.join(root, 'content/workbook.json'), 'utf8'));
const interfaceEnglish = JSON.parse(await fs.readFile(path.join(root, 'content/ui.en.json'), 'utf8'));
export const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const english = new Map(Object.entries(interfaceEnglish));

// Full document copy comes directly from the supplied English column, never
// from a new translation of the Vietnamese descriptions.
for (const cells of Object.values(workbook.sheets)) {
  for (const [cell, value] of Object.entries(cells)) {
    if (/^C\d+$/.test(cell) && cells[cell.replace('C', 'B')]) english.set(value, cells[cell.replace('C', 'B')]);
  }
}
english.set(workbook.sheets['00_Overview'].B7, workbook.sheets['00_Overview'].B6);
const heroVi = workbook.sheets['01_Home'].C5.split('\n');
const heroEn = workbook.sheets['01_Home'].B5.split('\n');
english.set(heroVi[0], heroEn[0]);
english.set(heroVi.slice(1).join(' '), heroEn.slice(1).join(' '));
const contact = workbook.sheets['06_Contact'];
english.set(`Người đại diện: ${contact.C6}`, `Representative: ${contact.B6}`);
english.set(`Địa chỉ: ${contact.C7}`, `Address: ${contact.B7}`);

export function translate(value, language = 'vi') {
  if (language === 'vi') return value;
  if (language !== 'en') throw new Error(`Unsupported language: ${language}`);
  if (english.has(value)) return english.get(value);
  if (/[À-ỹ]/u.test(value)) throw new Error(`Missing English interface label: ${value}`);
  return value;
}
export const languageRoute = (route, language) => language === 'en' ? `/en${route}` : route;
const escapedEnglish = new Map([...english].map(([vi, en]) => [escape(vi), escape(en)]));
function translateMarkupText(value) {
  const text = value.trim();
  if (!text) return value;
  const translated = escapedEnglish.get(text);
  if (translated !== undefined) return value.replace(text, () => translated);
  if (/[À-ỹ]/u.test(text)) throw new Error(`Untranslated English page text: ${text}`);
  return value;
}
export function localizeContent(html, language = 'vi') {
  if (language === 'vi') return html;
  return html.split(/(<[^>]*>)/g).map(token => {
    if (!token.startsWith('<')) return translateMarkupText(token);
    return token
      .replace(/\b(alt|aria-label)="([^"]*)"/g, (_, name, value) => `${name}="${translateMarkupText(value)}"`)
      .replace(/\bhref="(\/(?!assets\/|src\/)[^"]*)"/g, (_, href) => `href="${languageRoute(href, language)}"`);
  }).join('');
}

export function formMessages(language) {
  const labels = { name: 'Họ tên', company: 'Công ty', email: 'Email', phone: 'Điện thoại', requirement: 'Nhu cầu' };
  return {
    labels: Object.fromEntries(Object.entries(labels).map(([key, value]) => [key, translate(value, language)])),
    nameRequired: translate('Nhập họ tên của bạn.', language),
    requirementRequired: translate('Nhập nhu cầu cần trao đổi.', language),
    emailInvalid: translate('Nhập địa chỉ email hợp lệ.', language),
    copied: translate('Đã sao chép nội dung trao đổi.', language),
    manualCopy: translate('Chọn nội dung bên dưới để sao chép thủ công.', language),
  };
}
