import { readdirSync, renameSync } from 'fs'
import { join } from 'path'

const dist = join(process.cwd(), 'dist')
const files = readdirSync(dist)

for (const file of files) {
  if (/^index-[^.]+\.d\.(c|m)?ts/.test(file)) {
    const renamed = file.replace(/^index-[^.]+/, 'index')
    renameSync(join(dist, file), join(dist, renamed))
    console.log(`${file} → ${renamed}`)
  }
}
