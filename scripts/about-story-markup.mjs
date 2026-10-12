import { icon } from './visuals.mjs';

/** A conceptual infrastructure diagram; all symbols use the existing icon family. */
export function aboutStoryScene({ stage = 0, desktop = false } = {}) {
  const copy = (index, text) => `<span data-story-copy="${index}"${index === stage ? '' : ' hidden'}>${text}</span>`;
  const headings = ["Operating environments", "Connectivity with security", "From design to deployment", "Support throughout operation"];
  const labels = ["Connectivity needs", "Secure access", "System integration", "Technical Support"];
  const descriptions = ["Connection needs from users to resources.", "Connectivity and access control within one architecture.", "Integration, testing and commissioning in the existing environment.", "Review and optimization within the agreed support scope."];
  const details = [["Requirement", "Current state", "Scope"], ["Connectivity", "Security", "Scalability"], ["Integrate", "Test", "Commission"], ["Review", "Optimize", "Support"]];
  const node = (name, label, place) => `<div class="story-node story-node--${place}">${icon(name)}<span>${label}</span><span class="story-deployment-mark story-deployment-mark--${place}" aria-hidden="true">${icon('check')}</span></div>`;
  const wire = place => `<div class="story-wire story-wire--${place}"><span class="story-leg story-leg--horizontal"><span data-story-flow></span></span><span class="story-leg story-leg--vertical"><span data-story-flow></span></span></div>`;
  return `<figure class="story-scene" data-story-stage="${stage}" ${desktop ? 'data-story-desktop' : 'data-story-inline'}>
    <div class="story-scene-heading">${icon('network')}<p>${headings.map((label, index) => copy(index, label)).join('')}</p></div>
    <div class="story-map">
      <div class="story-security-zone" aria-hidden="true"></div>
      <div class="story-wires" aria-hidden="true">${['office', 'branch', 'cloud', 'server'].map(wire).join('')}</div>
      ${node('network', "Office", 'office')}${node('router', "Branch", 'branch')}${node('cloud', 'Cloud', 'cloud')}${node('server', "Data Center", 'server')}
      <div class="story-gateway"><span class="story-gateway-symbol">${icon('network', 'story-needs-symbol')}${icon('shield-check', 'story-secure-symbol')}${icon('cable', 'story-deploy-symbol')}${icon('headset', 'story-support-symbol')}</span><span>${labels.map((label, index) => copy(index, label)).join('')}</span></div>
    </div>
    <div class="story-scene-description">${descriptions.map((description, index) => copy(index, description)).join('')}</div>
    <div class="story-scene-detail">${details.map((items, index) => `<ol class="story-checkpoints" data-story-detail="${index}"${index === stage ? '' : ' hidden'}>${items.map(item => `<li>${item}</li>`).join('')}</ol>`).join('')}</div>
  </figure>`;
}
