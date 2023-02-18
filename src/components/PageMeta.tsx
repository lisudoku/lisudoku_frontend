import { Helmet } from 'react-helmet-async'

const PageMeta = ({ title, url, description }: PageMetaProps) => (
  <Helmet>
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta property="og:type" content="website" />
    <link rel="canonical" href={url} />
    <meta property="og:url" content={url} />
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />
  </Helmet>
)

type PageMetaProps = {
  title: string
  url: string
  description: string
}

export default PageMeta
