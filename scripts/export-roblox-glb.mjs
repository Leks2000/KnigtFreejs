import fs from 'node:fs/promises'
import path from 'node:path'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { createRobloxR15Knight } from '../public/static/roblox-knight-model.js'

const outputPath = path.resolve(process.cwd(), 'exports/roblox_r15_ragged_knight.glb')

if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null
      this.onloadend = null
      this.onerror = null
    }

    async readAsArrayBuffer(blob) {
      try {
        this.result = await blob.arrayBuffer()
        this.onloadend?.()
      } catch (error) {
        this.onerror?.(error)
      }
    }

    async readAsDataURL(blob) {
      try {
        const buffer = Buffer.from(await blob.arrayBuffer())
        this.result = `data:${blob.type || 'application/octet-stream'};base64,${buffer.toString('base64')}`
        this.onloadend?.()
      } catch (error) {
        this.onerror?.(error)
      }
    }
  }
}

function exportGlb(sceneObject) {
  const exporter = new GLTFExporter()
  return new Promise((resolve, reject) => {
    exporter.parse(
      sceneObject,
      (result) => resolve(result),
      (error) => reject(error),
      {
        binary: true,
        onlyVisible: true,
        maxTextureSize: 1024
      }
    )
  })
}

async function main() {
  const scene = new THREE.Scene()
  const { root } = createRobloxR15Knight()
  root.position.set(0, 0, 0)
  root.rotation.set(0, 0, 0)
  scene.add(root)

  const glbArrayBuffer = await exportGlb(root)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, Buffer.from(glbArrayBuffer))

  console.log(`GLB exported: ${outputPath}`)
}

main().catch((error) => {
  console.error('Failed to export GLB:', error)
  process.exit(1)
})
