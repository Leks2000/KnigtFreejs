import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { createRobloxR15Knight } from './roblox-knight-model.js'

const canvas = document.querySelector('#character-canvas')
const viewport = document.querySelector('#viewport-panel')
const loadingCard = document.querySelector('#loading-card')

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x090807, 0.045)

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.08

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
camera.position.set(4.5, 3.2, 7.2)

const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1.95, 0)
controls.enableDamping = true
controls.dampingFactor = 0.065
controls.minDistance = 3.4
controls.maxDistance = 12
controls.maxPolarAngle = Math.PI * 0.82

const { root, layers } = createRobloxR15Knight()
scene.add(root)

let spinEnabled = true
let exploded = false
let poseAlt = false
let dramaticLight = false

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(6.4, 64),
  new THREE.MeshStandardMaterial({ color: 0x12100e, roughness: 0.88, metalness: 0.04 })
)
floor.name = 'dark studio floor'
floor.rotation.x = -Math.PI / 2
floor.position.y = -1.56
floor.receiveShadow = true
scene.add(floor)

const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 8, 8, 8),
  new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 1, metalness: 0 })
)
backWall.name = 'dark rough background'
backWall.position.set(0, 1.6, -3.2)
backWall.receiveShadow = true
scene.add(backWall)

const ambient = new THREE.HemisphereLight(0xc8d5ff, 0x1d1208, 1.25)
scene.add(ambient)

const keyLight = new THREE.DirectionalLight(0xffe1a3, 3.2)
keyLight.position.set(-3.5, 5.6, 4.8)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(2048, 2048)
keyLight.shadow.camera.near = 0.5
keyLight.shadow.camera.far = 16
keyLight.shadow.camera.left = -5
keyLight.shadow.camera.right = 5
keyLight.shadow.camera.top = 6
keyLight.shadow.camera.bottom = -4
scene.add(keyLight)

const rimLight = new THREE.DirectionalLight(0x8fa7ff, 1.7)
rimLight.position.set(4.5, 2.5, -2.5)
scene.add(rimLight)

const fireLight = new THREE.PointLight(0xff7b32, 1.35, 8)
fireLight.position.set(-2.8, 1.3, 2.7)
scene.add(fireLight)

function resizeRenderer() {
  const rect = viewport.getBoundingClientRect()
  const width = Math.max(1, Math.floor(rect.width))
  const height = Math.max(1, Math.floor(rect.height))
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

window.addEventListener('resize', resizeRenderer)
resizeRenderer()

const spinButton = document.querySelector('#toggle-spin')
const explodeButton = document.querySelector('#toggle-explode')
const poseButton = document.querySelector('#toggle-pose')
const lightButton = document.querySelector('#toggle-light')
const downloadButton = document.querySelector('#download-glb')

spinButton.addEventListener('click', () => {
  spinEnabled = !spinEnabled
  spinButton.textContent = spinEnabled ? 'Пауза вращения' : 'Включить вращение'
  spinButton.classList.toggle('is-active', !spinEnabled)
})

explodeButton.addEventListener('click', () => {
  exploded = !exploded
  explodeButton.textContent = exploded ? 'Собрать обратно' : 'Разобрать слои'
  explodeButton.classList.toggle('is-active', exploded)
})

poseButton.addEventListener('click', () => {
  poseAlt = !poseAlt
  poseButton.textContent = poseAlt ? 'Базовая поза' : 'Смена позы'
  poseButton.classList.toggle('is-active', poseAlt)
})

lightButton.addEventListener('click', () => {
  dramaticLight = !dramaticLight
  lightButton.classList.toggle('is-active', dramaticLight)
})

function animateLayerExplosion(delta) {
  layers.forEach((layer) => {
    const base = layer.userData.basePosition
    const direction = layer.userData.explodeDirection
    const target = exploded ? base.clone().add(direction.clone().multiplyScalar(0.64)) : base
    layer.position.lerp(target, 1 - Math.pow(0.001, delta))
  })
}

function animatePose(delta) {
  const leftArm = root.getObjectByName('left armored arm')
  const rightArm = root.getObjectByName('right armored arm')
  const weapon = root.getObjectByName('long matchlock firearm')
  const helmet = root.getObjectByName('closed sallet helmet')

  const alpha = 1 - Math.pow(0.004, delta)
  if (leftArm && rightArm && weapon && helmet) {
    const leftTarget = poseAlt ? -0.68 : -0.15
    const rightTarget = poseAlt ? 0.63 : 0.3
    const weaponTarget = poseAlt ? -0.38 : -0.73
    const headTarget = poseAlt ? -0.18 : 0
    leftArm.rotation.z += (leftTarget - leftArm.rotation.z) * alpha
    rightArm.rotation.z += (rightTarget - rightArm.rotation.z) * alpha
    weapon.rotation.z += (weaponTarget - weapon.rotation.z) * alpha
    helmet.rotation.y += (headTarget - helmet.rotation.y) * alpha
  }
}

function animateLights(delta, elapsed) {
  const alpha = 1 - Math.pow(0.006, delta)
  const keyTarget = dramaticLight ? 4.6 : 3.2
  const rimTarget = dramaticLight ? 3.4 : 1.7
  const ambientTarget = dramaticLight ? 0.72 : 1.25
  keyLight.intensity += (keyTarget - keyLight.intensity) * alpha
  rimLight.intensity += (rimTarget - rimLight.intensity) * alpha
  ambient.intensity += (ambientTarget - ambient.intensity) * alpha
  fireLight.intensity = (dramaticLight ? 1.85 : 1.25) + Math.sin(elapsed * 5.7) * 0.18
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

function exportCurrentCharacterAsGLB() {
  const exporter = new GLTFExporter()
  const clone = root.clone(true)
  clone.position.set(0, 0, 0)
  clone.rotation.set(0, 0, 0)
  clone.scale.setScalar(1)

  exporter.parse(
    clone,
    (result) => {
      const blob = new Blob([result], { type: 'model/gltf-binary' })
      downloadBlob(blob, 'roblox_r15_ragged_knight.glb')
      downloadButton.textContent = 'GLB скачан ✓'
      setTimeout(() => {
        downloadButton.textContent = 'Скачать GLB (Roblox R15)'
      }, 1800)
    },
    (error) => {
      console.error('GLB export failed', error)
      downloadButton.textContent = 'Ошибка экспорта GLB'
      setTimeout(() => {
        downloadButton.textContent = 'Скачать GLB (Roblox R15)'
      }, 1800)
    },
    {
      binary: true,
      onlyVisible: true,
      trs: false,
      maxTextureSize: 1024
    }
  )
}

downloadButton.addEventListener('click', exportCurrentCharacterAsGLB)

const clock = new THREE.Clock()

function render() {
  const delta = Math.min(clock.getDelta(), 0.05)
  const elapsed = clock.elapsedTime

  if (spinEnabled && !controls.dragging) {
    root.rotation.y += delta * 0.2
  }

  root.position.y = -1.52 + Math.sin(elapsed * 1.6) * 0.018
  animateLayerExplosion(delta)
  animatePose(delta)
  animateLights(delta, elapsed)

  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

requestAnimationFrame(() => {
  loadingCard.classList.add('is-hidden')
  render()
})
