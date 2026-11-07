import { createReadStream } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sirv from 'sirv'

const root = fileURLToPath(new URL('../.output/public/', import.meta.url))
const indexFile = join(root, 'index.html')
const host = process.env.HOST || 'localhost'
const port = 4173
const serveStatic = sirv(root, { single: true, ignores: ['^/_nuxt/'] })

const server = createServer((req, res) => {
  serveStatic(req, res, () => {
    const { pathname } = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    const isAsset = pathname.startsWith('/_nuxt/') || extname(pathname) !== ''

    if (isAsset) {
      res.statusCode = 404
      res.end('Not found')
      return
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    createReadStream(indexFile).pipe(res)
  })
})

server.listen(port, host, () => {
  console.log(`Previewing .output/public at http://${host}:${port}`)
})
