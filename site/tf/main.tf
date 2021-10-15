
##
## LOCALS
##
locals {
  project_root = abspath("..")
  project_name = "praxis"
  package = jsondecode(file("${local.project_root}/package.json"))
  version = local.package.version
  domains = {
    "pr" : "pr-${var.pr_number}.praxisco.link",
    "eng" : "eng-${var.engineer}.praxisco.link",
    "staging" : "staging.praxisco.link",
    "qa" : "qa.praxisco.link",
    "uat" : "uat.praxisco.link",
    "prod" : "praxisco.link"
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
  is_prod = local.env_name == "prod"
  tags = {
    PraxisEnv     = var.env
    PraxisEnvName = local.env_name
    PraxisProject = "praxis-site"
  }
}

##
##  DATA
##

data "aws_caller_identity" "current" {}

data "aws_acm_certificate" "wildcard_domain" {
  domain   = "*.${local.domain}"
  statuses = ["ISSUED"]
}

data "aws_acm_certificate" "root_domain" {
  domain   = local.domain
  statuses = ["ISSUED"]
}

##
##  Route53 Domain record
##

# Get the hosted zone for the custom domain
data "aws_route53_zone" "custom_domain_zone" {
  name = local.tld
}

# Create a new record in Route 53 for the domain
resource "aws_route53_record" "cloudfront_alias_domain" {
  zone_id = data.aws_route53_zone.custom_domain_zone.zone_id
  name    = local.domain
  type    = "A"

  alias {
    name                   = module.tf_next.cloudfront_domain_name
    zone_id                = module.tf_next.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}



# Provider used for creating the Lambda@Edge function which must be deployed
# to us-east-1 region (Should not be changed)
provider "aws" {
  alias  = "global_region"
  region = "us-east-1"
}

module "tf_next" {
  source = "milliHQ/next-js/aws"

  cloudfront_aliases             = [local.domain]
  cloudfront_acm_certificate_arn = local.is_prod ? data.aws_acm_certificate.root_domain.arn : data.aws_acm_certificate.wildcard_domain.arn

  deployment_name = "${local.project_name}-site-${local.env_name}-next-frontend-${local.version}"
  next_tf_dir = "../.next-tf"
  use_awscli_for_static_upload = true

  # TODO:
  # lambda_environment_variables
  # tags

  providers = {
    aws.global_region = aws.global_region
  }
}