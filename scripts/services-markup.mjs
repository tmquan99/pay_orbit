import { icon, badge, serviceIcon } from './visuals.mjs';
import { escape } from './localize.mjs';

const copy = [
  {
    step: 'Tư vấn',
    lead: 'Xác định hướng đầu tư phù hợp với hiện trạng, nhu cầu vận hành và ngân sách.',
    outcome: 'Định hướng công nghệ phù hợp với nhu cầu thực tế và ưu tiên ngân sách.',
    action: 'Trao đổi tư vấn',
  },
  {
    step: 'Thiết kế',
    lead: 'Thống nhất kiến trúc kết nối, bảo mật và tích hợp trước khi triển khai.',
    outcome: 'Phương án có thể hiệu chỉnh cùng đội ngũ kỹ thuật của doanh nghiệp.',
    action: 'Trao đổi thiết kế',
  },
  {
    step: 'Cung cấp',
    lead: 'Thiết bị, bản quyền và subscription theo cấu hình dự án đã được phê duyệt.',
    outcome: 'Cung ứng bám sát phạm vi kỹ thuật và kế hoạch đã thống nhất.',
    action: 'Trao đổi cung ứng',
  },
  {
    step: 'Triển khai',
    lead: 'Đưa giải pháp vào môi trường hiện hữu, từ cài đặt đến kiểm thử và nghiệm thu.',
    outcome: 'Hướng tới hệ thống vận hành đúng khi bàn giao.',
    action: 'Trao đổi triển khai',
  },
  {
    step: 'Hỗ trợ',
    lead: 'Xử lý sự cố, rà soát cấu hình và tối ưu sau khi đưa hệ thống vào vận hành.',
    outcome: 'Phạm vi hỗ trợ được xác định theo từng dự án hoặc thỏa thuận dịch vụ.',
    action: 'Trao đổi hỗ trợ',
  },
];

export function serviceSections(services, workbook, button) {
  return `<div class="service-experience" data-service-experience><nav class="service-journey" data-service-nav aria-label="Điều hướng dịch vụ"><div class="container service-journey-inner">
    <h2>Từ nhu cầu đến vận hành</h2><div class="service-journey-steps"><div class="service-progress" aria-hidden="true"><span class="service-progress-fill"></span></div><ol>${services.map(([id], index) => `<li><a href="#${id}"><span class="service-stage-number" aria-hidden="true">${index + 1}</span><span>${copy[index].step}</span></a></li>`).join('')}</ol></div>
  </div></nav>
  <section class="service-sections" data-service-track id="service_track" aria-label="Chi tiết năm dịch vụ">${services.map(([id, title, scope], index) => {
    const item = copy[index];
    // Pair the six implementation tasks without dropping any original scope.
    const groups = scope.length > 4 ? [scope.slice(0, 2), scope.slice(2, 4), scope.slice(4)] : scope.map(label => [label]);
    return `<article class="service-detail" data-service id="${id}" aria-labelledby="${id}-heading"><div class="container service-detail-grid">
      <div class="service-heading">${badge(serviceIcon(index))}<h2 id="${id}-heading">${escape(title)}</h2></div>
      <div class="service-body"><p class="service-lead">${escape(item.lead)}</p>
        <div class="service-scope"><h3>Phạm vi điển hình</h3><ul>${groups.map(group => `<li>${icon('check')}<span>${group.map(label => `<span>${escape(label)}</span>`).join(' · ')}</span></li>`).join('')}</ul></div>
        <div class="service-outcome">${icon('arrow-right')}<p>${escape(item.outcome)}</p></div>
        <details class="service-description" id="${id}-description"><summary><span>Đọc mô tả đầy đủ</span>${icon('arrow-right')}</summary><p>${escape(workbook[`C${index + 5}`])}</p></details>
        <div class="service-actions">${button(item.action, '/contact/#consultation_form', 'button-outline')}</div>
      </div>
    </div></article>`;
  }).join('')}</section>
  <div class="container service-carousel-controls" data-service-controls hidden><output data-service-status aria-live="polite" aria-atomic="true"></output><div class="service-carousel-buttons"><button type="button" data-service-prev aria-controls="service_track" aria-label="Dịch vụ trước">${icon('arrow-right')}</button><button type="button" data-service-next aria-controls="service_track" aria-label="Dịch vụ tiếp theo">${icon('arrow-right')}</button></div></div>
  </div>`;
}
