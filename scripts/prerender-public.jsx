import fs from 'node:fs/promises'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { PublicRoutes } from '../src/prerender/PublicRoutes.jsx'
import { getRouteSeo } from '../src/lib/seo.js'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html')
const SITE_URL = process.env.VITE_SITE_URL || 'https://cushn.app'
const ROUTES = ['/', '/landing', '/privacy', '/terms', '/contact']

function upsertMetaTag(html, attrName, attrValue, content) {
  const pattern = new RegExp(`<meta[^>]*${attrName}=["']${attrValue}["'][^>]*>`, 'i')
  const tag = `<meta ${attrName}="${attrValue}" content="${content}">`
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace('</head>', `  ${tag}\n</head>`)
}

function upsertCanonical(html, href) {
  const pattern = /<link[^>]*rel=["']canonical["'][^>]*>/i
  const tag = `<link rel="canonical" href="${href}">`
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace('</head>', `  ${tag}\n</head>`)
}

function injectHead(html, seo) {
  let nextHtml = html.replace(/<title>.*?<\/title>/i, `<title>${seo.title}</title>`)
  nextHtml = upsertMetaTag(nextHtml, 'name', 'description', seo.description)
  nextHtml = upsertMetaTag(nextHtml, 'name', 'robots', seo.robots)
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:title', seo.title)
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:description', seo.description)
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:type', 'website')
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:url', seo.canonicalUrl)
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:image', seo.imageUrl)
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:card', 'summary_large_image')
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:title', seo.title)
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:description', seo.description)
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:image', seo.imageUrl)
  nextHtml = upsertCanonical(nextHtml, seo.canonicalUrl)
  return nextHtml
}

async function writePrerenderedRoute(routePath, template) {
  const markup = renderToString(<PublicRoutes pathname={routePath} />)
  const seo = getRouteSeo(routePath, SITE_URL)
  const htmlWithMarkup = template.replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
  const prerenderedHtml = injectHead(htmlWithMarkup, seo)
  const outputDir = path.join(DIST_DIR, routePath.replace(/^\//, ''))

  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(path.join(outputDir, 'index.html'), prerenderedHtml, 'utf8')
}

async function main() {
  const template = await fs.readFile(TEMPLATE_PATH, 'utf8')
  await Promise.all(ROUTES.map((routePath) => writePrerenderedRoute(routePath, template)))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
