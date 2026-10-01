/** Bundlers (Vite) resolve these imports to the asset's public URL. */
declare module "*?url" {
  const url: string;
  export default url;
}
