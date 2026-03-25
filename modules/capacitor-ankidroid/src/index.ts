import { registerPlugin } from "@capacitor/core";
import type { AnkiDroidPlugin } from "./definitions";

export type { AnkiDroidPlugin, AnkiDroidPluginCard } from "./definitions";

const AnkiDroid = registerPlugin<AnkiDroidPlugin>("AnkiDroid", {
  // No web implementation — Android only
});

export { AnkiDroid };
