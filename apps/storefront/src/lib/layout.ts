import { createServerFn } from "@tanstack/react-start";
import { getCatalog } from "./catalog.server";
import { readGlobal } from "./cms.server";
import { listLegalLinks } from "./legal.server";
import { getShopInfo } from "./shop.server";

/**
 * What every page's header and footer render on the server: the shop's details, the header's
 * announcement and menus, the footer's newsletter and links, the age check, the families the
 * footer lists, as Medusa has them, and the legal documents.
 */
export const getLayout = createServerFn({ method: "GET" }).handler(async () => {
  const [shop, header, footer, common, legalLinks, catalog] = await Promise.all([
    getShopInfo(),
    readGlobal("header"),
    readGlobal("footer"),
    readGlobal("common"),
    listLegalLinks(),
    getCatalog(),
  ]);
  return {
    shop,
    header: {
      announcement: header.announcement || null,
      main: header.main ?? [],
      menu: header.menu ?? [],
    },
    footer: {
      newsletter: footer.newsletter,
      columns: footer.columns ?? [],
      healthWarning: footer.healthWarning,
    },
    ageGate: common.ageGate,
    families: (catalog?.families ?? []).map(({ name, slug }) => ({ name, slug })),
    legalLinks,
  };
});

export type LayoutData = Awaited<ReturnType<typeof getLayout>>;
