import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipelineActions = require('@aws-cdk/aws-codepipeline-actions');
import * as s3 from "@aws-cdk/aws-s3";
import * as ecr from "@aws-cdk/aws-ecr";

interface AbstractCicdProps {
  serviceName: string;
  vpc: ec2.IVpc;
  artifactBucket: s3.IBucket;
  ecrRepository: ecr.IRepository;
  fargateService: ecs.FargateService;
}

export abstract class AbstractCicd extends cdk.Construct {
  readonly props: AbstractCicdProps;
  readonly codebuild: codebuild.Project;
  readonly codepipeline: codepipeline.Pipeline;

  constructor(scope: cdk.Construct, id: string, props: AbstractCicdProps) {
    super(scope, id);

    this.props = props;

    const { buildProject, buildPipeline } = this.create();

    this.codebuild = buildProject;
    this.codepipeline = buildPipeline;
  }

  private create(): {
    buildProject: codebuild.Project,
    buildPipeline: codepipeline.Pipeline,
  } {
    const codebuildRole = new iam.Role(this, 'CodeBuildIamRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
    });
    codebuildRole.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['ecr:GetAuthorizationToken'],
    }));
    codebuildRole.addToPolicy(new iam.PolicyStatement({
      resources: [`${this.props.ecrRepository.repositoryArn}*`],
      actions: ['ecr:*'],
    }));

    const bitbucket = codebuild.Source.bitBucket(this.createVersionControlConfig());

    const artifacts = codebuild.Artifacts.s3({
      bucket: this.props.artifactBucket,
      path: this.props.serviceName,
      name: `build.zip`,
      includeBuildId: false,
    });

    const buildProject = new codebuild.Project(this, `MyCodebuildProject`, {
      role: codebuildRole,
      source: bitbucket,
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.DOCKER_LAYER, codebuild.LocalCacheMode.CUSTOM),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_3_0,
        privileged: true,
      },
      buildSpec: this.createCodebuildSpec(),
      artifacts,
    });

    const definitionSourceOutput = new codepipeline.Artifact();

    const buildPipeline = new codepipeline.Pipeline(this, `MyPipeline`, {
      pipelineName: `${this.props.serviceName} deploy pipeline`,
      stages: [
        {
          stageName: `Source`,
          actions: [
            new codepipelineActions.S3SourceAction({
              actionName: `Get Image Definition`,
              bucket: this.props.artifactBucket,
              bucketKey: `${this.props.serviceName}/build.zip`,
              output: definitionSourceOutput,
            }),
          ],
        },
        {
          stageName: `DeployToECS`,
          actions: [
            new codepipelineActions.EcsDeployAction({
              actionName: `Deploy To ${this.props.serviceName}`,
              service: this.props.fargateService,
              input: definitionSourceOutput,
            }),
          ],
        }
      ]
    });

    return { buildProject, buildPipeline }
  }

  protected abstract createCodebuildSpec(): codebuild.BuildSpec;

  protected abstract createVersionControlConfig(): codebuild.BitBucketSourceProps;
}