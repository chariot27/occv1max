export const ResumeTemplate = ({ data, atsScore }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Arial', 'Helvetica Neue', sans-serif;
          color: #222;
          font-size: 9.5pt;
          line-height: 1.5;
          background: #fff;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        /* ── TOP HEADER ─────────────────────────────────── */
        .header {
          padding: 28px 36px 18px 36px;
          border-bottom: 2px solid #1a3a6e;
        }
        .name {
          font-size: 26pt;
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #1a1a1a;
        }
        .contact-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 22px;
          margin-top: 6px;
          font-size: 8.5pt;
          color: #555;
        }
        .contact-row span { display: flex; align-items: center; gap: 4px; }

        /* ── TWO COLUMN BODY ─────────────────────────────── */
        .body {
          display: flex;
          flex: 1;
        }

        /* LEFT COLUMN */
        .col-left {
          width: 34%;
          padding: 20px 18px 20px 36px;
          border-right: 1.5px solid #e0e0e0;
          background: #fafafa;
        }

        /* RIGHT COLUMN */
        .col-right {
          width: 66%;
          padding: 20px 36px 20px 22px;
        }

        /* ── SECTION ─────────────────────────────────────── */
        .section { margin-bottom: 18px; }
        .section-title {
          font-size: 7.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #1a3a6e;
          border-bottom: 1.5px solid #1a3a6e;
          padding-bottom: 3px;
          margin-bottom: 9px;
        }

        /* ── LEFT: Skills ─────────────────────────────────── */
        .skill-item {
          font-size: 8.5pt;
          color: #333;
          padding: 2px 0;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .skill-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #1a3a6e;
          flex-shrink: 0;
        }

        /* ── LEFT: Education ──────────────────────────────── */
        .edu-item { margin-bottom: 10px; }
        .edu-school { font-weight: 700; font-size: 8.5pt; color: #1a1a1a; }
        .edu-degree { font-size: 8pt; color: #555; margin-top: 1px; }
        .edu-period { font-size: 7.5pt; color: #888; margin-top: 1px; }

        /* ── RIGHT: Experience ────────────────────────────── */
        .exp-item { margin-bottom: 14px; }
        .exp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .exp-role { font-weight: 700; font-size: 9.5pt; color: #1a1a1a; }
        .exp-period { font-size: 8pt; color: #1a3a6e; white-space: nowrap; font-weight: 600; }
        .exp-company { font-size: 8.5pt; color: #444; font-weight: 600; margin-top: 1px; }
        .exp-desc {
          font-size: 8.5pt;
          color: #444;
          margin-top: 4px;
          padding-left: 0;
        }
        .exp-bullets { margin-top: 4px; padding-left: 14px; }
        .exp-bullets li { font-size: 8.5pt; color: #444; margin-bottom: 2px; }

        /* ── RIGHT: Summary ───────────────────────────────── */
        .summary-text { font-size: 8.5pt; color: #444; }

        /* ── RIGHT: Certifications ────────────────────────── */
        .cert-item { margin-bottom: 9px; }
        .cert-name { font-weight: 700; font-size: 8.5pt; color: #1a1a1a; }
        .cert-authority { font-size: 8pt; color: #555; }
        .cert-date { font-size: 7.5pt; color: #888; margin-top: 1px; }

        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="page">

        <!-- HEADER -->
        <div class="header">
          <div class="name">${data.name}</div>
          <div style="font-size:10pt; color:#1a3a6e; font-weight:600; margin-top:4px;">${data.headline}</div>
          <div class="contact-row">
            ${data.email ? `<span>Email: ${data.email}</span>` : ''}
            ${data.phone ? `<span>Phone: ${data.phone}</span>` : ''}
            ${data.linkedin ? `<span>LinkedIn: linkedin.com/in/${data.linkedin.replace(/.*\/in\//, '')}</span>` : ''}
            ${data.github ? `<span>GitHub: ${data.github.replace('https://github.com/', 'github.com/')}</span>` : ''}
            ${data.twitter ? `<span>X: ${data.twitter.replace('https://twitter.com/', '@').replace('https://x.com/', '@')}</span>` : ''}
            ${data.website ? `<span>Website: ${data.website.replace(/^https?:\/\//, '')}</span>` : ''}
          </div>
        </div>

        <!-- BODY -->
        <div class="body">

          <!-- LEFT COLUMN -->
          <div class="col-left">

            ${data.skills && data.skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Technical Skills</div>
              ${data.skills.map(s => `
                <div class="skill-item">
                  <span class="skill-dot"></span>
                  <span>${s}</span>
                </div>
              `).join('')}
            </div>` : ''}

            ${data.education && data.education.length > 0 ? `
            <div class="section">
              <div class="section-title">Education</div>
              ${data.education.map(edu => `
                <div class="edu-item">
                  <div class="edu-school">${edu.school}</div>
                  ${edu.degree ? `<div class="edu-degree">${edu.degree}</div>` : ''}
                  ${edu.period ? `<div class="edu-period">${edu.period}</div>` : ''}
                </div>
              `).join('')}
            </div>` : ''}

          </div>

          <!-- RIGHT COLUMN -->
          <div class="col-right">

            ${data.summary ? `
            <div class="section">
              <div class="section-title">Professional Summary</div>
              <p class="summary-text">${data.summary}</p>
            </div>` : ''}

            ${data.experiences && data.experiences.length > 0 ? `
            <div class="section">
              <div class="section-title">Work Experience</div>
              ${data.experiences.map(exp => `
                <div class="exp-item">
                  <div class="exp-header">
                    <div>
                      <div class="exp-role">${exp.role}</div>
                      <div class="exp-company">${exp.company}</div>
                    </div>
                    <div class="exp-period">${exp.period || ''}</div>
                  </div>
                  ${exp.description ? `<div class="exp-desc">${exp.description}</div>` : ''}
                </div>
              `).join('')}
            </div>` : ''}

            ${data.certifications && data.certifications.length > 0 ? `
            <div class="section">
              <div class="section-title">Licenses &amp; Certifications</div>
              ${data.certifications.map(cert => `
                <div class="cert-item">
                  <div class="cert-name">${cert.name}</div>
                  ${cert.authority ? `<div class="cert-authority">${cert.authority}</div>` : ''}
                  ${cert.date ? `<div class="cert-date">${cert.date}</div>` : ''}
                </div>
              `).join('')}
            </div>` : ''}

          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
