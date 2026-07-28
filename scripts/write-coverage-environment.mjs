import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const summaryPath = 'coverage/coverage-summary.json'

if (!existsSync(summaryPath)) {
  console.warn(
    `${summaryPath} not found — run with --coverage first. Skipping environment.properties.`
  )
  process.exit(0)
}

const { total } = JSON.parse(readFileSync(summaryPath, 'utf-8'))

const properties = [
  ['Statements', total.statements.pct],
  ['Branches', total.branches.pct],
  ['Functions', total.functions.pct],
  ['Lines', total.lines.pct],
].map(([label, pct]) => `Coverage.${label}=${pct}%`)

mkdirSync('allure-results', { recursive: true })
writeFileSync('allure-results/environment.properties', properties.join('\n') + '\n')
