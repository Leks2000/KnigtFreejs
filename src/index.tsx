import { Hono } from 'hono'

const app = new Hono()

app.get('/api/character-spec', (c) => {
  return c.json({
    name: 'Roblox Dark Fantasy Mercenary Commander',
    style: 'Stylized Roblox-compatible low-poly commander with chunky armor forms, readable silhouette and game-ready third-person proportions',
    parts: [
      'oversized worn sallet/kettle hybrid helmet with slit visor and crest knob',
      'broad rounded pauldrons, narrow-waist torso, blocky forearms and boots',
      'cloth surcoat over partial chest plate with asymmetrical cross-body strap',
      'one large satchel, one utility pouch, hanging dagger and practical belt gear',
      'front-carried long polearm spear with chunky low-poly silhouette',
      'weathered steel, dirty cloth and dark leather material breakup'
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
    <title>Three.js Mercenary Commander Character</title>
    <meta name="description" content="Procedural Three.js Roblox-style dark fantasy mercenary commander character" />
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
          <h1>Mercenary Commander (Roblox)</h1>
          <p class="summary">
            Новый оригинальный dark-fantasy на Roblox-пропорциях: oversized шлем, широкие паулдроны,
            узкая талия, рваный суркоат, крупная сумка, утилитарный подсумок, кинжал и фронтальный spear/polearm.
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
            <strong>2k-4k</strong>
            <span>Triangle budget target</span>
          </article>
          <article class="stat-card">
            <strong>Low-poly</strong>
            <span>Roblox commander</span>
          </article>
          <article class="stat-card">
            <strong>Orbit</strong>
            <span>mouse/touch controls</span>
          </article>
        </section>

        <section id="reference-panel" aria-label="Provided visual references">
          <h2>Референсы</h2>
          <div class="reference-grid">
            <img src="https://www.genspark.ai/api/files/s/46PC7oET" alt="Mercenary commander armor turnaround reference" />
            <img src="https://www.genspark.ai/api/files/s/46PC7oET" alt="Mercenary commander silhouette reference" />
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
