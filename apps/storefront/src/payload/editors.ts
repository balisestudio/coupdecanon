import {
  BlocksFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from "@payloadcms/richtext-lexical";
import type { Block } from "payload";
import { ShopValueBlock } from "./blocks";

/**
 * What a legal text may hold: paragraphs with emphasis, lists, links to the site's pages or
 * elsewhere, and the shop's details, inserted from its settings. Nothing more, so the
 * documents keep the site's sober look.
 */
const textFeatures = () => [
  ParagraphFeature(),
  BoldFeature(),
  ItalicFeature(),
  UnorderedListFeature(),
  OrderedListFeature(),
  LinkFeature({ enabledCollections: [] }),
  InlineToolbarFeature(),
  FixedToolbarFeature(),
];

/**
 * A boxed text inside a document, such as the legal guarantees' notice that the consumer code
 * requires framed.
 */
export const BoxedBlock: Block = {
  slug: "boxed",
  labels: { singular: "Encadré", plural: "Encadrés" },
  fields: [
    {
      name: "label",
      type: "text",
      label: "Intitulé",
      required: true,
      admin: {
        description: "Lu par les lecteurs d’écran : « Encadré relatif aux garanties légales ».",
      },
    },
    {
      name: "content",
      type: "richText",
      label: "Texte",
      required: true,
      editor: lexicalEditor({
        features: [...textFeatures(), BlocksFeature({ inlineBlocks: [ShopValueBlock] })],
      }),
    },
  ],
};

/** A legal document's articles: the text features, subtitles and boxed texts. */
export const legalEditor = lexicalEditor({
  features: [
    ...textFeatures(),
    HeadingFeature({ enabledHeadingSizes: ["h3"] }),
    BlocksFeature({ blocks: [BoxedBlock], inlineBlocks: [ShopValueBlock] }),
  ],
});
