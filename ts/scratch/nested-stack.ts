import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { dependencyAlarms } from './shared';

export class NestedStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    // Access and use the shared dependencyAlarms array in the nested stack
    for (const alarmWithAnnotation of dependencyAlarms) {
      // Do something with the alarms, e.g., add them to a CloudWatch dashboard
    }
  }