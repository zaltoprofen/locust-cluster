# Locust Cluster

The CDK code for deploying [Locust](https://locust.io/) cluster on Fargate

## :warning: DO NOT DEPLOY WITH DEFAULT CONFIGURATION :warning:

If you deploy the Stack as is, anyone can see the Locust GUI.
To prevent this, you need to change the security group attached Load Balancer before deploying it.

[Security Group attached Load Balancer](https://github.com/zaltoprofen/locust-cluster/blob/6ad86c2b8f43c08df55cee71c67674bad9c738f3/lib/locust-cluster-stack.ts#L33-L34)

## Installation

```bash
git clone https://github.com/zaltoprofen/locust-cluster.git
cd locust-cluster
npm install
```

## Load testing scenario definition

Test scenarios in Locust are written as Python code.

In this repository, the scenario definition is written in `assets/locust-container/scenario.py`. Please modify it before deploying.

Also, if you need other packages or libraries for your test scenario, change the requirements.txt or Dockerfile in the same directory.

## Deployment

```bash
npx cdk diff  # Check diff
npx cdk deploy FoundationStack LocustClusterStack
```
