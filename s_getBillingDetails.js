
var serverlessSDK = require('./serverless_sdk/index.js');
serverlessSDK = new serverlessSDK({
  orgId: 'terralanes',
  applicationName: 'terralanes-backend',
  appUid: 'MGTDBb0H5JGR9c03rN',
  orgUid: 'c40ff449-c91a-4aca-9c7e-aa71837ea9d1',
  deploymentUid: '4d6b95ef-9800-427d-a61e-daee0c3aacb4',
  serviceName: 'terralanes-api',
  shouldLogMeta: true,
  shouldCompressLogs: true,
  disableAwsSpans: false,
  disableHttpSpans: false,
  stageName: 'test-warmup',
  serverlessPlatformStage: 'prod',
  devModeEnabled: false,
  accessKey: null,
  pluginVersion: '3.7.1',
  disableFrameworksInstrumentation: false
});

const handlerWrapperArgs = { functionName: 'terralanes-api-test-warmup-getBillingDetails', timeout: 20 };

try {
  const userHandler = require('././handlers/billing.js');
  module.exports.handler = serverlessSDK.handler(userHandler.getBillingDetails, handlerWrapperArgs);
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs);
}