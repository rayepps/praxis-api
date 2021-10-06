

locals {
  env_name_map = {
    "pr" : "pr-${var.pr_number}",
    "eng" : "eng-${var.engineer}",
    "staging" : "staging",
    "uat" : "uat",
    "prod" : "prod"
  }
  env_domain_map = {
    "pr" : "praxisco.link",
    "eng" : "praxisco.link",
    "staging" : "praxisco.link",
    "uat" : "praxisco.link",
    "prod" : "praxisco.link"
  }
  asset_domain_map = {
    "pr" : "pr-${var.pr_number}-assets.praxisco.link",
    "eng" : "eng-${var.engineer}-assets.praxisco.link",
    "staging" : "staging-assets.praxisco.link",
    "uat" : "uat-assets.praxisco.link",
    "prod" : "assets.praxisco.link"
  }
  is_prod      = var.env == "prod"
  domain       = local.env_domain_map[var.env]
  env_name     = local.env_name_map[var.env]
  asset_domain = local.asset_domain_map[var.env]
  project      = "env-infrastructure"
  tags = {
    PraxisEnv     = var.env
    PraxisEnvName = local.env_name
    PraxisProject = local.project
  }
}

##
## SECRETS
##

resource "aws_ssm_parameter" "token_sig_secret" {
  name  = "/${local.env_name}/praxis_infrastructure/token_sig_secret"
  type  = "String"
  value = var.token_signature_secret
  tags  = local.tags
}

resource "aws_ssm_parameter" "api_key" {
  name  = "/${local.env_name}/praxis_infrastructure/api_key"
  type  = "String"
  value = var.api_key
  tags  = local.tags
}

resource "aws_ssm_parameter" "graphcms_webhook_signature_secret" {
  name  = "/${local.env_name}/praxis_infrastructure/graphcms_webhook_signature_secret"
  type  = "String"
  value = var.graphcms_webhook_signature_secret
  tags  = local.tags
}

resource "aws_ssm_parameter" "graphcms_webhook_key" {
  name  = "/${local.env_name}/praxis_infrastructure/graphcms_webhook_key"
  type  = "String"
  value = var.graphcms_webhook_key
  tags  = local.tags
}

resource "aws_ssm_parameter" "graphcms_api_token" {
  name  = "/${local.env_name}/praxis_infrastructure/graphcms_api_token"
  type  = "String"
  value = var.graphcms_api_token
  tags  = local.tags
}

resource "aws_ssm_parameter" "graphcms_api_url" {
  name  = "/${local.env_name}/praxis_infrastructure/graphcms_api_url"
  type  = "String"
  value = var.graphcms_api_url
  tags  = local.tags
}

resource "aws_ssm_parameter" "webflow_api_token" {
  name  = "/${local.env_name}/praxis_infrastructure/webflow_api_token"
  type  = "String"
  value = var.webflow_api_token
  tags  = local.tags
}

resource "aws_ssm_parameter" "webflow_site_id" {
  name  = "/${local.env_name}/praxis_infrastructure/webflow_site_id"
  type  = "String"
  value = var.webflow_site_id
  tags  = local.tags
}

resource "aws_ssm_parameter" "google_geocoding_api_key" {
  name  = "/${local.env_name}/praxis_infrastructure/google_geocoding_api_key"
  type  = "String"
  value = var.google_geocoding_api_key
  tags  = local.tags
}

data "aws_acm_certificate" "wildcard_domain" {
  domain   = "*.${local.domain}"
  statuses = ["ISSUED"]
}

module "cdn" {
  source = "cloudposse/cloudfront-s3-cdn/aws"
  # Cloud Posse recommends pinning every module to a specific version
  version = "0.68.0"

  // Ex. bucket name: dev-praxis-assets, pr-104-praxis-assets
  namespace = local.env_name
  stage     = "praxis"
  name      = "assets"
  delimiter = "-"

  default_ttl = 60 // seconds

  cloudfront_access_log_create_bucket   = true
  s3_access_logging_enabled             = true
  cloudfront_access_logging_enabled     = true
  cloudfront_access_log_include_cookies = true

  s3_access_log_prefix = "logs/s3_access"

  // cors_allowed_origins = local.sister_domains
  cors_allowed_headers = ["*"]
  cors_allowed_methods = ["GET", "PUT", "HEAD"]
  cors_allowed_origins = ["*"]
  cors_expose_headers  = ["ETag"]

  website_enabled   = false
  dns_alias_enabled = true
  allowed_methods   = ["GET", "HEAD"]

  aliases             = [local.asset_domain]
  parent_zone_name    = local.domain
  acm_certificate_arn = data.aws_acm_certificate.wildcard_domain.arn

  tags = local.tags
}

resource "aws_ssm_parameter" "asset_cdn_bucket_name" {
  name  = "/${local.env_name}/praxis_infrastructure/asset_cdn_bucket_name"
  type  = "String"
  value = module.cdn.s3_bucket
  tags  = local.tags
}
