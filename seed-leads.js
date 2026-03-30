const SUPABASE_URL = "https://lkikndmaiwkrkgkxkvnl.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraWtuZG1haXdrcmtna3hrdm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTg2ODYsImV4cCI6MjA5MDQ3NDY4Nn0.0CimGbZ_qJQLA3LTOPMiFmqmpeCVt6EmOYhHCAl-uy4";
const TABLE = "leadpj_leads";
const BATCH_SIZE = 50;
const TOTAL = 750;

const USER_IDS = [
  "f1c840b1-f66b-4645-94ee-186140b7f615", // Valentin
  "9ac537b0-33a6-4dc2-bed7-d63fe47649b1", // Ivan
];

// Seeded pseudo-random number generator for deterministic output
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }

// --- Data pools ---

const firstNames = [
  "Marc","Laurent","Pierre","Sophie","Jean","Claude","Nathalie","Thomas","Sandra","Fernando",
  "Ana","Carlos","Olivier","Isabelle","Patrick","Marie","Philippe","Catherine","Nicolas","Christine",
  "David","Carole","Luc","Anne","Michel","Monique","Yves","Martine","Daniel","Sylvie",
  "Romain","Julie","Gilles","Caroline","Alain","Francoise","Eric","Dominique","Robert","Helene",
  "Antonio","Maria","Paolo","Lucia","Giorgio","Elena","Ricardo","Teresa","Luis","Rosa",
  "Hugo","Ines","Joao","Marta","Pedro","Beatriz","Sergio","Valentina","Miguel","Clara",
  "Alexandre","Emilie","Arnaud","Celine","Benoit","Audrey","Christophe","Delphine","Fabrice","Florence",
  "Gauthier","Geraldine","Henri","Laetitia","Jacques","Manon","Kevin","Morgane","Leo","Pauline",
  "Mathieu","Rachel","Nathan","Sarah","Oscar","Tania","Quentin","Valerie","Raphael","Wendy",
  "Stephane","Aline","Thierry","Brigitte","Victor","Camille","Xavier","Diana","Yannick","Emma",
];

const lastNames = [
  "Muller","Weber","Schmit","Hoffmann","Klein","Schneider","Wagner","Becker","Braun","Reuter",
  "Meyer","Schroeder","Kremer","Weiss","Peters","Simon","Thill","Scholtes","Reding","Pinto",
  "Ferreira","Da Silva","Pereira","Rodrigues","Oliveira","Costa","Santos","Almeida","Martins","Gomes",
  "Dupont","Lefevre","Bernard","Lambert","Dumont","Renard","Collin","Masson","Gerard","Laurent",
  "Rossi","Bianchi","Romano","Colombo","De Luca","Conti","Esposito","Ricci","Marino","Moretti",
  "Schmitz","Hein","Engel","Franck","Stein","Hansen","Fischer","Koch","Wolf","Vogel",
  "Lopes","Sousa","Mendes","Ribeiro","Carvalho","Nunes","Fernandes","Gonçalves","Monteiro","Vieira",
  "Theis","Kayser","Molitor","Welter","Faber","Pauly","Metz","Lorang","Krier","Goergen",
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
  "Import/Export / International Trade",
  "E-commerce / Digital",
  "Coworking / Business Services",
  "Events / Hospitality",
  "Training / Education / Coaching",
  "Environmental / Sustainability consulting",
  "Solopreneurs / Freelance professionals",
];

const titles = ["CEO","Founder","Managing Director","Owner","Partner","Gérant","Directeur Général","Co-Founder"];

const cityDistribution = [
  ...Array(50).fill("Luxembourg City"),
  ...Array(10).fill("Esch-sur-Alzette"),
  ...Array(10).fill("Kirchberg"),
  ...Array(5).fill("Strassen"),
  ...Array(5).fill("Bertrange"),
  ...Array(3).fill("Leudelange"),
  ...Array(3).fill("Munsbach"),
  ...Array(3).fill("Capellen"),
  ...Array(3).fill("Hesperange"),
  ...Array(2).fill("Senningerberg"),
  "Remich","Echternach","Diekirch","Ettelbruck","Mersch","Grevenmacher",
];

const sourceDistribution = [
  ...Array(40).fill("linkedin"),
  ...Array(25).fill("manual"),
  ...Array(15).fill("referral"),
  ...Array(10).fill("website"),
  ...Array(10).fill("event"),
];

const employeesDistribution = [
  ...Array(40).fill("1-5"),
  ...Array(30).fill("6-20"),
  ...Array(20).fill("21-50"),
  ...Array(10).fill("51-100"),
];

