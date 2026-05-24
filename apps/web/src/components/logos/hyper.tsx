import type { SVGProps } from "react";

export function HyperLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <title>Hyper</title>
      <rect x="3" y="3" width="18" height="18" />
    </svg>
  );
}
