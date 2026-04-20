import { sanitizeData } from './security';

const VOYAGER_BASE = 'https://www.linkedin.com/voyager/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractVanityName(input) {
  if (!input) return '';
  const cleaned = input.replace(/\/+$/, '');
  const match = cleaned.match(/linkedin\.com\/in\/([^/?]+)/);
  return match ? match[1] : cleaned.trim();
}

async function getCSRFToken(liAtCookie) {
  try {
    const res = await fetch('https://www.linkedin.com/', {
      headers: {
        cookie: `li_at=${liAtCookie}`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      redirect: 'manual',
    });
    const raw = res.headers.get('set-cookie') || '';
    const match = raw.match(/JSESSIONID="?([^";]+)/);
    if (match) { console.log('CSRF obtained'); return match[1]; }
    return 'ajax:0';
  } catch (e) {
    return 'ajax:0';
  }
}

function buildHeaders(liAtCookie, csrf) {
  return {
    cookie: `li_at=${liAtCookie}; JSESSIONID="${csrf}"`,
    'csrf-token': csrf,
    'x-li-lang': 'pt_BR',
    'x-restli-protocol-version': '2.0.0',
    'x-li-track': '{"clientVersion":"1.13.8","osName":"web","timezoneOffset":-3,"timezone":"America/Sao_Paulo","deviceFormFactor":"DESKTOP"}',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    accept: 'application/vnd.linkedin.normalized+json+2.1',
    'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8',
    referer: 'https://www.linkedin.com/',
  };
}

async function voyagerGet(url, headers) {
  const res = await fetch(url, { headers, redirect: 'manual' });
  if (res.status >= 300 && res.status < 400) {
    console.log(`Redirect (${res.status}) — cookie expired`);
    return null;
  }
  if (!res.ok) {
    console.log(`HTTP ${res.status} for ${url.substring(url.indexOf('/voyager'))}`);
    return null;
  }
  return res.json();
}

// ─── Main export ─────────────────────────────────────────────────────────────

