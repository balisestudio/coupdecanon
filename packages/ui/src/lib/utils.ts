import { createCn } from "cn/config";

/**
 * Merges class names, resolving Tailwind conflicts (the last class wins). It's taught the
 * design's own tokens from `globals.css`, so it knows `max-w-dialog` overrides `max-w-text`
 * or `py-section` overrides `py-4`. Keep these lists in step with the theme.
 */
export const cn = createCn({
  extend: {
    theme: {
      spacing: ["gutter", "grid", "stack", "block", "section"],
      container: ["page", "text", "dialog"],
      aspect: ["portrait", "landscape", "wide"],
    },
  },
});
