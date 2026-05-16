import { useEffect } from 'react'
import { defaultMeta } from '../../config/tools'

interface PageMetaProps {
  title?: string
  description?: string
  path?: string
}

function ensureMetaByName(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function ensureMetaByProperty(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function ensureCanonical(href: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

export default function PageMeta({ title = defaultMeta.title, description = defaultMeta.description, path = '/' }: PageMetaProps) {
  useEffect(() => {
    const fullTitle = `${title} | Dev Tools`
    document.title = fullTitle

    const origin = window.location.origin
    const normalizedPath = path === '/' ? '/dev-tools/' : `/dev-tools${path}`
    const canonicalUrl = `${origin}${normalizedPath}`

    ensureMetaByName('description', description)
    ensureMetaByName('robots', 'index,follow')

    ensureMetaByProperty('og:type', 'website')
    ensureMetaByProperty('og:title', fullTitle)
    ensureMetaByProperty('og:description', description)
    ensureMetaByProperty('og:url', canonicalUrl)

    ensureMetaByName('twitter:card', 'summary_large_image')
    ensureMetaByName('twitter:title', fullTitle)
    ensureMetaByName('twitter:description', description)

    ensureCanonical(canonicalUrl)
  }, [title, description, path])

  return null
}
