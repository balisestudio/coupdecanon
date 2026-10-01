import { CATALOG } from "@coupdecanon/config/shop";
import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import { createProductsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows";
import {
  type FamilyName,
  syncCatalogConventions,
  syncFamilies,
  syncTaxClasses,
  type TaxClass,
} from "./seed/catalog";
import { retrieveStore } from "./seed/store";

/** Each family's tax class: the drinks with alcohol, and the food and soft drinks. */
const TAX_CLASS_OF: Record<FamilyName, TaxClass> = {
  "Cidre & Poiré": CATALOG.taxClasses.alcohol,
  "Calvados & Apéritif": CATALOG.taxClasses.alcohol,
  Bière: CATALOG.taxClasses.alcohol,
  "Jus de fruits": CATALOG.taxClasses.food,
  Épicerie: CATALOG.taxClasses.food,
  Souvenir: CATALOG.taxClasses.other,
};

/** A stand-in product photo from Picsum, the same for a given product on every run. */
const demoThumbnail = (handle: string) =>
  `https://picsum.photos/seed/coupdecanon-${handle}/800/1000.webp`;

/** The product's photos: its main one, then any more it has. */
const demoImages = (product: DemoProduct) => [
  { url: demoThumbnail(product.handle) },
  ...(product.morePhotos ?? []).map((seed) => ({
    url: demoThumbnail(`${product.handle}-${seed}`),
  })),
];

type DemoProduct = {
  title: string;
  /** In French, like every URL of the site. */
  handle: string;
  subtitle: string;
  family: FamilyName;
  /** Format and tax-inclusive price in euros, one per variant. */
  formats: [format: string, price: number][];
  /** The introduction on its page. */
  description?: string;

  /** Seeds of more Picsum photos, after the main one. */
  morePhotos?: string[];
  domainOnly?: boolean;
};

/**
 * The shop mockup's catalog. Grocery prices and formats are placeholders the mockup left
 * blank.
 */
const PRODUCTS: DemoProduct[] = [
  {
    title: "Calvados fermier",
    handle: "calvados-fermier",
    description: "Élaboré avec les seules pommes de nos vergers, distillé et vieilli au domaine.",
    morePhotos: ["futs", "alambic"],
    subtitle: "Appellation calvados fermier, en 35 cl, 75 cl ou 1,5 l",
    family: "Calvados & Apéritif",
    formats: [
      ["35 cl", 18],
      ["75 cl", 30],
      ["1,5 l", 80],
    ],
  },
  {
    title: "Le Champoiré",
    handle: "le-champoire",
    subtitle: "Poiré demi-sec à bulles fines, 4°, 75 cl",
    family: "Cidre & Poiré",
    formats: [["75 cl", 7]],
  },
  {
    title: "L’Halbi",
    handle: "l-halbi",
    subtitle: "Moitié pomme, moitié poire, 4°, 75 cl",
    family: "Cidre & Poiré",
    formats: [["75 cl", 5]],
    domainOnly: true,
  },
  {
    title: "Cidre brut",
    handle: "cidre-brut",
    subtitle: "Assez sec, la base de toutes nos cuvées. Avec les plats salés. 5°, 75 cl",
    family: "Cidre & Poiré",
    formats: [["75 cl", 4]],
  },
  {
    title: "Cidre demi-sec",
    handle: "cidre-demi-sec",
    subtitle: "Plus fruité, pour l’apéritif et le dessert. 3 à 4°, 50 cl ou 75 cl",
    family: "Cidre & Poiré",
    formats: [
      ["50 cl", 3],
      ["75 cl", 4],
    ],
  },
  {
    title: "Jus de pomme",
    handle: "jus-de-pomme",
    subtitle: "Pur jus, ni collé ni filtré. 50 cl ou 1 l",
    family: "Jus de fruits",
    formats: [
      ["50 cl", 3],
      ["1 l", 4],
    ],
  },
  {
    title: "Jus de poire",
    handle: "jus-de-poire",
    subtitle: "Pur jus, ni collé ni filtré. 1 l",
    family: "Jus de fruits",
    formats: [["1 l", 4]],
  },
  {
    title: "Jus pomme-poire",
    handle: "jus-pomme-poire",
    subtitle: "70 % de pommes, 30 % de poires. 1 l",
    family: "Jus de fruits",
    formats: [["1 l", 4]],
  },
  {
    title: "Jus de pomme pétillant",
    handle: "jus-de-pomme-petillant",
    subtitle: "En bouteille champenoise, production limitée. 75 cl",
    family: "Jus de fruits",
    formats: [["75 cl", 5]],
  },
  {
    title: "Apéri’pom",
    handle: "aperi-pom",
    subtitle: "Notre pommeau : jus de pomme et jeune calvados de nos caves. 18°, 35 cl ou 70 cl",
    family: "Calvados & Apéritif",
    formats: [
      ["35 cl", 10],
      ["70 cl", 17],
    ],
  },
  {
    title: "Apéri’poire",
    handle: "aperi-poire",
    subtitle: "Jus de poire et jeune calvados, notes de fruits secs. 18°, 35 cl ou 70 cl",
    family: "Calvados & Apéritif",
    formats: [
      ["35 cl", 10],
      ["70 cl", 17],
    ],
  },
  {
    title: "Mignonnettes",
    handle: "mignonnettes",
    subtitle: "Calvados fermier de trois ans, en flacons de 3 cl",
    family: "Calvados & Apéritif",
    formats: [["3 cl", 6]],
  },
  {
    title: "Cid’Aigre",
    handle: "cid-aigre",
    subtitle: "Vinaigre de cidre non pasteurisé, vieilli deux ans. 50 cl",
    family: "Épicerie",
    formats: [["50 cl", 4]],
  },
  {
    title: "Vinaigre de poiré",
    handle: "vinaigre-de-poire",
    subtitle: "Vinaigre de poiré du domaine",
    family: "Épicerie",
    formats: [["50 cl", 4]],
  },
  {
    title: "Confitures fermières",
    handle: "confitures-fermieres",
    subtitle: "Avec les fruits du domaine",
    family: "Épicerie",
    formats: [["350 g", 5]],
  },
  {
    title: "Miel du domaine",
    handle: "miel-du-domaine",
    subtitle: "Récolté au domaine",
    family: "Épicerie",
    formats: [["500 g", 9]],
  },
  {
    title: "Œufs de la ferme",
    handle: "oeufs-de-la-ferme",
    subtitle: "De la basse-cour du domaine",
    family: "Épicerie",
    formats: [["Boîte de 6", 3]],
  },
  {
    title: "La Blonde de Ouézy",
    handle: "la-blonde-de-ouezy",
    subtitle: "Bière brassée au domaine avec l’eau de notre source. Non bio",
    family: "Bière",
    formats: [["33 cl", 3.5]],
  },
];

/**
 * Development only: fills the catalog with the mockup's products, published on the online
 * sales channel. Demo products already there, found by handle or title, are brought in line:
 * handle, family, tax class and tags. Run after the seed, with `pnpm seed:demo`.
 */
export default async function seedDemo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModule = container.resolve(Modules.PRODUCT);
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);

  const store = await retrieveStore(container);
  if (!store.default_sales_channel_id) throw new Error("Run the seed first");
  const [shippingProfile] = await fulfillmentModule.listShippingProfiles();
  if (!shippingProfile) throw new Error("Run the seed first");

  // Normally done by the seed; run again in case the database predates a convention.
  const taxClasses = await syncTaxClasses(container);
  const families = await syncFamilies(container);
  const { domainOnlyTagId } = await syncCatalogConventions(container);

  const catalogFields = (product: DemoProduct) => {
    const typeId = taxClasses.get(TAX_CLASS_OF[product.family]);
    const categoryId = families.get(product.family);
    if (!typeId || !categoryId) throw new Error(`"${product.family}" is missing: run the seed`);
    return {
      handle: product.handle,
      type_id: typeId,
      category_ids: [categoryId],
      // The storefront picks its featured products itself: none sits in a collection.
      collection_id: null,
      tag_ids: product.domainOnly ? [domainOnlyTagId] : [],
      ...(product.description ? { description: product.description } : {}),
    };
  };

  const existingProducts = await productModule.listProducts(
    {
      $or: [
        { handle: PRODUCTS.map((product) => product.handle) },
        { title: PRODUCTS.map((product) => product.title) },
      ],
    },
    { relations: ["images"] },
  );
  const existingOf = (product: DemoProduct) =>
    existingProducts.find((candidate) => candidate.handle === product.handle) ??
    existingProducts.find((candidate) => candidate.title === product.title);

  const present = PRODUCTS.flatMap((product) => {
    const existing = existingOf(product);
    return existing ? [{ product, existing }] : [];
  });
  if (present.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: present.map(({ product, existing }) => ({
          id: existing.id,
          ...catalogFields(product),
          // Demo products get their photos when they miss some.
          ...(existing.thumbnail && (existing.images?.length ?? 0) >= demoImages(product).length
            ? {}
            : { thumbnail: demoThumbnail(product.handle), images: demoImages(product) }),
        })),
      },
    });
    logger.info(`${present.length} demo products brought in line`);
  }

  const missing = PRODUCTS.filter((product) => !existingOf(product));
  if (!missing.length) return;

  await createProductsWorkflow(container).run({
    input: {
      products: missing.map((product) => ({
        ...catalogFields(product),
        title: product.title,
        subtitle: product.subtitle,
        thumbnail: demoThumbnail(product.handle),
        images: demoImages(product),
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile.id,
        sales_channels: [{ id: store.default_sales_channel_id as string }],
        options: [{ title: "Format", values: product.formats.map(([format]) => format) }],
        variants: product.formats.map(([format, price]) => ({
          title: format,
          options: { Format: format },
          manage_inventory: false,
          prices: [{ amount: price, currency_code: "eur" }],
        })),
      })),
    },
  });

  logger.info(`${missing.length} demo products created`);
}
