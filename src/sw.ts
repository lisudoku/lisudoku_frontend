/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

const DEBUG = false

if (!DEBUG) {
  self.__WB_DISABLE_DEV_LOGS = true;
}

import { sample } from 'lodash-es'
import { setCacheNameDetails, clientsClaim, RouteHandlerCallbackOptions, cacheNames } from 'workbox-core'
import { precache, createHandlerBoundToURL, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { differenceInDays, parseISO } from 'date-fns'

declare const self: ServiceWorkerGlobalScope

const SERVER_URL = import.meta.env.VITE_API_BASE_URL
const DOWNLOAD_PATH = '/api/puzzles/download'
const MAX_DOWNLOAD_AGE_DAYS = 30
const RESPONSE_HEADERS = {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
}

clientsClaim()
self.skipWaiting()
cleanupOutdatedCaches()

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
const wbRoutes = self.__WB_MANIFEST

setCacheNameDetails({
  prefix: 'lisudoku',
  suffix: '',
  precache: 'cache', // store precache in the same place as runtime cache
  runtime: 'cache',
})

const CACHE_NAME = cacheNames.runtime

const routes = [
  ...wbRoutes,
]

console.log('SW routes', routes)

// Saved data to runtime cache
precache(routes)

const clearDownloadCache = async () => {
  console.log('[DOWNLOAD] Cleaning download data')
  const cache = await caches.open(CACHE_NAME)
  await cache.delete(DOWNLOAD_PATH)
  console.log('[DOWNLOAD] Deleted download data')
}

const handleDownloadPath = async (request: Request) => {
  const cache = await caches.open(CACHE_NAME)
  const cachedEntry = await cache.match(DOWNLOAD_PATH)

  if (cachedEntry) {
    console.log('[DOWNLOAD] Cached data found')
    const cachedData = await cachedEntry.clone().json()
    if (cachedData.date && differenceInDays(new Date(), parseISO(cachedData.date)) < MAX_DOWNLOAD_AGE_DAYS) {
      console.log('[DOWNLOAD] Cached data is fresh, no need to update')
      return cachedEntry
    } else {
      console.log('[DOWNLOAD] Cached data is old, trying to update')
    }
  }

  console.log('[DOWNLOAD] Requesting download data')
  const response = await fetch(request.clone())
  const responseData = await response.clone().json()
  responseData.date = new Date()
  const datedResponse = new Response(JSON.stringify(responseData), RESPONSE_HEADERS)
  console.log('[DOWNLOAD] Received download data')
  const content = await response.clone().json()
  console.log('[DOWNLOAD] Downloaded content size', JSON.stringify(content).length)
  console.log('[DOWNLOAD] Downloaded content', JSON.stringify(content).substring(0, 100))
  await cache.put(DOWNLOAD_PATH, datedResponse);
  console.log('[DOWNLOAD] Cached downloaded puzzles')
  return response
}

registerRoute(
  SERVER_URL + DOWNLOAD_PATH,
  ({ request }) => handleDownloadPath(request),
  'POST',
)

type FilterPuzzlesFn = (puzzles: any[], requestArgs: { requestBody: any, searchParams: URLSearchParams, pathParams: string[] | undefined }) => any[] | null
const createPuzzleRouteHandler = (filterPuzzles: FilterPuzzlesFn) => async (args: RouteHandlerCallbackOptions) => {
  const requestClone = args.request.clone()
  return fetch(args.request).catch(async () => {
    console.log('offline, get from cache')
    const cache = await caches.open(CACHE_NAME)
    const cachedData = await cache.match(DOWNLOAD_PATH)
    if (!cachedData) {
      console.error('No downloaded puzzles found in cache :(')
      return Response.error()
    }
    const cachedDataBody = await cachedData.json()
    const puzzles = cachedDataBody.puzzles
    console.log('Got this puzzles content', JSON.stringify(puzzles).substring(0, 100))
    let requestBody
    try {
      requestBody = await requestClone.json()
    } catch (e) {
      console.warn('No request body')
    }

    if (args.params !== undefined && !Array.isArray(args.params)) {
      console.error('Something wrong with params')
      return Response.error()
    }

    const candidatePuzzles = filterPuzzles(puzzles, {
      requestBody, searchParams: args.url.searchParams, pathParams: args.params,
    })

    if (candidatePuzzles === null) {
      return Response.error()
    }

    console.log(`Candidate puzzle count = ${candidatePuzzles.length}`)
    const puzzle = sample(candidatePuzzles)
    console.log('Got this puzzle content', JSON.stringify(puzzle).substring(0, 100))
    return new Response(JSON.stringify(puzzle), RESPONSE_HEADERS)
  })
}

// POST /api/puzzles/random
registerRoute(
  new RegExp(SERVER_URL + '/api/puzzles/random'),
  createPuzzleRouteHandler((puzzles: any[], { requestBody, searchParams }) => {
    console.log(`Looking for variant = ${searchParams.get('variant')}`)
    console.log(`Looking for difficulty = ${searchParams.get('difficulty')}`)

    const solvedPuzzleIds = requestBody.id_blacklist
    console.log('Solved puzzles', solvedPuzzleIds)
    const validPuzzles = puzzles.filter((puzzle: any) => (
      puzzle.variant === searchParams.get('variant') &&
      puzzle.difficulty === searchParams.get('difficulty')
    ))
    if (validPuzzles.length === 0) {
      console.warn('No valid puzzle in the cache')
      return null
    }
    let candidatePuzzles = validPuzzles.filter((puzzle: any) => (
      !solvedPuzzleIds.includes(puzzle.public_id))
    )
    if (candidatePuzzles.length === 0) {
      console.warn('No unsolved puzzles')
      candidatePuzzles = validPuzzles
    }

    return candidatePuzzles
  }),
  'POST',
)

// GET /api/puzzles/:id
registerRoute(
  new RegExp(SERVER_URL + '/api/puzzles/([^/]+)'),
  createPuzzleRouteHandler((puzzles: any[], { pathParams }) => {
    if (!pathParams) {
      console.error("Can't find id in path")
      return null
    }
    const id = pathParams[0]
    console.log(`Looking for id = ${id}`)

    const puzzle = puzzles.filter((puzzle: any) => (
      puzzle.public_id === id
    ))

    if (puzzle.length === 0) {
      console.warn('No puzzle with id in the cache')
      return null
    }

    return puzzle
  }),
)

// POST /api/puzzles/:id/check => correct
registerRoute(
  new RegExp(SERVER_URL + '/api/puzzles/[^/]+/check'),
  async (args) => fetch(args.request).catch(
    () => new Response('{"correct": true}', RESPONSE_HEADERS)
  ),
  'POST',
)

// GET /api/competitions => []
registerRoute(
  new RegExp(SERVER_URL + '/api/competitions[^/]*'),
  async (args) => fetch(args.request).catch(
    () => new Response('{"competitions":[]}', RESPONSE_HEADERS)
  ),
)

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
const isResource = (url: URL) => (
  url.pathname.match(fileExtensionRegexp)
)
// Redirect everything else to /
registerRoute(
  // Return false to exempt requests from being fulfilled by /
  ({ request, url }: { request: Request; url: URL }) => (
    request.mode === 'navigate' && !url.pathname.startsWith('/_') && !isResource(url)
  ),
  createHandlerBoundToURL('index.html')
)

// Catch-all GET handler
registerRoute(
  ({ url }) => {
    if (DEBUG) {
      console.log('GET', url.pathname)
    }
    return true
  },
  new NetworkFirst(),
)

self.addEventListener('install', (e) => {
  // console.log('Extra install steps')
})

// Download offline puzzle data on activation
self.addEventListener('activate', (e) => {
  console.log('Activate steps')
  e.waitUntil((async () => {
    await clearDownloadCache()
    const request = new Request(SERVER_URL + DOWNLOAD_PATH, { method: 'POST' })
    handleDownloadPath(request)
  })())
})
