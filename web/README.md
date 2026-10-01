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

## layout

```
src/
  core/          framework-free logic: resume data, routing, pdf.js wrapper
  web/
    layout/      page shell: top bar, side navigation, footer
    components/  reusable pieces (entries, links, skill chart, pdf pages)
    pages/       ResumePage and the pdf ViewerPage
```
