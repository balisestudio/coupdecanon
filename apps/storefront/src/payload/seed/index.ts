/**
 * Payload's seed, run with `pnpm --filter @coupdecanon/storefront seed` once Medusa is seeded
 * and running: it gives the site its starting content, from the copy the storefront had, and
 * links it to Medusa's products and families. It only fills what is empty: the team's edits
 * stay. With PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD in `.env`, it also creates that
 * admin, in development, when there is none yet.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "@payload-config";
import { type GlobalSlug, getPayload } from "payload";
import { medusa } from "../../lib/medusa.server";
import {
  AWARDS,
  common,
  estate,
  FAMILY_INTRODUCTIONS,
  FEATURED_HANDLES,
  FOOTER,
  HEADER,
  HELP,
  home,
  MINIATURES_HANDLE,
  orchard,
  orderConfirmation,
  PRODUCT_STORIES,
  productPage,
  SEARCH,
  SETTINGS,
  SHOP_PAGE,
  weddings,
} from "./content";
import { ensurePhoto, familyPhoto, PHOTOS, type PhotoKey } from "./photos";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const payload = await getPayload({ config });
const log = (message: string) => payload.logger.info(`[seed] ${message}`);

async function seedAdmin() {
  const email = process.env.PAYLOAD_ADMIN_EMAIL;
  const password = process.env.PAYLOAD_ADMIN_PASSWORD;
  if (!email || !password) return;
  const { totalDocs } = await payload.count({
    overrideAccess: true,
    collection: "users",
  });
  if (totalDocs) return;
  await payload.create({
    overrideAccess: true,
    collection: "users",
    data: { email, password, name: "Administrateur" },
  });
  log("admin created, from .env");
}

async function seedPhotos() {
  const ids = {} as Record<PhotoKey, number | null>;
  for (const [key, photo] of Object.entries(PHOTOS) as [PhotoKey, (typeof PHOTOS)[PhotoKey]][]) {
    ids[key] = await ensurePhoto(payload, { key, ...photo });
  }
  return ids;
}

/** Medusa's products and families the content points at, by handle. */
async function readMedusa() {
  const handles = [...FEATURED_HANDLES, MINIATURES_HANDLE, ...Object.keys(PRODUCT_STORIES)];
  const [{ products }, { product_categories: categories }] = await Promise.all([
    medusa.store.product.list({ handle: handles, fields: "id,handle", limit: handles.length }),
    medusa.store.category.list({
      parent_category_id: "null",
      fields: "id,handle,name",
      limit: 100,
    }),
  ]);
  const productId = (handle: string) => products.find((p) => p.handle === handle)?.id ?? null;
  return { productId, categories };
}

/** Writes a global the team has never saved. */
async function seedGlobal(slug: GlobalSlug, data: Record<string, unknown>) {
  const current = await payload.findGlobal({
    overrideAccess: true,
    slug,
    depth: 0,
  });
  if (current.updatedAt) return;
  await payload.updateGlobal({
    overrideAccess: true,
    slug,
    data: data as never,
  });
  log(`${slug} written`);
}

async function seedCollections(medusaData: Awaited<ReturnType<typeof readMedusa>>) {
  for (const award of AWARDS) {
    const { totalDocs } = await payload.count({
      overrideAccess: true,
      collection: "awards",
      where: { title: { equals: award.title } },
    });
    if (!totalDocs)
      await payload.create({
        overrideAccess: true,
        collection: "awards",
        data: award,
      });
  }

  for (const file of ["legal-notice", "terms-of-sale", "terms-of-use", "privacy"]) {
    const fixture = JSON.parse(readFileSync(path.join(dirname, "legal", `${file}.json`), "utf8"));
    const { totalDocs } = await payload.count({
      overrideAccess: true,
      collection: "legal-documents",
      where: { document: { equals: fixture.document } },
    });
    if (totalDocs) continue;
    await payload.create({
      overrideAccess: true,
      collection: "legal-documents",
      data: fixture,
    });
    log(`${fixture.title} written`);
  }

  for (const category of medusaData.categories) {
    const { totalDocs } = await payload.count({
      overrideAccess: true,
      collection: "families",
      where: { category: { equals: category.id } },
    });
    if (totalDocs) continue;
    const photo = await ensurePhoto(payload, familyPhoto(category.handle, category.name));
    await payload.create({
      overrideAccess: true,
      collection: "families",
      data: {
        category: category.id,
        name: category.name,
        photo,
        introduction: FAMILY_INTRODUCTIONS[category.handle] ?? null,
      },
    });
  }

  for (const [handle, story] of Object.entries(PRODUCT_STORIES)) {
    const product = medusaData.productId(handle);
    if (!product) continue;
    const { totalDocs } = await payload.count({
      overrideAccess: true,
      collection: "product-stories",
      where: { product: { equals: product } },
    });
    if (!totalDocs) {
      await payload.create({
        overrideAccess: true,
        collection: "product-stories",
        data: { product, ...story },
      });
    }
  }
}

await seedAdmin();
const photos = await seedPhotos();
const medusaData = await readMedusa();
const picks = {
  featured: FEATURED_HANDLES.flatMap((handle) => medusaData.productId(handle) ?? []),
  miniatures: medusaData.productId(MINIATURES_HANDLE),
};

await seedGlobal("settings", SETTINGS);
await seedGlobal("header", HEADER);
await seedGlobal("footer", FOOTER);
await seedGlobal("common", common(photos));
await seedGlobal("home", home(photos, picks));
await seedGlobal("shop", SHOP_PAGE);
await seedGlobal("product-page", productPage(photos));
await seedGlobal("estate", estate(photos));
await seedGlobal("orchard", orchard(photos));
await seedGlobal("weddings", weddings(photos, picks));
await seedGlobal("help", HELP);
await seedGlobal("search", SEARCH);
await seedGlobal("order-confirmation", orderConfirmation(photos));
await seedCollections(medusaData);

log("done");
process.exit(0);
