import PageMeta from 'src/components/PageMeta'
import { Typography } from '@material-tailwind/react'

const OfflinePage = () => (
  <div className="px-4 py-3">
    <PageMeta title="Offline"
              url="https://lisudoku.xyz/offline"
              description="Instructions for offline use of the app" />
    <Typography variant="h2">
      Offline
    </Typography>
    <Typography variant="paragraph">
      lisudoku also works offline! For the best experience you can install it as an app.
    </Typography>

    <Typography variant="h4" className="mt-3">
      iOS/iPadOS
    </Typography>
    <Typography variant="paragraph">
      Share {'>'} Add to Home Screen (
        <a href="https://www.lifewire.com/home-screen-icons-in-safari-for-iphone-and-amp-ipod-touch-4103654"
          target="_blank"
          rel="noopener noreferrer"
          className="underline">
          source
        </a>
      )
      <img alt="" src="https://www.lifewire.com/thmb/Bpp7E0Pyg4YweTIlPVUnImiVXGk=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/MakeSafariBookmark-9eff4fc5264546418637785165ae8541.jpg" />
    </Typography>

    <Typography variant="h4" className="mt-3">
      Android Chrome
    </Typography>
    <Typography variant="paragraph">
      Click "Add lisudoku to Home Screen" on the bottom (
        <a href="https://9to5google.com/2021/03/29/chrome-new-pwa-install"
          target="_blank"
          rel="noopener noreferrer"
          className="underline">
          source
        </a>
      )
    </Typography>

    <Typography variant="h4" className="mt-3">
      Desktop Chrome/Edge
    </Typography>
    <Typography variant="paragraph">
      Click the icon in the URL bar
      <img alt="" src="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing/pwa-install.png" />
    </Typography>

    <Typography variant="h4" className="mt-3">
      More
    </Typography>
    <Typography variant="paragraph">
      You can find full instructions
      {' '}
      <a href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing"
        target="_blank"
        rel="noopener noreferrer"
        className="underline">
        here
      </a>
      .
    </Typography>
  </div>
)

export default OfflinePage
