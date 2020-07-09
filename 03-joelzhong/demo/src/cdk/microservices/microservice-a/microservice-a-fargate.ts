import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import {AbstractFargate, AbstractFargateProps} from "../abstract-fargate";

export class MicroserviceAFargate extends AbstractFargate {
  constructor(scope: cdk.Construct, id: string, props: AbstractFargateProps) {
    super(scope, id, props);
  }

  protected createFargateTaskDefinition(): ecs.FargateTaskDefinition {
    const taskDefinition = new ecs.FargateTaskDefinition(this, `MyFargateTaskDefinition`, {
      cpu: 512,
      memoryLimitMiB: 1024,
    });

    const name = `microservice-a`;

    taskDefinition
      .addContainer(name, {
        image: ecs.ContainerImage.fromAsset(`${__dirname}/../../../apps/${name}/`)
      })
      .addPortMappings({
        containerPort: 3000
      });

    return taskDefinition;
  }
}