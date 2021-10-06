
##
## LOCALS
##
locals {
  project_root = abspath("..")
  project_name = "praxis"
  domains = {
    "pr" : "pr-${var.pr_number}-api.praxisco.link",
    "eng" : "eng-${var.engineer}-api.praxisco.link",
    "staging" : "staging-api.praxisco.link",
    "qa" : "qa-api.praxisco.link",
    "uat" : "uat-api.praxisco.link",
    "prod" : "api.praxisco.link"
  }
  domain = local.domains[var.env]
  tld    = "praxisco.link"
  env_name_map = {
    "pr" : "pr-${var.pr_number}",
    "eng" : "eng-${var.engineer}",
    "staging" : "staging",
    "qa" : "qa",
    "uat" : "uat",
    "prod" : "prod"
  }
  env_name = local.env_name_map[var.env]
  tags = {
    PraxisEnv     = var.env
    PraxisEnvName = local.env_name
    PraxisProject = "praxis-api"
  }
}

##
## DATA
##

data "aws_caller_identity" "current" {}

data "aws_ssm_parameter" "token_sig_secret" {
  name = "/${local.env_name}/praxis_infrastructure/token_sig_secret"
}

data "aws_ssm_parameter" "praxis_api_key" {
  name = "/${local.env_name}/praxis_infrastructure/api_key"
}

data "aws_ssm_parameter" "graphcms_webhook_signature_secret" {
  name = "/${local.env_name}/praxis_infrastructure/graphcms_webhook_signature_secret"
}

data "aws_ssm_parameter" "graphcms_webhook_key" {
  name = "/${local.env_name}/praxis_infrastructure/graphcms_webhook_key"
}

data "aws_ssm_parameter" "graphcms_api_token" {
  name = "/${local.env_name}/praxis_infrastructure/graphcms_api_token"
}

data "aws_ssm_parameter" "graphcms_api_url" {
  name = "/${local.env_name}/praxis_infrastructure/graphcms_api_url"
}

data "aws_ssm_parameter" "webflow_api_token" {
  name = "/${local.env_name}/praxis_infrastructure/webflow_api_token"
}

data "aws_ssm_parameter" "webflow_site_id" {
  name = "/${local.env_name}/praxis_infrastructure/webflow_site_id"
}

data "aws_ssm_parameter" "google_geocoding_api_key" {
  name = "/${local.env_name}/praxis_infrastructure/google_geocoding_api_key"
}

data "aws_acm_certificate" "wildcard_domain" {
  domain   = "*.${local.tld}"
  statuses = ["ISSUED"]
}

data "aws_route53_zone" "main" {
  name         = "${local.tld}."
  private_zone = false
}


##
## API GATEWAY
##

resource "aws_apigatewayv2_api" "api" {

  name          = "${local.env_name}-${local.project_name}-api"
  description   = "Api Gateway API proxing to lambdas for ${local.project_name}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_methods = ["*"]
    allow_origins = ["*"]
    allow_headers = [
      "content-type",
      "x-amz-date",
      "authorization",
      "x-api-key",
      "x-amz-security-token",
      "x-amz-user-agent"
    ]
  }

  tags = local.tags
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
  tags        = local.tags
}

