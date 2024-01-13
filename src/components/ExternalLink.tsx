import { ReactNode } from 'react'

const ExternalLink = ({ url, children }: ExternalLinkProps) => (
  <a href={url}
     target="_blank"
     rel="noopener noreferrer"
     className="text-primary font-bold"
  >
    {children}
  </a>
)

type ExternalLinkProps = {
  url: string
  children: ReactNode
}

export default ExternalLink
