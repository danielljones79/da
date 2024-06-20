import { ParentStack } from './parent-stack';
import { App, Stack, DefaultStackSynthesizer, Stage, PermissionsBoundary} from 'aws-cdk-lib';


declare const app: App;

const prodStage = new Stage(app, 'ProdStage', {
  permissionsBoundary: PermissionsBoundary.fromName('cdk-${Qualifier}-PermissionsBoundary-${AWS::AccountId}-${AWS::Region}'),
});


new ParentStack(prodStage, 'ProdStack', {
  synthesizer: new DefaultStackSynthesizer({
    qualifier: 'custom',
  }),
});

