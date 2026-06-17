import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(__dirname, '../../.env'),
});
export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const cartLambda = new NodejsFunction(this, 'CartLambda', {
      runtime: Runtime.NODEJS_LATEST,
      timeout: cdk.Duration.seconds(30),
      projectRoot: path.join(__dirname, '../../'),
      depsLockFilePath: path.join(__dirname, '../../package-lock.json'),
      entry: path.join(__dirname, '../../dist/src/lambda.js'),
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
      environment: {
        DB_HOST: process.env.DB_HOST || '',
        DB_PORT: process.env.DB_PORT || '5432',
        DB_USER: process.env.DB_USER || '',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        DB_NAME: process.env.DB_NAME || 'postgres',
        DB_SSL: process.env.DB_SSL || 'true',
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
