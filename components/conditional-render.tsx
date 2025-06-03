import { Fragment, ReactNode } from "react";

interface ConditionalRenderProps {
  condition: boolean;
  children: ReactNode;
}

export function ConditionalRender({
  children,
  condition,
}: ConditionalRenderProps) {
  if (!condition) return null;
  return <Fragment>{children}</Fragment>;
}
