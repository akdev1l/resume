import { EmbeddedDemo } from "./EmbeddedDemo";

export const SPLATBOX_URL = "https://splatbox.alexdiaz.fyi/";

// Splatbox runs on its own Worker (multiplayer signaling needs its Durable
// Objects), so unlike the other demos there is no build under public/demos/:
// the demo frames the live site, with a link to it in case the frame can't load.
export function SplatboxDemo() {
  return (
    <>
      <EmbeddedDemo
        src={SPLATBOX_URL}
        title="Splatbox game"
        aspectRatio="16 / 9"
        allow="fullscreen; gamepad; autoplay"
      />
      <p>
        <small>
          Runs live from <a href={SPLATBOX_URL}>splatbox.alexdiaz.fyi</a>; open it there if the game doesn't load here.
        </small>
      </p>
    </>
  );
}
