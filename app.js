/* ── Paperjam Leads — Paperjam Leads ── */
const SUPABASE_URL = 'https://lkikndmaiwkrkgkxkvnl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraWtuZG1haXdrcmtna3hrdm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTg2ODYsImV4cCI6MjA5MDQ3NDY4Nn0.0CimGbZ_qJQLA3LTOPMiFmqmpeCVt6EmOYhHCAl-uy4';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* ── State ── */
let currentUser = null;
let allUsers = [];
let allLeads = [];
let allActivities = [];
let settings = {};
let sortCol = 'created_at';
let sortDir = 'desc';
let currentPage = 1;
const PAGE_SIZE = 25;
let currentLang = localStorage.getItem('leadpj_lang') || 'fr';

/* ── i18n ── */
const i18n = {
  es: {
    login_sub: 'Gestiona tus leads de forma simple y potente',
    username: 'Usuario', password: 'Contraseña', login_btn: 'Iniciar sesión',
    login_error: 'Usuario o contraseña incorrectos',
    nav_dashboard: 'Dashboard', nav_leads: 'Leads', nav_pipeline: 'Pipeline',
    logout: 'Cerrar sesión',
    new_lead: 'Nuevo Lead', edit_lead: 'Editar Lead',
    col_company: 'Empresa', col_contact: 'Contacto', col_status: 'Estado',
    col_assigned: 'Asignado', col_value: 'Valor', col_source: 'Fuente',
    col_updated: 'Actualizado', col_actions: 'Acciones',
    search_leads: 'Buscar leads...', all_statuses: 'Todos los estados',
    all_users: 'Todos', all_sources: 'Todas las fuentes',
    status_nuevo: 'Nuevo', status_contactado: 'Contactado',
    status_en_negociacion: 'En negociación', status_cerrado_ganado: 'Cerrado ganado',
    status_cerrado_perdido: 'Cerrado perdido',
    source_other: 'Otro', phone: 'Teléfono', notes: 'Notas',
    cancel: 'Cancelar', save: 'Guardar', delete_confirm: '¿Eliminar este lead?',
    pipeline_funnel: 'Pipeline', by_source: 'Por fuente',
    recent_activity: 'Actividad reciente', value_summary: 'Resumen de valor',
    total_leads: 'Total Leads', conversion_rate: 'Tasa conversión',
    pipeline_value: 'Valor pipeline', won_value: 'Valor ganado',
    avg_deal: 'Media por deal', no_leads: 'No hay leads todavía',
    activity_history: 'Historial de actividad',
    add_note: 'Agregar nota', description: 'Descripción',
    lost_reason: 'Razón de pérdida', lost_reason_label: '¿Por qué se perdió este lead?',
    confirm_lost: 'Confirmar perdido',
    log_call: 'Llamada', log_email: 'Email', log_meeting: 'Reunión',
    generate_template: 'Generar email', template_title: 'Template de email',
    copy_subject: 'Copiar asunto', copy_body: 'Copiar cuerpo',
    copied: '¡Copiado!', close: 'Cerrar',
    quality: 'Calidad', industry: 'Industria', employees: 'Empleados', city: 'Ciudad',
    contact_title: 'Cargo', phone_type: 'Tipo tel.', mobile: 'Móvil', landline: 'Fijo',
    is_member: 'Miembro', is_contacted: 'Contactado', has_responded: 'Respondido',
    call_scheduled: 'Llamada prog.', became_member: 'Nuevo miembro',
    settings: 'Ajustes', calendly_link: 'Link Calendly', caller_name: 'Nombre llamador',
    save_settings: 'Guardar ajustes', settings_saved: '¡Ajustes guardados!',
    quality_guide: 'Guía de calidad',
    q10: '10 — Lead perfecto: decisor, empresa ideal, necesidad clara, presupuesto confirmado',
    q9: '9 — Casi perfecto: muy buen fit, alta probabilidad de conversión',
    q8: '8 — Excelente: contacto directo con decisor, empresa relevante',
    q7: '7 — Muy bueno: buen perfil de empresa, contacto identificado',
    q6: '6 — Bueno: empresa target pero contacto genérico o indirecto',
    q5: '5 — Promedio: podría ser cliente, necesita investigación',
    q4: '4 — Por debajo: poco presupuesto o difícil acceso',
    q3: '3 — Bajo: poca probabilidad, fuera del perfil ideal',
    q2: '2 — Muy bajo: casi no encaja pero vale mantener',
    q1: '1 — Mínimo: apenas relevante, archivar para futuro',
    email_lang: 'Idioma email',
    select_lang: 'Seleccionar idioma del email',
    all_qualities: 'Todas las calidades',
  },
  en: {
    login_sub: 'Manage your leads simply and powerfully',
    username: 'Username', password: 'Password', login_btn: 'Sign in',
    login_error: 'Wrong username or password',
    nav_dashboard: 'Dashboard', nav_leads: 'Leads', nav_pipeline: 'Pipeline',
    logout: 'Sign out',
    new_lead: 'New Lead', edit_lead: 'Edit Lead',
    col_company: 'Company', col_contact: 'Contact', col_status: 'Status',
    col_assigned: 'Assigned', col_value: 'Value', col_source: 'Source',
    col_updated: 'Updated', col_actions: 'Actions',
    search_leads: 'Search leads...', all_statuses: 'All statuses',
    all_users: 'Everyone', all_sources: 'All sources',
    status_nuevo: 'New', status_contactado: 'Contacted',
    status_en_negociacion: 'In negotiation', status_cerrado_ganado: 'Closed won',
    status_cerrado_perdido: 'Closed lost',
    source_other: 'Other', phone: 'Phone', notes: 'Notes',
    cancel: 'Cancel', save: 'Save', delete_confirm: 'Delete this lead?',
    pipeline_funnel: 'Pipeline', by_source: 'By source',
    recent_activity: 'Recent activity', value_summary: 'Value summary',
    total_leads: 'Total Leads', conversion_rate: 'Conversion rate',
    pipeline_value: 'Pipeline value', won_value: 'Won value',
    avg_deal: 'Avg deal size', no_leads: 'No leads yet',
    activity_history: 'Activity history',
    add_note: 'Add note', description: 'Description',
    lost_reason: 'Lost reason', lost_reason_label: 'Why was this lead lost?',
    confirm_lost: 'Confirm lost',
    log_call: 'Call', log_email: 'Email', log_meeting: 'Meeting',
    generate_template: 'Generate email', template_title: 'Email template',
    copy_subject: 'Copy subject', copy_body: 'Copy body',
    copied: 'Copied!', close: 'Close',
    quality: 'Quality', industry: 'Industry', employees: 'Employees', city: 'City',
    contact_title: 'Title', phone_type: 'Phone type', mobile: 'Mobile', landline: 'Landline',
    is_member: 'Member', is_contacted: 'Contacted', has_responded: 'Responded',
    call_scheduled: 'Call sched.', became_member: 'New member',
    settings: 'Settings', calendly_link: 'Calendly link', caller_name: 'Caller name',
    save_settings: 'Save settings', settings_saved: 'Settings saved!',
    quality_guide: 'Quality guide',
    q10: '10 — Perfect lead: decision-maker, ideal company, clear need, confirmed budget',
    q9: '9 — Near perfect: great fit, high conversion probability',
    q8: '8 — Excellent: direct contact with decision-maker, relevant company',
    q7: '7 — Very good: good company profile, contact identified',
    q6: '6 — Good: target company but generic or indirect contact',
    q5: '5 — Average: could be a client, needs research',
    q4: '4 — Below average: low budget or hard to reach',
    q3: '3 — Low: unlikely, outside ideal profile',
    q2: '2 — Very low: barely fits but worth keeping',
    q1: '1 — Minimal: barely relevant, archive for future',
    email_lang: 'Email language',
    select_lang: 'Select email language',
    all_qualities: 'All qualities',
  },
  fr: {
    login_sub: 'Gérez vos leads simplement et puissamment',
    username: 'Utilisateur', password: 'Mot de passe', login_btn: 'Se connecter',
    login_error: 'Utilisateur ou mot de passe incorrect',
    nav_dashboard: 'Tableau de bord', nav_leads: 'Leads', nav_pipeline: 'Pipeline',
    logout: 'Déconnexion',
    new_lead: 'Nouveau Lead', edit_lead: 'Modifier Lead',
    col_company: 'Entreprise', col_contact: 'Contact', col_status: 'Statut',
    col_assigned: 'Assigné', col_value: 'Valeur', col_source: 'Source',
    col_updated: 'Mis à jour', col_actions: 'Actions',
    search_leads: 'Rechercher leads...', all_statuses: 'Tous les statuts',
    all_users: 'Tous', all_sources: 'Toutes les sources',
    status_nuevo: 'Nouveau', status_contactado: 'Contacté',
    status_en_negociacion: 'En négociation', status_cerrado_ganado: 'Fermé gagné',
    status_cerrado_perdido: 'Fermé perdu',
    source_other: 'Autre', phone: 'Téléphone', notes: 'Notes',
    cancel: 'Annuler', save: 'Enregistrer', delete_confirm: 'Supprimer ce lead ?',
    pipeline_funnel: 'Pipeline', by_source: 'Par source',
    recent_activity: 'Activité récente', value_summary: 'Résumé valeur',
    total_leads: 'Total Leads', conversion_rate: 'Taux conversion',
    pipeline_value: 'Valeur pipeline', won_value: 'Valeur gagnée',
    avg_deal: 'Moyenne par deal', no_leads: 'Pas encore de leads',
    activity_history: "Historique d'activité",
    add_note: 'Ajouter note', description: 'Description',
    lost_reason: 'Raison de perte', lost_reason_label: 'Pourquoi ce lead a été perdu ?',
    confirm_lost: 'Confirmer perdu',
    log_call: 'Appel', log_email: 'Email', log_meeting: 'Réunion',
    generate_template: 'Générer email', template_title: "Template d'email",
    copy_subject: 'Copier sujet', copy_body: 'Copier corps',
    copied: 'Copié !', close: 'Fermer',
    quality: 'Qualité', industry: 'Industrie', employees: 'Employés', city: 'Ville',
    contact_title: 'Poste', phone_type: 'Type tél.', mobile: 'Mobile', landline: 'Fixe',
    is_member: 'Membre', is_contacted: 'Contacté', has_responded: 'Répondu',
    call_scheduled: 'Appel prog.', became_member: 'Nouveau membre',
    settings: 'Paramètres', calendly_link: 'Lien Calendly', caller_name: 'Nom appelant',
    save_settings: 'Sauvegarder', settings_saved: 'Paramètres sauvegardés !',
    quality_guide: 'Guide qualité',
    q10: '10 — Lead parfait : décideur, entreprise idéale, besoin clair, budget confirmé',
    q9: '9 — Presque parfait : très bon fit, haute probabilité de conversion',
    q8: '8 — Excellent : contact direct avec décideur, entreprise pertinente',
    q7: '7 — Très bon : bon profil entreprise, contact identifié',
    q6: '6 — Bon : entreprise cible mais contact générique ou indirect',
    q5: '5 — Moyen : pourrait être client, nécessite recherche',
    q4: '4 — En dessous : peu de budget ou accès difficile',
    q3: '3 — Faible : peu probable, hors profil idéal',
    q2: '2 — Très faible : correspond à peine mais vaut garder',
    q1: '1 — Minimal : à peine pertinent, archiver pour le futur',
    email_lang: "Langue de l'email",
    select_lang: "Sélectionner la langue de l'email",
    all_qualities: 'Toutes les qualités',
  }
};

