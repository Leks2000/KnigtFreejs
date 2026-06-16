import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

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
controls.target.set(0, 1.85, 0)
controls.enableDamping = true
controls.dampingFactor = 0.065
controls.minDistance = 3.4
controls.maxDistance = 12
controls.maxPolarAngle = Math.PI * 0.82

const root = new THREE.Group()
root.name = 'Ragged Arquebus Knight'
root.position.y = -1.55
scene.add(root)

const layers = []
let spinEnabled = true
let exploded = false
let poseAlt = false
let dramaticLight = false

const palette = {
  steel: 0xb8bcc0,
  darkSteel: 0x5d6265,
  edgeSteel: 0xe5e2d7,
  cloth: 0xc6c1b4,
  dirtyCloth: 0x8e887c,
  olive: 0x343929,
  leather: 0x5d3f2c,
  darkLeather: 0x2f2119,
  wood: 0x5f473a,
  brass: 0xba8a48,
  black: 0x080807
}

function canvasTexture(base = '#aeb3b6', specks = ['#ffffff33', '#0000003a', '#866d4f44']) {
  const texCanvas = document.createElement('canvas')
  texCanvas.width = 128
  texCanvas.height = 128
  const ctx = texCanvas.getContext('2d')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 720; i += 1) {
    ctx.fillStyle = specks[Math.floor(Math.random() * specks.length)]
    const size = Math.random() * 2.8 + 0.4
    ctx.fillRect(Math.random() * 128, Math.random() * 128, size, size)
  }
  for (let y = 0; y < 128; y += 7) {
    ctx.strokeStyle = 'rgba(0,0,0,0.055)'
    ctx.beginPath()
    ctx.moveTo(0, y + Math.random() * 3)
    ctx.lineTo(128, y + Math.random() * 3)
    ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(texCanvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

const metalTexture = canvasTexture('#aeb3b6')
const clothTexture = canvasTexture('#bdb7aa', ['#ffffff22', '#00000030', '#6b543a38'])
const leatherTexture = canvasTexture('#5d3f2c', ['#d7b58422', '#00000044', '#2c1a133d'])

const materials = {
  metal: new THREE.MeshStandardMaterial({ color: palette.steel, roughness: 0.58, metalness: 0.72, map: metalTexture }),
  darkMetal: new THREE.MeshStandardMaterial({ color: palette.darkSteel, roughness: 0.68, metalness: 0.58 }),
  edge: new THREE.MeshStandardMaterial({ color: palette.edgeSteel, roughness: 0.42, metalness: 0.82 }),
  cloth: new THREE.MeshStandardMaterial({ color: palette.cloth, roughness: 0.95, metalness: 0.02, map: clothTexture, side: THREE.DoubleSide }),
  dirtyCloth: new THREE.MeshStandardMaterial({ color: palette.dirtyCloth, roughness: 1, metalness: 0.0, map: clothTexture, side: THREE.DoubleSide }),
  olive: new THREE.MeshStandardMaterial({ color: palette.olive, roughness: 0.86, metalness: 0.02 }),
  leather: new THREE.MeshStandardMaterial({ color: palette.leather, roughness: 0.83, metalness: 0.04, map: leatherTexture }),
  darkLeather: new THREE.MeshStandardMaterial({ color: palette.darkLeather, roughness: 0.9, metalness: 0.02 }),
  wood: new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.78, metalness: 0.0 }),
  brass: new THREE.MeshStandardMaterial({ color: palette.brass, roughness: 0.55, metalness: 0.42 }),
  black: new THREE.MeshStandardMaterial({ color: palette.black, roughness: 0.8, metalness: 0.1 })
}

function addMesh(parent, geometry, material, position, rotation = [0, 0, 0], scale = [1, 1, 1], name = 'mesh') {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.scale.set(...scale)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function registerLayer(group, direction) {
  group.userData.basePosition = group.position.clone()
  group.userData.explodeDirection = new THREE.Vector3(...direction)
  layers.push(group)
}

function cylinder(radiusTop, radiusBottom, height, radial = 12, heightSeg = 1) {
  return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial, heightSeg)
}

function box(w, h, d) {
  return new THREE.BoxGeometry(w, h, d)
}

