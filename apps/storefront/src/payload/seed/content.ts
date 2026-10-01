import { PATHS } from "@coupdecanon/config/routes";
import type { PhotoKey } from "./photos";

/**
 * The site's content as the storefront wrote it before Payload: the seed's starting point,
 * which the team then edits in the admin.
 */

type Photos = Record<PhotoKey, number | null>;

/** What the content picks from Medusa: the featured products, and the miniatures. */
type MedusaPicks = { featured: string[]; miniatures: string | null };

const link = (label: string, url: string) => ({ label, url });

export const SETTINGS = {
  contact: {
    phone: "02 31 40 68 19",
    email: "contact@domainedeouezy.fr",
    address: {
      place: "Château de Ouézy",
      street: "22 rue Auguste Lemonnier",
      postal_code: "14270",
      city: "Ouézy",
      region: "Normandie",
      country_code: "fr",
    },
  },
  legal: {
    legal_name: "Hervé Delom de Mézerac",
    legal_form: "Entrepreneur individuel (EI)",
    siren: "410727150",
    siret: "41072715000014",
    address: "Avenue du Château de Canon, 14270 Mézidon Vallée d'Auge",
  },
};

export const HEADER = {
  announcement: "10% de remise dès 12 bouteilles, 20% dès 100",
  main: [
    link("Boutique", PATHS.shop),
    link("Le domaine", PATHS.estate),
    link("Le verger", PATHS.orchard),
  ],
  menu: [
    link("La boutique", PATHS.shop),
    link("Le domaine", PATHS.estate),
    link("Le verger", PATHS.orchard),
    link("Mariages et fêtes", PATHS.weddings),
    link("Aide et contact", PATHS.help),
  ],
};

export const FOOTER = {
  newsletter: {
    title: "Les nouvelles du domaine",
    text: "Une lettre quand une cuvée sort de la cave.",
    note: "Une lettre de temps en temps, et rien d’autre. Vous pouvez vous désinscrire à tout moment.",
  },
  columns: [
    { title: "Boutique", families: true, links: [link("Mariages et fêtes", PATHS.weddings)] },
    {
      title: "Le domaine",
      families: false,
      links: [
        link("Le verger", PATHS.orchard),
        link("Récompenses", PATHS.awards),
        { ...link("La ferme pédagogique", "https://ferme-pedagogique.fr"), shortLabel: "La ferme" },
        link("Les cabanes", "https://cabane-insolite.com"),
        link("Le château", "https://chateaudeouezy.fr/"),
      ],
    },
    {
      title: "Aide",
      families: false,
      links: [
        link("Questions fréquentes", PATHS.help),
        link("Livraison et retrait", PATHS.delivery),
        link("Nous écrire", PATHS.contact),
        link("Mon compte", PATHS.account),
      ],
    },
  ],
  healthWarning:
    "L’abus d’alcool est dangereux pour la santé, à consommer avec modération. La vente d’alcool est interdite aux mineurs.",
};

export const common = (photos: Photos) => ({
  visit: { title: "Venir au domaine", photo: photos.boutique },
  ageGate: {
    title: "Bienvenue au domaine",
    text: "Nos cidres, poirés et calvados sont réservés aux personnes majeures. Merci de confirmer que vous avez 18 ans ou plus.",
    healthWarning: "L’abus d’alcool est dangereux pour la santé, à consommer avec modération.",
    photo: photos["age-gate"],
  },
});

