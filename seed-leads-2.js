const SUPABASE_URL = "https://lkikndmaiwkrkgkxkvnl.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraWtuZG1haXdrcmtna3hrdm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTg2ODYsImV4cCI6MjA5MDQ3NDY4Nn0.0CimGbZ_qJQLA3LTOPMiFmqmpeCVt6EmOYhHCAl-uy4";
const TABLE = "leadpj_leads";
const BATCH_SIZE = 50;
const TOTAL = 700;

// Seeded pseudo-random number generator (different seed from seed-leads.js)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(98765);
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }

// --- Data pools ---

const firstNames = [
  // French
  "Marc","Laurent","Pierre","Sophie","Jean","Claude","Nathalie","Thomas","Sandra","Olivier",
  "Isabelle","Patrick","Marie","Philippe","Catherine","Nicolas","Christine","Romain","Julie","Gilles",
  "Caroline","Alain","Francoise","Eric","Dominique","Robert","Helene","Alexandre","Emilie","Arnaud",
  "Celine","Benoit","Audrey","Christophe","Delphine","Fabrice","Florence","Gauthier","Geraldine","Henri",
  "Laetitia","Jacques","Manon","Leo","Pauline","Mathieu","Rachel","Nathan","Sarah","Quentin",
  "Valerie","Raphael","Stephane","Aline","Thierry","Brigitte","Victor","Camille","Xavier","Yannick",
  // German
  "Klaus","Hans","Wolfgang","Dieter","Jurgen","Horst","Manfred","Karl","Franz","Stefan",
  "Andrea","Monika","Ursula","Petra","Sabine","Renate","Ingrid","Karin","Elke","Heike",
  // Portuguese
  "Fernando","Ana","Carlos","Antonio","Maria","Ricardo","Teresa","Luis","Rosa","Hugo",
  "Ines","Joao","Marta","Pedro","Beatriz","Sergio","Miguel","Clara","Tiago","Filipa",
  "Rui","Catarina","Bruno","Diana","Nuno","Raquel","Vasco","Rita","Duarte","Leonor",
  // Italian
  "Paolo","Lucia","Giorgio","Elena","Marco","Valentina","Giuseppe","Chiara","Andrea","Francesca",
  "Luca","Giulia","Matteo","Alessia","Federico","Silvia","Roberto","Laura","Davide","Martina",
];

const lastNames = [
  // Luxembourgish/German
  "Muller","Weber","Schmit","Hoffmann","Klein","Schneider","Wagner","Becker","Braun","Reuter",
  "Meyer","Schroeder","Kremer","Weiss","Peters","Thill","Scholtes","Reding","Schmitz","Hein",
  "Engel","Franck","Stein","Hansen","Fischer","Koch","Wolf","Vogel","Theis","Kayser",
  "Molitor","Welter","Faber","Pauly","Metz","Lorang","Krier","Goergen","Hermes","Flammang",
  "Weis","Dostert","Lentz","Majerus","Huberty","Clesen","Pletschette","Kieffer","Oberweis","Thinnes",
  // French
  "Dupont","Lefevre","Bernard","Lambert","Dumont","Renard","Collin","Masson","Gerard","Laurent",
  "Moreau","Fournier","Girard","Bonnet","Mercier","Rousseau","Clement","Gauthier","Roux","Blanc",
  // Portuguese
  "Pinto","Ferreira","Da Silva","Pereira","Rodrigues","Oliveira","Costa","Santos","Almeida","Martins",
  "Gomes","Lopes","Sousa","Mendes","Ribeiro","Carvalho","Nunes","Fernandes","Monteiro","Vieira",
  // Italian
  "Rossi","Bianchi","Romano","Colombo","De Luca","Conti","Esposito","Ricci","Marino","Moretti",
];

const industries = [
  "Accounting / Fiduciaire / Audit",
  "Legal / Law firms",
  "Architecture / Interior Design",
  "Technology / IT / Software",
  "Finance / Investment / Private Equity / Fund Management",
  "Consulting / Strategy / Management",
  "Real Estate / Property",
  "Insurance",
  "Marketing / Communication / PR",
  "HR / Recruitment",
  "Logistics / Transport",
  "Solopreneurs / Freelance professionals",
];

