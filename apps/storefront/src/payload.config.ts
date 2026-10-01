import path from "node:path";
import { fileURLToPath } from "node:url";
import { SHOP } from "@coupdecanon/config/shop";
import { env } from "@coupdecanon/config/storefront-env";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { fr } from "@payloadcms/translations/languages/fr";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Awards } from "./payload/collections/awards";
import { Families } from "./payload/collections/families";
import { LegalDocuments } from "./payload/collections/legal-documents";
import { Media } from "./payload/collections/media";
import { ProductStories } from "./payload/collections/product-stories";
import { Users } from "./payload/collections/users";
import { medusaOptionsEndpoint } from "./payload/endpoints";
import { Common } from "./payload/globals/common";
import { Estate } from "./payload/globals/estate";
import { Footer } from "./payload/globals/footer";
import { Header } from "./payload/globals/header";
import { Help } from "./payload/globals/help";
import { Home } from "./payload/globals/home";
import { Orchard } from "./payload/globals/orchard";
import { OrderConfirmation } from "./payload/globals/order-confirmation";
import { ProductPage } from "./payload/globals/product-page";
import { Search } from "./payload/globals/search";
import { Settings } from "./payload/globals/settings";
import { Shop } from "./payload/globals/shop";
import { Weddings } from "./payload/globals/weddings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Payload, the site's CMS, inside the storefront: its admin at /admin, its API at /api. It
 * keeps everything the site says and shows, in its own database; Medusa keeps the commerce,
 * products, prices, stock, promotions and orders. Lists of Medusa's products and families
 * are picked from Medusa itself (see `payload/medusa.ts`).
 */
export default buildConfig({
  // The site's own address: links in the admin's e-mails, such as a password reset, lead there.
  serverURL: env.STOREFRONT_URL.replace(/\/$/, ""),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: dirname,
      importMapFile: path.resolve(dirname, "routes/_payload/importMap.js"),
    },
    meta: {
      titleSuffix: ` · ${SHOP.name}`,
      description: `L’administration du contenu de ${SHOP.name}.`,
      icons: [{ rel: "icon", type: "image/svg+xml", url: "/favicon.svg" }],
      openGraph: { siteName: SHOP.name },
    },
    components: {
      graphics: {
        Logo: "/payload/components/brand#BrandLogo",
        Icon: "/payload/components/brand#BrandIcon",
      },
    },
  },
  i18n: { supportedLanguages: { fr }, fallbackLanguage: "fr" },
  collections: [Media, Awards, LegalDocuments, Families, ProductStories, Users],
  globals: [
    Home,
    Shop,
    ProductPage,
    Estate,
    Orchard,
    Weddings,
    Help,
    Search,
    OrderConfirmation,
    Header,
    Footer,
    Common,
    Settings,
  ],
  endpoints: [medusaOptionsEndpoint],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  email: nodemailerAdapter({
    defaultFromAddress: env.EMAIL_FROM,
    defaultFromName: SHOP.name,
    transportOptions: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } } : {}),
    },
  }),
  db: postgresAdapter({
    pool: { connectionString: env.PAYLOAD_DATABASE_URL },
    // Development syncs the schema as the config changes; production runs the migrations.
    migrationDir: path.resolve(dirname, "payload/migrations"),
  }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  telemetry: false,
});