export const home = (photos: Photos, picks: MedusaPicks) => ({
  hero: {
    title: "Ce que donnent nos vergers",
    text: "Cidres, poirés, jus et calvados, faits au Domaine de Ouézy avec les seules pommes et poires de nos vergers. En bio, depuis 1995.",
    cta: link("Parcourir la boutique", PATHS.shop),
    photoStart: photos.harvest,
    photo: photos.orchard,
    photoEnd: photos.press,
  },
  cellar: { title: "La cave du domaine", products: picks.featured },
  estate: {
    title: "Le fruit fait\nle travail",
    paragraphs: [
      {
        text: "Ni sucre, ni eau, ni levures, ni sulfites ajoutés : ce sont les levures de la pomme qui font fermenter le jus. Nos cidres ne sont filtrés que très rarement, et nos jus ne sont ni collés ni filtrés.",
      },
      { text: "Nous travaillons ainsi les fruits du domaine depuis 1995, au cœur du Pays d’Auge." },
    ],
    photo: photos.cellar,
  },
  orchard: {
    title: "Une vingtaine de variétés, toutes en hautes tiges",
    text: "Douces, douces-amères, amères, acidulées, aigres : c’est leur mélange qui donne un cidre charpenté, fruité, et surtout riche en arômes.",
    link: link("Découvrir le verger", PATHS.orchard),
  },
  families: { title: "Toute la boutique, par famille" },
  miniatures: {
    title: "Une mignonnette de calvados pour chaque invité",
    text: "Des flacons remplis de notre calvados fermier, à poser sur chaque assiette de vos mariages et de vos fêtes.",
    facts: [
      { value: "3 cl", label: "Le flacon" },
      { value: "3 ans", label: "L’âge du calvados" },
      { value: "50", label: "Mignonnettes au minimum, tarif sur devis" },
    ],
    cta: link("Demander un devis", PATHS.quote),
  },
  awards: { title: "Récompenses" },
  seo: {
    title: "Cidres, calvados et jus bio du Domaine de Ouézy",
    description:
      "Cidres, poirés, jus de fruits et calvados fermier bio, faits au Domaine de Ouézy avec les seules pommes et poires de nos vergers, en Pays d’Auge depuis 1995.",
  },
});

export const SHOP_PAGE = {
  hero: {
    title: "La boutique",
    text: "{produits}, tous faits au domaine avec les fruits de nos vergers.",
  },
  quote: {
    text: "« Nos meilleures poires sont toutes locales… mais l’on ne connaît pas leurs noms. »",
    caption: "À propos du Champoiré",
  },
  seo: {
    title: "La boutique : cidres, calvados, jus et épicerie de la ferme",
    description:
      "Tous les produits du Domaine de Ouézy : cidres, poirés, jus de fruits, calvados fermier et épicerie de la ferme, faits en bio avec les fruits de nos vergers.",
  },
};

export const productPage = (photos: Photos) => ({
  story: { makingTitle: "Élaboration", stepsTitle: "Du verger au verre" },
  details: {
    items: [
      {
        title: "Livraison et retrait",
        text: "Commandez en ligne, puis retirez votre commande à la boutique du domaine, sans frais. Nous vous prévenons par e-mail dès qu’elle est prête.",
        link: link("Livraison et retrait", PATHS.delivery),
      },
      {
        title: "Mariages et commandes en nombre",
        text: "Pour un mariage, une fête ou une commande importante, nous préparons un devis sur mesure.",
        link: link("Demander un devis", PATHS.quote),
      },
    ],
  },
  tasting: {
    title: "Goûter avant de choisir",
    text: "Venez déguster la nouvelle cuvée à la boutique du château, puis repartez avec vos produits.",
    photo: photos.degustation,
  },
  related: { title: "Dans la même famille" },
});

const ESTATE_INTRO =
  "Un château du XIXe siècle, 58 hectares en agriculture biologique entre Caen et Lisieux, et des vergers dont nous transformons les fruits depuis 1995.";

