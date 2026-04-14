import { startStreamableServer } from './server'

async function main() {
  await startStreamableServer()
}

main().catch((e) => {
  process.stderr.write(`Fatal error: ${e instanceof Error ? e.message : JSON.stringify(e)}\n`)
  process.exit(1)
})