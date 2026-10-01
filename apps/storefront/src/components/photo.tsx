import { cn } from "@coupdecanon/ui/lib/utils";
import type { Media } from "../payload-types";

/** `data-*` attributes, such as the scroll motion ones. */
type DataAttributes = { [key: `data-${string}`]: string | number | undefined };

/** A photo from Payload's library, as a relation returns it: its document, or only its id. */
export type PhotoMedia = Media | number | null | undefined;

/** The library's photo, once its document is there: an id alone can't be shown. */
const mediaOf = (media: PhotoMedia) => (typeof media === "object" && media?.url ? media : null);

/** Every width the library made of a photo, the original included, for `srcset`. */
function sourcesOf(media: Media) {
  const sources = [
    ...Object.values(media.sizes ?? {}),
    { url: media.url, width: media.width },
  ].flatMap((size) => (size?.url && size.width ? [{ url: size.url, width: size.width }] : []));
  const byWidth = new Map(sources.map((source) => [source.width, source.url]));
  return [...byWidth].sort(([a], [b]) => a - b);
}

/**
 * A photo: one of the estate's, from Payload's library, in the widths the library made of it,
 * or a product's, from Medusa. `sizes` says how wide it shows, so the browser downloads the
 * width it needs: the full width by default. The team's focal point stays in view when the
 * photo is cropped. Without a photo, a tinted block holds its place.
 */
export function Photo({
  media,
  src,
  alt,
  width,
  height,
  sizes = "100vw",
  priority = false,
  className,
  ...data
}: {
  media?: PhotoMedia;
  /** A photo from elsewhere, such as Medusa's products. */
  src?: string;
  /** What the photo shows; the library's description by default. `""` for a decorative one. */
  alt?: string;
  width?: number;
  height?: number;
  sizes?: string;
  /** Loads eagerly, for the photo that paints the page's first screen. */
  priority?: boolean;
  className?: string;
} & DataAttributes) {
  const image = mediaOf(media);
  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : "auto";

  if (image?.url) {
    const sources = sourcesOf(image);
    const focus =
      image.focalX != null && image.focalY != null
        ? { objectPosition: `${image.focalX}% ${image.focalY}%` }
        : undefined;
    const fallback = sources.filter(([w]) => w <= 1440).pop()?.[1] ?? image.url;
    return (
      <img
        src={fallback}
        srcSet={sources.map(([w, url]) => `${url} ${w}w`).join(", ")}
        sizes={sizes}
        alt={alt ?? image.alt}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        style={focus}
        className={cn("w-full object-cover", className)}
        {...data}
      />
    );
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? ""}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={cn("w-full object-cover", className)}
        {...data}
      />
    );
  }

  return <div aria-hidden="true" className={cn("bg-muted", className)} {...data} />;
}
