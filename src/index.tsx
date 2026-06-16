import { Hono } from 'hono'

const app = new Hono()

app.get('/api/character-spec', (c) => {
  return c.json({
    name: 'Roblox R15 Ragged Arquebus Knight — reference upgrade',
    style: 'Roblox blocky R15 proportions with weathered low-poly medieval armor, cloth and leather detail from the provided references',
    parts: [
      'proper closed sallet helmet with beaked visor, slit, nasal ridge and breathing holes',
      'weathered plate cuirass with raised breastplate, trims, scuffs, mud and rivets',
      'connected pauldrons, shoulder sockets, arm joints and visible leather gaskets',
      'ragged cloth tabard, torn cape and chainmail skirt patches',
      'leather satchel, belt pouches, straps, buckles and ammunition box',
      'long matchlock / arquebus-style firearm with wooden texture, muzzle, lock and bayonet',
      'layered greaves, vambraces, gloves and broad sabaton boots'
    ],
    controls: ['drag to orbit', 'wheel to zoom', 'buttons for pose, explode view and lighting']
  })
})

app.get('/', (c) => {
  return c.html(`<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Three.js Ragged Knight Character</title>
    <meta name="description" content="Procedural Three.js medieval knight character based on provided references" />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ctext y='50' font-size='48'%3E%E2%9A%94%EF%B8%8F%3C/text%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://unpkg.com" />
    <link rel="stylesheet" href="/static/style.css" />
  </head>
  <body>
    <main id="experience-shell" aria-label="Interactive Three.js character viewer">
      <section id="viewport-panel" aria-label="3D viewport">
        <canvas id="character-canvas"></canvas>
        <div id="loading-card" role="status">
          <span class="loader"></span>
          <p>Собираю персонажа в Three.js...</p>
        </div>
      </section>

      <aside id="control-panel" aria-label="Character controls and reference">
        <header id="app-header">
          <p class="eyebrow">Three.js procedural model</p>
          <h1>Рваный латник с аркебузой</h1>
          <p class="summary">
            Броу, апнул модель под Roblox R15 и референс: нормальный закрытый шлем-саллет,
            аккуратные соединения блоков, латные слои, рваная ткань, сумки, ремни, грязь, царапины и длинное оружие.
          </p>
        </header>

        <nav id="actions" aria-label="Viewer actions">
          <button id="toggle-spin" class="primary-action" type="button">Пауза вращения</button>
          <button id="toggle-explode" type="button">Разобрать слои</button>
          <button id="toggle-pose" type="button">Смена позы</button>
          <button id="toggle-light" type="button">Драматичный свет</button>
          <button id="download-glb" type="button">Скачать GLB (Roblox R15)</button>
        </nav>

        <section id="stats-panel" aria-label="Character details">
          <article class="stat-card">
            <strong>100%</strong>
            <span>Procedural geometry</span>
          </article>
          <article class="stat-card">
            <strong>Low-poly</strong>
            <span>Roblox R15 knight</span>
          </article>
          <article class="stat-card">
            <strong>Orbit</strong>
            <span>mouse/touch controls</span>
          </article>
        </section>

        <section id="reference-panel" aria-label="Provided visual references">
          <h2>Референсы</h2>
          <div class="reference-grid">
            <img src="https://www.genspark.ai/api/files/s/dGAXima5" alt="Base Roblox block character reference" />
            <img src="https://www.genspark.ai/api/files/s/m8RrKN7p" alt="Full body ragged knight turnaround reference" />
          </div>
        </section>

        <section id="hint-panel" aria-label="Usage hints">
          <h2>Как крутить</h2>
          <ul>
            <li>ЛКМ / палец — вращение камеры</li>
            <li>Колёсико — зум</li>
            <li>ПКМ / два пальца — панорамирование</li>
          </ul>
        </section>
      </aside>
    </main>

    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
          "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
        }
      }
    </script>
    <script type="module" src="/static/app.js"></script>
  </body>
</html>`)
})

export default app