const titles = [
  "CEO","Founder","Managing Director","Owner","Partner","Gerant",
  "Directeur General","Co-Founder","Associe","Director","Head of Operations",
  "General Manager","Administrator","Responsable","Chef d'entreprise",
];

const cities = [
  "Luxembourg City","Luxembourg City","Luxembourg City","Luxembourg City","Luxembourg City",
  "Luxembourg City","Luxembourg City","Luxembourg City","Luxembourg City","Luxembourg City",
  "Esch-sur-Alzette","Esch-sur-Alzette","Esch-sur-Alzette","Esch-sur-Alzette",
  "Differdange","Differdange","Dudelange","Dudelange",
  "Ettelbruck","Ettelbruck","Diekirch","Diekirch",
  "Strassen","Strassen","Strassen","Bertrange","Bertrange","Bertrange",
  "Mamer","Mamer","Hesperange","Hesperange","Sandweiler","Niederanven",
  "Walferdange","Mondorf-les-Bains","Clervaux","Vianden","Redange","Capellen",
  "Steinfort","Bascharage","Petange","Schifflange","Bettembourg","Kayl","Rumelange",
  "Wiltz","Echternach","Remich","Grevenmacher","Mersch",
];

const sources = [
  "linkedin","linkedin","linkedin","linkedin","linkedin","linkedin","linkedin","linkedin",
  "website","website","website","website",
  "referral","referral","referral","referral","referral",
  "cold_outreach","cold_outreach","cold_outreach",
  "paperjam_event","paperjam_event","paperjam_event",
  "bce_registry","bce_registry","bce_registry","bce_registry",
  "networking","networking","networking",
];

const employeesDistribution = [
  "1-5","1-5","1-5","1-5",
  "6-20","6-20","6-20",
  "21-50","21-50",
  "51-100",
];

// Quality score distribution: more 4-7, fewer 9-10
const qualityWeights = [
  { min: 1, max: 2, weight: 5 },
  { min: 3, max: 4, weight: 15 },
  { min: 5, max: 6, weight: 30 },
  { min: 7, max: 8, weight: 35 },
  { min: 9, max: 10, weight: 15 },
];

function pickQualityScore() {
  const r = rand() * 100;
  let cum = 0;
  for (const tier of qualityWeights) {
    cum += tier.weight;
    if (r < cum) return randInt(tier.min, tier.max);
  }
  return 6;
}

// Legal entity suffixes
const suffixes = ["SARL","S.A.","S.a r.l.","GmbH",""];

