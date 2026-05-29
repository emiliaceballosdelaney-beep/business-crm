import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qjotzepgeaibulbvtbjs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb3R6ZXBnZWFpYnVsYnZ0YmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTMyNTAsImV4cCI6MjA5MjE4OTI1MH0.OxVlrIDj6RBqi7wVOhBtWm6XmlvurKmZXP0rxACCcuY'
const PROSPER_STARTUP_ID = '37bba3f8-b055-4312-8137-6850f63c64b4'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const csv = [
  { first: 'Drew',      last: 'Nelson',           email: 'drewgarrett@me.com' },
  { first: 'Lucas',     last: 'Riney',             email: 'lucas.riney@gmail.com' },
  { first: 'Ty',        last: 'Wilkinson',         email: 'wilkinson513@yahoo.com' },
  { first: 'Jennifer',  last: 'Delg',              email: 'jennifer.m.delg@gmail.com' },
  { first: 'Jesse',     last: 'Jaggers',           email: 'jessehomeindex@gmail.com' },
  { first: 'Reese',     last: 'Mecchi',            email: 'reesemecchi@gmail.com' },
  { first: 'Barbara',   last: 'McDonald',          email: 'babs@studioy.org' },
  { first: 'Gilian',    last: 'Meyers',            email: 'gilianmeyers@gmail.com' },
  { first: 'Shiva',     last: 'Howell',            email: 'shivahowell@gmail.com' },
  { first: 'Michael',   last: 'Bello',             email: 'mbello929@gmail.com' },
  { first: 'Stella',    last: 'Stavro',            email: 'stella.rae.stavro@gmail.com' },
  { first: 'Erin',      last: 'Delaney',           email: 'erinliberated@gmail.com' },
  { first: 'Penelope',  last: 'Templeton',         email: 'templetonpenelope@gmail.com' },
  { first: 'Francesca', last: 'Stavro',            email: 'francescastavro@gmail.com' },
  { first: 'Nikki',     last: 'Nahai',             email: 'nikkirachelnahai@gmail.com' },
  { first: 'Carli',     last: 'Bershon',           email: 'cmbershon@gmail.com' },
  { first: 'Lucas',     last: 'Gelfen',            email: 'lgelfen@gmail.com' },
  { first: 'David',     last: 'Templeton',         email: 'davidmtempleton@yahoo.com' },
  { first: 'Joe',       last: 'Rumi',              email: 'rumijoe@gmail.com' },
  { first: 'Dionsio',   last: 'Ceballos',          email: 'studiosdiopro@gmail.com' },
  { first: 'Morgan',    last: 'Drmaj',             email: 'morgan@morgandrmaj.com' },
  { first: 'Ari',       last: 'Adduci',            email: 'ariredeagle@sbcglobal.net' },
  { first: 'Bodhi',     last: 'Sabol',             email: 'bodhisabol@gmail.com' },
  { first: 'Bobby',     last: 'Carol',             email: 'livinginyourelement@gmail.com' },
  { first: 'Shannon',   last: 'Helland',           email: 'sss.helland@gmail.com' },
  { first: 'Inanna',    last: 'Delaney',           email: 'inanna@inannadelaney.com' },
  { first: 'Anna',      last: 'Menges',            email: 'anna.menges@yahoo.com' },
  { first: 'Victoria',  last: 'Esterle',           email: 'v.b.jackson12@gmail.com' },
  { first: 'Daniel',    last: 'Riddlesmith',       email: 'coolbreeze57d@gmail.com' },
  { first: 'Sierra',    last: 'Sullivan',          email: 'sierra@lifestylized.com' },
  { first: 'Starr',     last: 'Sheppard-Decker',   email: 'mestarr@mestarr.com' },
  { first: 'Robert',    last: 'Wong',              email: 'rwong64@hotmail.com' },
  { first: 'Pat',       last: 'Wathen',            email: 'tap44@iglou.com' },
  { first: 'Kristina',  last: 'Bennett',           email: 'kristinabridget@hotmail.com' },
  { first: 'Kera',      last: 'DuPree',            email: 'keraschulze1@gmail.com' },
  { first: 'Melissa',   last: 'Semcer',            email: 'msemcer@gmail.com' },
  { first: 'Rachel',    last: 'Gallaway',          email: 'luckychloeg@gmail.com' },
  { first: 'Elena',     last: 'Ceballos',          email: 'cene00@yahoo.com.mx' },
  { first: 'Donna',     last: 'Woods',             email: 'donnawoods8@yahoo.com' },
  { first: 'Jennifer',  last: 'Tawil',             email: 'jennifer@leanonmewestchesterdoula.com' },
  { first: 'Reese',     last: 'Tindall',           email: 'reesetindall66@icloud.com' },
  { first: 'Sean',      last: 'Stewart',           email: 'info@rockyourgift.com' },
  { first: 'Casey',     last: 'Lundberg',          email: 'caseylundberg21@gmail.com' },
  { first: 'Ari',       last: 'Pine',              email: 'ariypine@gmail.com' },
  { first: 'Justin',    last: 'Ayers',             email: 'justinlayers@gmail.com' },
  { first: 'Ethan',     last: 'Telles',            email: 'ethan.telles@me.com' },
  { first: 'Cole',      last: 'Sanguinetti',       email: 'csanguinetti3@yahoo.com' },
  { first: 'Drew',      last: 'Kiesow',            email: 'kiesowdrew@gmail.com' },
  { first: 'Lisa',      last: 'Robins',            email: 'robinslisa@gmail.com' },
  { first: 'Lucia',     last: 'Sciarpa',           email: 'lusciousluciapavone@gmail.com' },
  { first: 'Debbie',    last: 'King',              email: 'travel909@yahoo.com' },
  { first: 'Jacob',     last: 'Kerkhoff',          email: 'jacobk322@me.com' },
  { first: 'Jessica',   last: 'Zubric',            email: 'jzubric@gmail.com' },
  { first: 'Sedona',    last: 'Delaney',           email: 'sedonamarie@hotmail.com' },
  { first: 'Devin',     last: 'Spurgeon',          email: 'josephdevin9@gmail.com' },
  { first: 'Jonah',     last: 'Koppelman',         email: 'jonahkoppelman@gmail.com' },
  { first: 'Al',        last: 'Simpkins',          email: 'alsimpkins2@gmail.com' },
  { first: 'Callan',    last: 'Rush',              email: 'callanrush@gmail.com' },
  { first: 'Jo',        last: '',                  email: 'yellowfireflyllc@gmail.com' },
  { first: 'Jackson',   last: 'Bouchard',          email: 'jacksonross1128@gmail.com' },
  { first: 'Lori',      last: 'Elizabeth',         email: 'lorieopal@gmail.com' },
  { first: 'Diego',     last: 'Melazzi',           email: 'dmelazzi@gmail.com' },
  { first: 'Mary',      last: 'Anne',              email: 'toninimat@yahoo.com' },
  { first: 'Zoe',       last: '',                  email: 'digitalzee@gmail.com' },
  // "K" skipped — no usable name
]

