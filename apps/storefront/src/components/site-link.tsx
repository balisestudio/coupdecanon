import { Link, type LinkProps } from "@tanstack/react-router";
import type { ComponentProps } from "react";

type SiteLinkProps = Omit<ComponentProps<"a">, "href"> &
  Pick<LinkProps, "activeOptions" | "activeProps" | "preload"> & {
    /**
     * A page of the site, from `PATHS`, with its search and hash if any; or an outside URL.
     * Without one, the link is plain text, like a product that has no page any more.
     */
    href?: string;
  };

/**
 * A link written with its URL, as `PATHS` gives it. The router takes the site's own pages
 * over, so going from one to another swaps the content instead of reloading the document.
 * Other sites open in a new tab, which screen readers announce, without learning where the
 * visitor came from; phone and e-mail links stay as they are.
 */
export function SiteLink({ href, ...props }: SiteLinkProps) {
  if (href && /^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {props.children}
        <span className="sr-only"> (nouvel onglet)</span>
      </a>
    );
  }
  if (!href?.startsWith("/")) return <a href={href} {...props} />;
  const { children, ...rest } = props;
  // `href` wins over `to`, which the router's types require. The router keeps a link's target
  // from its first render: a new `href` makes a new link. Its children are React's, which the
  // router types from an older React.
  return (
    <Link key={href} to="." href={href} {...rest}>
      {children as LinkProps["children"]}
    </Link>
  );
}
