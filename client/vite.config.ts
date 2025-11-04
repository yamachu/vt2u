import react from "@vitejs/plugin-react";
import { copyFile, glob, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { defineConfig } from "vite";

// Custom plugin to copy vtlib files to public directory
function copyVtlibFiles() {
  return {
    name: "copy-vtlib-files",
    async buildStart() {
      const sourcePath = "../vtlib/bin/Release/net9.0/publish/wwwroot";
      const targetPath = "./public/vtlib";

      try {
        // Ensure target directory exists
        await mkdir(targetPath, { recursive: true });

        // Get all files using glob
        const files = glob("**/*", {
          cwd: sourcePath,
        });

        const copyPromises = [];
        for await (const file of files) {
          const sourceFile = join(sourcePath, file);

          // Check if it's a file (not a directory)
          const stats = await stat(sourceFile);
          if (!stats.isFile()) {
            continue;
          }

          const targetFile = join(targetPath, file);

          // ディレクトリ作成とファイルコピーを非同期で実行
          copyPromises.push(
            mkdir(dirname(targetFile), { recursive: true }).then(() =>
              copyFile(sourceFile, targetFile)
            )
          );
        }

        await Promise.all(copyPromises);
        console.log(
          `✓ Copied ${copyPromises.length} files from ${sourcePath} to ${targetPath}`
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error(`⚠️  Error copying vtlib files: ${message}`);
        console.warn(`⚠️  vtlib source path not found: ${sourcePath}`);
        console.warn('   Please run "dotnet publish" in vtlib directory first');
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    copyVtlibFiles(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
