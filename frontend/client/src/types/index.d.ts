export type FileInfo = {
  name: string;
  size: number;
  type: string;
  date: string;
  imgSrc?: string;
};

export type NavItemProps = HTMLAttributes<HTMLAnchorElement> & {
  name: string;
  icon: JSX.Element;
  link: string;
};
