import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';

export interface AbstractFargateProps {
  serviceName: string;
  cluster: ecs.ICluster;
}

export abstract class AbstractFargate extends cdk.Construct {
  readonly props: AbstractFargateProps;
  readonly albFargate: ecsPatterns.ApplicationLoadBalancedFargateService;

  constructor(scope: cdk.Construct, id: string, props: AbstractFargateProps) {
    super(scope, id);

    this.props = props;
    this.albFargate = this.create();
  }

  private create(): ecsPatterns.ApplicationLoadBalancedFargateService {
    return new ecsPatterns.ApplicationLoadBalancedFargateService(this, `MyFargateService`, {
      cluster: this.props.cluster,
      taskDefinition: this.createFargateTaskDefinition(),
    });
  }

  protected abstract createFargateTaskDefinition(): ecs.FargateTaskDefinition;
}