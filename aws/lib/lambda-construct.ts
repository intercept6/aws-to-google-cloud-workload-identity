import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { resolve } from "path";

interface Props {
  writerRole: cdk.aws_iam.IRole;
  readerRole: cdk.aws_iam.IRole;
}
export class LambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    new cdk.aws_lambda_nodejs.NodejsFunction(this, "WriterLambda", {
      functionName: "writer_lambda",
      entry: resolve(__dirname, "handler", "index.ts"),
      handler: "writerHandler",
      role: props.writerRole,
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      logGroup: new cdk.aws_logs.LogGroup(this, "WriterLogGroup", {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      environment: {
        PROJECT_ID: process.env.TF_VAR_google_project_id!,
        BUCKET_NAME: process.env.TF_VAR_bucket_name!,
      },
    });

    new cdk.aws_lambda_nodejs.NodejsFunction(this, "ReaderLambda", {
      functionName: "reader_lambda",
      entry: resolve(__dirname, "handler", "index.ts"),
      handler: "readerHandler",
      role: props.readerRole,
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      logGroup: new cdk.aws_logs.LogGroup(this, "ReaderLogGroup", {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      environment: {
        PROJECT_ID: process.env.TF_VAR_google_project_id!,
        BUCKET_NAME: process.env.TF_VAR_bucket_name!,
      },
    });
  }
}
