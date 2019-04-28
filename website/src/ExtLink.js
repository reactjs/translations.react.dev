import React, { forwardRef } from 'react'
import { css } from 'glamor'

export default forwardRef(function ExtLink(
  { style: customStyle, href, children, ...props },
  ref,
) {
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
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
})
