import type { PhotoMedia } from "../components/photo";
import { getCms } from "./cms.server";

export type FamilyContent = { photo: PhotoMedia; introduction: string | null };

/** What the site says and shows of each family, from Payload, by Medusa's category id. */
export async function listFamilyContent(): Promise<Record<string, FamilyContent>> {
  const cms = await getCms();
  const { docs } = await cms.find({ collection: "families", depth: 1, limit: 100 });
  return Object.fromEntries(
    docs.map((doc) => [
      doc.category,
      { photo: doc.photo ?? null, introduction: doc.introduction || null },
    ]),
  );
}
