import { icon, badge, solutionIcon } from './visuals.mjs';
import { escape } from './html.mjs';

const content = [
  {
    lead: "Connect offices and branches on a platform that is easy to manage.",
    audience: "Offices, campuses and distributed branches.",
    scope: ['Switching', 'Routing', 'Wireless', 'WAN / SD-WAN'],
    action: "Discuss enterprise networking", vendor: 'cisco',
  },
  {
    lead: "Connect servers, storage and applications with room for infrastructure growth.",
    audience: "Data centers, private cloud and hybrid environments.",
    scope: ['Compute / Storage', 'Data Center', 'Private Cloud', 'Hybrid Cloud'],
    action: "Discuss data center networking", vendor: 'cisco',
  },
  {
    lead: "Control access and protect users, applications and network resources.",
    audience: "Users, applications and critical network resources.",
    scope: ["Firewalls", "Threat prevention", "Secure access", "Network segmentation"],
    action: "Discuss cybersecurity", vendor: 'palo-alto-networks',
  },
  {
    lead: "Protect workloads and improve visibility across cloud environments.",
    audience: "Public, private and hybrid cloud.",
    scope: ['Public Cloud', 'Private Cloud', 'Hybrid Cloud', 'Workload'],
    action: "Discuss cloud security", vendor: 'palo-alto-networks',
  },
];

export function solutionSections(solutions, workbook, button) {
  return `<nav class="solution-nav" data-solution-nav aria-label="Solution navigation"><div class="container solution-nav-inner"><span>Choose a solution</span><ul>${solutions.map(([id, title], index) => `<li><a href="#${id}"><span class="solution-nav-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span>${escape(title)}</span></a></li>`).join('')}</ul></div></nav>
  <section class="solution-sections" aria-label="Four solutions in detail">${solutions.map(([id, title], index) => {
    const item = content[index];
    const benefits = [["Stable connectivity","Centralized management","Scalability with users and branches"],["Compute and storage connectivity","Redundancy","Operational visibility","Support for infrastructure growth"],["Network protection","Access control","Risk reduction","Improved threat detection and prevention"],["Workload protection","Improved visibility","Support for multi-cloud and hybrid environments"]][index];
    return `<article class="solution-detail" id="${id}" data-solution aria-labelledby="${id}-heading"><span class="solution-focus-anchor" aria-hidden="true"></span><div class="container solution-detail-grid">
      <div class="solution-heading"><div class="solution-marker">${badge(solutionIcon(index))}<span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span></div><p class="solution-family">${index < 2 ? "Connect your business" : "Protect your infrastructure"}</p><h2 id="${id}-heading">${escape(title)}</h2><p class="solution-audience">${escape(item.audience)}</p></div>
      <div class="solution-body"><p class="solution-lead">${escape(item.lead)}</p>
        <div class="solution-scope"><h3>Scope may include</h3><ul>${item.scope.map(label => `<li>${escape(label)}</li>`).join('')}</ul></div>
        <div class="solution-benefits"><h3>Solution objectives</h3><ul>${benefits.map(label => `<li>${icon('check')}<span>${escape(label.charAt(0).toLocaleUpperCase('en') + label.slice(1))}</span></li>`).join('')}</ul></div>
        <details class="solution-description"><summary><span>Read the full description</span>${icon('arrow-right')}</summary><p>${escape(workbook[`B${index + 5}`])}</p></details>
        <div class="solution-actions">${button(item.action, '/contact/#consultation_form')}
          <a class="solution-technology" href="/products/#${item.vendor}"><span>Related technology</span>${icon('arrow-up-right')}</a></div>
      </div>
    </div></article>`;
  }).join('')}</section>`;
}
