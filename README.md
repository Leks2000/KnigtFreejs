# webapp — Three.js Ragged Arquebus Knight

## Project Overview
- **Name**: webapp
- **Goal**: интерактивная Three.js-страница с процедурным low-poly персонажем по предоставленным референсам рыцаря/латника.
- **Main Features**:
  - Procedural 3D character assembled from Three.js primitives.
  - Weathered plate armor, closed visor helmet, pauldrons, greaves and gloves.
  - Ragged cloth tabard/cape, leather belts, pouches and satchel.
  - Long matchlock / arquebus-style firearm with wooden stock and metal barrel.
  - Orbit camera, zoom/pan, auto-rotation, explode view, pose switch and lighting toggle.
  - Reference image panel using the user-provided Genspark file URLs.

## Functional Entry URIs
- `/` — main interactive 3D character viewer.
- `/static/app.js` — frontend Three.js scene and interaction logic.
- `/static/style.css` — responsive UI styling.
- `/api/character-spec` — JSON summary of character parts and controls.

## Data Architecture
- **Data Models**: no database models; the character is procedural client-side geometry.
- **Storage Services**: none required.
- **Data Flow**: Hono serves the HTML shell and static assets; the browser imports Three.js from CDN and builds the scene locally.

## User Guide
1. Open `/` in a browser.
2. Drag on the canvas to rotate the camera around the character.
3. Use the mouse wheel/pinch to zoom.
4. Use buttons to pause rotation, separate armor/gear layers, switch pose, and change lighting mood.

## Features Not Yet Implemented
- Export to GLB/GLTF.
- Full skeletal animation rig.
- Texture painting from actual UV maps.
- Loading a hand-made production 3D model file.

## Recommended Next Steps
- Add a GLTF export button if the model needs to be reused in Blender/Unity.
- Replace procedural primitives with a sculpted GLB model for higher fidelity.
- Add animation clips such as idle breathing, weapon raise, and turntable showcase.

## Deployment
- **Platform**: Cloudflare Pages / Workers-compatible Hono app.
- **Status**: local sandbox development ready.
- **Tech Stack**: Hono + TypeScript + Three.js CDN + CSS.
- **Last Updated**: 2026-06-16
