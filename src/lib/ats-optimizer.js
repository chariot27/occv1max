/**
 * ATS Optimizer — analyzes and auto-improves resume content for maximum ATS score.
 *
 * Categories scored (total 100 pts):
 *  - Contact info      (10 pts)
 *  - Professional summary (10 pts)
 *  - Experience quality   (25 pts)
 *  - Skills coverage      (20 pts)
 *  - Certifications       (10 pts)
 *  - Education            (10 pts)
 *  - Keyword density      (15 pts)
 */

// ── Strong action verbs for experience bullets ────────────────────────────────
const ACTION_VERBS = [
  'Developed','Built','Designed','Implemented','Led','Delivered','Optimized',
  'Architected','Maintained','Integrated','Automated','Deployed','Refactored',
  'Reduced','Increased','Improved','Migrated','Created','Managed','Collaborated',
  'Reviewed','Tested','Documented','Monitored','Scaled','Secured','Analyzed',
  'Configured','Established','Launched','Streamlined',
];

// ── Common tech keywords — used to boost keyword density score ────────────────
const TECH_KEYWORDS = [
  'api','rest','microservices','docker','kubernetes','ci/cd','git','sql','nosql',
  'react','angular','vue','node','spring','java','.net','python','typescript',
  'javascript','aws','azure','gcp','linux','agile','scrum','tdd','devops',
  'backend','frontend','fullstack','cloud','database','authentication','jwt',
  'oauth','graphql','redis','mongodb','postgresql','mysql','testing','clean code',
];

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Analyzes and optimizes a profile data object for ATS.
 * Returns { optimizedData, scoreReport }.
 */
