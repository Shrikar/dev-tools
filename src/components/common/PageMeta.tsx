import { useEffect } from 'react'
import { defaultMeta } from '../../config/tools'

interface PageMetaProps {
  title?: string
  description?: string
}

export default function PageMeta({ title = defaultMeta.title, description = defaultMeta.description }: PageMetaProps) {
  useEffect(() => {
    const fullTitle = `${title} | Dev Tools`
    document.title = fullTitle

    const ensureMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    ensureMeta('description', description)
  }, [title, description])

  return null
}