function sphere(rx, ry, rz, width = 18, height = 9) {
  const geo = new THREE.SphereGeometry(1, width, height)
  geo.scale(rx, ry, rz)
  return geo
}

function roundedBox(w, h, d, radius = 0.04, segments = 2) {
  if (THREE.RoundedBoxGeometry) return new THREE.RoundedBoxGeometry(w, h, d, segments, radius)
  return box(w, h, d)
}

function makeArmorPlate(name, position, rotation, scale, direction) {
  const group = new THREE.Group()
  group.name = name
  group.position.set(...position)
  group.rotation.set(...rotation)
  addMesh(group, sphere(1, 0.58, 0.64, 18, 9), materials.metal, [0, 0, 0], [0, 0, 0], scale, `${name} plate`)
  addMesh(group, cylinder(0.42, 0.46, 0.035, 18), materials.edge, [0, -0.39 * scale[1], 0.01], [Math.PI / 2, 0, 0], [scale[0], scale[2], 1], `${name} rim`)
  registerLayer(group, direction)
  return group
}

function makeLimb(name, side = 1) {
  const limb = new THREE.Group()
  limb.name = name

  addMesh(limb, sphere(0.26, 0.44, 0.24, 12, 8), materials.darkMetal, [0, 0.24, 0], [0, 0, 0.08 * side], [1, 1, 1], `${name} upper mail`)
  addMesh(limb, cylinder(0.23, 0.2, 0.58, 10), materials.metal, [0.02 * side, -0.1, 0], [0.08, 0, -0.06 * side], [1, 1, 0.86], `${name} vambrace`)
  addMesh(limb, sphere(0.23, 0.18, 0.21, 12, 7), materials.edge, [0.03 * side, -0.45, 0.02], [0.05, 0, 0], [1, 1, 1], `${name} elbow plate`)
  addMesh(limb, cylinder(0.18, 0.17, 0.52, 10), materials.metal, [0.02 * side, -0.78, 0], [0.05, 0, 0.05 * side], [1, 1, 0.9], `${name} forearm`)
  addMesh(limb, roundedBox(0.28, 0.2, 0.22), materials.leather, [0.02 * side, -1.09, 0.03], [0.1, 0, -0.1 * side], [1, 1, 1], `${name} glove`)

  registerLayer(limb, [side * 0.9, 0.18, 0.18])
  return limb
}

function makeLeg(name, side = 1) {
  const leg = new THREE.Group()
  leg.name = name

  addMesh(leg, cylinder(0.22, 0.2, 0.68, 10), materials.olive, [0, 0.25, 0], [0.02, 0, 0.03 * side], [1, 1, 0.86], `${name} hose`)
  addMesh(leg, sphere(0.25, 0.2, 0.22, 12, 7), materials.metal, [0, -0.16, 0.05], [0.1, 0, 0], [1, 1, 1], `${name} knee cop`)
  addMesh(leg, cylinder(0.19, 0.15, 0.72, 10), materials.metal, [0.01 * side, -0.62, 0], [0.04, 0, -0.02 * side], [1, 1, 0.9], `${name} greave`)
  addMesh(leg, roundedBox(0.35, 0.16, 0.72), materials.metal, [0.02 * side, -1.08, 0.18], [0.07, 0, 0], [1, 1, 1], `${name} sabaton`)

  registerLayer(leg, [side * 0.45, -0.2, 0.14])
  return leg
}

function makeRaggedCloth(name, count, width, y, z, material, direction) {
  const group = new THREE.Group()
  group.name = name
  for (let i = 0; i < count; i += 1) {
    const x0 = -width / 2 + (i / count) * width
    const x1 = -width / 2 + ((i + 0.85) / count) * width
    const tipX = (x0 + x1) / 2 + (Math.random() - 0.5) * 0.08
    const length = 0.42 + Math.random() * 0.28
    const shape = new THREE.Shape()
    shape.moveTo(x0, y)
    shape.lineTo(x1, y + Math.random() * 0.03)
    shape.lineTo(tipX, y - length)
    shape.lineTo(x0, y)
    const geo = new THREE.ShapeGeometry(shape)
    const mesh = addMesh(group, geo, material, [0, 0, z + (Math.random() - 0.5) * 0.04], [0.02 * (Math.random() - 0.5), 0, 0.08 * (Math.random() - 0.5)], [1, 1, 1], `${name} torn strip`)
    mesh.receiveShadow = true
  }
  registerLayer(group, direction)
  return group
}

