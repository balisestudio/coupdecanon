import { Logo } from "@coupdecanon/ui/components/logo";

/**
 * The shop's logo in Payload's admin, in the admin's own text color. The admin has none of the
 * site's styles: the logo takes its size inline.
 */
export function BrandLogo() {
  return <Logo style={{ height: "4.5rem", width: "auto" }} />;
}

/** The logo's statue alone, in the admin's navigation. */
export function BrandIcon() {
  return <Logo variant="mark" title={null} style={{ height: "1.75rem", width: "auto" }} />;
}
