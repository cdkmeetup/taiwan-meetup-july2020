#!/bin/bash

cdk diff "MyStaging*" \
	--app="npx ts-node ./bin/my-staging-fargates.ts" \
	--toolkit-stack-name=CDKToolkit


