import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export interface FoundationStackProps extends cdk.StackProps {
  readonly vpcCidr: string;
}

export class FoundationStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: cdk.Construct, id: string, props?: FoundationStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      cidr: props?.vpcCidr,
      maxAzs: 2,
    });
  }
}