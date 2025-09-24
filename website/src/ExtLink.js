import { forwardRef } from 'react'
import styles from './ExtLink.module.css'

export default forwardRef(function ExtLink(
  { className, href, children, ...props },
  ref,
) {
  const combinedClassName = className
    ? `${styles.link} ${className}`
    : styles.link
  return (
    <a
      {...props}
      className={combinedClassName}
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
})
