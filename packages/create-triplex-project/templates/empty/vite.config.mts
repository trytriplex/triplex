import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  /**
   * This uses the GITHUB_REPOSITORY environment variable set in GitHub actions
   * to infer your repository name, falling back to the app name chosen when
   * generating your project.
   */
  base: "/" + process.env.GITHUB_REPOSITORY?.split("/").pop() || "{app_name}",
  plugins: [react()],
});
