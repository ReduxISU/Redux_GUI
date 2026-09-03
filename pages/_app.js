import Head from 'next/head'
import '../styles/globals.css'
import '../styles/q.css';
import 'driver.js/dist/driver.css';
import { ThemeModeProvider } from '../components/ThemeModeContext';
// import '../styles/reducedStyle.css'

// Site-wide default metadata. Lives here (not _document) so it is emitted in the
// server-rendered HTML that link crawlers (Discord, Slack, iMessage, Twitter, etc.)
// read — they do not execute JS, so without these tags they show no preview.
// Individual pages can override any of these with their own <Head>.
const SITE_URL = 'https://redux.isu.edu'
const SITE_NAME = 'Redux'
const SITE_DESCRIPTION =
  'Redux is an educational platform for exploring computational complexity — problems, reductions, and NP-completeness.'
const OG_IMAGE = `${SITE_URL}/og-image.png` // TODO: add public/og-image.png (recommended 1200x630)

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>{SITE_NAME}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph — used by Discord, Facebook, LinkedIn, iMessage, Slack */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={SITE_NAME} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={OG_IMAGE} />

        {/* Twitter/X card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_NAME} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>
      <ThemeModeProvider>
        <Component {...pageProps} />
      </ThemeModeProvider>
    </>
  )
}

export default MyApp
