import { icon } from './visuals.mjs';

/** A conceptual infrastructure diagram; all symbols use the existing icon family. */
export function aboutStoryScene({ stage = 0, desktop = false } = {}) {
  const copy = (index, text) => `<span data-story-copy="${index}"${index === stage ? '' : ' hidden'}>${text}</span>`;
  const headings = ['Môi trường vận hành', 'Kết nối cùng bảo mật', 'Từ thiết kế đến triển khai', 'Đồng hành trong vận hành'];
  const labels = ['Yêu cầu kết nối', 'Truy cập an toàn', 'Tích hợp hệ thống', 'Hỗ trợ kỹ thuật'];
  const descriptions = ['Nhu cầu kết nối từ người dùng đến tài nguyên.', 'Kết nối và kiểm soát truy cập trong một kiến trúc.', 'Tích hợp, kiểm thử và nghiệm thu trong môi trường hiện hữu.', 'Rà soát và tối ưu theo phạm vi hỗ trợ đã thỏa thuận.'];
  const details = [['Nhu cầu', 'Hiện trạng', 'Phạm vi'], ['Kết nối', 'Bảo mật', 'Mở rộng'], ['Tích hợp', 'Kiểm thử', 'Nghiệm thu'], ['Rà soát', 'Tối ưu', 'Hỗ trợ']];
  const node = (name, label, place) => `<div class="story-node story-node--${place}">${icon(name)}<span>${label}</span><span class="story-deployment-mark story-deployment-mark--${place}" aria-hidden="true">${icon('check')}</span></div>`;
  const wire = place => `<div class="story-wire story-wire--${place}"><span class="story-leg story-leg--horizontal"><span data-story-flow></span></span><span class="story-leg story-leg--vertical"><span data-story-flow></span></span></div>`;
  return `<figure class="story-scene" data-story-stage="${stage}" ${desktop ? 'data-story-desktop' : 'data-story-inline'}>
    <div class="story-scene-heading">${icon('network')}<p>${headings.map((label, index) => copy(index, label)).join('')}</p></div>
    <div class="story-map">
      <div class="story-security-zone" aria-hidden="true"></div>
      <div class="story-wires" aria-hidden="true">${['office', 'branch', 'cloud', 'server'].map(wire).join('')}</div>
      ${node('network', 'Văn phòng', 'office')}${node('router', 'Chi nhánh', 'branch')}${node('cloud', 'Cloud', 'cloud')}${node('server', 'Trung tâm dữ liệu', 'server')}
      <div class="story-gateway"><span class="story-gateway-symbol">${icon('network', 'story-needs-symbol')}${icon('shield-check', 'story-secure-symbol')}${icon('cable', 'story-deploy-symbol')}${icon('headset', 'story-support-symbol')}</span><span>${labels.map((label, index) => copy(index, label)).join('')}</span></div>
    </div>
    <div class="story-scene-description">${descriptions.map((description, index) => copy(index, description)).join('')}</div>
    <div class="story-scene-detail">${details.map((items, index) => `<ol class="story-checkpoints" data-story-detail="${index}"${index === stage ? '' : ' hidden'}>${items.map(item => `<li>${item}</li>`).join('')}</ol>`).join('')}</div>
    <figcaption>Minh họa khái niệm, không phải cấu hình triển khai.</figcaption>
  </figure>`;
}
