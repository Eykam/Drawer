import { _Object } from "@aws-sdk/client-s3";
import { Filesystem, DrawerFile, UploadFile } from "../../@types/Filesystem";
export declare class S3Filesystem extends Filesystem {
    private client;
    private bucket;
    fileList: _Object[];
    constructor();
    init: () => Promise<void>;
    listObjects: (dirname: string) => Promise<_Object[]>;
    getObject: (objectName: string) => Promise<DrawerFile>;
    getObjects: (names: string[]) => Promise<{
        [k: string]: Promise<DrawerFile>;
    }>;
    putObject: (objectName: string, contentType: string, currObject?: Buffer) => Promise<boolean>;
    putObjects: (files: UploadFile[], dir: string) => Promise<{
        [k: string]: Promise<boolean>;
    }>;
    deleteObjects: (names: string[]) => Promise<string[]>;
    copyObject: (source: string, dest: string) => Promise<boolean>;
    renameObject: (source: string, dest: string) => Promise<boolean>;
}
