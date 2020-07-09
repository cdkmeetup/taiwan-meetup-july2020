import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as s3 from "@aws-cdk/aws-s3";
import * as ecr from "@aws-cdk/aws-ecr";

export interface FargateProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  cluster: ecs.ICluster;
  artifactBucket: s3.IBucket;
  ecrRepository: ecr.IRepository;
}