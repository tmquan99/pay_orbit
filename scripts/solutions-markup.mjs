import { icon, badge, solutionIcon } from './visuals.mjs';
import { escape } from './localize.mjs';

const content = [
  {
    lead: 'Kết nối văn phòng và chi nhánh trên một nền tảng dễ quản trị.',
    audience: 'Văn phòng, campus và các chi nhánh phân tán.',
    scope: ['Switching', 'Routing', 'Wireless', 'WAN / SD-WAN'],
    action: 'Trao đổi về mạng doanh nghiệp', vendor: 'cisco',
  },
  {
    lead: 'Kết nối máy chủ, lưu trữ và ứng dụng, sẵn sàng cho tăng trưởng hạ tầng.',
    audience: 'Data Center, Private Cloud và môi trường Hybrid.',
    scope: ['Compute / Storage', 'Data Center', 'Private Cloud', 'Hybrid Cloud'],
    action: 'Trao đổi về trung tâm dữ liệu', vendor: 'cisco',
  },
  {
    lead: 'Kiểm soát truy cập và bảo vệ người dùng, ứng dụng cùng tài nguyên mạng.',
    audience: 'Người dùng, ứng dụng và tài nguyên mạng quan trọng.',
    scope: ['Tường lửa', 'Phòng chống mối đe dọa', 'Truy cập an toàn', 'Phân đoạn mạng'],
    action: 'Trao đổi về an ninh mạng', vendor: 'palo-alto-networks',
  },
  {
    lead: 'Bảo vệ workload và tăng khả năng quan sát trên môi trường Cloud.',
    audience: 'Public Cloud, Private Cloud và Hybrid Cloud.',
    scope: ['Public Cloud', 'Private Cloud', 'Hybrid Cloud', 'Workload'],
    action: 'Trao đổi về bảo mật Cloud', vendor: 'palo-alto-networks',
  },
];

export function solutionSections(solutions, workbook, button) {
  return `<nav class="solution-nav" data-solution-nav aria-label="Điều hướng giải pháp"><div class="container solution-nav-inner"><span>Chọn giải pháp</span><ul>${solutions.map(([id, title], index) => `<li><a href="#${id}"><span class="solution-nav-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span>${escape(title)}</span></a></li>`).join('')}</ul></div></nav>
  <section class="solution-sections" aria-label="Chi tiết bốn giải pháp">${solutions.map(([id, title], index) => {
    const item = content[index];
    const benefits = workbook[`D${index + 5}`].replace(/\.$/, '').split(';').map(value => value.trim());
    return `<article class="solution-detail" id="${id}" data-solution aria-labelledby="${id}-heading"><span class="solution-focus-anchor" aria-hidden="true"></span><div class="container solution-detail-grid">
      <div class="solution-heading"><div class="solution-marker">${badge(solutionIcon(index))}<span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span></div><p class="solution-family">${index < 2 ? 'Kết nối doanh nghiệp' : 'Bảo vệ hạ tầng số'}</p><h2 id="${id}-heading">${escape(title)}</h2><p class="solution-audience">${escape(item.audience)}</p></div>
      <div class="solution-body"><p class="solution-lead">${escape(item.lead)}</p>
        <div class="solution-scope"><h3>Phạm vi có thể bao gồm</h3><ul>${item.scope.map(label => `<li>${escape(label)}</li>`).join('')}</ul></div>
        <div class="solution-benefits"><h3>Giá trị giải pháp hướng tới</h3><ul>${benefits.map(label => `<li>${icon('check')}<span>${escape(label.charAt(0).toLocaleUpperCase('vi') + label.slice(1))}</span></li>`).join('')}</ul></div>
        <details class="solution-description"><summary><span>Đọc mô tả đầy đủ</span>${icon('arrow-right')}</summary><p>${escape(workbook[`C${index + 5}`])}</p></details>
        <div class="solution-actions">${button(item.action, '/contact/#consultation_form')}
          <a class="solution-technology" href="/products/#${item.vendor}"><span>Công nghệ liên quan</span>${icon('arrow-up-right')}</a></div>
      </div>
    </div></article>`;
  }).join('')}</section>`;
}
