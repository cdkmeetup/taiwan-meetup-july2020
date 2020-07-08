# AWS CDK and CDK8S服務更新

# Link to HackMD
https://hackmd.io/@pahud/taiwan-cdk-meetup-01-pahud/

# RDS Proxy sample

```ts
// Creating a Database Proxy
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as secrets from '@aws-cdk/aws-secretsmanager';

const vpc: ec2.IVpc = ...;
const securityGroup: ec2.ISecurityGroup = ...;
const secret: secrets.ISecret = ...;
const dbInstance: rds.IDatabaseInstance = ...;

const proxy = dbInstance.addProxy('proxy', {
    connectionBorrowTimeout: cdk.Duration.seconds(30),
    maxConnectionsPercent: 50,
    secret,
    vpc,
});

```

# Lambda Filesystem

```ts
const fn = new lambda.Function(stack, 'MyLambda', {
  code,
  handler,
  runtime,
  vpc,
  // mount the access point to /mnt/msg in the lambda runtime enironment
  filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/msg'),
});
```

## Filesystem Access

```ts
// create a new Amaozn EFS filesystem
const fileSystem = new efs.FileSystem(stack, 'Efs', { vpc });

// create a new access point from the filesystem
const accessPoint = fileSystem.addAccessPoint('AccessPoint', {
  // set /export/lambda as the root of the access point
  path: '/export/lambda',
  // as /export/lambda does not exist in a new efs filesystem, the efs will create the directory with the following createAcl
  createAcl: {
    ownerUid: '1001',
    ownerGid: '1001',
    permissions: '750',
  },
  // enforce the POSIX identity so lambda function will access with this identity
  posixUser: {
    uid: '1001',
    gid: '1001',
  },
});

const fn = new lambda.Function(stack, 'MyLambda', {
  code,
  handler,
  runtime,
  vpc,
  // mount the access point to /mnt/msg in the lambda runtime enironment
  filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/msg'),
});
```

# API Gateway HTTP API Custom Domain

```ts
const certArn = 'arn:aws:acm:us-east-1:111111111111:certificate';
const domainName = 'example.com';

const dn = new DomainName(stack, 'DN', {
  domainName,
  certificate: acm.Certificate.fromCertificateArn(stack, 'cert', certArn),
});

const api = new HttpApi(stack, 'HttpProxyProdApi', {
  defaultIntegration: new LambdaProxyIntegration({ handler }),
  // https://${dn.domainName} goes to prodApi $default stage
  defaultDomainMapping: {
    domainName: dn,
    mappingKey: '/',
  },
});
```
(see full sample in the [README](https://github.com/aws/aws-cdk/tree/master/packages/%40aws-cdk/aws-apigatewayv2#custom-domain))

# cdk8s-plus - L2 constructs for CDK8S

At a glance

```ts
import * as kplus from 'cdk8s-plus';
import * as cdk8s from 'cdk8s';
import * as path from 'path';

// our cdk app
const app = new cdk8s.App();

// our kuberentes chart
const chart = new cdk8s.Chart(app, 'Chart');

// lets create a volume that contains our app.
// we use a trick with a config map!
const appData = new kplus.ConfigMap(chart, 'AppData');
appData.addDirectory(path.join(__dirname, 'app'));

const appVolume = kplus.Volume.fromConfigMap(appData);

// now we create a container that runs our app
const appPath = '/var/lib/app';
const port = 80;
const container = new kplus.Container({
  image: 'node:14.4.0-alpine3.12',
  command: ['node', 'index.js', `${port}`],
  port: port,
  workingDir: appPath,
})

// make the app accessible to the container
container.mount(appPath, appVolume);

// now lets create a deployment to run a few instances of this container
const deployment = new kplus.Deployment(chart, 'Deployment', {
  spec: {
    replicas: 3,
    podSpecTemplate: {
      containers: [ container ]
    }
  },
});

// finally, we expose the deployment as a load balancer service and make it run
deployment.expose({port: 8080, serviceType: kplus.ServiceType.LOAD_BALANCER})

// we are done, synth
app.synth();
```
(see full samples in the [README](https://github.com/awslabs/cdk8s/tree/master/packages/cdk8s-plus#at-a-glance))

## AWS Taipei Summit Online 報名

![](https://i.imgur.com/IElnsLv.jpg)

https://pages.awscloud.com/aws-summit-online-taipei-registration.html

## Pahud Dev Youtube Channel

![](https://i.imgur.com/8wp8IUQ.jpg)

https://pahud.dev
