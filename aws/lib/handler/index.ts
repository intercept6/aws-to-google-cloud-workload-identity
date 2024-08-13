import { Handler } from "aws-lambda";
import { Storage } from "@google-cloud/storage";
import * as credentials from "./credentials.json";

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials,
});

const FILE_NAME = "lambda.txt";

export const writeHandler: Handler = async () => {
  await storage
    .bucket(process.env.BUCKET_NAME!)
    .file(FILE_NAME)
    .save("Hello, World!");
};

export const readHandler: Handler = async () => {
  const contents = await storage
    .bucket(process.env.BUCKET_NAME!)
    .file(FILE_NAME)
    .download();

  console.log(contents.toString());
};
