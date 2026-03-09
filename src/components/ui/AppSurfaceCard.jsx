import React from 'react'

export default function AppSurfaceCard({
  children,
  className = '',
  style,
  as: Component = 'div',
  tone = 'default',
}) {
  const toneClass = tone === 'muted' ? 'surface-card-muted' : 'surface-card'
  const classes = [toneClass, className].filter(Boolean).join(' ')

  return (
    <Component className={classes} style={style}>
      {children}
    </Component>
  )
}
