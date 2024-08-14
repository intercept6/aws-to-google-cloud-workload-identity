import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { resolve } from "path";

interface Props {
  vpc: cdk.aws_ec2.IVpc;
  writerRole: cdk.aws_iam.IRole;
  readerRole: cdk.aws_iam.IRole;
}
export class EcsConstruct extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const cluster = new cdk.aws_ecs.Cluster(this, "Cluster", {
      vpc: props.vpc,
      executeCommandConfiguration: {
        logging: cdk.aws_ecs.ExecuteCommandLogging.DEFAULT,
      },
    });

    const logGroup = new cdk.aws_logs.LogGroup(this, "LogGroup", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const sg = new cdk.aws_ec2.SecurityGroup(this, "SecurityGroup", {
      vpc: props.vpc,
      allowAllOutbound: true,
    });
    sg.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(3000));

    const image = cdk.aws_ecs.ContainerImage.fromAsset(
      resolve(__dirname, "node-container")
    );

    const writerTask = new cdk.aws_ecs.FargateTaskDefinition(
      this,
      "WriterTask",
      {
        taskRole: props.writerRole,
        runtimePlatform: {
          operatingSystemFamily: cdk.aws_ecs.OperatingSystemFamily.LINUX,
          cpuArchitecture: cdk.aws_ecs.CpuArchitecture.ARM64,
        },
      }
    );
    writerTask.addContainer("WriterContainer", {
      image,
      environment: {
        PROJECT_ID: process.env.TF_VAR_google_project_id!,
        BUCKET_NAME: process.env.TF_VAR_bucket_name!,
      },
      logging: cdk.aws_ecs.LogDriver.awsLogs({
        logGroup,
        streamPrefix: "writer",
      }),
      portMappings: [{ containerPort: 3000 }],
    });

    const writerService = new cdk.aws_ecs.FargateService(
      this,
      "WriterService",
      {
        cluster,
        serviceName: "writer_ecs",
        taskDefinition: writerTask,
        assignPublicIp: true,
        securityGroups: [sg],
        enableExecuteCommand: true,
      }
    );

    const readerTask = new cdk.aws_ecs.FargateTaskDefinition(
      this,
      "ReaderTask",
      {
        taskRole: props.readerRole,
        runtimePlatform: {
          operatingSystemFamily: cdk.aws_ecs.OperatingSystemFamily.LINUX,
          cpuArchitecture: cdk.aws_ecs.CpuArchitecture.ARM64,
        },
      }
    );
    readerTask.addContainer("ReaderContainer", {
      image,
      environment: {
        PROJECT_ID: process.env.TF_VAR_google_project_id!,
        BUCKET_NAME: process.env.TF_VAR_bucket_name!,
      },
      logging: cdk.aws_ecs.LogDriver.awsLogs({
        logGroup,
        streamPrefix: "reader",
      }),
      portMappings: [{ containerPort: 3000 }],
    });

    const readerService = new cdk.aws_ecs.FargateService(
      this,
      "ReaderService",
      {
        cluster,
        serviceName: "reader_ecs",
        taskDefinition: readerTask,
        assignPublicIp: true,
        securityGroups: [sg],
        enableExecuteCommand: true,
      }
    );

    const lb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      "ALB",
      {
        vpc: props.vpc,
        internetFacing: true,
      }
    );
    const listener = lb.addListener("Listener", {
      port: 80,
      defaultAction:
        cdk.aws_elasticloadbalancingv2.ListenerAction.fixedResponse(404, {
          messageBody: "Not Found",
        }),
    });
    listener.addTargets("WriterTarget", {
      port: 80,
      healthCheck: {
        path: "/health",
      },
      protocol: cdk.aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
      targets: [
        writerService.loadBalancerTarget({
          containerName: "WriterContainer",
          containerPort: 3000,
        }),
      ],
      priority: 100,
      conditions: [
        cdk.aws_elasticloadbalancingv2.ListenerCondition.httpRequestMethods([
          "POST",
        ]),
        cdk.aws_elasticloadbalancingv2.ListenerCondition.pathPatterns([
          "/writer",
        ]),
      ],
    });
    listener.addTargets("ReaderTarget", {
      port: 80,
      healthCheck: {
        path: "/health",
      },
      protocol: cdk.aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
      targets: [
        readerService.loadBalancerTarget({
          containerName: "ReaderContainer",
          containerPort: 3000,
        }),
      ],
      priority: 200,
      conditions: [
        cdk.aws_elasticloadbalancingv2.ListenerCondition.httpRequestMethods([
          "GET",
        ]),
        cdk.aws_elasticloadbalancingv2.ListenerCondition.pathPatterns([
          "/reader",
        ]),
      ],
    });
  }
}
