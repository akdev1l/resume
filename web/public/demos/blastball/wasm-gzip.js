// Not part of the Godot export: added by the resume (see web/README.md).
//
// Cloudflare Pages takes files up to 25 MiB and the Godot engine (index.wasm)
// is ~38 MiB, so it ships gzipped as index.wasm.gz (~10 MiB). Godot's loader
// fetches index.wasm and hands the response to WebAssembly.instantiateStreaming;
// this answers that fetch with index.wasm.gz, inflated in the browser.
"use strict";

(function () {
  const fetchOriginal = window.fetch.bind(window);

  // The body as served, inflated if it is still gzip: a server that sends
  // Content-Encoding: gzip for .gz files has the browser inflate it already.
  async function inflated(response) {
    const reader = response.body.getReader();
    const first = await reader.read();
    const body = new ReadableStream({
      start(controller) {
        if (first.done) {
          controller.close();
        } else {
          controller.enqueue(first.value);
        }
      },
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      },
      cancel(reason) {
        return reader.cancel(reason);
      },
    });
    const gzipped = !first.done && first.value[0] === 0x1f && first.value[1] === 0x8b;
    return gzipped ? body.pipeThrough(new DecompressionStream("gzip")) : body;
  }

  window.fetch = async function (input, init) {
    const url = new URL(input instanceof Request ? input.url : String(input), document.baseURI);
    if (!url.pathname.endsWith("/index.wasm")) {
      return fetchOriginal(input, init);
    }
    const response = await fetchOriginal(`${url.href}.gz`, init);
    if (!response.ok) {
      return response;
    }
    return new Response(await inflated(response), {
      headers: { "Content-Type": "application/wasm" },
    });
  };
})();
