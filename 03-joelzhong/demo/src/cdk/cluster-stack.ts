import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';

interface ClusterStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class ClusterStack extends cdk.Stack {
  readonly vpc: ec2.IVpc;
  readonly cluster: ecs.ICluster;
  
  constructor(scope: cdk.Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    this.vpc = props.vpc;

    this.cluster = new ecs.Cluster(this, 'MyEcsCluster', {
      vpc: this.vpc,
    });
  }
}




