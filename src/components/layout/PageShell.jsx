import React from 'react'

export default function PageShell({
  children,
  width = 'default',
  as: Component = 'div',
  className = '',
  style,
}) {
  const classes = ['page-shell', `page-shell--${width}`, className].filter(Boolean).join(' ')

  return (
    <Component className={classes} style={style}>
      {children}
    </Component>
  )
}
