export interface SceneMeta {
  lighting: "custom" | "default";
}

export interface SceneComponent {
  (props: unknown): JSX.Element;
  triplexMeta?: SceneMeta;
}

export type SceneModule = Record<string, SceneComponent>;
