export const generatePDF = async (htmlContent) => {
  console.log("PDF Generation called, but Puppeteer is disabled for Vercel compatibility.");
  throw new Error("Geração de PDF via Puppeteer não é suportada diretamente na Vercel. Recomendamos Railway ou Fly.io para este recurso.");
};
