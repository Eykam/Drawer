import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectsCommand, CopyObjectCommand, } from "@aws-sdk/client-s3";
import { Filesystem } from "../../@types/Filesystem";
export class S3Filesystem extends Filesystem {
    client;
    bucket;
    fileList;
    constructor() {
        super(process.env.ROOT_BUCKET_NAME || "");
        this.bucket = process.env.ROOT_BUCKET_NAME || "";
        this.client = new S3Client({
            region: process.env.AWS_REGION || "us-east-1",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
            },
        });
        this.fileList = [];
    }
    init = async () => {
        try {
            // Initialize by fetching the file list
            this.fileList = await this.listObjects("");
            console.log("S3Filesystem initialized successfully");
        }
        catch (error) {
            console.error("Failed to initialize S3Filesystem:", error);
        }
    };
    listObjects = async (dirname) => {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: dirname,
                Delimiter: "/",
            });
            const response = await this.client.send(command);
            // Combine files and "directories" (common prefixes)
            const files = response.Contents || [];
            const directories = (response.CommonPrefixes || []).map((prefix) => ({
                Key: prefix.Prefix,
                Size: 0,
                LastModified: new Date(),
            }));
            // Update the cached file list
            this.fileList = [...files, ...directories];
            return this.fileList;
        }
        catch (error) {
            console.error("Error listing objects:", error);
            return [];
        }
    };
    getObject = async (objectName) => {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: objectName,
            });
            const response = await this.client.send(command);
            const bodyContents = await response.Body?.transformToByteArray();
            return {
                data: Buffer.from(bodyContents || []),
                lastModified: response.LastModified?.toISOString() || "",
                "Content-Type": response.ContentType || "",
                "Content-Length": response.ContentLength?.toString() || "0",
            };
        }
        catch (error) {
            console.error("Error getting object:", error);
            throw error;
        }
    };
    getObjects = async (names) => {
        const result = {};
        for (const name of names) {
            result[name] = this.getObject(name);
        }
        return result;
    };
    putObject = async (objectName, contentType, currObject) => {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: objectName,
                Body: currObject || Buffer.from(""),
                ContentType: contentType === "dir" ? "application/x-directory" : contentType,
            });
            await this.client.send(command);
            return true;
        }
        catch (error) {
            console.error("Error putting object:", error);
            return false;
        }
    };
    putObjects = async (files, dir) => {
        const result = {};
        for (const file of files) {
            const key = dir ? `${dir}${file.name}` : file.name;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            result[key] = this.putObject(key, file.type, buffer);
        }
        return result;
    };
    deleteObjects = async (names) => {
        try {
            const command = new DeleteObjectsCommand({
                Bucket: this.bucket,
                Delete: {
                    Objects: names.map((name) => ({ Key: name })),
                },
            });
            const response = await this.client.send(command);
            return (response.Deleted || []).map((obj) => obj.Key || "");
        }
        catch (error) {
            console.error("Error deleting objects:", error);
            return [];
        }
    };
    copyObject = async (source, dest) => {
        try {
            const command = new CopyObjectCommand({
                Bucket: this.bucket,
                CopySource: `${this.bucket}/${source}`,
                Key: dest,
            });
            await this.client.send(command);
            return true;
        }
        catch (error) {
            console.error("Error copying object:", error);
            return false;
        }
    };
    renameObject = async (source, dest) => {
        try {
            // Copy to new location
            const copied = await this.copyObject(source, dest);
            if (!copied)
                return false;
            // Delete the original
            const deleted = await this.deleteObjects([source]);
            return deleted.length > 0;
        }
        catch (error) {
            console.error("Error renaming object:", error);
            return false;
        }
    };
}
