import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as sd from '@aws-cdk/aws-servicediscovery';


export interface LocustServicesProps {
  readonly cluster: ecs.ICluster;
  readonly image: ecs.ContainerImage;
  readonly namespace: sd.INamespace;
  readonly vpc: ec2.IVpc;
  readonly numWorkers: number;
}

export class LocustServices extends cdk.Construct {
  public readonly masterTaskDefinition: ecs.TaskDefinition;
  public readonly masterService: ecs.FargateService;
  public readonly workerTaskDefinition: ecs.TaskDefinition;
  public readonly workerService: ecs.FargateService;

  constructor(scope: cdk.Construct, id: string, props: LocustServicesProps) {
    super(scope, id);

    const { cluster, image, namespace, vpc, numWorkers } = props;
    const securityGroup = new ec2.SecurityGroup(this, 'InternalSG', { vpc });
    securityGroup.addIngressRule(securityGroup, ec2.Port.allTraffic());

    this.masterTaskDefinition = new ecs.TaskDefinition(this, 'MasterTaskDefinition', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '512',
      memoryMiB: '2048',
    });
    this.masterTaskDefinition.addContainer('Primary', {
      image,
      command: ['locust', '-f', 'scenario.py', '--master'],
    }).addPortMappings({ containerPort: 8089 }, { containerPort: 5557 });

    this.masterService = new ecs.FargateService(this, 'MasterService', {
      cluster,
      taskDefinition: this.masterTaskDefinition,
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE }),
      securityGroups: [securityGroup],
      cloudMapOptions: {
        cloudMapNamespace: namespace,
        name: 'master',
        dnsRecordType: sd.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(10),
      },
    });

    this.workerTaskDefinition = new ecs.TaskDefinition(this, 'WorkerTaskDefinition', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '2048',
      memoryMiB: '8192',
    });
    this.workerTaskDefinition.addContainer('Primary', {
      image,
      command: ['locust', '-f', 'scenario.py', '--worker', `--master-host=master.${namespace.namespaceName}`]
    });

    this.workerService = new ecs.FargateService(this, 'WorkerService', {
      cluster,
      taskDefinition: this.workerTaskDefinition,
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC }),
      assignPublicIp: true,
      securityGroups: [securityGroup],
      desiredCount: numWorkers,
    });
  }
}
