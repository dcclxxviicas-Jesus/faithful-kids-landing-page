'use client'

import { useState } from 'react'

export function BlogImage({ src, alt, width, height, style, loading, fetchPriority }: {
  src: string
  alt: string
  width: number
  height: number
  style?: React.CSSProperties
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
}) {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      // @ts-expect-error fetchpriority is valid HTML
      fetchpriority={fetchPriority}
      style={style}
      onError={() => setFailed(true)}
    />
  )
}
