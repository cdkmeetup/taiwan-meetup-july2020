import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';


const DEFAULT_ALLOCATION_ID = 'eipalloc-01e90a91e61f2cbee'


export interface EipAssociationStackProps extends cdk.StackProps {
  readonly instance: ec2.IInstance;
}

export class BastionLinuxStack extends cdk.Stack {
  readonly instance: ec2.IInstance;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    this.instance = new ec2.BastionHostLinux(this, 'Bastion', {
      vpc: getOrCreateVpc(this),
      instanceType: new ec2.InstanceType('t3.small'),
    })
  }
}

export class EipAssociationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: EipAssociationStackProps) {
    super(scope, id, props);

    const eip = new ec2.CfnEIPAssociation(this, 'EipAssociation', {
      allocationId: this.node.tryGetContext('eip_allocation_id') ?? DEFAULT_ALLOCATION_ID,
      instanceId: props.instance.instanceId,
    })
  }
}

function getOrCreateVpc(scope: cdk.Construct): ec2.IVpc {
  // use an existing vpc or create a new one
  return scope.node.tryGetContext('use_default_vpc') === '1' ?
    ec2.Vpc.fromLookup(scope, 'Vpc', { isDefault: true }) :
    scope.node.tryGetContext('use_vpc_id') ?
      ec2.Vpc.fromLookup(scope, 'Vpc', { vpcId: scope.node.tryGetContext('use_vpc_id') }) :
      new ec2.Vpc(scope, 'Vpc', { maxAzs: 3, natGateways: 1 });
}

const app = new cdk.App()

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const bastion = new BastionLinuxStack(app, 'BastionLinuxStack', { env })
new EipAssociationStack(app, 'EipAssociationStack', {
  env,
  instance: bastion.instance,
})

