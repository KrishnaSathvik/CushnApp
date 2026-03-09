const TOKENS = {
  shellBg: '#000000',
  cardBg: '#FFFFFF',
  text: '#111827',
  muted: '#4B5563',
  border: '#E5E7EB',
  accent: '#14B8A6',
  cta: '#8B5CF6',
  highlight: '#FEF08A',
  footer: '#14B8A6',
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function escapeEmailHtml(value: string | number | null | undefined): string {
  return escapeHtml(String(value ?? ''))
}

function wrapHighlight(value: string): string {
  return `<span style="background-color:${TOKENS.highlight};padding:2px 4px;">${escapeHtml(value)}</span>`
}

export function buildEditorialEmail({
  title,
  greeting,
  paragraphs,
  sectionTitle,
  sectionBody,
  ctaLabel,
  ctaHref,
  footerNote,
  footerSecondaryLabel = 'Manage preferences',
  footerSecondaryHref,
}: {
  title: string
  greeting?: string
  paragraphs: string[]
  sectionTitle?: string
  sectionBody?: string
  ctaLabel: string
  ctaHref: string
  footerNote?: string
  footerSecondaryLabel?: string
  footerSecondaryHref?: string
}): string {
  const introHtml = paragraphs
    .map((paragraph) => `
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${TOKENS.text};">
        ${paragraph}
      </p>
    `)
    .join('')

  const sectionHtml = sectionTitle
    ? `
      <h3 style="margin:32px 0 16px;font-size:18px;font-weight:800;color:${TOKENS.text};">
        ${escapeHtml(sectionTitle)}
      </h3>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${TOKENS.text};">
        ${sectionBody || ''}
      </p>
    `
    : ''

  const footerHtml = footerNote
    ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${TOKENS.text};">${footerNote}</p>`
    : ''

  const footerLinksHtml = footerSecondaryHref
    ? `
      <p style="margin:0;font-size:11px;">
        ${footerSecondaryHref ? `<a href="${escapeHtml(footerSecondaryHref)}" style="color:${TOKENS.footer};text-decoration:underline;">${escapeHtml(footerSecondaryLabel)}</a>` : ''}
      </p>
    `
    : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${TOKENS.shellBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:${TOKENS.text};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${TOKENS.shellBg};padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:${TOKENS.cardBg};text-align:left;">
            <tr>
              <td style="padding:40px 50px;">
                <div style="text-align:center;margin-bottom:40px;">
                  <span style="font-size:28px;font-weight:800;letter-spacing:-0.05em;color:${TOKENS.text};">Cushn</span>
                </div>

                ${greeting ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${TOKENS.text};">${greeting}</p>` : ''}
                ${introHtml}
                ${sectionHtml}
                ${footerHtml}

                <div style="text-align:center;margin-bottom:32px;margin-top:40px;">
                  <a href="${escapeHtml(ctaHref)}" style="display:inline-block;padding:12px 24px;background-color:${TOKENS.cta};color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;border-radius:8px;">
                    ${escapeHtml(ctaLabel)}
                  </a>
                </div>

                <hr style="border:none;border-top:1px solid ${TOKENS.border};margin:40px 0 32px;" />

                <div style="text-align:center;">
                  <div style="margin-bottom:16px;">
                    <span style="font-size:20px;font-weight:800;letter-spacing:-0.05em;color:${TOKENS.text};">Cushn</span>
                  </div>
                  ${footerLinksHtml}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function cushnHighlight(label: string): string {
  return wrapHighlight(label)
}
