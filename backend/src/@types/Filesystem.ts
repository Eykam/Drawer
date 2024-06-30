import { _Object } from "@aws-sdk/client-s3";

export abstract class Filesystem {
  rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  abstract init: () => void;
  abstract listObjects: (dirname: string) => Promise<_Object[]>;
  abstract getObject: (objectName: string) => Promise<DrawerFile>;
  abstract getObjects: (names: string[]) => Promise<{
    [k: string]: Promise<DrawerFile>;
  }>;
  abstract putObject: (
    objectName: string,
    contentType: string,
    currObject: Buffer
  ) => Promise<boolean>;
  abstract putObjects: (
    files: Express.Multer.File[],
    dir: string
  ) => Promise<{
    [k: string]: Promise<boolean>;
  }>;
  abstract deleteObjects: (names: string[]) => Promise<string[]>;
  abstract copyObject: (source: string, dest: string) => Promise<boolean>;
  abstract renameObject: (source: string, dest: string) => Promise<boolean>;
}

export type DrawerFile = {
  data: Buffer;
  lastModified: string;
  "Content-Type": string;
  "Content-Length": string;
};
