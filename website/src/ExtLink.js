import React from 'react'
import { css } from 'glamor'

export default function ExtLink({
  style: customStyle,
  href,
  children,
  ...props
}) {
  const style = css({
    color: 'blue',
    textDecoration: 'underline',
    ':hover': {
      textDecoration: 'none',
    },
    ...customStyle,
  })
  return (
    <a
      {...props}
      {...style}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}
