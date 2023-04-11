export interface SceneMeta {
  lighting: "custom" | "default";
}

export interface SceneComponent {
  (props: unknown): JSX.Element;
  triplexMeta?: SceneMeta;
}

export type SceneModule = Record<string, SceneComponent>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentModule = Record<string, (props: any) => any>;
