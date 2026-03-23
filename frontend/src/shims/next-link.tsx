import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

type Props = {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: React.MouseEventHandler
  [key: string]: unknown
}

// Minimal `next/link` shim using `react-router-dom`.
export default function Link({ href, children, ...rest }: Props) {
  return (
    <RouterLink to={href} {...(rest as any)}>
      {children}
    </RouterLink>
  )
}