const qualityDistribution = [
  ...Array(15).fill("high"),   // 9-10
  ...Array(35).fill("good"),   // 7-8
  ...Array(35).fill("medium"), // 5-6
  ...Array(15).fill("low"),    // 3-4
];

// Company name generators per industry
function generateCompanyName(industry, firstName, lastName) {
  const ln = lastName.replace(/ /g, "");
  const fn = firstName;
  switch (industry) {
    case "Accounting / Fiduciaire / Audit":
      return pick([
        `Fiduciaire ${lastName}`,`${lastName} & Partners Audit`,`${lastName} Fiduciaire`,
        `${fn} ${lastName} Révision`,`Cabinet ${lastName}`,`${lastName} Audit & Conseil`,
        `Fiduciaire ${fn} ${lastName}`,`${lastName} Expertise Comptable`,
      ]);
    case "Legal / Law firms":
      return pick([
        `${lastName} & Associés Avocats`,`Etude ${lastName}`,`${lastName} Law`,
        `Cabinet d'Avocats ${lastName}`,`${lastName} Legal`,`${fn} ${lastName} Avocats`,
        `${lastName} & Partners Law`,`Etude Notariale ${lastName}`,
      ]);
    case "Architecture / Interior Design":
      return pick([
        `${lastName} Architectes`,`Atelier ${lastName}`,`${fn} ${lastName} Design`,
        `${lastName} Architecture`,`Studio ${lastName}`,`${lastName} Interior Design`,
        `${ln} Architects`,`Atelier d'Architecture ${lastName}`,
      ]);
    case "Technology / IT / Software":
      return pick([
        `${ln} Technologies`,`${ln} Digital`,`${ln}Tech`,`${ln} Solutions`,
        `${ln} Software`,`${ln} IT Services`,`${fn}${ln} Labs`,`${ln} Systems`,
      ]);
    case "Finance / Investment / Private Equity / Fund Management":
      return pick([
        `${lastName} Capital`,`${ln} Investments`,`${lastName} Fund Management`,
        `${ln} Private Equity`,`${lastName} Asset Management`,`${ln} Finance`,
        `${lastName} Wealth Partners`,`${ln} Advisory Capital`,
      ]);
    case "Consulting / Strategy / Management":
      return pick([
        `${lastName} Consulting`,`${lastName} Advisory`,`${ln} Strategy`,
        `${fn} ${lastName} Conseil`,`${lastName} Management Consulting`,
        `${ln} & Partners Consulting`,`${lastName} Strategy Group`,`${ln} Consult`,
      ]);
    case "Real Estate / Property":
      return pick([
        `${lastName} Immobilier`,`${ln} Real Estate`,`${lastName} Properties`,
        `Agence ${lastName}`,`${ln} Property Group`,`${lastName} Immo`,
        `${fn} ${lastName} Immobilier`,`${ln} Realty`,
      ]);
    case "Insurance":
      return pick([
        `${lastName} Assurances`,`${ln} Insurance`,`Cabinet ${lastName} Assurances`,
        `${lastName} & Partners Insurance`,`${ln} Courtage`,`Assurances ${fn} ${lastName}`,
        `${ln} Risk Solutions`,`${lastName} Broker`,
      ]);
    case "Marketing / Communication / PR":
      return pick([
        `${ln} Communication`,`${ln} Agency`,`${fn}${ln} Creative`,
        `${ln} PR`,`Studio ${lastName}`,`${ln} Media`,
        `${lastName} Marketing`,`${ln} Brand Agency`,
      ]);
    case "HR / Recruitment":
      return pick([
        `${lastName} Recruitment`,`${ln} HR Solutions`,`${lastName} Staffing`,
        `${ln} Talent`,`${lastName} People`,`${ln} HR Consulting`,
        `${fn} ${lastName} Recrutement`,`${ln} Executive Search`,
      ]);
    case "Logistics / Transport":
      return pick([
        `${ln} Logistics`,`${lastName} Transport`,`${ln} Express`,
        `${lastName} Shipping`,`${ln} Supply Chain`,`${lastName} Freight`,
        `${fn} ${lastName} Transport`,`${ln} Logistics Solutions`,
      ]);
    case "Import/Export / International Trade":
      return pick([
        `${ln} Trading`,`${lastName} Import-Export`,`${ln} International`,
        `${lastName} Global Trade`,`${ln} Commerce`,`${fn} ${lastName} Trading`,
        `${ln} Trade Solutions`,`${lastName} Worldwide`,
      ]);
    case "E-commerce / Digital":
      return pick([
        `${ln} Digital`,`${ln} E-Commerce`,`${fn}${ln} Online`,
        `${ln} Shop`,`${ln} Marketplace`,`${lastName} Digital Commerce`,
        `${ln} Web`,`${ln} Click`,
      ]);
    case "Coworking / Business Services":
      return pick([
        `${ln} Business Center`,`${lastName} Coworking`,`${ln} Hub`,
        `${lastName} Office Solutions`,`${ln} Workspace`,`The ${lastName} Hub`,
        `${ln} Business Services`,`${lastName} Flex Office`,
      ]);
    case "Events / Hospitality":
      return pick([
        `${ln} Events`,`${lastName} Hospitality`,`${ln} Catering`,
        `${lastName} Event Management`,`${ln} Traiteur`,`${fn} ${lastName} Events`,
        `${ln} Receptions`,`${lastName} Gastronomie`,
      ]);
    case "Training / Education / Coaching":
      return pick([
        `${lastName} Coaching`,`${ln} Training`,`${lastName} Academy`,
        `${fn} ${lastName} Formation`,`${ln} Learning`,`Institut ${lastName}`,
        `${ln} Education`,`${lastName} Development`,
      ]);
    case "Environmental / Sustainability consulting":
      return pick([
        `${ln} Green`,`${lastName} Sustainability`,`${ln} Environnement`,
        `${lastName} Eco Consulting`,`${ln} Climate Solutions`,`Green ${lastName}`,
        `${ln} Energy`,`${lastName} Environmental`,
      ]);
    case "Solopreneurs / Freelance professionals":
      return pick([
        `${fn} ${lastName} Consulting`,`${fn} ${lastName}`,`${ln} Freelance`,
        `${fn} ${lastName} Services`,`${lastName} Independent`,`${fn} ${lastName} Pro`,
        `Studio ${fn} ${lastName}`,`${fn} ${lastName} Conseil`,
      ]);
    default:
      return `${lastName} Services`;
  }
}

