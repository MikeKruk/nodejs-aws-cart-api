import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import path from 'path';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const cartLambda = new NodejsFunction(this, 'CartLambda', {
      runtime: Runtime.NODEJS_LATEST,
      projectRoot: path.join(__dirname, '../../'),
      depsLockFilePath: path.join(__dirname, '../../package-lock.json'),
      entry: path.join(__dirname, '../../src/main.ts'),
      handler: 'handler',
      bundling: {
        externalModules: [
          '@nestjs/microservices',
          'class-transformer',
          '@nestjs/microservices/microservices-module',
          '@nestjs/websockets/socket-module',
          'class-validator',
        ],
      },
    });

    const api = new apigateway.RestApi(this, 'CartApi', {
      restApiName: 'Cart Api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      deployOptions: {
        stageName: 'dev',
      },
    });

    api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(cartLambda),
      anyMethod: true,
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API endpoint',
    });
  }
}
