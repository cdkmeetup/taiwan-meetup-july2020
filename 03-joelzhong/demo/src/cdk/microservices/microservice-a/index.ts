import * as cdk from '@aws-cdk/core';
import {AbstractFargate} from "../abstract-fargate";
import {AbstractCicd} from "../abstract-cicd";
import {MicroserviceAFargate} from "./microservice-a-fargate";
import {MicroserviceACicd} from "./microservice-a-cicd";
import {FargateProps} from "../props";

export class MicroserviceA extends cdk.Stack {
  readonly fargate: AbstractFargate;
  readonly cicd: AbstractCicd;
  readonly serviceName = `microservice-a`;

  constructor(scope: cdk.Construct, id: string, props: FargateProps) {
    super(scope, id, props);

    this.fargate = new MicroserviceAFargate(this, `MyMicroserviceAFargate`, {
      serviceName: this.serviceName,
      cluster: props.cluster,
    });

    this.cicd = new MicroserviceACicd(this, `MicroserviceACicd`, {
      serviceName: this.serviceName,
      vpc: props.vpc,
      ecrRepository: props.ecrRepository,
      artifactBucket: props.artifactBucket,
      fargateService: this.fargate.albFargate.service,
    });
  }
}
