import { ThemeSwitcher } from "./ThemeSwitcher";

// Site settings in the top bar's top-right corner, laid out in a row. New
// controls (e.g. the language selector) go here, ideally as SegmentedControls
// so they all look alike.
export function TopBarTools() {
  return (
    <div className="top-bar-tools">
      <ThemeSwitcher />
    </div>
  );
}
