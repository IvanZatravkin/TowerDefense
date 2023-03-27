import React from "react";

export const If = React.memo(
  ({
    condition,
    children,
  }: React.PropsWithChildren<{ condition: boolean }>) => {
    return condition ? <>{children}</> : null;
  }
);