export const estate = (photos: Photos) => ({
  hero: { title: "Le Domaine de Ouézy", text: ESTATE_INTRO, photo: photos.chateau },
  family: {
    title: "Une famille, une ferme, un château",
    paragraphs: [
      {
        text: "Héloïse et Hervé de Mézerac tiennent le domaine avec toute l’équipe de la ferme. Ici, l’agriculture biologique n’est pas une option : c’est un héritage.",
      },
      {
        text: "Nos vergers ont été plantés il y a plus de vingt ans, avec les variétés qui ont fait la réputation de nos cidres. Tout ce que nous vendons est fait ici, avec nos propres fruits.",
      },
    ],
    link: link("Découvrir le verger", PATHS.orchard),
    photo: photos.famille,
  },
  figures: {
    text: "58 hectares en agriculture biologique, un millier d’animaux en semi-liberté dans les vergers, et un pressoir qui tourne de septembre à janvier.",
  },
  madeHere: {
    title: "Tout est fait sur place",
    text: "Du pressoir à la cave, tout ce que nous vendons est élaboré au domaine.",
    workshops: [
      {
        title: "Le pressoir",
        text: "Les fruits sont triés, lavés, broyés puis pressés au pressoir pneumatique pour obtenir le meilleur jus possible.",
        photo: photos.pressoir,
      },
      {
        title: "La cave",
        text: "Le cidre y fermente un an en tonneau, puis l’eau-de-vie de calvados y vieillit dans nos fûts.",
        photo: photos.futs,
      },
      {
        title: "L’atelier brassicole",
        text: "Depuis 2023, nous brassons notre bière, la Blonde de Ouézy, avec l’eau de source du domaine.",
        photo: photos.brassage,
      },
    ],
  },
  awards: { title: "Récompenses" },
  activities: {
    title: "Au domaine aussi",
    text: "Le domaine se visite aussi, en famille, entre amis ou le temps d’une nuit.",
    items: [
      {
        name: "La ferme pédagogique",
        text: "Vaches, moutons, cochons, chèvres, ânes et basse-cour, en semi-liberté dans les vergers.",
        link: link("Découvrir", "https://ferme-pedagogique.fr"),
      },
      {
        name: "Les cabanes dans les arbres",
        text: "Des cabanes perchées jusqu’à 22 mètres de haut, pour deux ou en famille, et un lodge au bord de l’eau.",
        link: link("Découvrir", "https://cabane-insolite.com"),
      },
      {
        name: "Le château",
        text: "Mariages jusqu’à 150 invités, séminaires et fêtes de famille, dans les salons en enfilade et le parc à l’anglaise.",
        link: link("Découvrir", "https://chateaudeouezy.fr/"),
      },
      {
        name: "L’éco-hôtel",
        text: "Des chambres sans Wi-Fi, sobres et calmes, pour se reposer vraiment.",
        link: link("Découvrir", "https://slowtourism.fr/"),
      },
      {
        name: "Le snack de la ferme",
        text: "Burgers, planches, crêpes et glaces, avec les produits de la ferme et des producteurs voisins. Le week-end, de 12 h à 17 h.",
        link: link("Voir la carte", "https://domainedeouezy.fr/le-snack-de-la-ferme/"),
      },
    ],
  },
  seo: { title: "Le Domaine de Ouézy, un château et ses vergers bio", description: ESTATE_INTRO },
  search: {
    summary: "La famille, le château, la cave et les récompenses",
    keywords: "domaine chateau famille recompense cave pressoir biere calvados visite",
  },
});

const VARIETIES = [
  "Bisquet",
  "Rambault",
  "Binet rouge",
  "Fresquin rouge",
  "Bedan",
  "Cimetière de Blangy",
  "Doux Évêque",
  "Douce Moën",
  "Douce Coët Ligné",
  "Moulin à Vent",
  "Noël des Champs",
  "René Martin",
  "Président des Cours",
  "Kermerrien",
  "Antoinette",
  "Tête de Brebis",
  "Mettais",
  "Marie Ménard",
];

