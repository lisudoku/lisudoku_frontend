import { Helmet } from 'react-helmet-async'

interface PageMetaProps {
  title: string
  url: string
  description: string
  includeTitleBranding?: boolean
  noIndex?: boolean
}

export const PageMeta = ({ title, url, description, includeTitleBranding = true, noIndex = false }: PageMetaProps) => (
  <Helmet>
    <title>{`${title}${includeTitleBranding ? ' • lisudoku.xyz' : ''}`}</title>
    <meta property="og:title" content={`${title} • lisudoku.xyz`} />
    <meta property="og:type" content="website" />
    <link rel="canonical" href={url} />
    <meta property="og:url" content={url} />
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />
    {noIndex && <meta name="robots" content="noindex" />}
  </Helmet>
)