function sanitizeDomain(name) {
  return name
    .toLowerCase()
    .replace(/[éèê]/g, "e")
    .replace(/[àâ]/g, "a")
    .replace(/[ùû]/g, "u")
    .replace(/[ôö]/g, "o")
    .replace(/[ïî]/g, "i")
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
  const city = pick(cityDistribution);
  const source = pick(sourceDistribution);
  const employees = pick(employeesDistribution);
  const qualityTier = pick(qualityDistribution);

  // Email: 80% personal, 20% generic
  const fnClean = firstName.toLowerCase().replace(/[éèê]/g, "e").replace(/[àâ]/g, "a").replace(/[ùû]/g, "u").replace(/[ç]/g, "c");
  const lnClean = lastName.toLowerCase().replace(/[éèê]/g, "e").replace(/[àâ]/g, "a").replace(/[ ]/g, "").replace(/[ç]/g, "c");
  let contactEmail;
  const emailRoll = rand();
  if (emailRoll < 0.4) {
    contactEmail = `${fnClean}@${domain}.lu`;
  } else if (emailRoll < 0.8) {
    contactEmail = `${fnClean}.${lnClean}@${domain}.lu`;
  } else {
    contactEmail = `info@${domain}.lu`;
  }

  // Phone
  const isMobile = rand() < 0.8;
  let contactPhone;
  let phoneType;
  if (isMobile) {
    const prefix = pick(["621","661","691"]);
    contactPhone = `+352 ${prefix} ${String(randInt(100,999)).padStart(3,"0")} ${String(randInt(100,999)).padStart(3,"0")}`;
    phoneType = "mobile";
  } else {
    const prefix = pick(["26","27"]);
    contactPhone = `+352 ${prefix} ${String(randInt(10,99))} ${String(randInt(10,99))} ${String(randInt(10,99))}`;
    phoneType = "landline";
  }

  // Website
  const website = rand() < 0.5 ? `https://www.${domain}.lu` : `https://${domain}.lu`;

  // Quality score
  let qualityScore;
  switch (qualityTier) {
    case "high": qualityScore = randInt(9, 10); break;
    case "good": qualityScore = randInt(7, 8); break;
    case "medium": qualityScore = randInt(5, 6); break;
    case "low": qualityScore = randInt(3, 4); break;
  }

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
    value: 0,
    quality_score: qualityScore,
    is_member: false,
    is_contacted: false,
    has_responded: false,
    call_scheduled: false,
    became_member: false,
    assigned_to: USER_IDS[index % 2],
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
