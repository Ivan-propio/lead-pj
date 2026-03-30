/* ── Pipeline / Kanban Board ── */

const PIPELINE_STATUSES = ['nuevo', 'contactado', 'en_negociacion', 'cerrado_ganado', 'cerrado_perdido'];
const STATUS_COLORS = {
  nuevo: 'var(--nuevo)', contactado: 'var(--contactado)',
  en_negociacion: 'var(--en-negociacion)', cerrado_ganado: 'var(--cerrado-ganado)',
  cerrado_perdido: 'var(--cerrado-perdido)'
};

function renderPipeline() {
  const board = document.getElementById('kanbanBoard');
  if (!board) return;

  board.innerHTML = PIPELINE_STATUSES.map(status => {
    const leads = allLeads.filter(l => l.status === status);
    const totalValue = leads.reduce((s, l) => s + (parseFloat(l.value) || 0), 0);

    return `
      <div class="kanban-col">
        <div class="kanban-col-header">
          <div class="col-title" style="color:${STATUS_COLORS[status]}">${t('status_' + status)}</div>
          <div class="col-meta">${leads.length} leads · €${formatNum(totalValue)}</div>
        </div>
        <div class="kanban-col-body" data-status="${status}"
          ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event,'${status}')">
          ${leads.map(l => kanbanCard(l)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function kanbanCard(lead) {
  const initial = (getUserName(lead.assigned_to) || '?')[0];
  const daysSince = Math.floor((Date.now() - new Date(lead.updated_at || lead.created_at).getTime()) / 86400000);
  const checks = [];
  if (lead.is_contacted) checks.push('📞');
  if (lead.has_responded) checks.push('💬');
  if (lead.call_scheduled) checks.push('📅');
  if (lead.became_member) checks.push('⭐');

  return `
    <div class="kanban-card" draggable="true" data-id="${lead.id}"
      ondragstart="handleDragStart(event,'${lead.id}')" ondragend="handleDragEnd(event)"
      onclick="openDetail('${lead.id}')">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div class="kc-company">${escHtml(lead.company_name)}</div>
        ${qualityBadge(lead.quality_score || 5)}
      </div>
      <div class="kc-contact">${escHtml(lead.contact_name || '—')}${lead.contact_title ? ' · ' + escHtml(lead.contact_title) : ''}</div>
      <div class="kc-footer">
        <div style="display:flex;align-items:center;gap:6px">
          ${lead.value > 0 ? `<span class="kc-value">€${formatNum(lead.value)}</span>` : ''}
          <span style="font-size:0.65rem;color:var(--text3)">${daysSince}d</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          ${checks.length > 0 ? `<span style="font-size:0.7rem">${checks.join('')}</span>` : ''}
          <div class="kc-avatar">${initial}</div>
        </div>
      </div>
    </div>
  `;
}

/* ── Drag & Drop ── */
let draggedLeadId = null;

function handleDragStart(e, id) {
  draggedLeadId = id;
  e.dataTransfer.effectAllowed = 'move';
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.kanban-col-body').forEach(el => el.classList.remove('drag-over'));
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e, newStatus) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!draggedLeadId) return;

  const lead = allLeads.find(l => l.id === draggedLeadId);
  if (!lead || lead.status === newStatus) { draggedLeadId = null; return; }

  const oldStatus = lead.status;

  // If dropping to cerrado_perdido, ask for reason
  if (newStatus === 'cerrado_perdido') {
    showLostReasonModal(draggedLeadId);
    draggedLeadId = null;
    return;
  }

  const updateData = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };
  if (newStatus === 'cerrado_ganado') updateData.closed_at = new Date().toISOString();

  await sb.from('leadpj_leads').update(updateData).eq('id', draggedLeadId);
  await sb.from('leadpj_activities').insert({
    lead_id: draggedLeadId, user_id: currentUser.id, type: 'status_change',
    description: `Status: ${t('status_' + oldStatus)} → ${t('status_' + newStatus)}`,
    old_value: oldStatus, new_value: newStatus
  });

  // Auto-check is_contacted when moving past nuevo
  if (oldStatus === 'nuevo' && newStatus !== 'nuevo') {
    await sb.from('leadpj_leads').update({ is_contacted: true }).eq('id', draggedLeadId);
  }

  draggedLeadId = null;
  await loadData();
  refreshAll();
}

/* ── Touch support for mobile drag ── */
let touchDragId = null;
let touchClone = null;

document.addEventListener('touchstart', (e) => {
  const card = e.target.closest('.kanban-card');
  if (!card) return;
  touchDragId = card.dataset.id;
  const rect = card.getBoundingClientRect();
  touchClone = card.cloneNode(true);
  touchClone.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;opacity:0.8;z-index:999;pointer-events:none;`;
  document.body.appendChild(touchClone);
  card.style.opacity = '0.3';
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (!touchClone) return;
  const touch = e.touches[0];
  touchClone.style.top = (touch.clientY - 30) + 'px';
  touchClone.style.left = (touch.clientX - 60) + 'px';
}, { passive: true });

document.addEventListener('touchend', async (e) => {
  if (!touchClone || !touchDragId) return;
  touchClone.remove();
  touchClone = null;
  document.querySelectorAll('.kanban-card').forEach(c => c.style.opacity = '');

  const touch = e.changedTouches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  const col = el?.closest('.kanban-col-body');
  if (col) {
    const newStatus = col.dataset.status;
    draggedLeadId = touchDragId;
    await handleDrop(e, newStatus);
  }
  touchDragId = null;
});
