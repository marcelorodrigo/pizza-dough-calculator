import { readdirSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const componentsDirectory = resolve(process.cwd(), 'app/components')

function componentFiles(): string[] {
  return readdirSync(componentsDirectory, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.vue'))
}

describe('component auto-import names', () => {
  it('finds components to check', () => {
    expect(componentFiles().length).toBeGreaterThan(0)
  })

  it('uses globally unique basenames, because Nuxt registers flat names', () => {
    const filesByName = new Map<string, string[]>()

    for (const file of componentFiles()) {
      const name = basename(file, '.vue')
      filesByName.set(name, [...(filesByName.get(name) ?? []), file])
    }

    const duplicates = [...filesByName].filter(([, files]) => files.length > 1)

    expect(duplicates).toEqual([])
  })
})
