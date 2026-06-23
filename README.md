

# Three.js Ragged Arquebus Knight

## Project Overview
- **Name**: Arquebus Knight
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


https://github.com/user-attachments/assets/1d3ae373-bbc6-4230-beae-b4128bfafc1f

<img width="512" height="512" alt="Create_a_character_concept_image_of_a_ROBLOX-style-1781626834815" src="https://github.com/user-attachments/assets/c6cc7931-411c-438d-a304-70d09bbde8e5" />


## What This Project Is
This repository is an open-source browser demo / prototype for a procedural **Three.js dark-fantasy Roblox-style knight character viewer**. The project does not rely on a hand-made 3D model as the main source: the character is assembled in code from Three.js geometry, procedural materials and canvas-generated textures.

The prototype is useful as:
- a learning example for Three.js character composition;
- a browser-based showcase for low-poly game art ideas;
- a starting point for a Roblox-inspired R15 fantasy character asset;
- an experiment in using AI-assisted coding workflows for interactive 3D web apps.

## Open Source

## AI-Assisted Development Note
This prototype was built and tested as an AI-assisted coding experiment. The project can mention that GPT-5.2 was used during experimentation/prototyping, while keeping the repository focused on the actual source code, reproducible build steps and open-source contribution workflow.

## Data Architecture
- **Data Models**: no database models; the character is procedural client-side geometry.
- **Storage Services**: none required.
- **Data Flow**: Hono serves the HTML shell and static assets; the browser imports Three.js from CDN and builds the scene locally.

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
