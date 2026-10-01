import type { Payload } from "payload";

/**
 * The site's photos, until the estate's own are shot: Picsum pictures stand in for them, at
 * about twice their largest displayed size, each described as the picture it waits for. The
 * team replaces them in Payload's library, which keeps the descriptions.
 */
export const PHOTOS = {
  harvest: { width: 640, height: 800, alt: "Des mains qui ramassent les pommes" },
  orchard: { width: 1280, height: 1600, alt: "Le verger de hautes tiges en octobre" },
  press: { width: 640, height: 800, alt: "Le pressoir pendant la pressée" },
  cellar: { width: 1040, height: 1300, alt: "La cave et ses fûts de chêne" },
  chateau: { width: 1600, height: 800, alt: "Le château de Ouézy depuis le parc" },
  famille: { width: 800, height: 1000, alt: "Héloïse et Hervé de Mézerac dans le verger" },
  pressoir: { width: 1200, height: 900, alt: "Le pressoir pneumatique pendant la pressée" },
  futs: { width: 800, height: 600, alt: "Les fûts de chêne" },
  brassage: { width: 800, height: 600, alt: "L’atelier de brassage" },
  "verger-fleurs": { width: 1000, height: 1250, alt: "Le verger en fleurs, au printemps" },
  poires: { width: 1200, height: 900, alt: "Poires à poiré tombées dans l’herbe" },
  moutons: { width: 1200, height: 900, alt: "Les moutons sous les pommiers" },
  "mariage-table": { width: 1000, height: 1250, alt: "Une mignonnette posée sur chaque assiette" },
  presentoir: { width: 1200, height: 900, alt: "Le présentoir de mignonnettes" },
  aperitif: { width: 1200, height: 900, alt: "Le Champoiré servi à l’apéritif" },
  degustation: { width: 1280, height: 960, alt: "Une dégustation à la boutique du château" },
  boutique: { width: 1280, height: 960, alt: "La boutique du château" },
  "age-gate": { width: 840, height: 1050, alt: "Le verger au lever du jour" },
  "commande-prete": { width: 800, height: 1000, alt: "Des commandes prêtes au domaine" },
} as const;

export type PhotoKey = keyof typeof PHOTOS;

/** A family's photo, in its card on the home page. */
export const familyPhoto = (handle: string, name: string) => ({
  key: `family-${handle}`,
  width: 600,
  height: 750,
  alt: `${name}, au domaine`,
});

/**
 * The library's photo for a key, added from Picsum the first time: its id, or `null` when the
 * picture can't be downloaded, the pages then showing a tinted block in its place.
 */
export async function ensurePhoto(
  payload: Payload,
  { key, width, height, alt }: { key: string; width: number; height: number; alt: string },
): Promise<number | null> {
  const filename = `${key}.webp`;
  const { docs } = await payload.find({
    overrideAccess: true,
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  });
  if (docs[0]) return docs[0].id;

  const response = await fetch(
    `https://picsum.photos/seed/coupdecanon-${key}/${width}/${height}.webp`,
  ).catch(() => null);
  if (!response?.ok) {
    payload.logger.warn(`The stand-in photo "${key}" could not be downloaded: skipped`);
    return null;
  }
  const data = Buffer.from(await response.arrayBuffer());
  const media = await payload.create({
    overrideAccess: true,
    collection: "media",
    data: { alt },
    file: { data, mimetype: "image/webp", name: filename, size: data.length },
  });
  return media.id;
}
