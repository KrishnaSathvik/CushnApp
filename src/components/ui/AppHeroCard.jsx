import React from 'react'

export default function AppHeroCard({ children, className = '', style, as: Component = 'section' }) {
  const classes = ['hero-card', className].filter(Boolean).join(' ')

  return (
    <Component className={classes} style={style}>
      {children}
    </Component>
  )
}
