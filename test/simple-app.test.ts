import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as SimpleApp from '../lib/simple-app-stack';
import '@aws-cdk/assert/jest';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SimpleApp.SimpleAppStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({"Resources": {
      "MySimpleAppBucketpdp6119CBC0": {
        "Type": "AWS::S3::Bucket",
        "Properties": {
          "BucketEncryption": {
            "ServerSideEncryptionConfiguration": [
              {
                "ServerSideEncryptionByDefault": {
                  "SSEAlgorithm": "AES256"
                }
              }
            ]
          }
        },
        "UpdateReplacePolicy": "Retain",
        "DeletionPolicy": "Retain",
      },
    },
    "Outputs": {
      "MySimpleAppBucketpdpNameExport": {
        "Value": {
          "Ref": "MySimpleAppBucketpdp6119CBC0"
        },
        "Export": {
          "Name": "MySimpleAppBucket-pdp"
        }
      }
    },}, MatchStyle.EXACT))
});

test('Stack create a S3 bucket', () => {
// ARRANGE
const app = new cdk.App();
// ACT
const stack = new SimpleApp.SimpleAppStack(app, 'MyTestStack');

//ASSERT
expect(stack).toHaveResource('AWS::S3::Bucket');
});