// Company name generators per industry
function generateCompanyName(industry, firstName, lastName) {
  const ln = lastName.replace(/ /g, "");
  const fn = firstName;
  const suffix = pick(suffixes);
  const maybeSuffix = suffix ? ` ${suffix}` : "";

  switch (industry) {
    case "Accounting / Fiduciaire / Audit":
      return pick([
        `Fiduciaire ${lastName}${maybeSuffix}`,
        `${lastName} & Partners Audit`,
        `Cabinet Comptable ${lastName}`,
        `${fn} ${lastName} Revision${maybeSuffix}`,
        `${lastName} Expertise Comptable`,
        `Bureau Comptable ${lastName}`,
        `${lastName} Audit & Conseil${maybeSuffix}`,
        `Fiduciaire du ${pick(["Centre","Sud","Nord","Plateau"])}`,
      ]);
    case "Legal / Law firms":
      return pick([
        `${lastName} & Associes Avocats`,
        `Etude ${lastName}`,
        `Cabinet d'Avocats ${lastName}`,
        `${lastName} Legal${maybeSuffix}`,
        `${fn} ${lastName} Avocats`,
        `${lastName} & Partners Law`,
        `Etude Notariale ${lastName}`,
        `${lastName} Jurisconseil`,
      ]);
    case "Architecture / Interior Design":
      return pick([
        `${lastName} Architectes${maybeSuffix}`,
        `Atelier ${lastName}`,
        `Bureau d'Architecture ${lastName}`,
        `${fn} ${lastName} Design`,
        `Studio ${lastName}`,
        `${ln} Architects`,
        `Atelier d'Architecture ${lastName}${maybeSuffix}`,
        `${lastName} & Partners Architectes`,
      ]);
    case "Technology / IT / Software":
      return pick([
        `${ln} Technologies${maybeSuffix}`,
        `${ln} Digital`,
        `${ln}Tech${maybeSuffix}`,
        `${ln} Solutions`,
        `${ln} Software`,
        `${ln} IT Services${maybeSuffix}`,
        `${fn}${ln} Labs`,
        `${ln} Systems${maybeSuffix}`,
      ]);
    case "Finance / Investment / Private Equity / Fund Management":
      return pick([
        `${lastName} Capital${maybeSuffix}`,
        `${ln} Investments S.A.`,
        `${lastName} Fund Management`,
        `${ln} Private Equity`,
        `${lastName} Asset Management${maybeSuffix}`,
        `${ln} Finance S.A.`,
        `${lastName} Wealth Partners`,
        `${ln} Advisory Capital`,
      ]);
    case "Consulting / Strategy / Management":
      return pick([
        `${lastName} Consulting${maybeSuffix}`,
        `${lastName} Advisory`,
        `${ln} Strategy Group`,
        `${fn} ${lastName} Conseil`,
        `${lastName} Management Consulting`,
        `Bureau ${lastName} Consulting`,
        `${ln} & Partners Conseil${maybeSuffix}`,
        `${ln} Consult`,
      ]);
    case "Real Estate / Property":
      return pick([
        `${lastName} Immobilier${maybeSuffix}`,
        `${ln} Real Estate`,
        `Agence Immobiliere ${lastName}`,
        `${ln} Property Group${maybeSuffix}`,
        `${lastName} Immo`,
        `${fn} ${lastName} Immobilier`,
        `${ln} Realty S.A.`,
        `Cabinet Immobilier ${lastName}`,
      ]);
    case "Insurance":
      return pick([
        `${lastName} Assurances${maybeSuffix}`,
        `${ln} Insurance`,
        `Cabinet ${lastName} Assurances`,
        `${lastName} & Partners Insurance`,
        `${ln} Courtage d'Assurances`,
        `Assurances ${fn} ${lastName}`,
        `${ln} Risk Solutions${maybeSuffix}`,
        `Bureau d'Assurances ${lastName}`,
      ]);
    case "Marketing / Communication / PR":
      return pick([
        `${ln} Communication${maybeSuffix}`,
        `${ln} Agency`,
        `${fn}${ln} Creative`,
        `${ln} PR`,
        `Studio ${lastName}`,
        `${ln} Media${maybeSuffix}`,
        `${lastName} Marketing`,
        `${ln} Brand Agency`,
      ]);
    case "HR / Recruitment":
      return pick([
        `${lastName} Recruitment${maybeSuffix}`,
        `${ln} HR Solutions`,
        `${lastName} Staffing`,
        `${ln} Talent`,
        `${lastName} People`,
        `${ln} HR Consulting${maybeSuffix}`,
        `${fn} ${lastName} Recrutement`,
        `${ln} Executive Search`,
      ]);
    case "Logistics / Transport":
      return pick([
        `${ln} Logistics${maybeSuffix}`,
        `${lastName} Transport`,
        `${ln} Express`,
        `${lastName} Shipping`,
        `${ln} Supply Chain${maybeSuffix}`,
        `${lastName} Freight`,
        `${fn} ${lastName} Transport`,
        `${ln} Logistics Solutions`,
      ]);
    case "Solopreneurs / Freelance professionals":
      return pick([
        `${fn} ${lastName} Consulting`,
        `${fn} ${lastName}`,
        `${ln} Freelance`,
        `${fn} ${lastName} Services`,
        `${lastName} Independent`,
        `${fn} ${lastName} Pro`,
        `Studio ${fn} ${lastName}`,
        `${fn} ${lastName} Conseil`,
      ]);
    default:
      return `${lastName} Services${maybeSuffix}`;
  }
}

