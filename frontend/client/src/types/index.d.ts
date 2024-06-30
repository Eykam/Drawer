export type FileInfo = {
  fileName: string;
  size: number;
  fileType: string;
  date: string;
};

export type NavItemProps = HTMLAttributes<HTMLAnchorElement> & {
  name: string;
  icon: JSX.Element;
  link: string;
};
