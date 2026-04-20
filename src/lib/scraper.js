import puppeteer from 'puppeteer';
import { sanitizeData } from './security';

export const scrapeLinkedInProfile = async (profileUrl, overrideCookie) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set the session cookie if available
    const sessionCookie = overrideCookie || process.env.LINKEDIN_SESSION_COOKIE;
    if (sessionCookie) {
      await page.setCookie({
        name: 'li_at',
        value: sessionCookie,
        domain: '.www.linkedin.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None'
      });
      console.log('Session cookie set for scraping.');
    }

    // Realistic desktop user agent for authenticated session
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Page loaded:', profileUrl);

    // Wait for basic content or login wall
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('Sign in') || bodyText.includes('Join LinkedIn')) {
      console.log('LinkedIn Login Wall/Join detected.');
    }

    // Wait a bit for dynamic content
    await new Promise(r => setTimeout(r, 3000));

    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : "";
      };
      
      // Selectors for authenticated profile
      const name = getText('.text-heading-xlarge') || getText('.top-card-layout__title') || getText('h1') || "User";
      const headline = getText('.text-body-medium') || getText('.top-card-layout__headline') || "Professional";
      
      // Attempt to find summary
      let summary = getText('.pv-about-section__summary-text') || getText('.summary') || "";
      
      // Aggressive experience search for authenticated view
      const expItems = document.querySelectorAll('.experience-section li, .pv-profile-section.experience-section li, .artdeco-list__item');
      
      const experiences = Array.from(expItems).map(el => {
        const role = el.querySelector('h3, .experience-item__title, .text-body-medium-bold')?.innerText?.trim() || "";
        const company = el.querySelector('h4, .experience-item__subtitle, .text-body-small')?.innerText?.trim() || "";
        const period = el.querySelector('.pv-entity__date-range, .experience-item__duration')?.innerText?.trim() || "";
        return { role, company, period, description: "" };
      }).filter(exp => exp.role && exp.company);

      return { name, headline, summary, experiences, skills: [] };
    });

    console.log('Extracted Data:', JSON.stringify(data, null, 2));

    return {
      name: sanitizeData(data.name) || "User",
      headline: sanitizeData(data.headline) || "Professional",
      summary: sanitizeData(data.summary) || "No summary found.",
      experiences: data.experiences.map(exp => ({
        ...exp,
        company: sanitizeData(exp.company),
        role: sanitizeData(exp.role),
        description: ""
      })),
      skills: [],
      posts: []
    };
  } catch (error) {
    console.error('Scraping Error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
