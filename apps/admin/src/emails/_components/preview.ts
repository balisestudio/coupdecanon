import type { ShopInfo } from "@coupdecanon/config/shop-info";

/**
 * Sample shop details for the preview server (`pnpm email:dev`) only. Sent e-mails read the
 * shop's settings from Payload instead.
 */
export const PREVIEW_SHOP: ShopInfo = {
  name: "Coup de Canon",
  contact: {
    phone: "02 31 40 68 19",
    email: "contact@domainedeouezy.fr",
    address: {
      place: "Château de Ouézy",
      street: "22 rue Auguste Lemonnier",
      postal_code: "14270",
      city: "Ouézy",
      country_code: "fr",
    },
  },
  legal: null,
  host: null,
  mediator: null,
  hours: {
    tuesday: [
      { opens: "10:00", closes: "12:30" },
      { opens: "14:00", closes: "18:00" },
    ],
    wednesday: [
      { opens: "10:00", closes: "12:30" },
      { opens: "14:00", closes: "18:00" },
    ],
    thursday: [
      { opens: "10:00", closes: "12:30" },
      { opens: "14:00", closes: "18:00" },
    ],
    friday: [
      { opens: "10:00", closes: "12:30" },
      { opens: "14:00", closes: "18:00" },
    ],
    saturday: [{ opens: "10:00", closes: "18:00" }],
  },
};
