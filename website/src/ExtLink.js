import React from 'react'
import { css } from 'glamor'

export default function ExtLink({ style, href, children, ...props }) {
  const rule = css({
    color: 'blue',
    ':hover': {
      textDecoration: 'underline',
    },
    ...style,
  })
  return (
    <a
      {...props}
      {...rule}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}
