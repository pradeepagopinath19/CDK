import * as cdk from '@aws-cdk/core';
import {Bucket, BucketEncryption} from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import { Runtime } from '@aws-cdk/aws-lambda';
import * as path from 'path';
import {BucketDeployment, Source} from '@aws-cdk/aws-s3-deployment';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront'

export class SimpleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'MySimpleAppBucket-pdp', {
      encryption: BucketEncryption.S3_MANAGED
    });

    new BucketDeployment(this, 'MySimpleAppPhotos', {
      sources:[
        Source.asset(path.join(__dirname, '..', 'photos'))
      ],
      destinationBucket: bucket
    })
    const websiteBucket = new Bucket(this, 'MySimpleAppWebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    const cloudFront = new CloudFrontWebDistribution(this, 'MySimpleAppDistribution', {
      originConfigs: [
        {
          s3OriginSource:{
            s3BucketSource: websiteBucket
          },
          behaviors: [{ isDefaultBehavior: true}]
        }
      ],
    })

    new BucketDeployment(this, 'MySimpleAppWebsiteDeploy', {
      sources: [
        Source.asset(path.join(__dirname, '..', 'frontend', 'build'))
      ],
      destinationBucket: websiteBucket,
      distribution: cloudFront
    });

    const getPhotos = new lambda.NodejsFunction(this, 'MySimpleAppLambda', {
      runtime: Runtime.NODEJS_12_X,
      entry: path.join(__dirname, '..', 'api', 'get-photos', 'index.ts'),
      handler: 'getPhotos',
      environment:{
        PHOTO_BUCKET_NAME: bucket.bucketName,
      },
    });

    // List the content of the files in the s3 bucket
    const bucketContainerPermissions = new PolicyStatement();
    bucketContainerPermissions.addResources(bucket.bucketArn);
    bucketContainerPermissions.addActions('s3:ListBucket');

    // Giving the permission to read/write all contents
    const bucketPermissions = new PolicyStatement();
    bucketPermissions.addResources(`${bucket.bucketArn}/*`);
    bucketPermissions.addActions('s3:GetObject', 's3:PutObject');

    // Adding it to the role

    getPhotos.addToRolePolicy(bucketContainerPermissions);
    getPhotos.addToRolePolicy(bucketPermissions);

    const httpApi = new HttpApi(this, 'MySimpleAppHttpApi', {
      corsPreflight:{
        allowOrigins: ['*'],
        allowMethods: [HttpMethod.GET]
      },
      apiName: 'photo-api',
      createDefaultStage: true
    });

    const lambdaIntegration = new LambdaProxyIntegration({
      handler: getPhotos
    });

    httpApi.addRoutes({
      path:'/getAllPhotos',
      methods: [
        HttpMethod.GET
      ],
      integration: lambdaIntegration
    })

    new cdk.CfnOutput(this, 'MySimpleAppBucket-pdpNameExport', {
      value:bucket.bucketName,
      exportName: 'MySimpleAppBucket-pdp',
    });

    new cdk.CfnOutput(this, 'MySimpleAppWebsiteBucket-pdpNameExport', {
      value:websiteBucket.bucketName,
      exportName: 'MySimpleAppWebsiteBucket-pdp',
    });

    new cdk.CfnOutput(this, 'MySimpleAppWebsiteUrlExport', {
      value:cloudFront.distributionDomainName,
      exportName: 'MySimpleAppWebsiteUrl',
    });

    new cdk.CfnOutput(this, 'MySimpleAppApi', {
      value: httpApi.url!,
      exportName: 'MySimpleAppApiEndPoint'
    })
  }
}
