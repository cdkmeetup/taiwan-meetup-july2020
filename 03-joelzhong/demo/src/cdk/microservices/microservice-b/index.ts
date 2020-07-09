import * as cdk from '@aws-cdk/core';
import {FargateProps} from "../props";
import {AbstractFargate} from "../abstract-fargate";
import {AbstractCicd} from "../abstract-cicd";
import {MicroserviceBFargate} from "./microservice-b-fargate";
import {MicroserviceBCicd} from "./microservice-b-cicd";

export class MicroserviceB extends cdk.Stack {
  readonly fargate: AbstractFargate;
  readonly cicd: AbstractCicd;
  readonly serviceName = `microservice-b`;

  constructor(scope: cdk.Construct, id: string, props: FargateProps) {
    super(scope, id, props);

    this.fargate = new MicroserviceBFargate(this, `MyMicroserviceBFargate`, {
      serviceName: this.serviceName,
      cluster: props.cluster,
    });

    this.cicd = new MicroserviceBCicd(this, `MicroserviceBCicd`, {
      serviceName: this.serviceName,
      vpc: props.vpc,
      ecrRepository: props.ecrRepository,
      artifactBucket: props.artifactBucket,
      fargateService: this.fargate.albFargate.service,
    });
  }
}
