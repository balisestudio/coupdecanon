import type { ShopInfo } from "@coupdecanon/config/shop-info";
import { cn } from "@coupdecanon/ui/lib/utils";
import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedInlineBlockNode,
} from "@payloadcms/richtext-lexical";
import {
  type JSXConvertersFunction,
  RichText as LexicalRichText,
} from "@payloadcms/richtext-lexical/react";
import type { ComponentProps } from "react";
import type { RichTextData } from "../lib/content";
import { SHOP_VALUES, shopValue } from "../lib/shop-values";
import type { Boxed, ShopValue } from "../payload-types";
import { SiteLink } from "./site-link";

type Nodes = DefaultNodeTypes | SerializedBlockNode<Boxed> | SerializedInlineBlockNode<ShopValue>;

type EditorState = ComponentProps<typeof LexicalRichText>["data"];

/**
 * A long text written in Payload, such as a legal document, in the site's `rich-text` style.
 * Links to the site's pages go through the router, links elsewhere open in a new tab, and the
 * shop's details print their current values from the settings. A detail the settings lack
 * prints nothing, flagged in development so the team sees what to fill in.
 */
export function RichText({
  data,
  shop,
  siteUrl,
  className,
}: {
  data: RichTextData;
  shop: ShopInfo;
  siteUrl: string;
  className?: string;
}) {
  const converters: JSXConvertersFunction<Nodes> = ({ defaultConverters }) => ({
    ...defaultConverters,
    link: ({ node, nodesToJSX }) => (
      <SiteLink href={node.fields.url ?? undefined}>
        {nodesToJSX({ nodes: node.children })}
      </SiteLink>
    ),
    blocks: {
      boxed: ({ node }) => (
        <aside aria-label={node.fields.label} className="border p-6">
          <RichText data={node.fields.content as RichTextData} shop={shop} siteUrl={siteUrl} />
        </aside>
      ),
    },
    inlineBlocks: {
      shopValue: ({ node }) => {
        const value = shopValue(node.fields.value, shop, siteUrl);
        if (!value) {
          return import.meta.env.DEV ? (
            <mark className="bg-muted text-muted-foreground">{SHOP_VALUES[node.fields.value]}</mark>
          ) : null;
        }
        return value.href ? <SiteLink href={value.href}>{value.text}</SiteLink> : value.text;
      },
    },
  });

  return (
    <LexicalRichText<Nodes>
      data={data as EditorState}
      converters={converters}
      disableIndent
      disableTextAlign
      className={cn("rich-text", className)}
    />
  );
}
