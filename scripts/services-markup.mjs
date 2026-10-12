import { icon, badge, serviceIcon } from './visuals.mjs';
import { escape } from './html.mjs';

const copy = [
  {
    step: "Consult",
    lead: "Choose an investment direction that fits your infrastructure, operational needs and budget.",
    outcome: "Technology recommendations aligned with real needs and budget priorities.",
    action: "Discuss consulting",
  },
  {
    step: "Design",
    lead: "Align networking, security and integration architecture before deployment.",
    outcome: "The design can be refined with your technical team.",
    action: "Discuss design",
  },
  {
    step: "Supply",
    lead: "Hardware, licenses and subscriptions based on the approved project configuration.",
    outcome: "Procurement aligned with the agreed technical scope and schedule.",
    action: "Discuss procurement",
  },
  {
    step: "Deploy",
    lead: "Deploy the solution in your existing environment, from installation to testing and commissioning.",
    outcome: "Aiming for a system that operates correctly at handover.",
    action: "Discuss deployment",
  },
  {
    step: "Support",
    lead: "Troubleshooting, configuration review and optimization after deployment.",
    outcome: "Support scope is defined for each project or service agreement.",
    action: "Discuss support",
  },
];

export function serviceSections(services, workbook, button) {
  return `<div class="service-experience" data-service-experience><nav class="service-journey" data-service-nav aria-label="Service navigation"><div class="container service-journey-inner">
    <h2>From requirements to operations</h2><div class="service-journey-steps"><div class="service-progress" aria-hidden="true"><span class="service-progress-fill"></span></div><ol>${services.map(([id], index) => `<li><a href="#${id}"><span class="service-stage-number" aria-hidden="true">${index + 1}</span><span>${copy[index].step}</span></a></li>`).join('')}</ol></div>
  </div></nav>
  <section class="service-sections" data-service-track id="service_track" aria-label="Five services in detail">${services.map(([id, title, scope], index) => {
    const item = copy[index];
    // Pair the six implementation tasks without dropping any original scope.
    const groups = scope.length > 4 ? [scope.slice(0, 2), scope.slice(2, 4), scope.slice(4)] : scope.map(label => [label]);
    return `<article class="service-detail" data-service id="${id}" aria-labelledby="${id}-heading"><div class="container service-detail-grid">
      <div class="service-heading">${badge(serviceIcon(index))}<h2 id="${id}-heading">${escape(title)}</h2></div>
      <div class="service-body"><p class="service-lead">${escape(item.lead)}</p>
        <div class="service-scope"><h3>Typical scope</h3><ul>${groups.map(group => `<li>${icon('check')}<span>${group.map(label => `<span>${escape(label)}</span>`).join(' · ')}</span></li>`).join('')}</ul></div>
        <div class="service-outcome">${icon('arrow-right')}<p>${escape(item.outcome)}</p></div>
        <details class="service-description" id="${id}-description"><summary><span>Read the full description</span>${icon('arrow-right')}</summary><p>${escape(workbook[`B${index + 5}`])}</p></details>
        <div class="service-actions">${button(item.action, '/contact/#consultation_form', 'button-outline')}</div>
      </div>
    </div></article>`;
  }).join('')}</section>
  <div class="container service-carousel-controls" data-service-controls hidden><output data-service-status aria-live="polite" aria-atomic="true"></output><div class="service-carousel-buttons"><button type="button" data-service-prev aria-controls="service_track" aria-label="Previous service">${icon('arrow-right')}</button><button type="button" data-service-next aria-controls="service_track" aria-label="Next service">${icon('arrow-right')}</button></div></div>
  </div>`;
}
