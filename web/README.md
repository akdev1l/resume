# resume web

The resume as a web page: Vite, TypeScript, React and [Pico CSS](https://picocss.com).

The content is fetched at runtime from `/resume.json`, the same file the LaTeX
build uses (`../src/resume.json`). Pages are routed with React Router:
`/` is the resume, `/pdf` the published pdf and `/demo/<id>` a tech demo.
GitHub Pages can't rewrite those paths, so the build also writes `404.html`, a
copy of `index.html` that boots the app for any path.

```
pnpm install
pnpm dev        # serves ../src/resume.json as /resume.json
pnpm build      # typecheck + bundle into dist/
pnpm lint       # eslint, with type-aware rules
pnpm test       # unit tests (vitest + Testing Library, in jsdom)
```

Tests sit next to the code they cover (`Foo.tsx` -> `Foo.test.tsx`). They use
the small sample resume in `src/test/fixtures.tsx`, not `resume.json`, and fake
what jsdom can't run: pdf.js, the WebAssembly game, fetch and canvas drawing.

TypeScript is pinned to `~6.0`: typescript-eslint needs TypeScript's JS API,
which TypeScript 7 (the Go port) no longer ships.

The CMake build runs `pnpm build` and stages `dist/`, `resume.json` and
`main.pdf` into `docs/`.

## tetris demo

`src/core/wasm/` holds libtetris compiled to WebAssembly by the tetris repo.
To update it, build there and copy the output over:

```
cmake --preset wasm && cmake --build --preset wasm     # in the tetris repo
cp build/wasm/wasm/tetris.{mjs,wasm} <resume>/web/src/core/wasm/
cp build/wasm/wasm/tetris.d.ts <resume>/web/src/core/wasm/tetris.d.mts
```

## stretchy face demo

`public/demos/webmface64/` is a static build of the webmface64 project, embedded on
`/demo/webmface64` in an iframe (`src/web/components/FaceStretchDemo.tsx`). The iframe
grants camera access; the demo only asks for it when its camera button is pressed, and
face tracking runs on the visitor's device. To update it, build there and copy the output
over:

```
# in the webmface64 repo, with the model in public/models/mario-head/
BUNDLE_MODELS=1 EMBED_MODEL=/demos/webmface64/models/mario-head/MarioHead.obj npm run build:embed
rm -rf <resume>/web/public/demos/webmface64/{assets,mediapipe,models,index.html}
cp -r dist-embed/. <resume>/web/public/demos/webmface64/
rm <resume>/web/public/demos/webmface64/models/mario-head/{MarioHead.dae,Highlight.png} \
   <resume>/web/public/demos/webmface64/models/.gitkeep   # unused by the OBJ
```

The build is ~27 MB, mostly the MediaPipe WebAssembly runtime and face model. The bundled
head model is Nintendo's (see `public/demos/webmface64/NOTICE.md`); leave out
`BUNDLE_MODELS`/`EMBED_MODEL` to ship the original procedural head instead.

## 3D boot splash demo

`public/demos/3dboot/` is the plymouth-3dboot web viewer (Rust compiled to WebAssembly
with Emscripten and SDL3), embedded on `/demo/3dboot` in an iframe
(`src/web/components/BootSplashDemo.tsx`). To update it, build there and copy the output
over:

```
scripts/dev.sh just viewer-web                       # in the 3dboot repo
cp target/web/{index.html,plymouth-3dboot-viewer.js,plymouth_3dboot_viewer.wasm} \
   <resume>/web/public/demos/3dboot/
```

Update `public/demos/3dboot/NOTICE.md` with the commit it was built from.

## layout

```
src/
  core/          framework-free logic: resume data, routing, pdf.js wrapper
  web/
    layout/      page shell: top bar, side navigation, footer
    components/  reusable pieces (entries, links, skill chart, pdf pages)
    pages/       ResumePage and the pdf ViewerPage
```
