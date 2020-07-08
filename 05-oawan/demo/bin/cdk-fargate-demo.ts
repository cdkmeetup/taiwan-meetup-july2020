#!/usr/bin/env node
import * as readlineSync from 'readline-sync';
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkFargateDemoStack } from '../lib/cdk-fargate-demo-stack';

if (!process.env['ENV_ACCOUNT'] || !process.env['ENV_REGION']) {
    process.env['ENV_ACCOUNT'] = readlineSync.question('> 請輸入 aws account id: ');
    process.env['ENV_REGION'] = readlineSync.question('> 請輸入 stack 建立之 region (default: ap-northeast-1): ') || 'ap-northeast-1';
    process.env['VPC_NAME'] = readlineSync.question('> 請輸入以建立的 VPC name (default: default): ');
}

const app = new cdk.App();
new CdkFargateDemoStack(app, 'CdkFargateDemoStack', {
    env: {
        account: process.env['ENV_ACCOUNT'],
        region: process.env['ENV_REGION']
    }
});