export const orchard = (photos: Photos) => ({
  hero: {
    title: "Le verger",
    text: "Une vingtaine de variétés de pommes à cidre et des poiriers choisis pendant vingt ans, tous en hautes tiges et cultivés en bio.",
    photo: photos["verger-fleurs"],
  },
  apples: {
    title: "Les pommes",
    text: "Douces, douces-amères, amères, acidulées, aigres. C’est leur mélange qui donne un cidre charpenté, fruité, et surtout riche en arômes.",
    varieties: VARIETIES.map((name) => ({ name })),
  },
  pears: {
    title: "Les poires",
    paragraphs: [
      {
        text: "Après vingt ans de recherche, nous avons un verger de poiriers sélectionnés avec soin. Nos meilleures poires sont toutes locales, et personne ne connaît leur nom.",
      },
      {
        text: "Comme les pommes à cidre, elles ne sont pas faites pour être croquées. Elles donnent le Champoiré, l’Halbi, le jus de poire et l’Apéri’poire.",
      },
    ],
    link: link("Voir les produits à la poire", `${PATHS.search}?q=poire`),
    photo: photos.poires,
  },
  harvest: {
    title: "De la récolte à la cave",
    steps: [
      {
        title: "Septembre à janvier",
        text: "Pommes et poires sont ramassées à la main ou à la machine, selon les variétés.",
      },
      { title: "Quinze jours", text: "Les fruits finissent de mûrir dans des palox en bois." },
      {
        title: "Au pressoir",
        text: "Tri, lavage, broyage, puis pressage au pressoir pneumatique.",
      },
      {
        title: "Quatre à huit jours",
        text: "Le moût repose en cuve, puis il est soutiré pour ôter les dépôts.",
      },
      {
        title: "Le temps qu’il faut",
        text: "Une fermentation douce et progressive, jusqu’au brut ou au demi-sec.",
      },
    ],
  },
  additives: {
    title: "Ni sucre, ni eau, ni levures, ni sulfites",
    text: "Ce sont les levures de la pomme qui font fermenter le jus. Nos cidres ne sont filtrés que très rarement, et nos jus ne sont ni collés ni filtrés.",
  },
  animals: {
    title: "Les animaux au verger",
    paragraphs: [
      {
        text: "Vaches, moutons, cochons, chèvres, ânes et basse-cour vivent en semi-liberté dans nos vergers. Ici, pas de cages.",
      },
      { text: "La ferme pédagogique les fait découvrir aux visiteurs." },
    ],
    link: link("La ferme pédagogique", "https://ferme-pedagogique.fr"),
    photo: photos.moutons,
  },
  taste: { title: "Goûter le verger", cta: link("Parcourir la boutique", PATHS.shop) },
  seo: {
    title: "Le verger : pommes à cidre et poiriers en hautes tiges",
    description:
      "Une vingtaine de variétés de pommes à cidre et des poiriers choisis pendant vingt ans, tous en hautes tiges et cultivés en bio au Domaine de Ouézy.",
  },
  search: {
    summary: "Nos variétés de pommes et de poires, et la récolte",
    keywords: "verger pomme poire variete recolte animaux arbre",
  },
});

export const weddings = (photos: Photos, picks: MedusaPicks) => ({
  hero: {
    title: "Mariages et fêtes",
    text: "Une mignonnette de calvados pour chaque invité, les boissons de la réception, et un château pour recevoir.",
    ctaLabel: "Demander un devis",
    photo: photos["mariage-table"],
  },
  offer: {
    title: "Ce que nous proposons",
    miniatures: {
      title: "Les mignonnettes",
      text: "Des flacons de 3 cl remplis de notre calvados fermier de trois ans, à {prix} l’unité, et un tarif spécial sur devis à partir de 50 mignonnettes.",
      product: picks.miniatures,
      photo: photos.presentoir,
    },
    drinks: {
      title: "Les boissons de la réception",
      text: "Cidres, Champoiré, Halbi, et jus de pomme pour les enfants.",
      photo: photos.aperitif,
    },
    venue: {
      title: "Le château pour recevoir",
      text: "Le château de Ouézy accueille les mariages jusqu’à 150 invités, avec l’exclusivité du domaine et des couchages sur place.",
      link: link("Le château", "https://chateaudeouezy.fr/"),
    },
  },
  quote: {
    title: "Demander un devis",
    text: "Dites-nous en quelques mots ce que vous préparez. Nous vous répondons par e-mail.",
  },
  seo: {
    title: "Mariages et fêtes : mignonnettes de calvados et boissons",
    description:
      "Une mignonnette de calvados pour chaque invité, les boissons de la réception, et le château de Ouézy pour recevoir. Demandez votre devis.",
  },
  search: {
    summary: "Mignonnettes de calvados et devis pour vos réceptions",
    keywords: "mariage fete mignonnettes devis calvados reception evenement",
  },
});