function sanitizeDomain(name) {
  return name
    .toLowerCase()
    .replace(/[eèéê]/g, "e")
    .replace(/[aàâ]/g, "a")
    .replace(/[uùû]/g, "u")
    .replace(/[oôö]/g, "o")
    .replace(/[iïî]/g, "i")
    .replace(/[ç]/g, "c")
    .replace(/[ &'\/\-().]+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function generateLead(index) {
  const firstName = pick(firstNames);
  const lastName = pick(lastNames);
  const industry = pick(industries);
  const companyName = generateCompanyName(industry, firstName, lastName);
  const domain = sanitizeDomain(companyName);
  const contactTitle = pick(titles);
  const city = pick(cities);
  const source = pick(sources);
  const employees = pick(employeesDistribution);
  const qualityScore = pickQualityScore();

  // Email: 80% personal, 20% generic
  const fnClean = firstName.toLowerCase().replace(/[eèéê]/g, "e").replace(/[aàâ]/g, "a").replace(/[uùû]/g, "u").replace(/[ç]/g, "c");
  const lnClean = lastName.toLowerCase().replace(/[eèéê]/g, "e").replace(/[aàâ]/g, "a").replace(/[ ]/g, "").replace(/[ç]/g, "c");
  let contactEmail;
  const emailRoll = rand();
  if (emailRoll < 0.4) {
    contactEmail = `${fnClean}@${domain}.lu`;
  } else if (emailRoll < 0.8) {
    contactEmail = `${fnClean}.${lnClean}@${domain}.lu`;
  } else {
    contactEmail = `info@${domain}.lu`;
  }

  // Phone: 80% mobile, 20% landline
  const isMobile = rand() < 0.8;
  let contactPhone;
  let phoneType;
  if (isMobile) {
    const prefix = pick(["621","661","691"]);
    contactPhone = `+352 ${prefix} ${String(randInt(100,999)).padStart(3,"0")} ${String(randInt(100,999)).padStart(3,"0")}`;
    phoneType = "mobile";
  } else {
    const prefix = pick(["26","27","24","25"]);
    contactPhone = `+352 ${prefix} ${String(randInt(10,99))} ${String(randInt(10,99))} ${String(randInt(10,99))}`;
    phoneType = "landline";
  }

  // Website
  const website = rand() < 0.5 ? `https://www.${domain}.lu` : `https://${domain}.lu`;

  // Value: random 500-15000
  const value = randInt(500, 15000);

  return {
    company_name: companyName,
    contact_name: `${firstName} ${lastName}`,
    contact_title: contactTitle,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    phone_type: phoneType,
    website: website,
    city: city,
    source: source,
    industry: industry,
    employees: employees,
    status: "nuevo",
    value: value,
    quality_score: qualityScore,
    is_member: false,
    is_contacted: false,
    has_responded: false,
    call_scheduled: false,
    became_member: false,
    assigned_to: null,
  };
}

async function insertBatch(leads, batchNum, totalBatches) {
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(leads),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Batch ${batchNum}/${totalBatches} failed (${res.status}): ${text}`);
  }
  console.log(`Batch ${batchNum}/${totalBatches} inserted (${leads.length} leads)`);
}

async function main() {
  console.log(`Generating ${TOTAL} leads...`);
  const allLeads = [];
  for (let i = 0; i < TOTAL; i++) {
    allLeads.push(generateLead(i));
  }
  console.log(`Generated ${allLeads.length} leads. Starting insertion...`);

  const totalBatches = Math.ceil(allLeads.length / BATCH_SIZE);
  let inserted = 0;

  for (let b = 0; b < totalBatches; b++) {
    const batch = allLeads.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    await insertBatch(batch, b + 1, totalBatches);
    inserted += batch.length;
  }

  console.log(`\nDone! Inserted ${inserted} leads into ${TABLE}.`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
