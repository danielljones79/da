import * as cdk from 'aws-cdk-lib';
import { Alarm } from 'aws-cdk-lib/aws-cloudwatch';

export interface AlarmWithAnnotation {
  alarm: Alarm;
  // Add other properties if necessary
}

export let dependencyAlarms: AlarmWithAnnotation[] = [];

export function addAlarm(alarm: Alarm) {
  dependencyAlarms.push({ alarm });
}