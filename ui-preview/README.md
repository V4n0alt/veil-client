# Veil Client UI preview

An interactive design system and six-screen React/TypeScript prototype built from
the owner's October 10 visual brief. This is a UI study alongside the native Rust
launcher, not a replacement launcher or Minecraft mod.

## Open the ready-made preview

Open **Veil-Preview.html** in Edge, Chrome or Firefox. This single file embeds
the app, background, font and any imported item textures; no ZIP extraction or
neighboring files are needed. The folder-based `index.html` remains available
for developers and requires its adjacent files.
Everything is local, including the background image, icons and Inter font.
No development server, account, Node installation or network connection is needed
to use that built preview. Browser/file access can be restricted by managed tools;
opening the file manually does not require disabling any security protections.

## Develop

Use Node.js 24 and npm:

```sh
npm ci
npm run format:check
npm run build
npm test
npm run dev
```

The development server listens only at `http://127.0.0.1:4173`. Source changes
rebuild automatically; refresh the page to see them. `dist/index.html` is the
standalone build. Dependencies are pinned in package.json and package-lock.json.

## Layout

- `src/theme.css`: exact supplied palette, radii, typography and motion tokens.
- `src/components/ui.tsx`: buttons, icon buttons/tooltips, badges, toggles, search,
  sliders, dialogs, setting rows and shared headings.
- `src/components/Items.tsx`: original pixel-style item icons and inventory slots.
- `src/screens/`: Main Menu, Inventory, Features, HUD, Settings and Launcher.
- `src/state.tsx`: shared local preview state; Fresh profile default; privacy off.
- `src/data.ts`: module catalog samples and category definitions.
- `scripts/test-ui.mjs`: DOM interaction checks against the production bundle.

The main menu opens sample worlds, a server-address flow and cosmetic color
studies. Inventory supports item movement/swaps and a sample log-to-planks recipe.
Feature cards support search, toggling and configuration. Settings include section
reset, selectors, sliders, reduced motion/blur and higher contrast. HUD widgets
can be moved by pointer or keyboard in edit mode and reset; visibility is shared
with Settings. The launcher shares profile selection and creation across screens.

## Honest boundaries

- Fresh starts with no mods. Quality and Performance are optional intent labels;
  their future compatible contents are explained before creating a preview profile.
- No modules are enabled initially, and no controls install or download mods.
- The world, inventory, HUD readings and accounts are samples. FPS and ping are
  clearly labeled sample values, not measurements or performance claims.
- The prototype cannot launch Minecraft, collect credentials or upload data.
- Settings and profiles live in memory and reset when the page reloads.
- Real in-game inventory/HUD integration, Microsoft OAuth, loaders and native
  egui/eframe/wgpu implementation remain separate work.
- Pointer layout and responsive CSS need manual browser review. DOM tests validate
  behavior but are not browser screenshots or proof of visual rendering.

## Art and licenses

The background is original concept art generated with the built-in image tool.
It is not a Minecraft screenshot or evidence of game rendering/performance.
See `DESIGN.md` for the saved prompt and design decisions. The split-V logo and
pixel item artwork were authored in SVG/CSS for this prototype. Runtime dependency
and font licenses are included in `public/THIRD-PARTY-NOTICES.txt` and copied into
the standalone build. Veil source remains under the repository MIT license.

## Video reference refinement

The supplied clip uses compact translucent control panels with lavender outlines,
classic square inventory slots, and Minecraft's normal item textures. The preview
now uses that combination while retaining Veil's main menu and sunset artwork.
It does not recreate gameplay effects or add any mods.

For this computer's ready-made preview, 20 original PNG textures were imported
from the verified local Minecraft 1.21.1 client. They cover every displayed item,
armor piece and block. Block icons use three textured faces; item images keep
nearest-neighbor pixels. Names now use the familiar full Minecraft item names.

The game textures remain local and are excluded from Git and the repository's
MIT license. Source-only builds and GitHub CI artifacts use the original SVG
fallbacks unless you import your own cached client before building:

```powershell
./scripts/import-minecraft-textures.ps1 -ClientJar 'C:/path/to/1.21.1-client.jar'
npm run build
```

This reads only the exact official 1.21.1 JAR and a fixed list of texture entries.
It makes no network requests and does not change Minecraft or install mods.
