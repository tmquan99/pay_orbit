export function installEnquiryForm() {
  const form = document.getElementById('consultation_form');
  if (!form) return;
  const messages = JSON.parse(document.getElementById('form_messages').textContent);
  const requestedProduct = new URLSearchParams(location.search).get('product');
  const selectedProduct = Object.hasOwn(messages.products || {}, requestedProduct) ? messages.products[requestedProduct] : null;
  if (selectedProduct && !form.elements.requirement.value.trim()) form.elements.requirement.value = selectedProduct;
  const status = document.getElementById('form_status');
  const button = document.getElementById('send_button');
  const label = button.querySelector('span');
  let sending = false;
  const errorFor = (id, value) => {
    if (id === 'name' && !value.trim()) return messages.nameRequired;
    if (id === 'requirement' && !value.trim()) return messages.requirementRequired;
    if (id === 'email' && !value.trim()) return messages.emailRequired;
    if (id === 'email' && form.elements.email.validity.typeMismatch) return messages.emailInvalid;
    return '';
  };
  function showFieldError(id, message) {
    const field = form.elements.namedItem(id);
    const error = document.getElementById(`${id}_error`);
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) { error.textContent = message; error.hidden = !message; }
  }
  form.addEventListener('input', event => {
    if (!sending) status.textContent = '';
    if (event.target.getAttribute('aria-invalid') === 'true') showFieldError(event.target.id, errorFor(event.target.id, event.target.value));
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    const fields = ['name', 'email', 'requirement'];
    const invalid = fields.filter(id => {
      const message = errorFor(id, form.elements.namedItem(id).value);
      showFieldError(id, message);
      return Boolean(message);
    });
    status.textContent = '';
    if (invalid.length) { form.elements.namedItem(invalid[0]).focus(); return; }
    const data = Object.fromEntries(['name', 'company', 'email', 'phone', 'requirement', 'website'].map(id => [id, form.elements.namedItem(id).value.trim()]));
    sending = true;
    button.disabled = true;
    label.textContent = messages.sending;
    form.setAttribute('aria-busy', 'true');
    status.textContent = messages.sending;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data), signal: controller.signal, credentials: 'omit' });
      const result = await response.json();
      if (response.status === 429) { status.textContent = messages.rateLimited; return; }
      if (response.status === 422 && result.errors) {
        for (const id of fields) {
          if (result.errors[id]) showFieldError(id, result.errors[id] === 'required' ? messages[`${id}Required`] : id === 'email' ? messages.emailInvalid : messages.fieldInvalid);
        }
        const first = fields.find(id => result.errors[id]);
        if (first) form.elements.namedItem(first).focus();
      }
      if (!response.ok || result.ok !== true) throw new Error('Enquiry not accepted');
      status.textContent = messages.sent;
    } catch { status.textContent = messages.sendFailed; }
    finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      label.textContent = messages.send;
      form.removeAttribute('aria-busy');
    }
  });
  button.disabled = false;
}
