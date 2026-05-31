import { isValidElement, type ReactNode } from "react";

/** Walk MDX/shiki/React children and extract plain text. */
export function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

export function detectLanguage(
  className?: string,
  children?: ReactNode,
): string {
  const fromClass = className?.match(/language-([\w-]+)/)?.[1];
  if (fromClass) return fromClass;

  if (isValidElement<{ className?: string }>(children)) {
    const fromChild = children.props.className?.match(/language-([\w-]+)/)?.[1];
    if (fromChild) return fromChild;
  }

  return "text";
}