function makeBeltPouch(name, scale = 1) {
  const pouch = new THREE.Group()
  pouch.name = name
  addMesh(pouch, roundedBox(0.42 * scale, 0.48 * scale, 0.17 * scale), materials.leather, [0, 0, 0], [0.02, 0.03, 0], [1, 1, 1], `${name} body`)
  addMesh(pouch, roundedBox(0.34 * scale, 0.08 * scale, 0.2 * scale), materials.darkLeather, [0, 0.13 * scale, 0.02 * scale], [0, 0, 0], [1, 1, 1], `${name} flap`)
  addMesh(pouch, box(0.045 * scale, 0.08 * scale, 0.03 * scale), materials.brass, [0, -0.02 * scale, 0.1 * scale], [0, 0, 0], [1, 1, 1], `${name} buckle`)
  return pouch
}

function makeWeapon() {
  const weapon = new THREE.Group()
  weapon.name = 'long matchlock firearm'

  addMesh(weapon, cylinder(0.035, 0.04, 3.05, 12), materials.darkMetal, [0, 0, 0], [Math.PI / 2, 0, 0], [1, 1, 1], 'dark iron barrel')
  addMesh(weapon, cylinder(0.055, 0.055, 0.95, 12), materials.darkMetal, [0, 0, 0.88], [Math.PI / 2, 0, 0], [1, 1, 1], 'thick muzzle tube')
  addMesh(weapon, roundedBox(0.16, 0.18, 1.55), materials.wood, [-0.02, -0.13, -1.0], [-0.11, 0, 0], [1, 1, 1], 'wooden stock')
  addMesh(weapon, roundedBox(0.24, 0.16, 0.7), materials.wood, [-0.08, -0.21, -1.86], [-0.35, 0, 0], [1, 1, 1], 'wide buttstock')
  addMesh(weapon, box(0.14, 0.16, 0.2), materials.darkMetal, [0.02, -0.04, -0.06], [0, 0, 0], [1, 1, 1], 'lock mechanism')
  addMesh(weapon, cylinder(0.015, 0.015, 0.42, 8), materials.brass, [0.14, -0.02, -0.08], [1.2, 0.3, 0.4], [1, 1, 1], 'curved match holder')
  addMesh(weapon, cylinder(0.018, 0.018, 1.05, 8), materials.darkMetal, [0, -0.13, 1.17], [Math.PI / 2, 0, 0], [1, 1, 1], 'bayonet rail')

  weapon.position.set(-0.05, 1.78, 0.62)
  weapon.rotation.set(1.28, 0.04, -0.76)
  registerLayer(weapon, [-0.2, 0.45, 1.55])
  return weapon
}

