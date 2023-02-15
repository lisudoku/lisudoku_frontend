import { Helmet } from 'react-helmet-async'

const PageMeta = ({ title, url }: PageMetaProps) => (
  <Helmet>
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta property="og:type" content="website" />
    <link rel="canonical" href={url} />
    <meta property="og:url" content={url} />
  </Helmet>
)

type PageMetaProps = {
  title: string
  url: string
}

export default PageMeta
