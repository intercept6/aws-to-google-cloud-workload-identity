import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Storage } from "@google-cloud/storage";
import {
  AwsClient,
  AwsSecurityCredentials,
  AwsSecurityCredentialsSupplier,
  ExternalAccountSupplierContext,
} from "google-auth-library";
import * as credentials from "./credentials.json";

class AwsContainerSupplier implements AwsSecurityCredentialsSupplier {
  async getAwsRegion(context: ExternalAccountSupplierContext): Promise<string> {
    const res = await fetch(
      `${process.env.ECS_CONTAINER_METADATA_URI_V4}/task`
    );
    // https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/task-metadata-endpoint-v4-fargate-examples.html
    const metadata = await res.json();
    // console.log(`successfully fetched metadata: ${JSON.stringify(metadata)}`);
    const az = metadata.AvailabilityZone;
    // console.log(`successfully fetched availability zone: ${az}`);
    const region = az.slice(0, -1);
    // console.log(`successfully parsed region from availability zone: ${region}`);
    return region;
  }

  async getAwsSecurityCredentials(
    context: ExternalAccountSupplierContext
  ): Promise<AwsSecurityCredentials> {
    const res = await fetch(
      `http://169.254.170.2${process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI}`
    );
    // https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/security-iam-roles.html
    const credentials = await res.json();
    // console.log(
    //   `successfully fetched credentials: ${JSON.stringify(credentials)}`
    // );

    return {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      token: credentials.Token,
    };
  }
}

const client = new AwsClient({
  type: credentials.type,
  audience: credentials.audience,
  subject_token_type: credentials.subject_token_type,
  token_url: credentials.token_url,
  awsSecurityCredentialsSupplier: new AwsContainerSupplier(),
});

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  authClient: client,
});

const FILE_NAME = "ecs.txt";

const app = new Hono();

app
  .get("/health", (c) => c.json({ status: "ok" }))
  .post("/writer", async (c) => {
    await storage
      .bucket(process.env.BUCKET_NAME!)
      .file(FILE_NAME)
      .save("Hello, World!");
    return c.text("File written!");
  })
  .get("/reader", async (c) => {
    const contents = await storage
      .bucket(process.env.BUCKET_NAME!)
      .file(FILE_NAME)
      .download();

    return c.text(contents.toString());
  });

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
