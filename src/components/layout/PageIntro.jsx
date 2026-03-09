import React from 'react'

export default function PageIntro({ eyebrow, title, subtitle, align = 'left', titleStyle, subtitleStyle, as = 'h1' }) {
  const alignClass = align === 'center' ? 'page-intro--center' : ''
  const TitleTag = as

  return (
    <div className={['page-intro', alignClass].filter(Boolean).join(' ')}>
      {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
      <TitleTag className="page-title" style={titleStyle}>{title}</TitleTag>
      {subtitle ? <p className="page-subtitle" style={subtitleStyle}>{subtitle}</p> : null}
    </div>
  )
}
