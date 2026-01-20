import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  optimizeDeps: {
    exclude: ["@react-router/node", "@react-router/dev", "@supabase/supabase-js"],
  },
});
// touch
// touch2
// touch3
// touch4
// ui-overhaul
// final-fix
// complete
