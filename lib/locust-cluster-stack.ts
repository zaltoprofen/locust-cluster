import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as sd from '@aws-cdk/aws-servicediscovery';
import { LocustServices } from './constructs/locust-services';

export interface LocustClusterStackProps extends cdk.StackProps {
  readonly vpc: ec2.IVpc;
}

export class LocustClusterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: LocustClusterStackProps) {
    super(scope, id, props);
    const { vpc } = props;

    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });
    const namespace = new sd.PrivateDnsNamespace(this, 'Namespace', { vpc, name: 'locust.local' });
    const image = ecs.ContainerImage.fromAsset('assets/locust-container');

    const services = new LocustServices(this, 'Locust', {
      cluster, image, namespace, vpc,
      numWorkers: 10,
    });
    const locustGuiTargetGroup = new elbv2.ApplicationTargetGroup(this, 'LocustGUI', {
      vpc,
      targetType: elbv2.TargetType.IP,
      targets: [services.masterService],
      port: 8089,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });

    const loadBalancerSG = new ec2.SecurityGroup(this, 'LBSG', { vpc });
    loadBalancerSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', { vpc, securityGroup: loadBalancerSG, internetFacing: true });
    const listener = lb.addListener('Listener', { open: false, port: 80 });
    listener.addAction('ForwardLocustGUI', {
      action: elbv2.ListenerAction.forward([locustGuiTargetGroup]),
    });
  }
}