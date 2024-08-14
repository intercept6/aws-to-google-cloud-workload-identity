import { Handler } from "aws-lambda";
import { Storage } from "@google-cloud/storage";
import * as credentials from "./credentials.json";
import { AwsClient } from "google-auth-library";

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials,
});

const FILE_NAME = "lambda.txt";

export const writerHandler: Handler = async () => {
  await storage
    .bucket(process.env.BUCKET_NAME!)
    .file(FILE_NAME)
    .save("Hello, World!");
};

export const readerHandler: Handler = async () => {
  const contents = await storage
    .bucket(process.env.BUCKET_NAME!)
    .file(FILE_NAME)
    .download();

  console.log(contents.toString());
};
