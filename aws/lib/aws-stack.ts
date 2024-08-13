import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "path";

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const writerRole = new cdk.aws_iam.Role(this, "WriterRole", {
      roleName: "writer_role",
      assumedBy: new cdk.aws_iam.CompositePrincipal(
        new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com")
      ),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    const readerRole = new cdk.aws_iam.Role(this, "ReaderRole", {
      roleName: "reader_role",
      assumedBy: new cdk.aws_iam.CompositePrincipal(
        new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com")
      ),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    new cdk.aws_lambda_nodejs.NodejsFunction(this, "WriteLambda", {
      functionName: "write_lambda",
      entry: join(__dirname, "handler", "index.ts"),
      handler: "writeHandler",
      role: writerRole,
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      logGroup: new cdk.aws_logs.LogGroup(this, "WriteLogGroup", {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      environment: {
        PROJECT_ID: process.env.TF_VAR_google_project_id!,
        BUCKET_NAME: process.env.TF_VAR_bucket_name!,
      },
    });

    new cdk.aws_lambda_nodejs.NodejsFunction(this, "ReadLambda", {
      functionName: "read_lambda",
      entry: join(__dirname, "handler", "index.ts"),
      handler: "readHandler",
      role: readerRole,
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      logGroup: new cdk.aws_logs.LogGroup(this, "ReadLogGroup", {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      environment: {
        PROJECT_ID: process.env.TF_VAR_google_project_id!,
        BUCKET_NAME: process.env.TF_VAR_bucket_name!,
      },
    });
  }
}
