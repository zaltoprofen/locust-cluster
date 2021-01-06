#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LocustClusterStack } from '../lib/locust-cluster-stack';

const app = new cdk.App();
new LocustClusterStack(app, 'LocustClusterStack');