export const fetchFullProfile = async (vanityNameInput, liAtCookie) => {
  const vanityName = extractVanityName(vanityNameInput);
  console.log('→ Voyager fetch for:', vanityName);

  const csrf = await getCSRFToken(liAtCookie);
  const headers = buildHeaders(liAtCookie, csrf);

  // 1. Main profile (FullProfileWithEntities decoration = everything in one call)
  const profileUrl = `${VOYAGER_BASE}/identity/dash/profiles?q=memberIdentity&memberIdentity=${vanityName}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-93`;
  const profileData = await voyagerGet(profileUrl, headers);

  if (!profileData) {
    console.log('Profile fetch failed — returning empty');
    return emptyProfile();
  }

  const included = profileData.included || [];
  console.log(`Included items: ${included.length}`);

  // Log all $type values once for debugging
  const typeCounts = {};
  included.forEach(i => {
    const t = (i['$type'] || '').split('.').pop();
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  console.log('Types:', JSON.stringify(typeCounts));

  // ── Parse by URN (guarantees no duplicates) ──────────────────────────────
  const seenUrns = new Set();
  let name = '', headline = '', summary = '';
  const experiences = [];
  const education = [];
  const certifications = [];
  const skills = [];

  for (const item of included) {
    const urn = item.entityUrn || '';
    const type = item['$type'] || '';
    const shortType = type.split('.').pop();

    // Skip already-seen URNs
    if (urn && seenUrns.has(urn)) continue;
    if (urn) seenUrns.add(urn);

    // ── Profile identity ────────────────────────────────────────────────────
    if (shortType === 'Profile' && item.firstName) {
      name = name || `${item.firstName} ${item.lastName || ''}`.trim();
      headline = headline || item.headline || '';
      summary = summary || item.summary || '';
    }
    if (shortType === 'MiniProfile' && !name && item.firstName) {
      name = `${item.firstName} ${item.lastName || ''}`.trim();
      headline = headline || item.occupation || '';
    }

    // ── Experience: only items that have BOTH title AND companyName ─────────
    if (shortType === 'Position' && item.title && item.companyName) {
      experiences.push({
        role: item.title.trim(),
        company: item.companyName.trim(),
        period: formatPeriod(item.timePeriod),
        description: (item.description || '').trim(),
      });
    }

    // ── Education ───────────────────────────────────────────────────────────
    if (shortType === 'Education' && (item.schoolName || item.school)) {
      const degree = [item.degreeName, item.fieldOfStudy].filter(Boolean).join(' — ');
      education.push({
        school: (item.schoolName || item.school || '').trim(),
        degree: degree.trim(),
        period: formatPeriod(item.timePeriod),
      });
    }

    // ── Certifications ──────────────────────────────────────────────────────
    if (shortType === 'Certification' && item.name) {
      certifications.push({
        name: item.name.trim(),
        authority: (item.authority || '').trim(),
        date: item.timePeriod?.startDate
          ? `${item.timePeriod.startDate.month || ''}/${item.timePeriod.startDate.year || ''}`
          : '',
      });
    }

    // ── Skills (from main profile response) ─────────────────────────────────
    if (shortType === 'Skill' && item.name) {
      skills.push(item.name.trim());
    }
  }

  console.log(`Parsed → exp:${experiences.length} edu:${education.length} cert:${certifications.length} skills:${skills.length}`);

  // 2. Contact info (email, phone, github, twitter, website)
  let email = '', phone = '', github = '', twitter = '', website = '', linkedin = '';
  try {
    const contactData = await voyagerGet(
      `${VOYAGER_BASE}/identity/profiles/${vanityName}/profileContactInfo`,
      headers
    );
    if (contactData) {
      email = contactData.emailAddress || '';
      phone = (contactData.phoneNumbers?.[0]?.number) || '';
      linkedin = contactData.linkedInUrl || `https://www.linkedin.com/in/${vanityName}`;
      if (contactData.twitterHandles?.length) twitter = `https://twitter.com/${contactData.twitterHandles[0].name}`;
      if (contactData.websites?.length) {
        for (const w of contactData.websites) {
          const url = w.url || '';
          if (url.includes('github')) github = url;
          else if (!website) website = url;
        }
      }
      console.log('Contact info fetched:', { email: !!email, phone: !!phone, github: !!github, twitter: !!twitter });
    }
  } catch (e) {
    console.log('Contact info error:', e.message);
  }

  // 3. Fetch skills separately if none found in main response
  if (skills.length === 0) {
    try {
      const skillsData = await voyagerGet(
        `${VOYAGER_BASE}/identity/profiles/${vanityName}/skills?count=50`,
        headers
      );
      if (skillsData) {
        const allSkills = [
          ...(skillsData.elements || []),
          ...(skillsData.included || []),
        ];
        allSkills.forEach(s => {
          const n = s.name || s.skill?.name || '';
          if (n) skills.push(n.trim());
        });
        console.log('Skills from separate call:', skills.length);
      }
    } catch (e) { console.log('Skills endpoint error:', e.message); }
  }

  // 3. Deduplicate experiences by full phrase match (role + company, normalized)
  const uniqueExps = deduplicateByPhrase(experiences, e => `${e.role}|${e.company}`);

  // 4. Deduplicate certifications by name
  const uniqueCerts = deduplicateByPhrase(certifications, c => c.name);

  // 5. Deduplicate education by school+degree
  const uniqueEdu = deduplicateByPhrase(education, e => `${e.school}|${e.degree}`);

  // 6. Deduplicate skills
  const uniqueSkills = [...new Set(skills.map(s => s.toLowerCase()))].map(s =>
    skills.find(sk => sk.toLowerCase() === s) || s
  );

  console.log(`After dedup → exp:${uniqueExps.length} cert:${uniqueCerts.length} edu:${uniqueEdu.length} skills:${uniqueSkills.length}`);

  return {
    name: sanitizeData(name) || 'User',
    headline: sanitizeData(headline) || 'Professional',
    summary: sanitizeData(summary) || '',
    email: sanitizeData(email) || '',
    phone: sanitizeData(phone) || '',
    linkedin: sanitizeData(linkedin) || `https://www.linkedin.com/in/${vanityName}`,
    github: sanitizeData(github) || '',
    twitter: sanitizeData(twitter) || '',
    website: sanitizeData(website) || '',
    experiences: uniqueExps.map(e => ({
      role: sanitizeData(e.role),
      company: sanitizeData(e.company),
      period: e.period,
      description: sanitizeData(e.description),
    })),
    education: uniqueEdu.map(e => ({
      school: sanitizeData(e.school),
      degree: sanitizeData(e.degree),
      period: e.period,
    })),
    certifications: uniqueCerts.map(c => ({
      name: sanitizeData(c.name),
      authority: sanitizeData(c.authority),
      date: c.date,
    })),
    skills: uniqueSkills.map(s => sanitizeData(s)),
    posts: [],
  };
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Deduplicates an array using a key function.
 * Normalizes: lowercase, collapse whitespace, trim.
 */
function deduplicateByPhrase(arr, keyFn) {
  const seen = new Set();
  return arr.filter(item => {
    const raw = keyFn(item) || '';
    const key = raw.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatPeriod(tp) {
  if (!tp) return '';
  const s = tp.startDate;
  const e = tp.endDate;
  const start = s ? `${padMonth(s.month)}/${s.year}` : '';
  const end = e ? `${padMonth(e.month)}/${e.year}` : 'Present';
  return start ? `${start} – ${end}` : '';
}

function padMonth(m) {
  if (!m) return '';
  return String(m).padStart(2, '0');
}

function emptyProfile() {
  return {
    name: 'User', headline: 'Professional', summary: '', email: '', github: '',
    experiences: [], education: [], certifications: [], skills: [], posts: [],
  };
}
