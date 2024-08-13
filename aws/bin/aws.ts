#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Stack } from "../lib/aws-stack";

const app = new cdk.App();
new Stack(app, "AwsToGoogleCloudWorkloadIdentityStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
