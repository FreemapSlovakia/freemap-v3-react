// eslint-disable-next-line
export interface Node extends Record<string, Node | string> {}

export type OsmMapping = {
  osmTagToNameMapping: Node;
  colorNames: Record<string, string>;
};
