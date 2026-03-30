/* ── Leads UI — list, modal, detail, checkboxes ── */

function renderLeads() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const filterStatus = document.getElementById('filterStatus')?.value || '';
  const filterAssigned = document.getElementById('filterAssigned')?.value || '';
  const filterSource = document.getElementById('filterSource')?.value || '';

  let filtered = allLeads.filter(l => {
    if (filterStatus && l.status !== filterStatus) return false;
    if (filterAssigned && l.assigned_to !== filterAssigned) return false;
    if (filterSource && l.source !== filterSource) return false;
    if (search) {
      const hay = [l.company_name, l.contact_name, l.contact_email, l.industry, l.city].join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (sortCol === 'value') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
    else if (sortCol === 'assigned_to') { va = getUserName(va); vb = getUserName(vb); }
    else { va = (va || '').toString().toLowerCase(); vb = (vb || '').toString().toLowerCase(); }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const page = filtered.slice(start, start + PAGE_SIZE);

  const tbody = document.getElementById('leadsTableBody');
  if (!tbody) return;

  tbody.innerHTML = page.length > 0 ? page.map(l => `
    <tr onclick="openDetail('${l.id}')" style="cursor:pointer">
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          ${qualityBadge(l.quality_score || 5)}
          <div>
            <div style="font-weight:600">${escHtml(l.company_name)}</div>
            <div style="font-size:0.7rem;color:var(--text3)">${escHtml(l.industry || '')}</div>
          </div>
        </div>
      </td>
      <td>
        <div>${escHtml(l.contact_name || '—')}</div>
        <div style="font-size:0.7rem;color:var(--text3)">${escHtml(l.contact_email || '')}</div>
      </td>
      <td>${statusPill(l.status)}</td>
      <td>${getUserName(l.assigned_to)}</td>
      <td style="font-weight:600">€${formatNum(l.value || 0)}</td>
      <td>${l.source || '—'}</td>
      <td style="font-size:0.75rem;color:var(--text3)">${timeAgo(l.updated_at || l.created_at)}</td>
      <td onclick="event.stopPropagation()">
        <div style="display:flex;gap:4px;align-items:center">
          ${checkboxCell(l, 'is_contacted', '📞')}
          ${checkboxCell(l, 'has_responded', '💬')}
          ${checkboxCell(l, 'call_scheduled', '📅')}
          ${checkboxCell(l, 'became_member', '⭐')}
          <button class="btn-icon" onclick="showTemplateModal('${l.id}')" title="${t('generate_template')}">✉️</button>
          <button class="btn-icon" onclick="openLeadModal('${l.id}')" title="${t('edit_lead')}">✏️</button>
          <button class="btn-icon" onclick="deleteLead('${l.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text3)">${t('no_leads')}</td></tr>`;

  // Pagination
  document.getElementById('leadsPagination').innerHTML = `
    <button ${currentPage <= 1 ? 'disabled' : ''} onclick="currentPage--;renderLeads()">←</button>
    <span>${currentPage} / ${totalPages} (${filtered.length} leads)</span>
    <button ${currentPage >= totalPages ? 'disabled' : ''} onclick="currentPage++;renderLeads()">→</button>
  `;
}

function checkboxCell(lead, field, emoji) {
  const checked = lead[field];
  return `<button class="btn-icon" onclick="toggleCheck('${lead.id}','${field}')" style="opacity:${checked ? 1 : 0.3};font-size:0.9rem" title="${t(field)}">${emoji}</button>`;
}

async function toggleCheck(leadId, field) {
  const lead = allLeads.find(l => l.id === leadId);
  if (!lead) return;
  const newVal = !lead[field];
  lead[field] = newVal;
  await sb.from('leadpj_leads').update({ [field]: newVal, updated_at: new Date().toISOString() }).eq('id', leadId);
  renderLeads();
  if (document.getElementById('pagePipeline').classList.contains('active')) renderPipeline();
}

function sortLeads(col) {
  if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  else { sortCol = col; sortDir = 'asc'; }
  renderLeads();
}

/* ── Lead Modal ── */
function openLeadModal(id) {
  const modal = document.getElementById('leadModal');
  const form = document.getElementById('leadForm');
  form.reset();
  document.getElementById('leadId').value = '';

  if (id) {
    const l = allLeads.find(x => x.id === id);
    if (!l) return;
    document.getElementById('leadModalTitle').textContent = t('edit_lead');
    document.getElementById('leadId').value = l.id;
    document.getElementById('fCompany').value = l.company_name || '';
    document.getElementById('fContact').value = l.contact_name || '';
    document.getElementById('fEmail').value = l.contact_email || '';
    document.getElementById('fPhone').value = l.contact_phone || '';
    document.getElementById('fWebsite').value = l.website || '';
    document.getElementById('fSource').value = l.source || 'manual';
    document.getElementById('fStatus').value = l.status || 'nuevo';
    document.getElementById('fAssigned').value = l.assigned_to || '';
    document.getElementById('fValue').value = l.value || 0;
    document.getElementById('fNotes').value = l.notes || '';
  } else {
    document.getElementById('leadModalTitle').textContent = t('new_lead');
    if (currentUser) document.getElementById('fAssigned').value = currentUser.id;
  }
  modal.classList.add('open');
}

function closeLeadModal() {
  document.getElementById('leadModal').classList.remove('open');
}

async function saveLead(e) {
  e.preventDefault();
  const id = document.getElementById('leadId').value;
  const data = {
    company_name: document.getElementById('fCompany').value.trim(),
    contact_name: document.getElementById('fContact').value.trim(),
    contact_email: document.getElementById('fEmail').value.trim(),
    contact_phone: document.getElementById('fPhone').value.trim(),
    website: document.getElementById('fWebsite').value.trim(),
    source: document.getElementById('fSource').value,
    status: document.getElementById('fStatus').value,
    assigned_to: document.getElementById('fAssigned').value || null,
    value: parseFloat(document.getElementById('fValue').value) || 0,
    notes: document.getElementById('fNotes').value.trim(),
    updated_at: new Date().toISOString()
  };

  if (data.status.startsWith('cerrado') && !data.closed_at) data.closed_at = new Date().toISOString();

  if (id) {
    await sb.from('leadpj_leads').update(data).eq('id', id);
  } else {
    const { data: newLead } = await sb.from('leadpj_leads').insert(data).select().single();
    if (newLead) {
      await sb.from('leadpj_activities').insert({
        lead_id: newLead.id, user_id: currentUser.id, type: 'created',
        description: `Lead created: ${data.company_name}`
      });
    }
  }
  closeLeadModal();
  await loadData();
  refreshAll();
}

async function deleteLead(id) {
  if (!confirm(t('delete_confirm'))) return;
  await sb.from('leadpj_leads').delete().eq('id', id);
  await loadData();
  refreshAll();
}

/* ── Detail Panel ── */
function openDetail(id) {
  const lead = allLeads.find(l => l.id === id);
  if (!lead) return;
  const overlay = document.getElementById('detailOverlay');
  document.getElementById('detailTitle').textContent = lead.company_name;

  const fields = [
    ['col_contact', lead.contact_name || '—'],
    ['contact_title', lead.contact_title || '—'],
    ['Email', lead.contact_email || '—'],
    ['phone', (lead.contact_phone || '—') + (lead.phone_type ? ` (${t(lead.phone_type)})` : '')],
    ['Website', lead.website ? `<a href="${lead.website}" target="_blank">${lead.website}</a>` : '—'],
    ['col_source', lead.source || '—'],
    ['industry', lead.industry || '—'],
    ['employees', lead.employees || '—'],
    ['city', lead.city || '—'],
    ['col_status', statusPill(lead.status)],
    ['col_assigned', getUserName(lead.assigned_to)],
    ['col_value', '€' + formatNum(lead.value || 0)],
    ['quality', qualityBadge(lead.quality_score || 5) + ' ' + (lead.quality_score || 5) + '/10'],
    ['notes', lead.notes || '—'],
  ];

  document.getElementById('detailInfo').innerHTML = fields.map(([lbl, val]) =>
    `<div class="row"><span class="lbl">${t(lbl)}</span><span>${val}</span></div>`
  ).join('');

  // Tracking status
  const checks = ['is_member', 'is_contacted', 'has_responded', 'call_scheduled', 'became_member'];
  const checkEmojis = { is_member: '👤', is_contacted: '📞', has_responded: '💬', call_scheduled: '📅', became_member: '⭐' };

  document.getElementById('quickActions').innerHTML = `
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      ${checks.map(c => `
        <button class="btn btn-sm ${lead[c] ? 'btn-primary' : 'btn-secondary'}" onclick="toggleCheck('${id}','${c}');setTimeout(()=>openDetail('${id}'),300)">
          ${checkEmojis[c]} ${t(c)}
        </button>
      `).join('')}
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-sm btn-secondary" onclick="openActivityModal('${id}','note')">${t('add_note')}</button>
      <button class="btn btn-sm btn-secondary" onclick="openActivityModal('${id}','call')">${t('log_call')}</button>
      <button class="btn btn-sm btn-secondary" onclick="openActivityModal('${id}','email')">${t('log_email')}</button>
      <button class="btn btn-sm btn-secondary" onclick="openActivityModal('${id}','meeting')">${t('log_meeting')}</button>
      <button class="btn btn-sm btn-primary" onclick="showTemplateModal('${id}')">✉️ ${t('generate_template')}</button>
      <button class="btn btn-sm btn-secondary" onclick="openLeadModal('${id}')">✏️ ${t('edit_lead')}</button>
    </div>
  `;

  // Timeline
  const acts = allActivities.filter(a => a.lead_id === id);
  const icons = { note: '📝', status_change: '🔄', call: '📞', email: '✉️', meeting: '🤝', task: '📋', created: '🆕', template_sent: '📧' };
  document.getElementById('detailTimeline').innerHTML = acts.length > 0 ? acts.map(a => {
    const user = allUsers.find(u => u.id === a.user_id);
    return `<div class="timeline-item">
      <div class="timeline-icon ${a.type}">${icons[a.type] || '📌'}</div>
      <div class="timeline-body">
        <div class="desc">${escHtml(a.description)}</div>
        <div class="meta">${user?.display_name || '?'} · ${timeAgo(a.created_at)}</div>
      </div>
    </div>`;
  }).join('') : '<p style="color:var(--text3);font-size:0.82rem">No activity yet</p>';

  overlay.classList.add('open');
}

function closeDetail() {
  document.getElementById('detailOverlay').classList.remove('open');
}

/* ── Activity Modal ── */
function openActivityModal(leadId, type) {
  document.getElementById('actLeadId').value = leadId;
  document.getElementById('actType').value = type;
  document.getElementById('actDesc').value = '';
  const titles = { note: t('add_note'), call: t('log_call'), email: t('log_email'), meeting: t('log_meeting') };
  document.getElementById('activityModalTitle').textContent = titles[type] || t('add_note');
  document.getElementById('activityModal').classList.add('open');
}

function closeActivityModal() {
  document.getElementById('activityModal').classList.remove('open');
}

async function saveActivity(e) {
  e.preventDefault();
  const leadId = document.getElementById('actLeadId').value;
  const type = document.getElementById('actType').value;
  const desc = document.getElementById('actDesc').value.trim();
  if (!desc) return;
  await sb.from('leadpj_activities').insert({
    lead_id: leadId, user_id: currentUser.id, type, description: desc
  });
  await sb.from('leadpj_leads').update({ updated_at: new Date().toISOString() }).eq('id', leadId);
  closeActivityModal();
  await loadData();
  refreshAll();
  openDetail(leadId);
}

/* ── Lost Reason ── */
let pendingLostLeadId = null;

function showLostReasonModal(leadId) {
  pendingLostLeadId = leadId;
  document.getElementById('lostLeadId').value = leadId;
  document.getElementById('lostReasonText').value = '';
  document.getElementById('lostReasonModal').classList.add('open');
}

function closeLostReasonModal() {
  document.getElementById('lostReasonModal').classList.remove('open');
  pendingLostLeadId = null;
}

async function saveLostReason(e) {
  e.preventDefault();
  const id = document.getElementById('lostLeadId').value;
  const reason = document.getElementById('lostReasonText').value.trim();
  await sb.from('leadpj_leads').update({
    status: 'cerrado_perdido', lost_reason: reason,
    closed_at: new Date().toISOString(), updated_at: new Date().toISOString()
  }).eq('id', id);
  await sb.from('leadpj_activities').insert({
    lead_id: id, user_id: currentUser.id, type: 'status_change',
    description: `Status → Cerrado perdido: ${reason}`, old_value: 'unknown', new_value: 'cerrado_perdido'
  });
  closeLostReasonModal();
  await loadData();
  refreshAll();
}
