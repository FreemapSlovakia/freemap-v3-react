type IsObject<T> = T extends Record<string, unknown> ? true : false;

export type DeepPartialWithRequiredObjects<T> = {
  // Object keys: required, recursively partial inside
  [K in keyof T as IsObject<T[K]> extends true
    ? K
    : never]: DeepPartialWithRequiredObjects<T[K]>;
} & {
  // Non-object keys: optional
  [K in keyof T as IsObject<T[K]> extends false ? K : never]?: T[K];
};
