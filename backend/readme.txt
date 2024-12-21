Backend System

> npm run start

Contents of file "local.settings.json" should be at least structured:

{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "...",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "OPENAI_API_KEY": "...",
    "OPENAI_ASSISTANT_ID": "...",
    "FUNCTIONS_EXTENSION_VERSION": "~4",
    "WEBSITE_NODE_DEFAULT_VERSION": "~20",
    "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING": "...",
    "WEBSITE_CONTENTSHARE": "help-amd-backend6bee82",
    "WEBSITE_RUN_FROM_PACKAGE": "1",
    "APPLICATIONINSIGHTS_CONNECTION_STRING": "...",
    "CosmosDbConnectionSetting": "AccountEndpoint=...",
  },
  "Host": {
    "CORS": "*"
  }
}