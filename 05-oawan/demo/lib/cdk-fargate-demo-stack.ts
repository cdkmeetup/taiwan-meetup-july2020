import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as log from '@aws-cdk/aws-logs';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ecr from '@aws-cdk/aws-ecr';

const stackPolicy = {
	removalPolicy: cdk.RemovalPolicy.DESTROY,
};

export class CdkFargateDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Env Args
    const { PROJ_NAME = 'demo', VPC_NAME } = process.env;

    // VPC
    const vpc_opts = !!VPC_NAME ? { vpcName: VPC_NAME } : { isDefault: true }; // use specified or default vpc
    const vpc = ec2.Vpc.fromLookup(this, `${PROJ_NAME}-vpc`, vpc_opts);

    // Subnet (Public Subnet)，需綁定為指向 natgateway 之 route table
    const public_subnet_1 = ec2.Subnet.fromSubnetAttributes(this, `${PROJ_NAME}-public-subnet-1`, {
      availabilityZone: 'ap-northeast-1c',
      subnetId:'subnet-049a09f8c50809857',
      routeTableId: 'rtb-0330d717fdf6f4ca8'
    });
    const public_subnet_2 = ec2.Subnet.fromSubnetAttributes(this, `${PROJ_NAME}-public-subnet-2`, {
      availabilityZone: 'ap-northeast-1c',
      subnetId:'subnet-093901b3ac2a36f85',
      routeTableId: 'rtb-0330d717fdf6f4ca8'
    });
    
    // Security Group
    const securityGroup = new ec2.SecurityGroup(this, `${PROJ_NAME}-security-group`, {
			vpc,
			allowAllOutbound: true,
			securityGroupName: PROJ_NAME,
    });
    // Add Inbound
		securityGroup.addIngressRule(ec2.Peer.ipv4('172.32.0.0/16'), ec2.Port.allTraffic(), 'VPC-Alpha');
		securityGroup.addIngressRule(ec2.Peer.ipv4('0.0.0.0/16'), ec2.Port.allTraffic(), 'ALL');
    // securityGroup.addIngressRule(ec2.Peer.ipv4('0.0.0.0/32'), ec2.Port.tcp(80), 'Office');
    // ... Other Inbound ...
    
    // Log Group
		const logGroup = new log.LogGroup(this, `${PROJ_NAME}-log-group`, {
			...stackPolicy,
			logGroupName: `/ecs/${PROJ_NAME}`,
			retention: log.RetentionDays.INFINITE, // The number of days to retain the log events in the specified log group.
    });
    
    // ELB - Target Group
		const targetGroup = new elb.ApplicationTargetGroup(this, `${PROJ_NAME}-target-group`, {
			vpc,
			targetGroupName: PROJ_NAME,
			targetType: elb.TargetType.IP,
			protocol: elb.ApplicationProtocol.HTTP,
      port: 80,
      
      // Customize healthCheck with your Service
			// healthCheck: {
			// 	path: '/ping',
			// 	healthyThresholdCount: 5,
			// 	unhealthyThresholdCount: 2,
			// 	timeout: cdk.Duration.seconds(5),
			// 	interval: cdk.Duration.seconds(30),
			// 	healthyHttpCodes: '200',
			// },
    });
    
    // ELB - Load Balancer
    const loadBalancer = new elb.ApplicationLoadBalancer(this, `${PROJ_NAME}-load-balancer`, {
			vpc,
			securityGroup,
			internetFacing: true, // for Public facing
			ipAddressType: elb.IpAddressType.IPV4,
			loadBalancerName: PROJ_NAME,
			vpcSubnets: {
				subnets: [public_subnet_1, public_subnet_2],
			},
    });
    // Add Listener
		loadBalancer.addListener(`${PROJ_NAME}-listener`, {
			protocol: elb.ApplicationProtocol.HTTP,
			port: 80,
			defaultTargetGroups: [targetGroup],
    });
    
    // ECR
    const ecrRepo = ecr.Repository.fromRepositoryName(this, `${PROJ_NAME}-ecr`, 'amazon-ecs-sample');

    // ECS - Fargate Task Definition
    const account = props?.env?.account || '';
		const taskRole = iam.Role.fromRoleArn(
			this,
			`${PROJ_NAME}-task-role`,
			`arn:aws:iam::${account}:role/ecsTaskExecutionRole`,
			{
				mutable: false,
			},
		);
		const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, `${PROJ_NAME}-task-definition`, { // or use TaskDefinition and specified compatibility to FARGATE
			family: PROJ_NAME,
			memoryLimitMiB: 2048,
			cpu: 1024,
			taskRole,
			executionRole: taskRole,
    });
    // Add Container
    fargateTaskDefinition.addContainer(`${PROJ_NAME}-container`, {
      // Use an image from ECR repo
      image: ecs.ContainerImage.fromEcrRepository(ecrRepo, 'latest'),

      // Use an image from DockerHub
      // image: ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),

      cpu: 1024,
      environment: {
        AWS_DEFAULT_REGION: 'ap-northeast-1',
        // ... env args ...
      },
      memoryReservationMiB: 500,
      memoryLimitMiB: 2048,

      // 指定 logging group
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'ecs',
        logGroup,
      }),
    })
    // Add listen port
    .addPortMappings({
      containerPort: 80,
      hostPort: 80,
    });

    // ECS - Fargate Service
    const cluster = new ecs.Cluster(this, `${PROJ_NAME}-cluster`, { vpc });
    const svc = new ecs.FargateService(this, `${PROJ_NAME}-service`, {
      cluster,
      taskDefinition: fargateTaskDefinition
    });

    // Let loadbalancer loadbalance to this Service of the TargetGroup
    targetGroup.addTarget(svc);

    new cdk.CfnOutput(this, `${PROJ_NAME}-url`, {
      value: `https://${loadBalancer.loadBalancerDnsName}`
    });
  }
}
