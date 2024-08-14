import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "path";
import { LambdaConstruct } from "./lambda-construct";
import { EcsConstruct } from "./ecs-construct";

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const readerRole = new cdk.aws_iam.Role(this, "ReaderRole", {
      roleName: "reader_role",
      assumedBy: new cdk.aws_iam.CompositePrincipal(
        new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        new cdk.aws_iam.ServicePrincipal("ecs-tasks.amazonaws.com")
      ),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    const writerRole = new cdk.aws_iam.Role(this, "WriterRole", {
      roleName: "writer_role",
      assumedBy: new cdk.aws_iam.CompositePrincipal(
        new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        new cdk.aws_iam.ServicePrincipal("ecs-tasks.amazonaws.com")
      ),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    new LambdaConstruct(this, "LambdaConstruct", { readerRole, writerRole });

    const vpc = new cdk.aws_ec2.Vpc(this, "Vpc", {
      natGateways: 0,
    });

    new EcsConstruct(this, "EcsConstruct", { vpc, readerRole, writerRole });
  }
}
