import * as THREE from 'three'

function mulberry32(seed) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function createCanvasTexture(base = '#aeb3b6', specks = ['#ffffff33', '#0000003a', '#866d4f44']) {
  if (typeof document === 'undefined') return null
  const texCanvas = document.createElement('canvas')
  texCanvas.width = 128
  texCanvas.height = 128
  const ctx = texCanvas.getContext('2d')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 820; i += 1) {
    ctx.fillStyle = specks[Math.floor(Math.random() * specks.length)]
    const size = Math.random() * 2.5 + 0.4
    ctx.fillRect(Math.random() * 128, Math.random() * 128, size, size)
  }
  const texture = new THREE.CanvasTexture(texCanvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

function box(w, h, d) {
  return new THREE.BoxGeometry(w, h, d)
}

function sphere(rx, ry, rz, width = 16, height = 12) {
  const geo = new THREE.SphereGeometry(1, width, height)
  geo.scale(rx, ry, rz)
  return geo
}

function cylinder(radiusTop, radiusBottom, height, radial = 12, heightSeg = 1) {
  return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial, heightSeg)
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

function createMaterials() {
  const metalTexture = createCanvasTexture('#aeb3b6')
  const clothTexture = createCanvasTexture('#b7b1a5', ['#ffffff22', '#00000030', '#6b543a38'])
  const leatherTexture = createCanvasTexture('#5d3f2c', ['#d7b58422', '#00000044', '#2c1a133d'])

  const metalBase = { roughness: 0.52, metalness: 0.76 }

  return {
    steel: new THREE.MeshStandardMaterial({ color: 0xbac0c4, ...metalBase, map: metalTexture }),
    darkSteel: new THREE.MeshStandardMaterial({ color: 0x62676b, roughness: 0.62, metalness: 0.62, map: metalTexture }),
    edge: new THREE.MeshStandardMaterial({ color: 0xe1ddd2, roughness: 0.36, metalness: 0.88 }),
    cloth: new THREE.MeshStandardMaterial({ color: 0xc0b8aa, roughness: 0.98, metalness: 0.03, map: clothTexture, side: THREE.DoubleSide }),
    dirtyCloth: new THREE.MeshStandardMaterial({ color: 0x8f8878, roughness: 1, metalness: 0, map: clothTexture, side: THREE.DoubleSide }),
    olive: new THREE.MeshStandardMaterial({ color: 0x424834, roughness: 0.9, metalness: 0.02 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x5d3f2c, roughness: 0.84, metalness: 0.04, map: leatherTexture }),
    darkLeather: new THREE.MeshStandardMaterial({ color: 0x2d231d, roughness: 0.92, metalness: 0.02 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x5e4738, roughness: 0.8, metalness: 0 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xb6884a, roughness: 0.48, metalness: 0.52 }),
    black: new THREE.MeshStandardMaterial({ color: 0x0a0a09, roughness: 0.8, metalness: 0.1 })
  }
}

function registerLayer(layers, group, direction) {
  group.userData.basePosition = group.position.clone()
  group.userData.explodeDirection = new THREE.Vector3(...direction)
  layers.push(group)
}

function addRivetLine(parent, materials, startX, y, z, count = 4) {
  for (let i = 0; i < count; i += 1) {
    addMesh(
      parent,
      cylinder(0.014, 0.014, 0.018, 8),
      materials.edge,
      [startX + i * 0.09, y, z],
      [Math.PI / 2, 0, 0],
      [1, 1, 1],
      'rivet'
    )
  }
}

function addArmorScuffs(parent, materials, rng, width = 8) {
  for (let i = 0; i < width; i += 1) {
    const scratch = addMesh(
      parent,
      box(0.07 + rng() * 0.11, 0.006, 0.008),
      materials.edge,
      [(rng() - 0.5) * 0.5, (rng() - 0.5) * 0.34, 0.38 + rng() * 0.03],
      [0, 0, (rng() - 0.5) * 1.6],
      [1, 1, 1],
      'armor scratch'
    )
    scratch.material = materials.edge.clone()
    scratch.material.opacity = 0.7
    scratch.material.transparent = true
  }
}

function makeRaggedCloth(name, count, width, y, z, material, direction, layers, rng) {
  const group = new THREE.Group()
  group.name = name

  for (let i = 0; i < count; i += 1) {
    const x0 = -width / 2 + (i / count) * width
    const x1 = -width / 2 + ((i + 0.84) / count) * width
    const tipX = (x0 + x1) / 2 + (rng() - 0.5) * 0.08
    const length = 0.42 + rng() * 0.32
    const shape = new THREE.Shape()
    shape.moveTo(x0, y)
    shape.lineTo(x1, y + rng() * 0.02)
    shape.lineTo(tipX, y - length)
    shape.lineTo(x0, y)

    addMesh(
      group,
      new THREE.ShapeGeometry(shape),
      material,
      [0, 0, z + (rng() - 0.5) * 0.03],
      [0.02 * (rng() - 0.5), 0, 0.08 * (rng() - 0.5)],
      [1, 1, 1],
      `${name} strip`
    )
  }

  registerLayer(layers, group, direction)
  return group
}

function makeBeltPouch(name, scale, materials) {
  const pouch = new THREE.Group()
  pouch.name = name
  addMesh(pouch, box(0.42 * scale, 0.48 * scale, 0.17 * scale), materials.leather, [0, 0, 0], [0.02, 0.03, 0], [1, 1, 1], `${name} body`)
  addMesh(pouch, box(0.34 * scale, 0.08 * scale, 0.2 * scale), materials.darkLeather, [0, 0.14 * scale, 0.02 * scale], [0, 0, 0], [1, 1, 1], `${name} flap`)
  addMesh(pouch, box(0.05 * scale, 0.09 * scale, 0.03 * scale), materials.brass, [0, -0.02 * scale, 0.1 * scale], [0, 0, 0], [1, 1, 1], `${name} buckle`)
  addRivetLine(pouch, materials, -0.09 * scale, 0.18 * scale, 0.09 * scale, 3)
  return pouch
}

export function createRobloxR15Knight() {
  const rng = mulberry32(91337)
  const materials = createMaterials()
  const layers = []

  const root = new THREE.Group()
  root.name = 'Roblox R15 Ragged Arquebus Knight'
  root.position.y = -1.52
  root.userData.robloxRig = 'R15'

  const torso = new THREE.Group()
  torso.name = 'roblox-r15 torso armor'
  torso.position.set(0, 2.74, 0)
  addMesh(torso, box(1.18, 1.24, 0.58), materials.steel, [0, 0.02, 0], [0, 0, 0], [1, 1, 1], 'r15 upper torso plate')
  addMesh(torso, box(1.1, 0.72, 0.5), materials.steel, [0, -0.67, 0], [0.03, 0, 0], [1, 1, 1], 'r15 lower torso plate')
  addMesh(torso, cylinder(0.56, 0.6, 0.08, 18), materials.edge, [0, 0.69, 0], [Math.PI / 2, 0, 0], [1, 0.8, 1], 'gorget rim')
  addMesh(torso, box(1.28, 0.16, 0.58), materials.leather, [0, -0.44, 0.02], [0, 0, 0], [1, 1, 1], 'waist belt')
  addArmorScuffs(torso, materials, rng, 10)
  addRivetLine(torso, materials, -0.22, 0.5, 0.3, 6)
  registerLayer(layers, torso, [0, 0.26, 0.18])
  root.add(torso)

  const chestStrap = new THREE.Group()
  chestStrap.name = 'diagonal leather straps'
  chestStrap.position.set(0, 2.85, 0.34)
  addMesh(chestStrap, box(0.13, 1.62, 0.08), materials.leather, [0.2, -0.02, 0], [0, 0, -0.78], [1, 1, 1], 'front diagonal strap')
  addMesh(chestStrap, box(0.13, 1.4, 0.08), materials.darkLeather, [-0.16, -0.02, -0.02], [0, 0, 0.76], [1, 1, 1], 'counter strap')
  addMesh(chestStrap, box(0.12, 0.14, 0.045), materials.brass, [0.47, -0.35, 0.06], [0, 0, -0.72], [1, 1, 1], 'strap buckle')
  addRivetLine(chestStrap, materials, 0.34, -0.11, 0.05, 3)
  registerLayer(layers, chestStrap, [0.28, 0.18, 0.75])
  root.add(chestStrap)

  const neck = new THREE.Group()
  neck.name = 'neck rings'
  neck.position.set(0, 3.56, 0)
  for (let i = 0; i < 4; i += 1) {
    addMesh(neck, cylinder(0.35 - i * 0.018, 0.36 - i * 0.018, 0.08, 18), materials.steel, [0, i * 0.07, 0], [Math.PI / 2, 0, 0], [1, 0.72, 1], 'layered gorget')
  }
  root.add(neck)

  const helmet = new THREE.Group()
  helmet.name = 'closed sallet helmet'
  helmet.position.set(0, 4.1, 0)
  addMesh(helmet, sphere(0.52, 0.54, 0.42, 18, 10), materials.steel, [0, 0.11, 0], [0.02, 0, 0], [1, 1, 1], 'helmet bowl')
  addMesh(helmet, sphere(0.29, 0.18, 0.24, 14, 7), materials.edge, [0, 0.62, -0.01], [0.06, 0, 0], [1, 1, 1], 'helmet crest')
  addMesh(helmet, box(0.64, 0.28, 0.2), materials.darkSteel, [0, -0.02, 0.35], [-0.2, 0, 0], [1, 1, 1], 'visor')
  addMesh(helmet, cylinder(0.013, 0.013, 0.76, 8), materials.black, [-0.14, 0.01, 0.46], [Math.PI / 2, 0, Math.PI / 2], [1, 1, 1], 'visor slit')
  const holes = [-0.22, -0.12, -0.02, 0.08, 0.18]
  holes.forEach((x) => {
    addMesh(helmet, cylinder(0.016, 0.016, 0.03, 8), materials.black, [x, -0.08, 0.445], [Math.PI / 2, 0, 0], [1, 1, 1], 'visor hole')
  })
  addRivetLine(helmet, materials, -0.12, 0.28, 0.38, 4)
  registerLayer(layers, helmet, [0, 0.92, 0.2])
  root.add(helmet)

  function makePauldron(name, side) {
    const pauldron = new THREE.Group()
    pauldron.name = name
    addMesh(pauldron, sphere(0.36, 0.24, 0.31, 16, 8), materials.steel, [0, 0, 0], [0.02, 0, 0], [1, 1, 1], 'main plate')
    addMesh(pauldron, cylinder(0.31, 0.34, 0.04, 16), materials.edge, [0, -0.14, 0.01], [Math.PI / 2, 0, 0], [1, 0.8, 1], 'rim')
    addMesh(pauldron, box(0.16, 0.08, 0.22), materials.darkLeather, [0.08 * side, -0.18, -0.02], [0, 0, 0.3 * side], [1, 1, 1], 'strap pad')
    addRivetLine(pauldron, materials, -0.09, -0.04, 0.23, 3)
    return pauldron
  }

  const shoulderL = makePauldron('left worn pauldron', -1)
  shoulderL.position.set(-0.78, 3.24, 0.02)
  shoulderL.rotation.set(0.05, 0.07, -0.28)
  registerLayer(layers, shoulderL, [-0.75, 0.32, 0.18])

  const shoulderR = makePauldron('right worn pauldron', 1)
  shoulderR.position.set(0.78, 3.24, 0.02)
  shoulderR.rotation.set(0.05, -0.07, 0.28)
  registerLayer(layers, shoulderR, [0.75, 0.32, 0.18])

  root.add(shoulderL, shoulderR)

  function makeArm(name, side = 1) {
    const arm = new THREE.Group()
    arm.name = name

    addMesh(arm, box(0.38, 0.58, 0.33), materials.darkSteel, [0, 0.24, 0], [0.04, 0, 0.06 * side], [1, 1, 1], `${name} upper arm`)
    addMesh(arm, box(0.34, 0.5, 0.29), materials.steel, [0.01 * side, -0.2, 0], [0.03, 0, -0.05 * side], [1, 1, 1], `${name} elbow plate`)
    addMesh(arm, box(0.32, 0.44, 0.26), materials.steel, [0.01 * side, -0.69, 0], [0.03, 0, 0.04 * side], [1, 1, 1], `${name} forearm`)
    addMesh(arm, box(0.31, 0.21, 0.24), materials.leather, [0.02 * side, -1.0, 0.03], [0.1, 0, -0.1 * side], [1, 1, 1], `${name} glove`)
    addMesh(arm, box(0.12, 0.62, 0.08), materials.darkLeather, [0.12 * side, -0.14, 0.2], [0.04, 0, 0], [1, 1, 1], `${name} strap`)
    addRivetLine(arm, materials, -0.09, 0.02, 0.15, 3)
    registerLayer(layers, arm, [side * 0.9, 0.18, 0.18])
    return arm
  }

  const armL = makeArm('left armored arm', -1)
  armL.position.set(-0.95, 2.72, 0.03)
  armL.rotation.set(0.07, -0.04, -0.15)

  const armR = makeArm('right armored arm', 1)
  armR.position.set(0.95, 2.78, 0.03)
  armR.rotation.set(0.27, 0.02, 0.3)

  root.add(armL, armR)

  function makeLeg(name, side = 1) {
    const leg = new THREE.Group()
    leg.name = name
    addMesh(leg, box(0.42, 0.74, 0.36), materials.olive, [0, 0.27, 0], [0.01, 0, 0.02 * side], [1, 1, 1], `${name} thigh cloth`)
    addMesh(leg, box(0.38, 0.5, 0.31), materials.steel, [0, -0.22, 0.03], [0.02, 0, 0], [1, 1, 1], `${name} knee plate`)
    addMesh(leg, box(0.34, 0.55, 0.29), materials.steel, [0.01 * side, -0.72, 0], [0.03, 0, -0.02 * side], [1, 1, 1], `${name} shin armor`)
    addMesh(leg, box(0.44, 0.18, 0.82), materials.steel, [0.02 * side, -1.1, 0.16], [0.06, 0, 0], [1, 1, 1], `${name} sabaton`)
    addMesh(leg, box(0.1, 0.62, 0.08), materials.darkLeather, [0.14 * side, -0.52, 0.18], [0.02, 0, 0], [1, 1, 1], `${name} strap`)
    addRivetLine(leg, materials, -0.08, -0.24, 0.18, 3)
    registerLayer(layers, leg, [side * 0.45, -0.2, 0.14])
    return leg
  }

  const legL = makeLeg('left plated leg', -1)
  legL.position.set(-0.37, 1.4, 0)
  legL.rotation.set(0.03, 0, -0.04)

  const legR = makeLeg('right plated leg', 1)
  legR.position.set(0.37, 1.4, 0)
  legR.rotation.set(0.03, 0, 0.04)

  root.add(legL, legR)

  const tabard = makeRaggedCloth('front ragged tabard', 12, 1.28, 2.24, 0.37, materials.cloth, [0, -0.05, 0.82], layers, rng)
  root.add(tabard)

  const backCape = makeRaggedCloth('back torn cape', 10, 1.24, 3.12, -0.33, materials.dirtyCloth, [0, 0.14, -0.95], layers, rng)
  backCape.rotation.x = -0.17
  root.add(backCape)

  const beltGear = new THREE.Group()
  beltGear.name = 'belt gear and satchels'
  addMesh(beltGear, cylinder(0.75, 0.75, 0.1, 20), materials.leather, [0, 2.22, 0], [Math.PI / 2, 0, 0], [1, 0.7, 1], 'equipment belt')
  const pouchFront = makeBeltPouch('small front pouch', 0.8, materials)
  pouchFront.position.set(0.33, 2.1, 0.54)
  pouchFront.rotation.set(-0.08, -0.18, 0.04)

  const pouchSide = makeBeltPouch('large right satchel', 1.2, materials)
  pouchSide.position.set(0.91, 1.97, 0.22)
  pouchSide.rotation.set(-0.08, -0.72, -0.12)

  const rearBag = makeBeltPouch('back utility bag', 0.95, materials)
  rearBag.position.set(0.44, 2.08, -0.52)
  rearBag.rotation.set(0.12, 0.22, 0.02)

  beltGear.add(pouchFront, pouchSide, rearBag)
  registerLayer(layers, beltGear, [0.62, 0.08, 0.56])
  root.add(beltGear)

  const sideTools = new THREE.Group()
  sideTools.name = 'side tools and ammunition'
  sideTools.position.set(-0.67, 2.08, -0.02)
  addMesh(sideTools, cylinder(0.035, 0.04, 0.9, 10), materials.darkLeather, [0, -0.22, 0], [0.08, 0.02, 0.02], [1, 1, 1], 'hanging tool')
  addMesh(sideTools, cylinder(0.032, 0.032, 0.94, 10), materials.darkSteel, [0.12, -0.25, 0.08], [0.09, -0.1, -0.08], [1, 1, 1], 'side knife')
  addMesh(sideTools, box(0.08, 0.14, 0.08), materials.brass, [-0.08, 0.08, 0.06], [0, 0, 0], [1, 1, 1], 'metal clip')
  registerLayer(layers, sideTools, [-0.78, 0.02, 0.22])
  root.add(sideTools)

  const weapon = new THREE.Group()
  weapon.name = 'long matchlock firearm'
  addMesh(weapon, cylinder(0.037, 0.04, 3.1, 12), materials.darkSteel, [0, 0, 0], [Math.PI / 2, 0, 0], [1, 1, 1], 'barrel')
  addMesh(weapon, cylinder(0.057, 0.057, 1, 12), materials.darkSteel, [0, 0, 0.9], [Math.PI / 2, 0, 0], [1, 1, 1], 'muzzle')
  addMesh(weapon, box(0.17, 0.2, 1.6), materials.wood, [-0.02, -0.14, -0.96], [-0.1, 0, 0], [1, 1, 1], 'stock')
  addMesh(weapon, box(0.27, 0.17, 0.72), materials.wood, [-0.08, -0.22, -1.86], [-0.34, 0, 0], [1, 1, 1], 'buttstock')
  addMesh(weapon, box(0.14, 0.16, 0.2), materials.darkSteel, [0.02, -0.04, -0.08], [0, 0, 0], [1, 1, 1], 'lock')
  addMesh(weapon, cylinder(0.015, 0.015, 0.44, 8), materials.brass, [0.14, -0.02, -0.08], [1.2, 0.3, 0.4], [1, 1, 1], 'match holder')
  addMesh(weapon, box(0.11, 0.1, 0.1), materials.brass, [0.08, -0.01, 0.35], [0, 0, 0], [1, 1, 1], 'sight clamp')
  addMesh(weapon, box(0.52, 0.05, 0.08), materials.darkLeather, [0, -0.18, -0.4], [0, 0, 0], [1, 1, 1], 'weapon strap')
  weapon.position.set(-0.05, 1.8, 0.62)
  weapon.rotation.set(1.25, 0.04, -0.73)
  registerLayer(layers, weapon, [-0.2, 0.45, 1.55])
  root.add(weapon)

  root.userData.layers = layers
  root.userData.materials = materials

  return { root, layers, materials }
}
