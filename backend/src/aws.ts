import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
});

export const fetchS3Folder = async (key: string, localPath: string) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET ?? "",
      Prefix: key,
    };
    const s3File = await s3.listObjectsV2(params).promise();
    if (s3File.Contents) {
      await Promise.all(
        s3File.Contents.map(async (file) => {
          const fileKey = file.Key;
          if (fileKey) {
            const getObjectParams = {
              Bucket: process.env.S3_BUCKET ?? "",
              Key: fileKey,
            };
            const fileContent = await s3.getObject(getObjectParams).promise();
            if (fileContent.Body) {
              const filePath = `${localPath}/${fileKey.replace(key, "")}`;
              await writeFile(filePath, fileContent.Body.toString());
              console.log(`Downloaded ${fileKey} to ${filePath}`);
            }
          }
        })
      );
    }
  } catch (error) {
    console.log({ error });
  }
};

export const copyS3Folder = async (
  sourcePrefix: string,
  targetPrefix: string,
  continutaionToken?: string
) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET ?? "",
      Prefix: sourcePrefix,
      ContinuationToken: continutaionToken,
    };
    const listedObjects = await s3.listObjectsV2(params).promise();
    if (listedObjects.Contents) {
      await Promise.all(
        listedObjects.Contents.map(async (file) => {
          const fileKey = file.Key;
          if (fileKey) {
            const copyObjectParams = {
              Bucket: process.env.S3_BUCKET ?? "",
              CopySource: `${process.env.S3_BUCKET}/${fileKey}`,
              Key: fileKey.replace(sourcePrefix, targetPrefix),
            };
            await s3.copyObject(copyObjectParams).promise();
            console.log(`Copied ${fileKey} to ${targetPrefix}`);
          }
        })
      );
    }

    if (listedObjects.IsTruncated) {
      await copyS3Folder(
        sourcePrefix,
        targetPrefix,
        listedObjects.NextContinuationToken
      );
    }
  } catch (error) {
    console.log({ error });
  }
};

export const saveToS3 = async (
  key: string,
  filePath: string,
  content: string
) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET ?? "",
      Key: `${key}${filePath}`,
      Body: content,
    };
    await s3.putObject(params).promise();
    console.log(`Saved ${key} to ${filePath}`);
  } catch (error) {
    console.log({ error });
  }
};

function writeFile(filePath: string, content: string) {
  return new Promise<void>(async (resolve, reject) => {
    await createFolder(path.dirname(filePath));
    fs.writeFile(filePath, content, "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function createFolder(path: string) {
  return new Promise<void>((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
