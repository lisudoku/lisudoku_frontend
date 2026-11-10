import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const require = createRequire(import.meta.url)
const { explore } = require('source-map-explorer')

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDirectory, '..')
const buildDirectory = resolve(projectRoot, 'build')
const assetsDirectory = resolve(buildDirectory, 'assets')

const DEFAULT_TOP = 30
const APP_SOURCE_LABEL = 'app src'

const numberFormat = new Intl.NumberFormat('en-US')

const formatBytes = (bytes) => numberFormat.format(bytes)

const formatPercent = (part, total) => (
  total === 0 ? '0.0%' : `${(100 * part / total).toFixed(1)}%`
)

const formatPath = (path) => relative(projectRoot, resolve(projectRoot, path))

const getGzipSize = (path) => {
  const filePath = resolve(projectRoot, path)

  try {
    return execFileSync('gzip', ['-c', filePath], { maxBuffer: 50 * 1024 * 1024 }).length
  } catch {
    return gzipSync(readFileSync(filePath)).length
  }
}

const parseArgs = (argv) => {
  const options = {
    all: false,
    json: false,
    top: DEFAULT_TOP,
    bundles: [],
  }

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]

    if (arg === '--help' || arg === '-h') {
      options.help = true
    } else if (arg === '--all') {
      options.all = true
    } else if (arg === '--json') {
      options.json = true
    } else if (arg === '--verbose') {
      options.verbose = true
    } else if (arg === '--top') {
      options.top = Number.parseInt(argv[++index], 10)
    } else if (arg.startsWith('--top=')) {
      options.top = Number.parseInt(arg.slice('--top='.length), 10)
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`)
    } else {
      options.bundles.push(arg)
    }
  }

  if (!Number.isFinite(options.top) || options.top < 0) {
    throw new Error('--top must be a non-negative integer')
  }

  return options
}

const printHelp = () => {
  console.log(`Usage: yarn analyze [options] [bundle ...]

Analyze generated chunks with source-map-explorer and print a package-size table.

Options:
  --all          Analyze every .js chunk in build/assets
  --top <n>      Show the top n packages (default ${DEFAULT_TOP}, 0 = all)
  --json         Print machine-readable JSON instead of a table
  --verbose      Print source-map-explorer warnings
  -h, --help     Show this help

Examples:
  yarn analyze
  yarn analyze --top 10
  yarn analyze 'build/assets/voice-*.js'
  yarn analyze --all --top 15
`)
}

const findEntryBundle = () => {
  const indexPath = resolve(buildDirectory, 'index.html')

  if (existsSync(indexPath)) {
    const html = readFileSync(indexPath, 'utf8')
    const match = html.match(/<script[^>]*\bsrc="([^"]+\.js)"/i)

    if (match !== null) {
      const scriptPath = match[1].replace(/^\.?\//, '')
      const bundlePath = resolve(buildDirectory, scriptPath)

      if (existsSync(bundlePath)) {
        return bundlePath
      }
    }
  }

  if (!existsSync(assetsDirectory)) {
    return undefined
  }

  return readdirSync(assetsDirectory)
    .filter(file => /^index-.*\.js$/.test(file))
    .map(file => resolve(assetsDirectory, file))
    .sort((left, right) => statSync(right).size - statSync(left).size)[0]
}

const findAllBundles = () => {
  if (!existsSync(assetsDirectory)) {
    return []
  }

  return readdirSync(assetsDirectory)
    .filter(file => file.endsWith('.js'))
    .map(file => resolve(assetsDirectory, file))
    .sort()
}

const groupSource = (source) => {
  const normalized = source.replaceAll('\\', '/')
  const packageMatch = normalized.match(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/)

  if (packageMatch !== null) {
    return packageMatch[1]
  }

  if (/(?:^|\/)src\//.test(normalized)) {
    return APP_SOURCE_LABEL
  }

  return normalized.replace(/^(\.\.\/)+/, '') || '[other]'
}

const groupFiles = (files) => {
  const groups = new Map()

  for (const [source, file] of Object.entries(files)) {
    if (source.startsWith('[')) {
      continue
    }

    const group = groupSource(source)
    groups.set(group, (groups.get(group) ?? 0) + file.size)
  }

  return [...groups]
    .map(([name, size]) => ({ name, size }))
    .sort((left, right) => right.size - left.size)
}

const printErrors = (errors) => {
  for (const error of errors) {
    const level = error.isWarning ? 'Warning' : 'Error'
    console.error(`${level}: ${error.bundleName}: ${error.message}`)
  }
}

const analyze = async (bundlePaths) => {
  try {
    return await explore(bundlePaths, { noBorderChecks: true })
  } catch (error) {
    if (error !== null && typeof error === 'object' && Array.isArray(error.errors)) {
      printErrors(error.errors)
      return undefined
    }

    throw error
  }
}

const printBundleTable = (bundle, top, verbose) => {
  const gzipBytes = getGzipSize(bundle.bundleName)
  const groups = groupFiles(bundle.files)
  const visibleGroups = top === 0 ? groups : groups.slice(0, top)
  const hiddenGroups = top === 0 ? [] : groups.slice(top)
  const hiddenSize = hiddenGroups.reduce((total, group) => total + group.size, 0)

  console.log(`Bundle: ${formatPath(bundle.bundleName)}`)
  console.log(
    `Raw: ${formatBytes(bundle.totalBytes)} B | ` +
    `Gzip: ${formatBytes(gzipBytes)} B | ` +
    `Mapped: ${formatBytes(bundle.mappedBytes)} B (${formatPercent(bundle.mappedBytes, bundle.totalBytes)}) | ` +
    `Unmapped: ${formatBytes(bundle.unmappedBytes ?? 0)} B`
  )
  console.log()

  const nameWidth = Math.max(
    'Package'.length,
    ...visibleGroups.map(group => group.name.length),
    hiddenGroups.length > 0 ? `Other (${hiddenGroups.length} groups)`.length : 0
  )
  const rawWidth = 12
  const mappedWidth = 9
  const totalWidth = 8

  const row = (name, size) => (
    `${name.padEnd(nameWidth)}  ` +
    `${formatBytes(size).padStart(rawWidth)}  ` +
    `${formatPercent(size, bundle.mappedBytes).padStart(mappedWidth)}  ` +
    `${formatPercent(size, bundle.totalBytes).padStart(totalWidth)}`
  )

  console.log(`${'Package'.padEnd(nameWidth)}  ${'Raw bytes'.padStart(rawWidth)}  ${'% mapped'.padStart(mappedWidth)}  ${'% total'.padStart(totalWidth)}`)
  console.log(`${'-'.repeat(nameWidth)}  ${'-'.repeat(rawWidth)}  ${'-'.repeat(mappedWidth)}  ${'-'.repeat(totalWidth)}`)

  for (const group of visibleGroups) {
    console.log(row(group.name, group.size))
  }

  if (hiddenGroups.length > 0) {
    console.log(row(`Other (${hiddenGroups.length} groups)`, hiddenSize))
  }

  console.log(`${'-'.repeat(nameWidth)}  ${'-'.repeat(rawWidth)}  ${'-'.repeat(mappedWidth)}  ${'-'.repeat(totalWidth)}`)
  console.log(row('Mapped total', bundle.mappedBytes))

  if (verbose && bundle.unmappedBytes !== undefined) {
    console.log(`\nUnmapped: ${formatBytes(bundle.unmappedBytes)} B`)
  }
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    printHelp()
    return
  }

  let bundlePaths = options.bundles

  if (bundlePaths.length === 0) {
    bundlePaths = options.all ? findAllBundles() : [findEntryBundle()].filter(Boolean)
  }

  if (bundlePaths.length === 0) {
    throw new Error(
      'No build found. Run `yarn build:dev --mode production` first, then re-run `yarn analyze`.'
    )
  }

  const result = await analyze(bundlePaths.length === 1 ? bundlePaths[0] : bundlePaths)

  if (result === undefined || result.bundles.length === 0) {
    process.exitCode = 1
    return
  }

  if (options.verbose) {
    printErrors(result.errors)
  }

  if (options.json) {
    const output = {
      bundles: result.bundles.map(bundle => ({
        bundleName: formatPath(bundle.bundleName),
        totalBytes: bundle.totalBytes,
        gzipBytes: getGzipSize(bundle.bundleName),
        mappedBytes: bundle.mappedBytes,
        unmappedBytes: bundle.unmappedBytes ?? 0,
        eolBytes: bundle.eolBytes,
        sourceMapCommentBytes: bundle.sourceMapCommentBytes,
        packages: groupFiles(bundle.files),
      })),
      errors: result.errors.map(error => ({
        bundleName: formatPath(error.bundleName),
        code: error.code,
        message: error.message,
        isWarning: error.isWarning ?? false,
      })),
    }

    console.log(JSON.stringify(output, null, 2))
    return
  }

  result.bundles.forEach((bundle, index) => {
    if (index > 0) {
      console.log()
    }

    printBundleTable(bundle, options.top, options.verbose)
  })
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
