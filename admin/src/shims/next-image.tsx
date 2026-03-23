import React from 'react'

type ImgProps = {
  src: string
  alt: string
  fill?: boolean
  className?: string
  style?: React.CSSProperties
}

// Minimal `next/image` shim -> plain `<img />`.
export default function Image(props: ImgProps) {
  const { src, alt, fill, className, style } = props

  const mergedStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        ...style,
      }
    : style || {}

  return <img src={src} alt={alt} className={className} style={mergedStyle} />
}