const DRY_RUN = process.argv[2] !== '--apply'

async function main() {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, first_name, last_name, email, name')
    .eq('startup_id', PROSPER_STARTUP_ID)

  if (error) { console.error('Error fetching clients:', error.message); process.exit(1) }

  // Track which CRM records have already been claimed for an update this run
  const claimedIds = new Set()

  const updates = []  // { id, current, patch }
  const creates = []  // { first, last, email }

  for (const row of csv) {
    const firstNorm = row.first.trim().toLowerCase()
    const lastNorm  = row.last.trim().toLowerCase()

    // 1. Try exact first+last match (never creates a collision)
    let match = clients.find(c =>
      !claimedIds.has(c.id) &&
      c.first_name?.toLowerCase() === firstNorm &&
      c.last_name?.toLowerCase()  === lastNorm
    )

    // 2. Try first-name match where CRM last_name is blank (unclaimed only)
    if (!match) {
      match = clients.find(c =>
        !claimedIds.has(c.id) &&
        c.first_name?.toLowerCase() === firstNorm &&
        (!c.last_name || c.last_name.trim() === '')
      )
    }

    // 3. Try first-name-only match where there's exactly one unclaimed record
    if (!match) {
      const candidates = clients.filter(c =>
        !claimedIds.has(c.id) &&
        c.first_name?.toLowerCase() === firstNorm
      )
      if (candidates.length === 1) match = candidates[0]
    }

    if (match) {
      claimedIds.add(match.id)
      const patch = {}
      if (row.last && (!match.last_name || match.last_name.trim() === '')) patch.last_name = row.last
      if (row.email && match.email?.toLowerCase() !== row.email.toLowerCase()) patch.email = row.email.toLowerCase()
      if (Object.keys(patch).length > 0) {
        const newFirst = match.first_name ?? row.first
        const newLast  = patch.last_name ?? match.last_name ?? ''
        patch.name = [newFirst, newLast].filter(Boolean).join(' ')
        updates.push({ id: match.id, displayName: `${match.first_name} ${match.last_name ?? ''}`.trim(), patch })
      }
    } else {
      // No unclaimed match — create a new contact
      creates.push(row)
    }
  }

  // ── Report ──────────────────────────────────────────────────
  console.log(`\nFetched ${clients.length} existing clients from CRM.\n`)

  console.log('─'.repeat(60))
  console.log(`UPDATES (${updates.length}):`)
  console.log('─'.repeat(60))
  for (const u of updates) {
    const changes = Object.entries(u.patch)
      .filter(([k]) => k !== 'name')
      .map(([k, v]) => `  ${k}: → "${v}"`)
      .join('\n')
    console.log(`\n  ${u.displayName} [${u.id}]\n${changes}`)
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`NEW CONTACTS TO CREATE (${creates.length}):`)
  console.log('─'.repeat(60))
  for (const r of creates) {
    console.log(`  ${r.first} ${r.last} <${r.email}>`)
  }

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN — no changes made. Re-run with --apply to apply.\n')
    return
  }

  // ── Apply updates ────────────────────────────────────────────
  console.log('\nApplying updates...')
  let okU = 0, failU = 0
  for (const u of updates) {
    const { error: err } = await supabase.from('clients').update(u.patch).eq('id', u.id)
    if (err) { console.error(`  ✗ ${u.displayName}: ${err.message}`); failU++ }
    else { console.log(`  ✓ Updated ${u.patch.name ?? u.displayName}`); okU++ }
  }

  // ── Create new contacts ──────────────────────────────────────
  console.log('\nCreating new contacts...')
  let okC = 0, failC = 0
  for (const r of creates) {
    const fullName = [r.first, r.last].filter(Boolean).join(' ')
    const { error: err } = await supabase.from('clients').insert({
      startup_id: PROSPER_STARTUP_ID,
      user_id:    '4faa03d7-ce51-4a52-92ac-f27c23e7e3e6',
      first_name: r.first,
      last_name:  r.last  || null,
      name:       fullName,
      email:      r.email.toLowerCase(),
      lead_stage: 'lead',
    })
    if (err) { console.error(`  ✗ ${fullName}: ${err.message}`); failC++ }
    else { console.log(`  ✓ Created ${fullName}`); okC++ }
  }

  console.log(`\nDone. ${okU} updated, ${okC} created, ${failU + failC} failed.\n`)
}

main()
