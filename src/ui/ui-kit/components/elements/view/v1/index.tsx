/** @jsx jsx */
import { jsx } from "@emotion/react";
import styled from "@emotion/styled";
import React, { PropsWithChildren } from "react";

import { alignItems } from "../../../../traits/alignItems";
import { cursor } from "../../../../traits/cursor";
import { height } from "../../../../traits/height";
import { justifyContent } from "../../../../traits/justifyContent";
import { overflow } from "../../../../traits/overflow";
import { padding } from "../../../../traits/padding";
import { transition } from "../../../../traits/transition";

type IProps = PropsWithChildren<{
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  role?: string;
}>;

// @ts-ignore
export const View = styled(({ children, className, onClick, role }: IProps) => (
  <div
    className={className}
    children={children}
    onClick={onClick}
    role={role}
  />
))(
  cursor,
  overflow,
  padding,
  transition,
  { display: "flex" },
  justifyContent,
  alignItems,
  height
);
