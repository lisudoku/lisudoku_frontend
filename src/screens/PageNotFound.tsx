import { PageMeta } from 'src/components/PageMeta'
import Typography from 'src/design_system/Typography'

const PageNotFound = () => (
  <>
    <PageMeta
      title="Page Not Found"
      url={window.location.href}
      description="Fallback when visiting an inexistent page"
      noIndex
    />
    <div className="w-full pt-20 text-center">
      <Typography variant="h1" className="font-normal mb-3">
        Page not found!
      </Typography>
    </div>
  </>
)

export default PageNotFound
