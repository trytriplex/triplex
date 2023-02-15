import { exec as execCb } from "child_process";
import { promisify } from "node:util";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const exec = promisify(execCb);
const gitIgnorePath = join(process.cwd(), ".gitignore");
const packageJsonPath = join(process.cwd(), "package.json");
const tsconfigPath = join(process.cwd(), "tsconfig.json");
const examplePath = join(process.cwd(), "src");

export async function init({
  version,
  pkgManager,
}: {
  version: string;
  pkgManager: string;
}) {
  console.log("Initializing...");
  const dir = await readdir(process.cwd());

  if (dir.includes(".gitignore")) {
    // Update
    let gitIgnore = await readFile(gitIgnorePath, "utf-8");

    if (gitIgnore.includes(".triplex")) {
      // Abort
    } else {
      // Add ignore
      gitIgnore += ".triplex\n";
      await writeFile(gitIgnorePath, gitIgnore);
    }
  } else {
    // Create one
    const gitIgnore = `.triplex\nnode_modules\n`;
    await writeFile(gitIgnorePath, gitIgnore);
  }

  if (dir.includes("package.json")) {
    // Update
    const packageJson = await readFile(packageJsonPath, "utf-8");
    const parsed = JSON.parse(packageJson);

    if (!parsed.dependencies) {
      parsed.dependencies = {};
    }

    if (!parsed.scripts) {
      parsed.scripts = {};
    }

    Object.assign(parsed.scripts.editor, {
      editor: "triplex editor",
    });

    Object.assign(parsed.dependencies, {
      "@react-three/fiber": "^8.11.1",
      "@triplex/run": `^${version}`,
      "@types/react": "^18.0.0",
      "@types/three": "^0.148.0",
      "react-dom": "^18.0.0",
      react: "^18.0.0",
      three: "^0.148.0",
    });

    await writeFile(packageJsonPath, JSON.stringify(parsed, null, 2) + "\n");
  } else {
    // Create
    const packageJson = `{
  "name": "my-triplex-app",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "editor": "triplex editor"
  },
  "dependencies": {
    "@react-three/fiber": "^8.11.1",
    "@triplex/run": "${version}",
    "@types/react": "^18.0.0",
    "@types/three": "^0.148.0",
    "react-dom": "^18.0.0",
    "react": "^18.0.0",
    "three": "^0.148.0"
  }
}
`;
    await writeFile(packageJsonPath, packageJson);
  }

  if (dir.includes("tsconfig.json")) {
    // Skip
  } else {
    // Create
    const tsconfig = `{
  "compilerOptions": {
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "moduleResolution": "node",
    "skipLibCheck": true,
    "strict": true,
    "jsx": "react-jsx",
    "types": ["@react-three/fiber"]
  },
  "include": ["."],
  "exclude": ["node_modules"]
}
`;
    await writeFile(tsconfigPath, tsconfig);
  }

  if (dir.includes("src")) {
    // Skip creating an example
  } else {
    const scene = `import Box from "./box";

export default function Scene() {
  return (
    <>
      <Box />
    </>
  );
}
`;
    const box = `
import type { Vector3Tuple } from "three";

export default function Box({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="pink" />
    </mesh>
  );
}
`;

    await mkdir(examplePath);
    await writeFile(join(examplePath, "scene.tsx"), scene);
    await writeFile(join(examplePath, "box.tsx"), box);
  }

  console.log("Installing dependencies...");
  await exec(`${pkgManager} i`);

  console.log("Starting the TRIPLEX editor!");
  await exec(`${pkgManager} run editor --open src/scene.tsx`);
}