function t(key) { return i18n[currentLang]?.[key] || i18n.es[key] || key; }

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('leadpj_lang', lang);
  document.querySelectorAll('.lang-switch button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  if (currentUser) refreshAll();
}

/* ── Auth ── */
async function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('loginUser').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;
  const { data, error } = await sb.from('leadpj_users')
    .select('*').eq('username', user).eq('password_hash', pass).single();
  if (error || !data) {
    document.getElementById('loginError').textContent = t('login_error');
    return;
  }
  currentUser = data;
  localStorage.setItem('leadpj_session', JSON.stringify(data));
  showApp();
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('leadpj_session');
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

async function checkSession() {
  const s = localStorage.getItem('leadpj_session');
  if (s) {
    currentUser = JSON.parse(s);
    showApp();
  }
}

async function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').style.display = 'flex';
  document.getElementById('currentUserName').textContent = currentUser.display_name;
  await loadData();
  refreshAll();
  subscribeRealtime();
}

/* ── Data Loading ── */
async function loadData() {
  const [usersRes, leadsRes, activitiesRes, settingsRes] = await Promise.all([
    sb.from('leadpj_users').select('*'),
    sb.from('leadpj_leads').select('*').order('created_at', { ascending: false }),
    sb.from('leadpj_activities').select('*').order('created_at', { ascending: false }).limit(200),
    sb.from('leadpj_settings').select('*')
  ]);
  allUsers = usersRes.data || [];
  allLeads = leadsRes.data || [];
  allActivities = activitiesRes.data || [];
  settings = {};
  (settingsRes.data || []).forEach(s => settings[s.key] = s.value);
  populateUserDropdowns();
}

