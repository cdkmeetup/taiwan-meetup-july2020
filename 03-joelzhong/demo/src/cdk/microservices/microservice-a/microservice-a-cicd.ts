import {AbstractCicd} from "../abstract-cicd";
import codebuild = require('@aws-cdk/aws-codebuild');

export class MicroserviceACicd extends AbstractCicd {

  protected createCodebuildSpec(): codebuild.BuildSpec {
    return codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        install: {
          'runtime-versions': {
            nodejs: 12,
          },
        },
        build: {
          commands: [
            `echo "This is nodejs app codebuild script"`,
            `cd ./src/apps/${this.props.serviceName}`,
            `docker build -t ${this.props.ecrRepository.repositoryUri}:$CODEBUILD_RESOLVED_SOURCE_VERSION`,
            `echo "ECR login now"`,
            `$(aws ecr get-login --no-include-email)`,
            `echo "Pushing to ECR now"`,
            `docker push ${this.props.ecrRepository.repositoryUri}:$CODEBUILD_RESOLVED_SOURCE_VERSION`,
            `printf '[{"name":"${this.props.serviceName}","imageUri":"%s"}]' ${this.props.ecrRepository.repositoryUri}:$CODEBUILD_RESOLVED_SOURCE_VERSION > imagedefinitions.json`,
          ],
        },
      },
      artifacts: {
        files: [
          `imagedefinitions.json`,
        ],
      },
    });
  }

  protected createVersionControlConfig(): codebuild.BitBucketSourceProps {
    return {
      owner: 'YOUR_BITBUCKET_ACCOUNT_NAME',
      repo: 'YOUR_BITBUCKET_REPO_NAME_FOR_NODEJS',
      webhook: true,
      webhookFilters: [
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('master'),
      ],
    };
  }
}