export const HELP = {
  hero: {
    title: "Aide et contact",
    text: "Les réponses aux questions que l’on nous pose le plus souvent, et un formulaire pour nous écrire.",
  },
  questions: [
    {
      anchor: "pickup",
      question: "Livrez-vous, ou faut-il venir au domaine ?",
      answer:
        "Pour l’instant, toutes les commandes se retirent à la boutique du château de Ouézy, sans frais. Nous vous écrivons dès que votre commande est prête.",
    },
    {
      anchor: "payment",
      question: "Quels moyens de paiement acceptez-vous ?",
      answer:
        "Vous réglez sur place, au retrait de votre commande, ou par carte bancaire en ligne, au moment de commander.",
    },
    {
      anchor: "discounts",
      question: "Comment fonctionnent les remises ?",
      answer:
        "Les remises en cours sont annoncées en haut de chaque page. Elles s’appliquent d’elles-mêmes dans votre panier, qui en affiche le montant avant la commande.",
    },
    {
      anchor: "damaged",
      question: "Un produit est abîmé, que faire ?",
      answer:
        "Signalez-le-nous au retrait, ou écrivez-nous avec une photo : nous trouverons une solution.",
    },
    {
      anchor: "age",
      question: "Pourquoi me demande-t-on mon âge ?",
      answer:
        "La vente d’alcool est interdite aux mineurs. Nous vous demandons de le confirmer à l’entrée du site et au moment de commander.",
    },
    {
      anchor: "weddings",
      question: "Faites-vous des commandes pour les mariages ?",
      answer:
        "Oui, avec nos mignonnettes de calvados et les boissons de la réception. Faites-nous une demande de devis depuis la page Mariages et fêtes.",
    },
  ],
  contact: { title: "Nous écrire" },
  seo: {
    title: "Aide et contact",
    description:
      "Retrait au domaine, remises, paiement : les réponses aux questions que l’on nous pose le plus souvent, et un formulaire pour nous écrire.",
  },
  search: {
    summary: "Retrait, remises, paiement, et un formulaire pour nous écrire",
    keywords: "aide contact livraison retrait remise paiement question",
  },
};

export const SEARCH = {
  suggestions: ["calvados", "jus", "poire", "sans alcool", "mignonnettes"].map((term) => ({
    term,
  })),
};

export const orderConfirmation = (photos: Photos) => ({
  photo: photos["commande-prete"],
  pickupDay: {
    title: "Le jour du retrait",
    text: "Profitez de votre passage pour goûter la nouvelle cuvée à la boutique, ou pour visiter la ferme pédagogique.",
    link: link("Découvrir le domaine", PATHS.estate),
  },
});

export const AWARDS = [
  {
    year: 2018,
    title: "Trophée du Festival des AOP/AOC",
    summary: "Trophée du Festival des AOP/AOC des cidres du Pays d’Auge",
    detail: "Cidres du Pays d’Auge. Notre cidre s’est distingué parmi près de 200 participants.",
  },
  {
    year: 2018,
    title: "Normandy Ambassador",
    summary: "Normandy Ambassador, décerné par la Région à notre cidre bio",
    detail: "Titre décerné par la Région Normandie à notre cidre bio.",
  },
  {
    year: 2016,
    title: "Médaille d’or",
    summary: "Médaille d’or au concours de jus de pommes de Vimoutiers",
    detail: "Concours de jus de pommes de Vimoutiers. La recette n’a pas changé depuis.",
  },
];

/** The products featured at first, by Medusa handle, in order. */
export const FEATURED_HANDLES = ["calvados-fermier", "le-champoire", "l-halbi"];

/** The product the weddings page quotes the price of. */
export const MINIATURES_HANDLE = "mignonnettes";

/** The products' stories, by Medusa handle, for those the catalog sells. */
export const PRODUCT_STORIES: Record<
  string,
  { making: string; steps: { title: string; text: string }[] }
> = {
  "calvados-fermier": {
    making:
      "Notre cidre fermente un an en tonneau de chêne. Il est ensuite distillé par le bouilleur de cru ambulant, puis l’eau-de-vie vieillit tranquillement dans nos fûts, dans la cave du domaine.",
    steps: [
      {
        title: "Le verger",
        text: "Des pommes à cidre de nos vergers de hautes tiges, et d’aucun autre.",
      },
      {
        title: "Un an en tonneau",
        text: "Le cidre fermente une année entière en tonneau de chêne.",
      },
      { title: "L’alambic", text: "Le bouilleur de cru ambulant vient le distiller au domaine." },
      { title: "La cave", text: "L’eau-de-vie vieillit dans nos fûts, sans se presser." },
    ],
  },
};

/** The families' introductions, by Medusa handle, as their pages print them. */
export const FAMILY_INTRODUCTIONS: Record<string, string> = {
  "cidre-poire": "Nos cidres et poirés, faits avec les pommes et les poires du domaine.",
  "jus-de-fruits": "Les pur jus de nos pommes et de nos poires, ni collés ni filtrés.",
  "calvados-aperitif": "Le calvados fermier et nos apéritifs, distillés et vieillis au domaine.",
  biere: "La bière brassée au domaine, avec l’eau de notre source.",
  epicerie: "Vinaigres, confitures, miel et œufs de la ferme.",
  souvenirs: "De quoi garder un peu du domaine chez soi.",
};