function populateUserDropdowns() {
  const selects = [document.getElementById('filterAssigned'), document.getElementById('fAssigned')];
  selects.forEach(sel => {
    if (!sel) return;
    const val = sel.value;
    const isFilter = sel.id === 'filterAssigned';
    sel.innerHTML = isFilter ? `<option value="">${t('all_users')}</option>` : '';
    allUsers.forEach(u => {
      sel.innerHTML += `<option value="${u.id}">${u.display_name}</option>`;
    });
    if (val) sel.value = val;
  });
}

/* ── Realtime ── */
function subscribeRealtime() {
  sb.channel('leadpj-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leadpj_leads' }, () => {
      loadData().then(refreshAll);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leadpj_activities' }, () => {
      loadData().then(refreshAll);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leadpj_settings' }, () => {
      loadData().then(refreshAll);
    })
    .subscribe();
}

/* ── Tab Switching ── */
function switchTab(tab, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
  document.getElementById('page' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
  if (el) el.classList.add('active');
  if (tab === 'pipeline') renderPipeline();
  if (tab === 'leads') renderLeads();
  if (tab === 'dashboard') renderDashboard();
}

/* ── Refresh All ── */
function refreshAll() {
  renderDashboard();
  renderLeads();
  if (document.getElementById('pagePipeline').classList.contains('active')) renderPipeline();
}

/* ── Dashboard ── */
function renderDashboard() {
  const total = allLeads.length;
  const byStatus = {};
  const bySource = {};
  let pipelineValue = 0, wonValue = 0;
  const statuses = ['nuevo', 'contactado', 'en_negociacion', 'cerrado_ganado', 'cerrado_perdido'];
  statuses.forEach(s => byStatus[s] = 0);

  allLeads.forEach(l => {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    bySource[l.source] = (bySource[l.source] || 0) + 1;
    const v = parseFloat(l.value) || 0;
    if (l.status === 'cerrado_ganado') wonValue += v;
    if (!l.status.startsWith('cerrado')) pipelineValue += v;
  });

  const won = byStatus.cerrado_ganado || 0;
  const convRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0';
  const avgDeal = won > 0 ? (wonValue / won).toFixed(0) : '0';

  // KPIs
  document.getElementById('kpiGrid').innerHTML = `
    <div class="kpi"><div class="kpi-label">${t('total_leads')}</div><div class="kpi-value">${total}</div></div>
    <div class="kpi"><div class="kpi-label">${t('status_nuevo')}</div><div class="kpi-value" style="color:var(--nuevo)">${byStatus.nuevo}</div></div>
    <div class="kpi"><div class="kpi-label">${t('status_en_negociacion')}</div><div class="kpi-value" style="color:var(--en-negociacion)">${byStatus.en_negociacion}</div></div>
    <div class="kpi"><div class="kpi-label">${t('status_cerrado_ganado')}</div><div class="kpi-value" style="color:var(--cerrado-ganado)">${byStatus.cerrado_ganado}</div></div>
    <div class="kpi"><div class="kpi-label">${t('conversion_rate')}</div><div class="kpi-value">${convRate}%</div></div>
  `;

  // Funnel
  const maxCount = Math.max(...statuses.map(s => byStatus[s]), 1);
  const statusColors = { nuevo: 'var(--nuevo)', contactado: 'var(--contactado)', en_negociacion: 'var(--en-negociacion)', cerrado_ganado: 'var(--cerrado-ganado)', cerrado_perdido: 'var(--cerrado-perdido)' };
  document.getElementById('funnelChart').innerHTML = statuses.map(s => `
    <div class="funnel-bar">
      <div class="label">${t('status_' + s)}</div>
      <div class="bar" style="width:${Math.max((byStatus[s] / maxCount) * 100, 4)}%;background:${statusColors[s]}"><span>${byStatus[s]}</span></div>
    </div>
  `).join('');

  // Source chart
  const sources = Object.entries(bySource).sort((a, b) => b[1] - a[1]);
  const maxSrc = sources.length > 0 ? sources[0][1] : 1;
  document.getElementById('sourceChart').innerHTML = sources.length > 0 ? sources.map(([s, c]) => `
    <div class="funnel-bar">
      <div class="label">${s}</div>
      <div class="bar" style="width:${Math.max((c / maxSrc) * 100, 4)}%;background:var(--primary)"><span>${c}</span></div>
    </div>
  `).join('') : `<p style="color:var(--text3);font-size:0.82rem">${t('no_leads')}</p>`;

  // Activity feed
  const recentActs = allActivities.slice(0, 10);
  document.getElementById('activityFeed').innerHTML = recentActs.length > 0 ? recentActs.map(a => {
    const lead = allLeads.find(l => l.id === a.lead_id);
    const user = allUsers.find(u => u.id === a.user_id);
    const colors = { note: 'var(--primary)', status_change: 'var(--contactado)', call: 'var(--cerrado-ganado)', email: 'var(--nuevo)', meeting: 'var(--en-negociacion)', created: 'var(--primary)', task: 'var(--cerrado-perdido)', template_sent: 'var(--primary)' };
    return `<div class="feed-item">
      <div class="feed-dot" style="background:${colors[a.type] || 'var(--text3)'}"></div>
      <div>
        <div class="feed-text"><strong>${user?.display_name || '?'}</strong> — ${a.description} ${lead ? `(<strong>${lead.company_name}</strong>)` : ''}</div>
        <div class="feed-time">${timeAgo(a.created_at)}</div>
      </div>
    </div>`;
  }).join('') : `<p style="color:var(--text3);font-size:0.82rem">${t('no_leads')}</p>`;

  // Value summary
  document.getElementById('valueSummary').innerHTML = `
    <div style="display:grid;gap:16px">
      <div><div style="font-size:0.75rem;color:var(--text3)">${t('pipeline_value')}</div><div style="font-size:1.4rem;font-weight:700;color:var(--primary)">€${formatNum(pipelineValue)}</div></div>
      <div><div style="font-size:0.75rem;color:var(--text3)">${t('won_value')}</div><div style="font-size:1.4rem;font-weight:700;color:var(--cerrado-ganado)">€${formatNum(wonValue)}</div></div>
      <div><div style="font-size:0.75rem;color:var(--text3)">${t('avg_deal')}</div><div style="font-size:1.4rem;font-weight:700">€${formatNum(avgDeal)}</div></div>
    </div>
  `;
}

/* ── Template Generator ── */
function generateEmailTemplate(lead, lang) {
  const calLink = settings.calendly_link || '[CALENDLY_LINK]';
  const callerName = settings.caller_name || 'Valentin';
  const companyName = settings.company_name || 'Paperjam Club';
  const today = new Date();
  const monthNames = {
    es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  };
  const month = monthNames[lang][today.getMonth()];
  const year = today.getFullYear();
  const contactFirst = (lead.contact_name || '').split(' ')[0] || lead.contact_name || '';
  const title = lead.contact_title || '';
  const industry = lead.industry || '';

  const templates = {
    es: {
      subject: `${contactFirst}, una invitación exclusiva para ${lead.company_name} — ${companyName}`,
      body: `Estimado/a ${contactFirst},

Me llamo ${callerName} y me pongo en contacto con usted en nombre de ${companyName}.

Hemos identificado a ${lead.company_name} como una empresa destacada en el sector ${industry} en Luxemburgo, y nos encantaría invitarle a formar parte de nuestra comunidad de profesionales y decisores.

${companyName} reúne a los líderes del tejido empresarial luxemburgués — es un espacio de networking de alto nivel, eventos exclusivos y oportunidades de visibilidad para empresas como la suya.

En este mes de ${month} ${year} estamos ampliando nuestra red en el sector ${industry} y creemos que ${lead.company_name} encaja perfectamente con el perfil de nuestros miembros.

¿Le gustaría que conversemos brevemente sobre las ventajas de la membresía? Le propongo reservar un slot de 15 minutos para una llamada telefónica o por Teams:

${calLink}

Me pondré en contacto personalmente con usted en la fecha y hora que le convenga.

Quedo a su disposición.

Cordialmente,
${callerName}
${companyName}
Luxembourg`
    },
    en: {
      subject: `${contactFirst}, an exclusive invitation for ${lead.company_name} — ${companyName}`,
      body: `Dear ${contactFirst},

My name is ${callerName} and I'm reaching out on behalf of ${companyName}.

We've identified ${lead.company_name} as a standout company in the ${industry} sector in Luxembourg, and I'd love to invite you to join our community of professionals and decision-makers.

${companyName} brings together leaders of Luxembourg's business landscape — offering high-level networking, exclusive events, and visibility opportunities for companies like yours.

This ${month} ${year}, we're expanding our network in the ${industry} sector and we believe ${lead.company_name} is a perfect fit for our membership.

Would you be open to a brief conversation about the benefits of joining? I'd like to suggest booking a 15-minute slot for a phone call or Teams meeting:

${calLink}

I will personally get in touch with you at the date and time that suits you best.

Looking forward to hearing from you.

Best regards,
${callerName}
${companyName}
Luxembourg`
    },
    fr: {
      subject: `${contactFirst}, une invitation exclusive pour ${lead.company_name} — ${companyName}`,
      body: `${title ? 'Cher' : 'Cher/Chère'} ${contactFirst},

Je m'appelle ${callerName} et je vous contacte au nom de ${companyName}.

Nous avons identifié ${lead.company_name} comme une entreprise remarquable dans le secteur ${industry} au Luxembourg, et je serais ravi de vous inviter à rejoindre notre communauté de professionnels et de décideurs.

${companyName} rassemble les leaders du tissu économique luxembourgeois — un espace de networking de haut niveau, d'événements exclusifs et d'opportunités de visibilité pour des entreprises comme la vôtre.

En ce mois de ${month} ${year}, nous élargissons notre réseau dans le secteur ${industry} et nous pensons que ${lead.company_name} correspond parfaitement au profil de nos membres.

Seriez-vous disponible pour un bref échange sur les avantages de l'adhésion ? Je vous propose de réserver un créneau de 15 minutes pour un appel téléphonique ou en Teams :

${calLink}

Je vous contacterai personnellement à la date et à l'heure qui vous conviennent.

Je reste à votre disposition.

Cordialement,
${callerName}
${companyName}
Luxembourg`
    }
  };
  return templates[lang] || templates.es;
}

function showTemplateModal(leadId) {
  const lead = allLeads.find(l => l.id === leadId);
  if (!lead) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay open';
  modal.id = 'templateModal';
  modal.innerHTML = `
    <div class="modal" style="width:620px">
      <h3>${t('template_title')} — ${lead.company_name}</h3>
      <div style="margin-bottom:16px">
        <label style="font-size:0.78rem;color:var(--text2);margin-bottom:6px;display:block">${t('email_lang')}</label>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm btn-secondary tmpl-lang${currentLang==='es'?' active':''}" data-tlang="es" onclick="switchTemplateLang('${leadId}','es',this)">Español</button>
          <button class="btn btn-sm btn-secondary tmpl-lang${currentLang==='en'?' active':''}" data-tlang="en" onclick="switchTemplateLang('${leadId}','en',this)">English</button>
          <button class="btn btn-sm btn-secondary tmpl-lang${currentLang==='fr'?' active':''}" data-tlang="fr" onclick="switchTemplateLang('${leadId}','fr',this)">Français</button>
        </div>
      </div>
      <div id="tmplContent"></div>
      <div class="modal-actions" style="margin-top:16px">
        <button class="btn btn-secondary" onclick="closeTemplateModal()">${t('close')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  switchTemplateLang(leadId, currentLang, modal.querySelector('.tmpl-lang.active'));
}

function switchTemplateLang(leadId, lang, btn) {
  const lead = allLeads.find(l => l.id === leadId);
  if (!lead) return;
  document.querySelectorAll('.tmpl-lang').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.tmpl-lang').forEach(b => {
    if (b.dataset.tlang === lang) b.classList.add('active');
  });
  const tmpl = generateEmailTemplate(lead, lang);
  document.getElementById('tmplContent').innerHTML = `
    <div style="margin-bottom:14px">
      <label style="font-size:0.75rem;color:var(--text3);display:block;margin-bottom:4px">Subject</label>
      <div style="background:var(--bg3);padding:10px 14px;border-radius:8px;font-size:0.85rem;position:relative" id="tmplSubject">${escHtml(tmpl.subject)}
        <button class="btn btn-sm btn-primary" style="position:absolute;right:6px;top:6px" onclick="copyText('tmplSubject')">${t('copy_subject')}</button>
      </div>
    </div>
    <div>
      <label style="font-size:0.75rem;color:var(--text3);display:block;margin-bottom:4px">Body</label>
      <pre style="background:var(--bg3);padding:14px;border-radius:8px;font-size:0.82rem;white-space:pre-wrap;font-family:inherit;color:var(--text);max-height:400px;overflow-y:auto;position:relative" id="tmplBody">${escHtml(tmpl.body)}</pre>
      <button class="btn btn-sm btn-primary" style="margin-top:8px" onclick="copyText('tmplBody')">${t('copy_body')}</button>
    </div>
  `;
}

function copyText(elId) {
  const el = document.getElementById(elId);
  const text = el.innerText || el.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = el.parentElement.querySelector('.btn-primary') || el.nextElementSibling;
    if (btn) { const orig = btn.textContent; btn.textContent = t('copied'); setTimeout(() => btn.textContent = orig, 1500); }
  });
}

function closeTemplateModal() {
  const m = document.getElementById('templateModal');
  if (m) m.remove();
}

/* ── Settings Modal ── */
function showSettings() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay open';
  modal.id = 'settingsModal';
  modal.innerHTML = `
    <div class="modal" style="width:460px">
      <h3>${t('settings')}</h3>
      <div class="field">
        <label>${t('calendly_link')}</label>
        <input type="text" id="setCalendly" value="${escHtml(settings.calendly_link || '')}" placeholder="https://calendly.com/...">
      </div>
      <div class="field">
        <label>${t('caller_name')}</label>
        <input type="text" id="setCallerName" value="${escHtml(settings.caller_name || 'Valentin')}">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeSettingsModal()">${t('cancel')}</button>
        <button class="btn btn-primary" onclick="saveSettings()">${t('save_settings')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function saveSettings() {
  const calLink = document.getElementById('setCalendly').value.trim();
  const callerName = document.getElementById('setCallerName').value.trim();
  await Promise.all([
    sb.from('leadpj_settings').upsert({ key: 'calendly_link', value: calLink, updated_at: new Date().toISOString() }),
    sb.from('leadpj_settings').upsert({ key: 'caller_name', value: callerName, updated_at: new Date().toISOString() })
  ]);
  settings.calendly_link = calLink;
  settings.caller_name = callerName;
  closeSettingsModal();
}

function closeSettingsModal() {
  const m = document.getElementById('settingsModal');
  if (m) m.remove();
}

/* ── Quality Guide Modal ── */
function showQualityGuide() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay open';
  modal.id = 'qualityGuideModal';
  modal.innerHTML = `
    <div class="modal" style="width:520px">
      <h3>${t('quality_guide')}</h3>
      <div style="display:grid;gap:8px;margin-top:12px">
        ${[10,9,8,7,6,5,4,3,2,1].map(n => `
          <div style="display:flex;gap:10px;align-items:start;padding:8px;background:var(--bg3);border-radius:8px">
            <div style="width:32px;height:32px;border-radius:50%;background:${qualityColor(n)};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;color:#fff">${n}</div>
            <div style="font-size:0.8rem;color:var(--text2)">${t('q' + n)}</div>
          </div>
        `).join('')}
      </div>
      <div class="modal-actions" style="margin-top:16px">
        <button class="btn btn-secondary" onclick="document.getElementById('qualityGuideModal').remove()">${t('close')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function qualityColor(score) {
  if (score >= 9) return 'var(--cerrado-ganado)';
  if (score >= 7) return '#22c55e';
  if (score >= 5) return 'var(--contactado)';
  if (score >= 3) return 'var(--cerrado-perdido)';
  return '#6b7280';
}

/* ── Helpers ── */
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function formatNum(n) { return Number(n).toLocaleString('de-DE'); }

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  return Math.floor(diff / 86400) + 'd';
}

function getUserName(id) {
  const u = allUsers.find(u => u.id === id);
  return u ? u.display_name : '—';
}

function statusPill(status) {
  return `<span class="pill pill-${status}">${t('status_' + status)}</span>`;
}

function qualityBadge(score) {
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:${qualityColor(score)};color:#fff;font-size:0.7rem;font-weight:700">${score}</span>`;
}

/* ── Init ── */
setLang(currentLang);
checkSession();