export function optimizeForATS(data) {
  // Deep clone to avoid mutation
  const profile = JSON.parse(JSON.stringify(data));

  const report = {
    categories: {},
    totalScore: 0,
    maxScore: 100,
    improvements: [],
  };

  // ── 1. Contact Info (10 pts) ────────────────────────────────────────────────
  let contactScore = 0;
  if (profile.name && profile.name !== 'User') contactScore += 4;
  if (profile.email) contactScore += 3;
  if (profile.github) contactScore += 3;
  report.categories.contact = { score: contactScore, max: 10, label: 'Contact Info' };

  // ── 2. Professional Summary (10 pts) ───────────────────────────────────────
  let summaryScore = 0;
  if (profile.summary) {
    const words = profile.summary.split(/\s+/).length;
    if (words >= 30) summaryScore += 5;
    else if (words >= 15) summaryScore += 3;
    else summaryScore += 1;

    // Check keyword presence in summary
    const summaryLower = profile.summary.toLowerCase();
    const kwHits = TECH_KEYWORDS.filter(k => summaryLower.includes(k)).length;
    if (kwHits >= 5) summaryScore += 5;
    else if (kwHits >= 3) summaryScore += 3;
    else if (kwHits >= 1) summaryScore += 1;
  } else {
    // Auto-generate summary from headline + skills + first experience
    if (profile.headline && profile.headline !== 'Professional') {
      const topSkills = profile.skills.slice(0, 5).join(', ');
      const latestExp = profile.experiences[0];
      const expPart = latestExp
        ? `Most recently working as ${latestExp.role} at ${latestExp.company}.`
        : '';
      profile.summary = `${profile.headline}. ${expPart} Experienced with ${topSkills}.`.trim();
      report.improvements.push('Auto-generated Professional Summary from headline and skills.');
      summaryScore = 7;
    }
  }
  report.categories.summary = { score: summaryScore, max: 10, label: 'Professional Summary' };

  // ── 3. Experience Quality (25 pts) ─────────────────────────────────────────
  let expScore = 0;
  if (profile.experiences.length >= 3) expScore += 10;
  else if (profile.experiences.length >= 1) expScore += 5;

  // Check descriptions have content
  const descWithContent = profile.experiences.filter(e => e.description && e.description.length > 20).length;
  if (descWithContent >= profile.experiences.length) expScore += 10;
  else if (descWithContent >= 1) expScore += 5;

  // Period dates present
  const withDates = profile.experiences.filter(e => e.period).length;
  if (withDates >= profile.experiences.length && withDates > 0) expScore += 5;

  report.categories.experience = { score: Math.min(expScore, 25), max: 25, label: 'Experience Quality' };

  // ── 4. Skills Coverage (20 pts) ────────────────────────────────────────────
  let skillsScore = 0;

  // Ensure skills are present
  if (profile.skills.length >= 10) skillsScore += 10;
  else if (profile.skills.length >= 5) skillsScore += 6;
  else if (profile.skills.length >= 1) skillsScore += 3;

  // Extract implicit skills from headline and summary and add them
  const textToMine = `${profile.headline} ${profile.summary} ${profile.experiences.map(e => e.description).join(' ')}`.toLowerCase();
  const existingSkillsLower = new Set(profile.skills.map(s => s.toLowerCase()));
  const implicitSkills = TECH_KEYWORDS.filter(k => textToMine.includes(k) && !existingSkillsLower.has(k));

  if (implicitSkills.length > 0) {
    // Capitalize first letter
    const formatted = implicitSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1));
    profile.skills = [...profile.skills, ...formatted];
    report.improvements.push(`Extracted ${implicitSkills.length} implicit skill(s) from profile text: ${formatted.slice(0, 5).join(', ')}${implicitSkills.length > 5 ? '...' : ''}`);
  }

  // ATS keyword match rate among tech keywords
  const skillsLower = new Set(profile.skills.map(s => s.toLowerCase()));
  const kwMatch = TECH_KEYWORDS.filter(k => skillsLower.has(k)).length;
  if (kwMatch >= 8) skillsScore += 10;
  else if (kwMatch >= 4) skillsScore += 6;
  else if (kwMatch >= 1) skillsScore += 3;

  report.categories.skills = { score: Math.min(skillsScore, 20), max: 20, label: 'Skills Coverage' };

  // ── 5. Certifications (10 pts) ─────────────────────────────────────────────
  let certScore = 0;
  if (profile.certifications.length >= 3) certScore = 10;
  else if (profile.certifications.length >= 1) certScore = 5;
  report.categories.certifications = { score: certScore, max: 10, label: 'Certifications' };

  // ── 6. Education (10 pts) ──────────────────────────────────────────────────
  let eduScore = 0;
  if (profile.education.length >= 1) {
    eduScore += 7;
    if (profile.education[0].degree) eduScore += 3;
  }
  report.categories.education = { score: eduScore, max: 10, label: 'Education' };

  // ── 7. Keyword Density (15 pts) ────────────────────────────────────────────
  const fullText = [
    profile.headline,
    profile.summary,
    ...profile.experiences.map(e => `${e.role} ${e.company} ${e.description}`),
    ...profile.skills,
    ...profile.certifications.map(c => c.name),
  ].join(' ').toLowerCase();

  const kwDensity = TECH_KEYWORDS.filter(k => fullText.includes(k)).length;
  let kwScore = 0;
  if (kwDensity >= 15) kwScore = 15;
  else if (kwDensity >= 10) kwScore = 11;
  else if (kwDensity >= 6) kwScore = 7;
  else if (kwDensity >= 3) kwScore = 4;
  report.categories.keywords = { score: kwScore, max: 15, label: 'Keyword Density' };

  // ── Total Score ─────────────────────────────────────────────────────────────
  report.totalScore = Object.values(report.categories).reduce((sum, c) => sum + c.score, 0);

  console.log(`ATS Score: ${report.totalScore}/100`);
  console.log('Categories:', JSON.stringify(
    Object.fromEntries(Object.entries(report.categories).map(([k, v]) => [k, `${v.score}/${v.max}`])),
    null, 2
  ));
  if (report.improvements.length > 0) {
    console.log('Improvements applied:', report.improvements);
  }

  return { optimizedData: profile, scoreReport: report };
}
