import DOMPurify from "dompurify";

const RTE_ALLOWED_TAGS = ["p", "br", "strong", "em", "ul", "ol", "li", "hr", "span"];
const RTE_ALLOWED_ATTR: string[] = [];

export function sanitizeRteHtml(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RTE_ALLOWED_TAGS,
    ALLOWED_ATTR: RTE_ALLOWED_ATTR,
  });
}

export function isRteHtml(value: string): boolean {
  return value.trim().startsWith("<");
}
