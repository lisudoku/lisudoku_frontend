import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteUrl = 'https://lisudoku.xyz'
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(scriptDirectory, '../public/sitemap.xml')

// Public static page URLs
const staticPaths = [
  '/',
  '/solver',
  '/learn',
  '/trainer',
  '/about',
  '/tv',
]

// These values mirror the public route parameters in src/types/sudoku.ts.
const variants = [
  'classic',
  'arrow',
  'thermo',
  'kropki',
  'diagonal',
  'antiknight',
  'antiking',
  'irregular',
  'extraregions',
  'oddeven',
  'topbot',
  'killer',
  'renban',
  'palindrome',
  'mixed',
]

const difficulties = [
  'easy4x4',
  'easy6x6',
  'hard6x6',
  'easy9x9',
  'medium9x9',
  'hard9x9',
]

// Generate all variant x difficulty combinations
const playPaths = variants.flatMap((variant) => (
  difficulties.map((difficulty) => `/play/${variant}/${difficulty}`)
))

const urls = [...staticPaths, ...playPaths]
const urlEntries = urls.map((path) => ` <url><loc>${siteUrl}${path}</loc></url>`).join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`

writeFileSync(outputPath, sitemap)

console.log(`Generated sitemap.xml with ${urls.length} URLs.`)
