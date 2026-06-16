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

function createCanvasTexture(base = '#aeb3b6', specks = ['#ffffff33', '#0000003a', '#866d4f44'], seed = 11, options = {}) {
  if (typeof document === 'undefined') return null

  const rng = mulberry32(seed)
  const texCanvas = document.createElement('canvas')
  texCanvas.width = 256
  texCanvas.height = 256
  const ctx = texCanvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, 256, 256)
  gradient.addColorStop(0, base)
  gradient.addColorStop(0.45, options.mid || base)
  gradient.addColorStop(1, options.dark || '#5f6263')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  if (options.fabric) {
    ctx.globalAlpha = 0.18
    ctx.strokeStyle = '#ffffff'
    for (let y = 7; y < 256; y += 11) {
      ctx.beginPath()
      ctx.moveTo(0, y + (rng() - 0.5) * 2)
      ctx.lineTo(256, y + (rng() - 0.5) * 2)
      ctx.stroke()
    }
    ctx.strokeStyle = '#1a1712'
    for (let x = 6; x < 256; x += 13) {
      ctx.beginPath()
      ctx.moveTo(x + (rng() - 0.5) * 2, 0)
      ctx.lineTo(x + (rng() - 0.5) * 2, 256)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  if (options.wood) {
    ctx.globalAlpha = 0.33
    for (let i = 0; i < 26; i += 1) {
      ctx.strokeStyle = i % 2 ? '#2a1b13' : '#a2754a'
      ctx.lineWidth = 1 + rng() * 3
      ctx.beginPath()
      const y = rng() * 256
      ctx.moveTo(0, y)
      for (let x = 0; x <= 256; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.04 + rng() * 5) * 7)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  for (let i = 0; i < 1500; i += 1) {
    ctx.fillStyle = specks[Math.floor(rng() * specks.length)]
    const size = rng() * 2.6 + 0.45
    ctx.fillRect(rng() * 256, rng() * 256, size, size)
  }

  if (options.scratches) {
    for (let i = 0; i < 70; i += 1) {
      ctx.save()
      ctx.globalAlpha = 0.24 + rng() * 0.22
      ctx.translate(rng() * 256, rng() * 256)
      ctx.rotate((rng() - 0.5) * 1.1)
      ctx.fillStyle = rng() > 0.45 ? '#f3eee0' : '#282521'
      ctx.fillRect(0, 0, 16 + rng() * 46, 1 + rng() * 2)
      ctx.restore()
    }
  }

  if (options.mud) {
    for (let i = 0; i < 34; i += 1) {
      ctx.globalAlpha = 0.16 + rng() * 0.18
      ctx.fillStyle = rng() > 0.5 ? '#2d241c' : '#7b684d'
      ctx.beginPath()
      ctx.ellipse(rng() * 256, 190 + rng() * 70, 7 + rng() * 20, 3 + rng() * 12, rng() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  const texture = new THREE.CanvasTexture(texCanvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(options.repeatX || 1.6, options.repeatY || 1.6)
  texture.anisotropy = 4
  return texture
}

function box(w, h, d, sx = 1, sy = 1, sz = 1) {
  return new THREE.BoxGeometry(w, h, d, sx, sy, sz)
}

function sphere(rx, ry, rz, width = 16, height = 12) {
  const geo = new THREE.SphereGeometry(1, width, height)
  geo.scale(rx, ry, rz)
  return geo
}

function cylinder(radiusTop, radiusBottom, height, radial = 12, heightSeg = 1) {
  return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial, heightSeg)
}

function cone(radius, height, radial = 12) {
  return new THREE.ConeGeometry(radius, height, radial)
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
  const metalTexture = createCanvasTexture('#b4b9bd', ['#ffffff3f', '#00000042', '#856f584d'], 431, { scratches: true, dark: '#6c7172' })
  const darkMetalTexture = createCanvasTexture('#5e6365', ['#ffffff28', '#00000058', '#7c60434d'], 913, { scratches: true, dark: '#292f31' })
  const clothTexture = createCanvasTexture('#b8b0a3', ['#ffffff20', '#00000034', '#6b543a42'], 778, { fabric: true, mud: true, dark: '#706b60', repeatX: 2.2, repeatY: 2.2 })
  const greenTexture = createCanvasTexture('#424936', ['#1a21163f', '#72805740', '#11120e50'], 612, { fabric: true, mud: true, dark: '#272d21' })
  const leatherTexture = createCanvasTexture('#5d3f2c', ['#d7b58426', '#0000004a', '#2c1a1348'], 333, { mud: true, dark: '#2c1c14' })
  const woodTexture = createCanvasTexture('#6b4b35', ['#c0955a2e', '#24180f55', '#7b5a3c36'], 557, { wood: true, dark: '#2b1d15', repeatX: 1.1, repeatY: 2.6 })

  const metalBase = { roughness: 0.58, metalness: 0.74 }

  return {
    steel: new THREE.MeshStandardMaterial({ color: 0xb9bec2, ...metalBase, map: metalTexture }),
    steelLight: new THREE.MeshStandardMaterial({ color: 0xd1d5d7, roughness: 0.43, metalness: 0.86, map: metalTexture }),
    darkSteel: new THREE.MeshStandardMaterial({ color: 0x565b5e, roughness: 0.66, metalness: 0.65, map: darkMetalTexture }),
    shadowSteel: new THREE.MeshStandardMaterial({ color: 0x2f3333, roughness: 0.78, metalness: 0.42, map: darkMetalTexture }),
    edge: new THREE.MeshStandardMaterial({ color: 0xe4ded1, roughness: 0.37, metalness: 0.88 }),
    grime: new THREE.MeshStandardMaterial({ color: 0x4b3c2b, roughness: 0.96, metalness: 0.03 }),
    cloth: new THREE.MeshStandardMaterial({ color: 0xbcb4a6, roughness: 1, metalness: 0.02, map: clothTexture, side: THREE.DoubleSide }),
    dirtyCloth: new THREE.MeshStandardMaterial({ color: 0x857f70, roughness: 1, metalness: 0, map: clothTexture, side: THREE.DoubleSide }),
    olive: new THREE.MeshStandardMaterial({ color: 0x404834, roughness: 0.93, metalness: 0.01, map: greenTexture }),
    leather: new THREE.MeshStandardMaterial({ color: 0x5d3f2c, roughness: 0.86, metalness: 0.04, map: leatherTexture }),
    darkLeather: new THREE.MeshStandardMaterial({ color: 0x2d231d, roughness: 0.94, metalness: 0.02, map: leatherTexture }),
    wood: new THREE.MeshStandardMaterial({ color: 0x654631, roughness: 0.82, metalness: 0, map: woodTexture }),
    brass: new THREE.MeshStandardMaterial({ color: 0xb6884a, roughness: 0.5, metalness: 0.52 }),
    black: new THREE.MeshStandardMaterial({ color: 0x080807, roughness: 0.82, metalness: 0.1 }),
    skinTone: new THREE.MeshStandardMaterial({ color: 0x987860, roughness: 0.96, metalness: 0.01 }),
    shirtBlack: new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.88, metalness: 0.04 })
  }
}

function registerLayer(layers, group, direction) {
  group.userData.basePosition = group.position.clone()
  group.userData.explodeDirection = new THREE.Vector3(...direction)
  layers.push(group)
}

function addRivetLine(parent, materials, startX, y, z, count = 4, step = 0.09, radius = 0.014) {
  for (let i = 0; i < count; i += 1) {
    addMesh(parent, cylinder(radius, radius, 0.018, 8), materials.edge, [startX + i * step, y, z], [Math.PI / 2, 0, 0], [1, 1, 1], 'raised rivet')
  }
}

function addRivetGrid(parent, materials, xs, ys, z, radius = 0.011) {
  xs.forEach((x) => ys.forEach((y) => addMesh(parent, cylinder(radius, radius, 0.02, 8), materials.edge, [x, y, z], [Math.PI / 2, 0, 0], [1, 1, 1], 'grid rivet')))
}

function addArmorScuffs(parent, materials, rng, width = 8, center = [0, 0, 0.38]) {
  for (let i = 0; i < width; i += 1) {
    const scratch = addMesh(
      parent,
      box(0.05 + rng() * 0.14, 0.006, 0.009),
      materials.edge,
      [center[0] + (rng() - 0.5) * 0.58, center[1] + (rng() - 0.5) * 0.42, center[2] + rng() * 0.03],
      [0, 0, (rng() - 0.5) * 1.75],
      [1, 1, 1],
      'bright armor scratch'
    )
    scratch.material = materials.edge.clone()
    scratch.material.opacity = 0.58
    scratch.material.transparent = true
  }
}

function addMudStains(parent, materials, rng, amount = 6, width = 0.5, y = -0.45, z = 0.34) {
  for (let i = 0; i < amount; i += 1) {
    const stain = addMesh(parent, box(0.08 + rng() * 0.16, 0.025 + rng() * 0.055, 0.011), materials.grime, [(rng() - 0.5) * width, y + rng() * 0.18, z], [0, 0, (rng() - 0.5) * 0.35], [1, 1, 1], 'mud stain')
    stain.material = materials.grime.clone()
    stain.material.opacity = 0.78
    stain.material.transparent = true
  }
}

function addPlateTrim(parent, materials, w, h, z, yOffset = 0, name = 'plate trim') {
  addMesh(parent, box(w, 0.045, 0.035), materials.edge, [0, yOffset + h / 2, z], [0, 0, 0], [1, 1, 1], `${name} top`)
  addMesh(parent, box(w, 0.045, 0.035), materials.edge, [0, yOffset - h / 2, z], [0, 0, 0], [1, 1, 1], `${name} bottom`)
  addMesh(parent, box(0.045, h, 0.035), materials.edge, [-w / 2, yOffset, z], [0, 0, 0], [1, 1, 1], `${name} left`)
  addMesh(parent, box(0.045, h, 0.035), materials.edge, [w / 2, yOffset, z], [0, 0, 0], [1, 1, 1], `${name} right`)
}

function addJointSocket(parent, materials, position, side = 1, name = 'joint socket') {
  addMesh(parent, cylinder(0.16, 0.16, 0.18, 14), materials.shadowSteel, position, [0, 0, Math.PI / 2], [1, 1, 1], name)
  addMesh(parent, cylinder(0.19, 0.19, 0.035, 14), materials.leather, [position[0] - 0.02 * side, position[1], position[2] + 0.01], [0, 0, Math.PI / 2], [1, 1, 1], `${name} leather gasket`)
}

function makeRaggedCloth(name, count, width, y, z, material, direction, layers, rng, options = {}) {
  const group = new THREE.Group()
  group.name = name

  for (let i = 0; i < count; i += 1) {
    const x0 = -width / 2 + (i / count) * width
    const x1 = -width / 2 + ((i + 0.84) / count) * width
    const tipX = (x0 + x1) / 2 + (rng() - 0.5) * 0.1
    const length = (options.length || 0.5) + rng() * (options.variation || 0.34)
    const shape = new THREE.Shape()
    shape.moveTo(x0, y)
    shape.lineTo(x1, y + rng() * 0.02)
    shape.lineTo(tipX, y - length)
    shape.lineTo(x0, y)

    const strip = addMesh(group, new THREE.ShapeGeometry(shape), material, [0, 0, z + (rng() - 0.5) * 0.04], [0.02 * (rng() - 0.5), 0, 0.1 * (rng() - 0.5)], [1, 1, 1], `${name} torn strip`)
    strip.userData.isClothStrip = true

    if (i % 2 === 0) {
      addMesh(group, box(0.025, length * 0.62, 0.01), material, [(x0 + x1) / 2, y - length * 0.3, z + 0.015], [0, 0, 0.06 * (rng() - 0.5)], [1, 1, 1], `${name} stitched seam`)
    }
  }

  addMesh(group, box(width * 0.9, 0.045, 0.035), material, [0, y - 0.03, z + 0.02], [0, 0, 0], [1, 1, 1], `${name} cloth waistband seam`)
  registerLayer(layers, group, direction)
  return group
}

function makeBeltPouch(name, scale, materials) {
  const pouch = new THREE.Group()
  pouch.name = name
  addMesh(pouch, box(0.42 * scale, 0.48 * scale, 0.17 * scale), materials.leather, [0, 0, 0], [0.02, 0.03, 0], [1, 1, 1], `${name} blocky leather body`)
  addMesh(pouch, box(0.38 * scale, 0.1 * scale, 0.2 * scale), materials.darkLeather, [0, 0.16 * scale, 0.02 * scale], [0, 0, 0], [1, 1, 1], `${name} heavy flap`)
  addMesh(pouch, box(0.05 * scale, 0.09 * scale, 0.03 * scale), materials.brass, [0, -0.03 * scale, 0.1 * scale], [0, 0, 0], [1, 1, 1], `${name} buckle`)
  addMesh(pouch, box(0.36 * scale, 0.028 * scale, 0.02 * scale), materials.darkLeather, [0, -0.18 * scale, 0.1 * scale], [0, 0, 0], [1, 1, 1], `${name} lower seam`)
  addRivetLine(pouch, materials, -0.12 * scale, 0.21 * scale, 0.09 * scale, 4, 0.08 * scale, 0.011 * scale)
  return pouch
}

function makeChainmailPatch(name, materials, width = 0.68, rows = 5, cols = 8) {
  const group = new THREE.Group()
  group.name = name
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = -width / 2 + (col / (cols - 1)) * width + (row % 2) * 0.018
      const y = -row * 0.052
      addMesh(group, cylinder(0.018, 0.018, 0.008, 8), materials.darkSteel, [x, y, 0], [Math.PI / 2, 0, 0], [1, 0.68, 1], 'chainmail ring')
    }
  }
  return group
}

export function createRobloxR15Knight() {
  const rng = mulberry32(91337)
  const materials = createMaterials()
  const layers = []

  const root = new THREE.Group()
  root.name = 'Roblox Dark Fantasy Mercenary Commander'
  root.position.y = -1.52
  root.userData.robloxRig = 'Strict Roblox R15 block silhouette: rectangular limbs, flat box torso, cylindrical head with armor layered on top'

  const robloxBase = new THREE.Group()
  robloxBase.name = 'roblox base body silhouette'
  addMesh(robloxBase, box(1.26, 1.18, 0.52), materials.shirtBlack, [0, 2.78, 0], [0, 0, 0], [1, 1, 1], 'roblox base torso block')
  addMesh(robloxBase, box(0.42, 1.26, 0.42), materials.skinTone, [-0.97, 2.72, 0], [0, 0, 0], [1, 1, 1], 'roblox base left arm block')
  addMesh(robloxBase, box(0.42, 1.26, 0.42), materials.skinTone, [0.97, 2.72, 0], [0, 0, 0], [1, 1, 1], 'roblox base right arm block')
  addMesh(robloxBase, box(0.44, 1.45, 0.44), materials.shirtBlack, [-0.38, 1.38, 0], [0, 0, 0], [1, 1, 1], 'roblox base left leg block')
  addMesh(robloxBase, box(0.44, 1.45, 0.44), materials.shirtBlack, [0.38, 1.38, 0], [0, 0, 0], [1, 1, 1], 'roblox base right leg block')
  root.add(robloxBase)

  const torso = new THREE.Group()
  torso.name = 'roblox-r15 torso armor'
  torso.position.set(0, 2.74, 0)
  addMesh(torso, box(1.3, 1.2, 0.56), materials.darkSteel, [0, 0.02, 0], [0, 0, 0], [1, 1, 1], 'strict r15 flat torso armor shell')
  addMesh(torso, box(1.2, 0.95, 0.08), materials.steelLight, [0, 0.14, 0.31], [0, 0, 0], [1, 1, 1], 'flat chest plate overlay')
  addMesh(torso, box(1.06, 0.2, 0.12), materials.black, [0, 0.58, 0.25], [0, 0, 0], [1, 1, 1], 'aggressive chest shadow visor strip')
  addMesh(torso, box(1.06, 0.34, 0.5), materials.steel, [0, -0.62, 0], [0, 0, 0], [1, 1, 1], 'block waist armor segment')
  addPlateTrim(torso, materials, 1.24, 1.12, 0.345, 0.05, 'cuirass bright trim')
  addMesh(torso, cylinder(0.6, 0.62, 0.09, 20), materials.edge, [0, 0.69, 0], [Math.PI / 2, 0, 0], [1, 0.62, 1], 'wide gorget rim')
  addMesh(torso, box(1.36, 0.18, 0.62), materials.leather, [0, -0.42, 0.025], [0, 0, 0], [1, 1, 1], 'thick connected waist belt')
  addMesh(torso, box(1.36, 0.06, 0.65), materials.brass, [0, -0.32, 0.04], [0, 0, 0], [1, 1, 1], 'belt brass top trim')
  addArmorScuffs(torso, materials, rng, 16)
  addMudStains(torso, materials, rng, 8, 0.9, -0.7, 0.33)
  addRivetGrid(torso, materials, [-0.49, -0.34, 0.34, 0.49], [0.45, 0.2, -0.04], 0.35)
  registerLayer(layers, torso, [0, 0.26, 0.18])
  root.add(torso)

  const chestStrap = new THREE.Group()
  chestStrap.name = 'cross-body commander strap harness'
  chestStrap.position.set(0, 2.85, 0.36)
  addMesh(chestStrap, box(0.15, 1.7, 0.08), materials.leather, [0.2, -0.02, 0], [0, 0, -0.78], [1, 1, 1], 'front diagonal leather strap')
  addMesh(chestStrap, box(0.12, 1.42, 0.08), materials.darkLeather, [-0.18, -0.02, -0.02], [0, 0, 0.76], [1, 1, 1], 'counter leather strap')
  addMesh(chestStrap, box(0.12, 0.14, 0.05), materials.brass, [0.47, -0.35, 0.06], [0, 0, -0.72], [1, 1, 1], 'strap square buckle')
  addMesh(chestStrap, box(0.16, 0.19, 0.045), materials.brass, [-0.28, 0.31, 0.035], [0, 0, 0.76], [1, 1, 1], 'upper strap clasp')
  addRivetLine(chestStrap, materials, 0.34, -0.11, 0.055, 3)
  registerLayer(layers, chestStrap, [0.28, 0.18, 0.75])
  root.add(chestStrap)

  const neck = new THREE.Group()
  neck.name = 'connected neck gorget rings'
  neck.position.set(0, 3.54, 0)
  for (let i = 0; i < 5; i += 1) {
    addMesh(neck, cylinder(0.36 - i * 0.018, 0.38 - i * 0.018, 0.082, 20), i % 2 ? materials.darkSteel : materials.steel, [0, i * 0.062, 0], [Math.PI / 2, 0, 0], [1, 0.7, 1], 'stacked articulated gorget')
  }
  addMesh(neck, box(0.34, 0.22, 0.34), materials.shadowSteel, [0, -0.03, 0], [0, 0, 0], [1, 1, 1], 'dark neck connector core')
  root.add(neck)

  const helmet = new THREE.Group()
  helmet.name = 'closed sallet helmet'
  helmet.position.set(0, 4.02, 0)
  addMesh(helmet, cylinder(0.31, 0.33, 0.74, 20), materials.shadowSteel, [0, 0.1, 0], [0, 0, 0], [1, 1, 1], 'roblox cylindrical head armor shell')
  addMesh(helmet, box(0.74, 0.06, 0.74), materials.black, [0, 0.43, 0], [0, 0, 0], [1, 1, 1], 'dark brim hat plate')
  addMesh(helmet, cylinder(0.22, 0.24, 0.16, 16), materials.black, [0, 0.52, 0], [0, 0, 0], [1, 1, 1], 'hat crown')
  addMesh(helmet, box(0.68, 0.24, 0.16), materials.darkSteel, [0, 0.04, 0.3], [-0.18, 0, 0], [1, 1, 1], 'closed angular visor plate')
  addMesh(helmet, box(0.58, 0.15, 0.28), materials.darkSteel, [0, -0.08, 0.46], [-0.38, 0, 0], [1, 1, 1], 'projecting pointed breather snout')
  addMesh(helmet, box(0.62, 0.03, 0.025), materials.black, [0, 0.08, 0.43], [-0.18, 0, 0], [1, 1, 1], 'thin black visor slit')
  addMesh(helmet, box(0.06, 0.24, 0.035), materials.edge, [0, 0.02, 0.44], [-0.18, 0, 0], [1, 1, 1], 'visor center nasal ridge')
  const holes = [-0.21, -0.12, -0.04, 0.04, 0.12, 0.21]
  holes.forEach((x, index) => {
    addMesh(helmet, cylinder(0.014, 0.014, 0.03, 8), materials.black, [x, -0.1 - (index % 2) * 0.04, 0.5], [Math.PI / 2, 0, 0], [1, 1, 1], 'visor breathing hole')
  })
  addRivetLine(helmet, materials, -0.2, 0.25, 0.36, 6, 0.08, 0.012)
  addArmorScuffs(helmet, materials, rng, 7, [0, 0.14, 0.35])
  helmet.scale.setScalar(1.12)
  registerLayer(layers, helmet, [0, 0.92, 0.2])
  root.add(helmet)

  function makePauldron(name, side) {
    const pauldron = new THREE.Group()
    pauldron.name = name
    addMesh(pauldron, box(0.56, 0.24, 0.46), materials.steel, [0, 0, 0], [0.02, 0, 0.16 * side], [1, 1, 1], 'sharp block pauldron main plate')
    addMesh(pauldron, box(0.48, 0.16, 0.4), materials.steelLight, [0.02 * side, -0.17, 0.02], [0.03, 0, 0.14 * side], [1, 1, 1], 'lower angular shoulder lame')
    addMesh(pauldron, box(0.43, 0.13, 0.34), materials.darkSteel, [0.04 * side, -0.3, 0.02], [0.04, 0, 0.12 * side], [1, 1, 1], 'second lower angular lame')
    addMesh(pauldron, box(0.42, 0.045, 0.37), materials.edge, [0, -0.16, 0.17], [0, 0, 0], [1, 1, 1], 'bright pauldron edge seam')
    addMesh(pauldron, box(0.2, 0.08, 0.24), materials.darkLeather, [0.1 * side, -0.28, -0.02], [0, 0, 0.3 * side], [1, 1, 1], 'visible shoulder strap pad')
    addMesh(pauldron, box(0.12, 0.1, 0.28), materials.edge, [0.28 * side, -0.04, 0.08], [0, 0, 0.52 * side], [1, 1, 1], 'aggressive shoulder horn')
    addRivetLine(pauldron, materials, -0.13, -0.03, 0.24, 4, 0.085)
    addArmorScuffs(pauldron, materials, rng, 5, [0, -0.02, 0.22])
    return pauldron
  }

  const shoulderL = makePauldron('left worn pauldron', -1)
  shoulderL.position.set(-0.92, 3.24, 0.02)
  shoulderL.rotation.set(0.02, 0.03, -0.1)
  registerLayer(layers, shoulderL, [-0.75, 0.32, 0.18])

  const shoulderR = makePauldron('right worn pauldron', 1)
  shoulderR.position.set(0.92, 3.24, 0.02)
  shoulderR.rotation.set(0.02, -0.03, 0.1)
  registerLayer(layers, shoulderR, [0.75, 0.32, 0.18])

  root.add(shoulderL, shoulderR)

  function makeArm(name, side = 1) {
    const arm = new THREE.Group()
    arm.name = name

    addJointSocket(arm, materials, [0.02 * side, 0.58, 0], side, `${name} shoulder connector`)
    addMesh(arm, box(0.42, 0.62, 0.42), materials.darkSteel, [0, 0.24, 0], [0, 0, 0], [1, 1, 1], `${name} roblox upper arm block armor`)
    addMesh(arm, box(0.44, 0.2, 0.44), materials.steelLight, [0, -0.08, 0], [0, 0, 0], [1, 1, 1], `${name} square elbow couter cap`)
    addMesh(arm, box(0.4, 0.54, 0.4), materials.steel, [0, -0.36, 0], [0, 0, 0], [1, 1, 1], `${name} block forearm vambrace`)
    addMesh(arm, box(0.39, 0.46, 0.39), materials.steel, [0, -0.82, 0], [0, 0, 0], [1, 1, 1], `${name} lower box vambrace`)
    addMesh(arm, box(0.4, 0.24, 0.33), materials.darkLeather, [0, -1.1, 0.02], [0, 0, 0], [1, 1, 1], `${name} square glove`)
    addMesh(arm, box(0.13, 0.7, 0.09), materials.darkLeather, [0.14 * side, -0.2, 0.21], [0, 0, 0], [1, 1, 1], `${name} connected vambrace strap`)
    addMesh(arm, box(0.38, 0.05, 0.35), materials.edge, [0, -0.56, 0.19], [0, 0, 0], [1, 1, 1], `${name} bright arm plate seam`)
    addRivetLine(arm, materials, -0.1, 0.02, 0.17, 4, 0.067)
    addArmorScuffs(arm, materials, rng, 6, [0, -0.3, 0.18])
    registerLayer(layers, arm, [side * 0.9, 0.18, 0.18])
    return arm
  }

  const armL = makeArm('left armored arm', -1)
  armL.position.set(-0.98, 2.74, 0.02)
  armL.rotation.set(0.02, 0, -0.03)

  const armR = makeArm('right armored arm', 1)
  armR.position.set(0.98, 2.74, 0.02)
  armR.rotation.set(0.1, 0.01, 0.08)

  root.add(armL, armR)

  function makeLeg(name, side = 1) {
    const leg = new THREE.Group()
    leg.name = name
    addMesh(leg, box(0.44, 0.74, 0.44), materials.olive, [0, 0.3, 0], [0, 0, 0], [1, 1, 1], `${name} roblox thigh block cloth`)
    addMesh(leg, box(0.45, 0.18, 0.44), materials.steelLight, [0, -0.12, 0.02], [0, 0, 0], [1, 1, 1], `${name} square knee cap`)
    addMesh(leg, box(0.42, 0.54, 0.4), materials.steel, [0, -0.38, 0.01], [0, 0, 0], [1, 1, 1], `${name} upper greave`)
    addMesh(leg, box(0.4, 0.6, 0.39), materials.steel, [0, -0.84, 0], [0, 0, 0], [1, 1, 1], `${name} lower shin armor`)
    addMesh(leg, box(0.47, 0.2, 0.66), materials.steel, [0, -1.2, 0.1], [0, 0, 0], [1, 1, 1], `${name} block sabaton boot`)
    addMesh(leg, box(0.11, 0.68, 0.09), materials.darkLeather, [0.15 * side, -0.56, 0.2], [0, 0, 0], [1, 1, 1], `${name} greave side strap`)
    addMesh(leg, box(0.38, 0.05, 0.34), materials.edge, [0, -0.6, 0.18], [0, 0, 0], [1, 1, 1], `${name} bright shin seam`)
    addRivetLine(leg, materials, -0.1, -0.26, 0.2, 4, 0.067)
    addMudStains(leg, materials, rng, 9, 0.36, -0.94, 0.2)
    registerLayer(layers, leg, [side * 0.45, -0.2, 0.14])
    return leg
  }

  const legL = makeLeg('left plated leg', -1)
  legL.position.set(-0.38, 1.4, 0)
  legL.rotation.set(0.01, 0, -0.01)

  const legR = makeLeg('right plated leg', 1)
  legR.position.set(0.38, 1.4, 0)
  legR.rotation.set(0.01, 0, 0.01)

  root.add(legL, legR)

  const chainFront = makeChainmailPatch('front visible chainmail skirt', materials, 0.98, 5, 11)
  chainFront.position.set(0, 2.21, 0.39)
  chainFront.rotation.set(0.04, 0, 0)
  registerLayer(layers, chainFront, [0, -0.04, 0.72])
  root.add(chainFront)

  const tabard = makeRaggedCloth('front ragged tabard', 14, 1.33, 2.17, 0.43, materials.cloth, [0, -0.05, 0.82], layers, rng, { length: 0.45, variation: 0.38 })
  root.add(tabard)

  const backCape = makeRaggedCloth('back torn cape', 13, 1.32, 3.1, -0.37, materials.dirtyCloth, [0, 0.14, -0.95], layers, rng, { length: 0.72, variation: 0.45 })
  backCape.rotation.x = -0.17
  addMesh(backCape, box(1.02, 0.1, 0.06), materials.darkLeather, [0, 3.02, -0.34], [0, 0, 0], [1, 1, 1], 'cape leather shoulder yoke')
  root.add(backCape)

  const beltGear = new THREE.Group()
  beltGear.name = 'belt gear and satchels'
  addMesh(beltGear, cylinder(0.78, 0.78, 0.12, 20), materials.leather, [0, 2.22, 0], [Math.PI / 2, 0, 0], [1, 0.68, 1], 'round connected equipment belt')
  addMesh(beltGear, box(1.46, 0.08, 0.09), materials.darkLeather, [0, 2.2, 0.47], [0, 0, 0], [1, 1, 1], 'front belt overlay strap')
  const pouchFront = makeBeltPouch('front utility pouch', 0.9, materials)
  pouchFront.position.set(0.3, 2.06, 0.57)
  pouchFront.rotation.set(-0.08, -0.14, 0.04)

  const pouchSide = makeBeltPouch('large right satchel', 1.35, materials)
  pouchSide.position.set(0.94, 1.97, 0.22)
  pouchSide.rotation.set(-0.08, -0.72, -0.12)

  beltGear.add(pouchFront, pouchSide)
  registerLayer(layers, beltGear, [0.62, 0.08, 0.56])
  root.add(beltGear)

  const sideTools = new THREE.Group()
  sideTools.name = 'side tools and hanging dagger'
  sideTools.position.set(-0.67, 2.06, -0.02)
  addMesh(sideTools, cylinder(0.042, 0.044, 0.72, 10), materials.darkLeather, [0, -0.14, 0], [0.08, 0.02, 0.02], [1, 1, 1], 'hanging dagger sheath')
  addMesh(sideTools, cylinder(0.03, 0.03, 0.56, 10), materials.darkSteel, [0.12, -0.12, 0.08], [0.09, -0.1, -0.08], [1, 1, 1], 'hanging dagger blade')
  addMesh(sideTools, box(0.1, 0.16, 0.1), materials.brass, [-0.08, 0.08, 0.06], [0, 0, 0], [1, 1, 1], 'dagger belt clip')
  registerLayer(layers, sideTools, [-0.78, 0.02, 0.22])
  root.add(sideTools)

  const polearm = new THREE.Group()
  polearm.name = 'front carried mercenary polearm'
  addMesh(polearm, cylinder(0.045, 0.048, 3.55, 10), materials.wood, [0, 0, 0], [Math.PI / 2, 0, 0], [1, 1, 1], 'long wooden pole shaft')
  addMesh(polearm, cylinder(0.06, 0.06, 0.38, 12), materials.darkSteel, [0, 0, 1.47], [Math.PI / 2, 0, 0], [1, 1, 1], 'spear socket collar')
  addMesh(polearm, cone(0.12, 0.56, 12), materials.edge, [0, 0, 1.86], [Math.PI / 2, 0, 0], [1, 1, 1], 'chunky spear head')
  addMesh(polearm, box(0.46, 0.06, 0.09), materials.darkLeather, [0, -0.16, -0.18], [0, 0, 0], [1, 1, 1], 'polearm grip wrap')
  addMesh(polearm, box(0.38, 0.06, 0.09), materials.darkLeather, [0, -0.16, -1.05], [0, 0, 0], [1, 1, 1], 'lower grip wrap')
  addRivetLine(polearm, materials, -0.09, -0.15, -0.2, 3, 0.08, 0.011)
  polearm.position.set(-0.04, 1.9, 0.82)
  polearm.rotation.set(1.26, 0.02, -0.48)
  registerLayer(layers, polearm, [-0.2, 0.45, 1.55])
  root.add(polearm)

  root.userData.layers = layers
  root.userData.materials = materials
  root.userData.referenceStyle = 'strict Roblox block avatar silhouette with Deepwoken-like grim armor overlays, sharp pauldrons, bandit belts, satchel and aggressive dark presentation'

  return { root, layers, materials }
}