resource "aws_apigatewayv2_domain_name" "main" {
  domain_name = local.domain
  domain_name_configuration {
    certificate_arn = data.aws_acm_certificate.wildcard_domain.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
  tags = local.tags
}

resource "aws_apigatewayv2_api_mapping" "main" {
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.main.id
  stage       = aws_apigatewayv2_stage.default.id
}

resource "aws_route53_record" "main" {
  name    = aws_apigatewayv2_domain_name.main.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.main.zone_id

  alias {
    name                   = aws_apigatewayv2_domain_name.main.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.main.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}


##
## ROUTES & INTEGRATIONS
##

locals {
  package = jsondecode(file("${local.project_root}/package.json"))
  manifestJson = jsondecode(file("${local.project_root}/manifest.json"))
  version = local.package.version
  manifest = flatten([
    for service in keys(local.manifestJson) : [
      for function in keys(local.manifestJson[service]) : {
        service     = service
        function    = function
        version     = local.manifestJson[service][function]["version"]
        environment = lookup(local.manifestJson[service][function], "environment", [])
        http        = lookup(local.manifestJson[service][function], "http", true)
        deploy      = lookup(local.manifestJson[service][function], "deploy", true)
        timeout     = lookup(local.manifestJson[service][function], "timeout", 60)
        memory      = lookup(local.manifestJson[service][function], "memory", 256)

        key      = "${service}.${function}"
        zip      = "praxis-api.zip"
        location = "${local.project_root}/praxis-api.zip"
      }
    ]
  ])
}


##
## S3 ARCHIVE
##

resource "aws_s3_bucket" "zips" {
  bucket        = "${local.env_name}-${local.project_name}-api-archive"
  acl           = "private"
  force_destroy = true
  tags          = local.tags
}

resource "aws_s3_bucket_object" "zip" {
  bucket = aws_s3_bucket.zips.bucket
  key    = "praxis-api-${local.version}.zip"
  source = "${local.project_root}/praxis-api.zip"
  etag   = filemd5("${local.project_root}/praxis-api.zip")
  tags   = local.tags
}


##
## LAMBDAS
##

locals {
  // Secrets and uncommon environment vars. Must be named in the environment
  // list for a function in the manifest to be be applied.
  available_environment_variables = {
    API_KEY                 = data.aws_ssm_parameter.praxis_api_key.value
    GRAPHCMS_WEBHOOK_SIGNATURE_SECRET = data.aws_ssm_parameter.graphcms_webhook_signature_secret.value
    GRAPHCMS_WEBHOOK_KEY    = data.aws_ssm_parameter.graphcms_webhook_key.value
    GRAPHCMS_API_TOKEN      = data.aws_ssm_parameter.graphcms_api_token.value
    GRAPHCMS_API_URL        = data.aws_ssm_parameter.graphcms_api_url.value
    WEBFLOW_API_TOKEN       = data.aws_ssm_parameter.webflow_api_token.value
    WEBFLOW_SITE_ID         = data.aws_ssm_parameter.webflow_site_id.value
    GOOGLE_GEOCODING_API_KEY = data.aws_ssm_parameter.google_geocoding_api_key.value
  }
}

module "lambda" {
  source = "git::https://git@github.com/terraform-aws-modules/terraform-aws-lambda.git?ref=v1.48.0"

  for_each = { for func in local.manifest : func.key => func if func.deploy }

  function_name = "${local.env_name}-${local.project_name}-api-${each.value.service}-${each.value.function}"
  handler       = "index.handler"
  timeout       = each.value.timeout
  memory_size   = each.value.memory

  create_package = false
  s3_existing_package = {
    bucket = aws_s3_bucket.zips.bucket
    key    = aws_s3_bucket_object.zip.key
  }

  tracing_mode = "Active"
  lambda_role  = aws_iam_role.lambda_role.arn
  create_role  = false

  runtime = "nodejs14.x"

  environment_variables = merge({ for var_name in each.value.environment : var_name => local.available_environment_variables[var_name] }, {
    PRAXIS_API_KEY        = data.aws_ssm_parameter.praxis_api_key.value
    PRAXIS_ENV            = var.env
    PRAXIS_ENV_NAME       = local.env_name
    PRAXIS_SERVICE        = each.value.service
    PRAXIS_FUNCTION       = each.value.function
    PRAXIS_VERSION        = each.value.version
    PRAXIS_API_URL        = "https://${aws_apigatewayv2_stage.default.invoke_url}"
    TOKEN_SIG_SECRET           = data.aws_ssm_parameter.token_sig_secret.value
    DYNAMO_TABLE_NAME          = aws_dynamodb_table.main.name
  })

  tags = local.tags

}


##
## API GATEWAY ROUTES
##

resource "aws_apigatewayv2_route" "main" {

  for_each = { for func in local.manifest : func.key => func if func.http }

  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /${each.value.service}/${each.value.function}"
  target    = "integrations/${aws_apigatewayv2_integration.main[each.key].id}"
}

resource "aws_apigatewayv2_integration" "main" {

  for_each = { for func in local.manifest : func.key => func if func.http }

  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = module.lambda[each.key].this_lambda_function_arn
  payload_format_version = "2.0"
  timeout_milliseconds   = 20000

  # Due to open issue - https://github.com/terraform-providers/terraform-provider-aws/issues/11148#issuecomment-619160589
  # Bug in terraform-aws-provider with perpetual diff
  lifecycle {
    ignore_changes = [passthrough_behavior]
  }
}

resource "aws_lambda_permission" "apigw" {

  for_each = { for func in local.manifest : func.key => func if func.http }

  statement_id = "AllowAPIGatewayInvoke"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*" // TODO: Be more specific
  function_name = module.lambda[each.key].this_lambda_function_name
}


##
## LAMBDA IAM
##

data "aws_iam_policy_document" "lambda_policy_doc" {

  statement {
    effect    = "Allow"
    resources = ["*"]
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
  }

  statement {
    effect    = "Allow"
    resources = ["*"]
    actions = [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords"
    ]
  }

  statement {
    effect = "Allow"
    resources = [
      "arn:aws:lambda:${var.region}:${data.aws_caller_identity.current.account_id}:function:*"
    ]
    actions = [
      "lambda:InvokeFunction"
    ]
  }

  statement {
    effect = "Allow"
    resources = [
      "arn:aws:dynamodb:${var.region}:${data.aws_caller_identity.current.account_id}:table/*"
    ]
    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:BatchWriteItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:GetRecords"
    ]
  }

}

data "aws_iam_policy_document" "policy" {
  statement {
    sid     = ""
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "frontend_lambda_role_policy" {
  name   = "${local.env_name}-${local.project_name}-api-lambda-policy"
  role   = aws_iam_role.lambda_role.id
  policy = data.aws_iam_policy_document.lambda_policy_doc.json
}

resource "aws_iam_role" "lambda_role" {
  name                  = "${local.env_name}-${local.project_name}-api-lambda-role"
  assume_role_policy    = data.aws_iam_policy_document.policy.json
  force_detach_policies = true
  tags                  = local.tags
}
