

locals {
  env_name_map = {
    "pr" : "pr-${var.pr_number}",
    "eng" : "eng-${var.engineer}",
    "staging" : "staging",
    "uat" : "uat",
    "prod" : "prod"
  }
  env_domain_map = {
    "pr" : "notforglory.link",
    "eng" : "notforglory.link",
    "staging" : "notforglory.link",
    "uat" : "notforglory.link",
    "prod" : "notforglory.link"
  }
  asset_domain_map = {
    "pr" : "pr-${var.pr_number}-assets.notforglory.link",
    "eng" : "eng-${var.engineer}-assets.notforglory.link",
    "staging" : "staging-assets.notforglory.link",
    "uat" : "uat-assets.notforglory.link",
    "prod" : "assets.notforglory.link"
  }
  is_prod      = var.env == "prod"
  domain       = local.env_domain_map[var.env]
  env_name     = local.env_name_map[var.env]
  asset_domain = local.asset_domain_map[var.env]
  project      = "env-infrastructure"
  tags = {
    NotForGloryEnv     = var.env
    NotForGloryEnvName = local.env_name
    NotForGloryProject = local.project
  }
}

##
## SECRETS
##

resource "aws_ssm_parameter" "token_sig_secret" {
  name  = "/${local.env_name}/notforglory_infrastructure/token_sig_secret"
  type  = "String"
  value = var.token_signature_secret
  tags  = local.tags
}

resource "aws_ssm_parameter" "api_key" {
  name  = "/${local.env_name}/notforglory_infrastructure/api_key"
  type  = "String"
  value = var.api_key
  tags  = local.tags
}

resource "aws_ssm_parameter" "stripe_key" {
  name  = "/${local.env_name}/notforglory_infrastructure/stripe_key"
  type  = "String"
  value = var.stripe_key
  tags  = local.tags
}

resource "aws_ssm_parameter" "stripe_secret" {
  name  = "/${local.env_name}/notforglory_infrastructure/stripe_secret"
  type  = "String"
  value = var.stripe_secret
  tags  = local.tags
}

resource "aws_ssm_parameter" "stripe_webhook_secret" {
  name  = "/${local.env_name}/notforglory_infrastructure/stripe_webhook_secret"
  type  = "String"
  value = var.stripe_webhook_secret
  tags  = local.tags
}

resource "aws_ssm_parameter" "google_client_email" {
  name  = "/${local.env_name}/notforglory_infrastructure/google_client_email"
  type  = "String"
  value = var.google_client_email
  tags  = local.tags
}

resource "aws_ssm_parameter" "google_private_key" {
  name  = "/${local.env_name}/notforglory_infrastructure/google_private_key"
  type  = "String"
  value = var.google_private_key
  tags  = local.tags
}

resource "aws_ssm_parameter" "google_project_id" {
  name  = "/${local.env_name}/notforglory_infrastructure/google_project_id"
  type  = "String"
  value = var.google_project_id
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

  // Ex. bucket name: dev-notforglory-assets, pr-104-notforglory-assets
  namespace = local.env_name
  stage     = "notforglory"
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
  name  = "/${local.env_name}/notforglory_infrastructure/asset_cdn_bucket_name"
  type  = "String"
  value = module.cdn.s3_bucket
  tags  = local.tags
}
