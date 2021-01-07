#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LocustClusterStack } from '../lib/locust-cluster-stack';
import { FoundationStack } from '../lib/foundation-stack';

const app = new cdk.App();

const foundationStack = new FoundationStack(app, 'FoundationStack');
new LocustClusterStack(app, 'LocustClusterStack', {
  vpc: foundationStack.vpc,
});
