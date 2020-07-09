import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';

export class InitStack extends cdk.Stack {
  readonly cicdArtifactBucket: s3.IBucket;
  readonly vpc: ec2.IVpc;
  readonly ecrRepository: ecr.IRepository;

  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, `MyVpc`, {
      cidr: `172.16.0.0/16`,
      maxAzs: 2,
      natGateways: 1,
    });

    this.cicdArtifactBucket = new s3.Bucket(this, `MyCicdArtifactBucket`, {
      bucketName: `my-cicd-artifact-bucket-v0`,
    });

    this.ecrRepository = new ecr.Repository(this, `MyEcrRepository`, {
      repositoryName: `my-test-app`,
    });
  }
}