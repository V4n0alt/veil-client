declare const __VEIL_TEXTURES__: Record<string, string>;

// Imported textures are embedded at build time so moving the HTML cannot lose them.
export function textureUrl(name: string) {
  return __VEIL_TEXTURES__[name] ?? `./minecraft/${name}.png`;
}
