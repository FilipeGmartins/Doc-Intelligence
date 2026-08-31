const baseUrl = process.argv[2] ?? process.env.DOC_INTELLIGENCE_BASE_URL

if (!baseUrl) {
  console.error('Informe a URL como argumento ou defina DOC_INTELLIGENCE_BASE_URL.')
  process.exit(1)
}

const routes = ['/', '/upload', '/documents', '/review', '/people', '/whatsapp']
let failed = false

for (const route of routes) {
  try {
    const response = await fetch(new URL(route, baseUrl), { redirect: 'follow' })
    const body = await response.text()
    const isApplication = response.ok && body.includes('id="root"')
    console.log(`${isApplication ? 'OK' : 'FALHA'} ${response.status} ${route}`)
    failed ||= !isApplication
  } catch (error) {
    failed = true
    console.error(`FALHA ${route}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

process.exitCode = failed ? 1 : 0
