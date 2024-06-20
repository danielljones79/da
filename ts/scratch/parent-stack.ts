

import * as cdk from 'aws-cdk-lib';
import { NestedStack } from './nested-stack';
import { addAlarm } from './shared';

declare const alias: any;
export class ParentStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create your alarms here and add them to the shared array
    const alarm1 = new Alarm(this, 'Alarm1', {
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 1,
      evaluationPeriods: 1,
      metric: alias,
    });
    addAlarm(alarm1);

    const alarm2 = new Alarm(this, 'Alarm2', {
      // alarm configuration
    });
    addAlarm(alarm2);

    // ... more alarms

    new NestedStack(this, 'NestedStack'); // Pass the alarms to the nested stack
  }
}

/*

import * as cdk from 'aws-cdk-lib';
import { NestedStack } from './nested-stack';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { addAlarm} from './shared';
import { Construct } from 'constructs';

declare const alias: any;

export class ParentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create your alarms here and add them to the shared array
    const alarm1 = new cloudwatch.Alarm(this, 'Alarm1', {
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 1,
      evaluationPeriods: 1,
      metric: alias,
    });
    addAlarm(alarm1);

    const alarm2 = new cloudwatch.Alarm(this, 'Alarm2', {
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 1,
      evaluationPeriods: 1,
      metric: alias,
    });
    addAlarm(alarm2);

    new NestedStack(this, 'NestedStack'); // Pass the alarms to the nested stack
  }
}
  */