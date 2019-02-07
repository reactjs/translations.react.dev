import React from 'react'
export default function ExtLink({ href, children, ...props }) {
  return (
    <a {...props} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}
