

# webapp — Three.js Ragged Arquebus Knight

## Project Overview
- **Name**: webapp
- **Goal**: интерактивная Three.js-страница с процедурным low-poly персонажем по предоставленным референсам рыцаря/латника.
- **Main Features**:
  - Procedural 3D character assembled from Three.js primitives.
  - Roblox R15 block proportions with clean visible connections between torso, limbs, shoulders, neck and gear.
  - Weathered plate armor, upgraded closed sallet visor helmet, pauldrons, greaves and gloves.
  - Procedural canvas textures: scratched metal, dirty fabric, green under-cloth, leather, wood grain and mud stains.
  - Ragged cloth tabard/cape, chainmail skirt patches, leather belts, pouches and satchel.
  - Long matchlock / arquebus-style firearm with wooden stock, metal barrel and bayonet tip.
  - Orbit camera, zoom/pan, auto-rotation, explode view, pose switch and lighting toggle.
  - Reference image panel using the user-provided Genspark file URLs.


Reference  

<img width="512" height="512" alt="Create_a_character_concept_image_of_a_ROBLOX-style-1781626834815" src="https://github.com/user-attachments/assets/c6cc7931-411c-438d-a304-70d09bbde8e5" />


## What This Project Is
This repository is an open-source browser demo / prototype for a procedural **Three.js dark-fantasy Roblox-style knight character viewer**. The project does not rely on a hand-made 3D model as the main source: the character is assembled in code from Three.js geometry, procedural materials and canvas-generated textures.

The prototype is useful as:
- a learning example for Three.js character composition;
- a browser-based showcase for low-poly game art ideas;
- a starting point for a Roblox-inspired R15 fantasy character asset;
- an experiment in using AI-assisted coding workflows for interactive 3D web apps.

## Open Source / GitHub Setup Checklist
Recommended GitHub repository settings and community files to add before promoting the project as open source:

- **Repository description**: `Procedural Three.js Roblox-style dark fantasy knight character viewer with GLB export.`
- **Website / homepage**: link to the deployed Cloudflare Pages or Workers URL.
- **Topics / tags**:
  - `threejs`
  - `webgl`
  - `hono`
  - `typescript`
  - `vite`
  - `cloudflare-pages`
  - `roblox`
  - `roblox-r15`
  - `low-poly`
  - `procedural-generation`
  - `3d-character`
  - `game-art`
  - `gltf`
  - `glb-export`
  - `open-source`
  - `ai-assisted`
  - `gpt-5-2`
- **License**: add an OSI-approved license file, for example `MIT` for simple reuse or `Apache-2.0` if patent language is desired.
- **Contributing guide**: add `CONTRIBUTING.md` with setup, coding style, issue workflow and PR expectations.
- **Code of conduct**: add `CODE_OF_CONDUCT.md` if outside contributors are welcome.
- **Security policy**: add `SECURITY.md` with responsible disclosure instructions.
- **Issue templates**: add templates for bugs, feature requests and asset/model improvement requests.
- **Pull request template**: include checklist items for screenshots, build verification and browser testing.
- **Screenshots / preview GIF**: add a `docs/` or `media/` folder with a rendered screenshot, turntable GIF or short video.
- **Roadmap**: track GLTF export polish, rigging, animation clips, UV texture workflow and production model replacement.

## AI-Assisted Development Note
This prototype was built and tested as an AI-assisted coding experiment. The project can mention that GPT-5.2 was used during experimentation/prototyping, while keeping the repository focused on the actual source code, reproducible build steps and open-source contribution workflow.

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
5. Use the GLB download button to export the current procedural character as a binary glTF file.

## Features Not Yet Implemented
- Export to GLB/GLTF.
- Full skeletal animation rig.
- Texture painting from actual UV maps.
- Loading a hand-made production 3D model file.
- Browser-side export settings panel for scale, pose and texture size.

## Recommended Next Steps
- Add a GLTF export button if the model needs to be reused in Blender/Unity.
- Add a `LICENSE` file and GitHub community health files before inviting contributors.
- Add screenshots and a deployed demo link to the top of this README.
- Polish the GLB export workflow for Blender/Unity/Roblox Studio handoff.
- Replace procedural primitives with a sculpted GLB model for higher fidelity.
- Add animation clips such as idle breathing, weapon raise, and turntable showcase.

## Deployment
- **Platform**: Cloudflare Pages / Workers-compatible Hono app.
- **Status**: local sandbox development ready.
- **Tech Stack**: Hono + TypeScript + Three.js CDN + CSS.
- **Last Updated**: 2026-06-16
- **Last Updated**: 2026-06-21

## 2026-06-16 Reference Upgrade
- Reworked the helmet into a proper closed sallet with angular beaked visor, thin eye slit, nasal ridge, rivets and breathing holes.
- Added stronger Roblox-style block connections: shoulder sockets, leather gaskets, belts, trims and articulated gorget rings.
- Added more reference-matching detail: layered shoulder lames, raised breastplate, chainmail rings, torn cloth strips, mud, scratches, pouches, ammo box and weapon details.
- Updated the reference panel to use the provided image URLs: `dGAXima5` and `m8RrKN7p`.
