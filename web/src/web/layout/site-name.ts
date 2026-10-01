import { createContext } from "react";

// The owner's name, set once by the Layout so pages only name themselves
// (see PageTitle). Kept apart from components so they stay hot-reloadable.
export const SiteNameContext = createContext("");
