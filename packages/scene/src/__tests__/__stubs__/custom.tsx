import { SceneObject } from "../../scene-object";

export function CustomBoxGroup({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <SceneObject
      name="custom-box-group"
      position={position}
      __meta={{
        name: "group",
        path: "custom-box.tsx",
        column: 0,
        line: 1,
        rotate: false,
        scale: false,
        // Position is statically defined therefore this is true.
        translate: true,
      }}
      __component="group"
    >
      <SceneObject
        name="custom-box-mesh"
        position={[1, 1, 1]}
        __meta={{
          name: "mesh",
          path: "custom-box.tsx",
          column: 0,
          line: 2,
          rotate: false,
          scale: false,
          translate: true,
        }}
        __component="mesh"
      >
        <boxGeometry />
      </SceneObject>
    </SceneObject>
  );
}