function buildCharacter() {
  const torso = new THREE.Group()
  torso.name = 'weathered torso armor'
  torso.position.set(0, 2.72, 0)
  addMesh(torso, sphere(0.72, 0.92, 0.43, 16, 10), materials.metal, [0, 0, 0], [0, 0, 0], [1, 1, 1], 'bellied cuirass')
  addMesh(torso, sphere(0.58, 0.35, 0.38, 16, 8), materials.metal, [0, -0.47, 0.03], [0, 0, 0], [1, 1, 1], 'fauld plate')
  addMesh(torso, cylinder(0.52, 0.55, 0.08, 20), materials.edge, [0, 0.72, 0], [Math.PI / 2, 0, 0], [1, 0.75, 1], 'gorget rim')
  addMesh(torso, cylinder(0.56, 0.64, 0.1, 18), materials.leather, [0, -0.38, 0.015], [Math.PI / 2, 0, 0], [1, 0.62, 1], 'brown waist belt')
  registerLayer(torso, [0, 0.26, 0.18])
  root.add(torso)

  const chestStrap = new THREE.Group()
  chestStrap.name = 'diagonal leather strap'
  chestStrap.position.set(0, 2.8, 0.42)
  addMesh(chestStrap, roundedBox(0.12, 1.38, 0.075), materials.leather, [0, 0, 0], [0, 0, -0.72], [1, 1, 1], 'front diagonal strap')
  addMesh(chestStrap, box(0.12, 0.12, 0.04), materials.brass, [0.35, -0.34, 0.055], [0, 0, -0.72], [1, 1, 1], 'strap brass stud')
  registerLayer(chestStrap, [0.28, 0.18, 0.75])
  root.add(chestStrap)

  const neck = new THREE.Group()
  neck.name = 'neck rings'
  neck.position.set(0, 3.53, 0)
  for (let i = 0; i < 4; i += 1) {
    addMesh(neck, cylinder(0.31 - i * 0.015, 0.32 - i * 0.015, 0.08, 18), materials.metal, [0, i * 0.07, 0], [Math.PI / 2, 0, 0], [1, 0.72, 1], 'layered gorget')
  }
  root.add(neck)

  const helmet = new THREE.Group()
  helmet.name = 'closed sallet helmet'
  helmet.position.set(0, 4.0, 0)
  addMesh(helmet, sphere(0.42, 0.48, 0.34, 18, 10), materials.metal, [0, 0.12, 0], [0.05, 0, 0], [1, 1, 1], 'rounded helmet bowl')
  addMesh(helmet, sphere(0.26, 0.16, 0.22, 14, 7), materials.edge, [0, 0.58, -0.02], [0.08, 0, 0], [1, 1, 1], 'helmet crest')
  addMesh(helmet, roundedBox(0.56, 0.24, 0.17), materials.darkMetal, [0, -0.03, 0.31], [-0.18, 0, 0], [1, 1, 1], 'sloped perforated visor')
  addMesh(helmet, cylinder(0.013, 0.013, 0.7, 8), materials.black, [-0.12, 0.01, 0.415], [Math.PI / 2, 0, Math.PI / 2], [1, 1, 1], 'visor slit')
  addMesh(helmet, cylinder(0.016, 0.016, 0.03, 8), materials.black, [-0.19, -0.08, 0.405], [Math.PI / 2, 0, 0], [1, 1, 1], 'visor hole')
  addMesh(helmet, cylinder(0.016, 0.016, 0.03, 8), materials.black, [-0.08, -0.1, 0.415], [Math.PI / 2, 0, 0], [1, 1, 1], 'visor hole')
  addMesh(helmet, cylinder(0.016, 0.016, 0.03, 8), materials.black, [0.08, -0.1, 0.415], [Math.PI / 2, 0, 0], [1, 1, 1], 'visor hole')
  addMesh(helmet, cylinder(0.016, 0.016, 0.03, 8), materials.black, [0.19, -0.08, 0.405], [Math.PI / 2, 0, 0], [1, 1, 1], 'visor hole')
  registerLayer(helmet, [0, 0.92, 0.2])
  root.add(helmet)

  const shoulderL = makeArmorPlate('left worn pauldron', [-0.73, 3.2, 0.02], [0.05, 0.06, -0.3], [0.48, 0.4, 0.36], [-0.75, 0.32, 0.18])
  const shoulderR = makeArmorPlate('right worn pauldron', [0.73, 3.2, 0.02], [0.05, -0.06, 0.3], [0.48, 0.4, 0.36], [0.75, 0.32, 0.18])
  root.add(shoulderL, shoulderR)

  const armL = makeLimb('left armored arm', -1)
  armL.position.set(-0.92, 2.68, 0.02)
  armL.rotation.set(0.07, -0.04, -0.17)
  const armR = makeLimb('right armored arm', 1)
  armR.position.set(0.92, 2.75, 0.03)
  armR.rotation.set(0.28, 0.02, 0.32)
  root.add(armL, armR)

  const handGuardL = new THREE.Group()
  handGuardL.name = 'left weapon grip hand'
  handGuardL.position.set(-0.55, 1.8, 0.57)
  handGuardL.rotation.set(0.45, 0.35, -0.45)
  addMesh(handGuardL, roundedBox(0.26, 0.18, 0.2), materials.leather, [0, 0, 0], [0, 0, 0], [1, 1, 1], 'left mitten on barrel')
  registerLayer(handGuardL, [-0.45, 0.2, 0.72])
  root.add(handGuardL)

  const handGuardR = new THREE.Group()
  handGuardR.name = 'right weapon grip hand'
  handGuardR.position.set(0.47, 2.16, 0.55)
  handGuardR.rotation.set(0.35, -0.1, 0.25)
  addMesh(handGuardR, roundedBox(0.28, 0.2, 0.22), materials.leather, [0, 0, 0], [0, 0, 0], [1, 1, 1], 'right mitten near lock')
  registerLayer(handGuardR, [0.35, 0.24, 0.72])
  root.add(handGuardR)

  const legL = makeLeg('left plated leg', -1)
  legL.position.set(-0.34, 1.34, 0)
  legL.rotation.set(0.03, 0, -0.05)
  const legR = makeLeg('right plated leg', 1)
  legR.position.set(0.34, 1.34, 0)
  legR.rotation.set(0.03, 0, 0.05)
  root.add(legL, legR)

  const tabard = makeRaggedCloth('front ragged tabard', 11, 1.18, 2.25, 0.43, materials.cloth, [0, -0.05, 0.82])
  root.add(tabard)

  const backCape = makeRaggedCloth('back torn cape', 9, 1.2, 3.12, -0.38, materials.dirtyCloth, [0, 0.14, -0.95])
  backCape.rotation.x = -0.18
  root.add(backCape)

  const skirt = new THREE.Group()
  skirt.name = 'olive skirt and mail layer'
  addMesh(skirt, cylinder(0.55, 0.68, 0.64, 12), materials.olive, [0, 1.82, 0], [0, 0, 0], [1, 1, 0.76], 'dark olive lower cloth')
  addMesh(skirt, cylinder(0.64, 0.78, 0.08, 16), materials.darkMetal, [0, 2.12, 0.01], [Math.PI / 2, 0, 0], [1, 0.62, 1], 'mail waist shadow')
  registerLayer(skirt, [0, -0.22, 0.14])
  root.add(skirt)

  const belt = new THREE.Group()
  belt.name = 'belt gear and satchels'
  addMesh(belt, cylinder(0.71, 0.73, 0.09, 20), materials.leather, [0, 2.22, 0], [Math.PI / 2, 0, 0], [1, 0.63, 1], 'wide equipment belt')
  const pouchFront = makeBeltPouch('small front pouch', 0.75)
  pouchFront.position.set(0.32, 2.14, 0.55)
  pouchFront.rotation.set(-0.08, -0.18, 0.04)
  const pouchSide = makeBeltPouch('large right satchel', 1.15)
  pouchSide.position.set(0.88, 2.0, 0.24)
  pouchSide.rotation.set(-0.08, -0.72, -0.12)
  const rearBag = makeBeltPouch('back utility bag', 0.95)
  rearBag.position.set(0.42, 2.12, -0.53)
  rearBag.rotation.set(0.12, 0.22, 0.02)
  belt.add(pouchFront, pouchSide, rearBag)
  registerLayer(belt, [0.62, 0.08, 0.56])
  root.add(belt)

  const sideTools = new THREE.Group()
  sideTools.name = 'side tools and ammunition'
  sideTools.position.set(-0.63, 2.1, -0.02)
  addMesh(sideTools, cylinder(0.035, 0.04, 0.84, 10), materials.darkLeather, [0, -0.22, 0], [0.08, 0.02, 0.02], [1, 1, 1], 'left dangling tool')
  addMesh(sideTools, cylinder(0.032, 0.032, 0.92, 10), materials.darkMetal, [0.12, -0.25, 0.08], [0.09, -0.1, -0.08], [1, 1, 1], 'side knife scabbard')
  addMesh(sideTools, box(0.08, 0.14, 0.08), materials.brass, [-0.08, 0.08, 0.06], [0, 0, 0], [1, 1, 1], 'metal clip')
  registerLayer(sideTools, [-0.78, 0.02, 0.22])
  root.add(sideTools)

  root.add(makeWeapon())
}

buildCharacter()

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
    const leftTarget = poseAlt ? -0.72 : -0.17
    const rightTarget = poseAlt ? 0.68 : 0.32
    const weaponTarget = poseAlt ? -0.42 : -0.76
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

const clock = new THREE.Clock()

function render() {
  const delta = Math.min(clock.getDelta(), 0.05)
  const elapsed = clock.elapsedTime

  if (spinEnabled && !controls.dragging) {
    root.rotation.y += delta * 0.22
  }

  root.position.y = -1.55 + Math.sin(elapsed * 1.6) * 0.018
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
