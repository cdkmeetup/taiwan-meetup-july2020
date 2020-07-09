#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MicroserviceA } from '../src/cdk/microservices/microservice-a';
import { MicroserviceB } from '../src/cdk/microservices/microservice-b';
import { ClusterStack } from '../src/cdk/cluster-stack';
import { config } from '../src/cdk/env';
import { InitStack } from "../src/cdk/init-stack";

const app = new cdk.App();

const init = new InitStack(app, 'MyInitStack', {
  env: config,
});

const cluster = new ClusterStack(app, 'MyStagingClusterStack', {
  vpc: init.vpc,
  env: config,
});
cluster.addDependency(init);

const serviceA = new MicroserviceA(app, 'MyMicroserviceAStack', {
  env: config,
  vpc: cluster.vpc,
  cluster: cluster.cluster,
  artifactBucket: init.cicdArtifactBucket,
});
serviceA.addDependency(cluster);

const serviceB = new MicroserviceB(app, 'MyMicroserviceBStack', {
  env: config,
  vpc: cluster.vpc,
  cluster: cluster.cluster,
  artifactBucket: init.cicdArtifactBucket,
});
serviceB.addDependency(cluster);