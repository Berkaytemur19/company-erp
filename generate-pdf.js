const { mdToPdf } = require('md-to-pdf');
const path = require('path');

(async () => {
  const pdf = await mdToPdf(
    { path: path.join(__dirname, 'BACKEND_RAPORU.md') },
    {
      dest: path.join(__dirname, 'BACKEND_RAPORU.pdf'),
      pdf_options: {
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      },
      css: `
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.6; }
        h1 { color: #1d4ed8; border-bottom: 3px solid #1d4ed8; padding-bottom: 8px; }
        h2 { color: #1d4ed8; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 28px; }
        h3 { color: #334155; margin-top: 20px; }
        h4 { color: #475569; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
        th { background: #1d4ed8; color: white; padding: 8px 12px; text-align: left; }
        td { padding: 7px 12px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #f8fafc; }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #0f172a; }
        pre { background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 12px; }
        pre code { background: none; color: inherit; padding: 0; }
        blockquote { border-left: 4px solid #1d4ed8; padding-left: 16px; color: #64748b; margin: 16px 0; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
      `,
    }
  );

  if (pdf) {
    console.log('PDF oluşturuldu: BACKEND_RAPORU.pdf');
  }
})();
