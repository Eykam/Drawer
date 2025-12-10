import { HTMLAttributes } from "react";

export type FileInfo = {
  name: string;
  fullPath: string;
  type: string;
  size: number;
  date: string;
  isDirectory: boolean;
};

export type NavItemProps = HTMLAttributes<HTMLAnchorElement> & {
  name: string;
  icon: JSX.Element;
  link: string;
};
