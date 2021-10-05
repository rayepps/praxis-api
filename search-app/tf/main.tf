
##
## LOCALS
##

locals {
  env_domain_map = {
    "pr" : "pr-${var.pr_number}-app.lunez.run",
    "eng" : "eng-${var.engineer}-app.lunez.run",
    "staging" : "staging-app.lunez.run",
    "uat" : "uat-app.lunez.run",
    "prod" : "app.lunecard.com"
  }
  env_name_map = {
    "pr" : "pr-${var.pr_number}",
    "eng" : "eng-${var.engineer}",
    "staging" : "staging",
    "uat" : "uat",
    "prod" : "prod"
  }

  domain   = local.env_domain_map[var.env]
  env_name = local.env_name_map[var.env]
  is_prod  = var.env == "prod"
  tld      = local.is_prod ? "lunecard.com" : "lunez.run"
  tags = {
    LuneEnv     = var.env
    LuneEnvName = local.env_name
    LuneProject = "lune-app"
  }
}


##
## DATA
##

data "aws_caller_identity" "current" {}

data "aws_acm_certificate" "wildcard_domain" {
  domain   = "*.${local.tld}"
  statuses = ["ISSUED"]
}

data "aws_route53_zone" "main" {
  name         = "${local.tld}."
  private_zone = false
}


##
## LOCALS
##
locals {
  account_number = data.aws_caller_identity.current.account_id
  project_root   = abspath("..")
  project_name   = "lune-app"
}


##
## S3 BUCKETS
##

# Creates bucket to store logs
resource "aws_s3_bucket" "website_logs" {
  bucket = "${local.env_name}-${local.project_name}-logs"
  acl    = "log-delivery-write"

  # Comment the following line if you are uncomfortable with Terraform 
  # destroying the bucket even if this one is not empty
  force_destroy = true

  tags = local.tags
}

# Creates bucket to store the static website
resource "aws_s3_bucket" "website_root" {
  bucket = "${local.env_name}-${local.project_name}-root"
  acl    = "public-read"

  # Comment the following line if you are uncomfortable with Terraform 
  # destroying the bucket even if not empty
  force_destroy = true

  logging {
    target_bucket = aws_s3_bucket.website_logs.bucket
    target_prefix = "server/"
  }

  website {
    index_document = "index.html"
    error_document = "404.html"
  }

  tags = local.tags
}

locals {
  mime_types = jsondecode(file("${path.module}/mimes.json"))
}

resource "aws_s3_bucket_object" "out" {
  for_each     = fileset("../build/", "**")
  bucket       = aws_s3_bucket.website_root.id
  key          = each.value
  content_type = lookup(local.mime_types, regex("\\.[^.]+$", each.value), null)
  source       = "../build/${each.value}"
  # etag makes the file update when it changes. See:
  # https://stackoverflow.com/questions/56107258/terraform-upload-file-to-s3-on-every-apply
  etag = filemd5("../build/${each.value}")
}


## 
## CLOUD FRONT
##

# Creates the CloudFront distribution to serve the static website
resource "aws_cloudfront_distribution" "website_cdn_root" {
  enabled     = true
  price_class = "PriceClass_All"
  # Select the correct PriceClass depending on who the 
  # CDN is supposed to serve
  # https://docs.aws.amazon.com/AmazonCloudFront/ladev/DeveloperGuide/PriceClass.html
  aliases = [local.domain]

  origin {
    origin_id   = "origin-bucket-${aws_s3_bucket.website_root.id}"
    domain_name = aws_s3_bucket.website_root.website_endpoint

    custom_origin_config {
      origin_protocol_policy = "http-only"
      # The protocol policy that you want CloudFront to use when fetching objects 
      # from the origin server (a.k.a S3 in our situation). HTTP Only is the default 
      # setting when the origin is an Amazon S3 static website hosting endpoint, because 
      # Amazon S3 doesn’t support HTTPS connections for static website hosting endpoints.
      http_port            = 80
      https_port           = 443
      origin_ssl_protocols = ["TLSv1.2", "TLSv1.1", "TLSv1"]
    }
  }

  default_root_object = "index.html"

  logging_config {
    bucket = aws_s3_bucket.website_logs.bucket_domain_name
    prefix = "${local.domain}/"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_root.id}"
    min_ttl          = "0"
    default_ttl      = "300"
    max_ttl          = "1200"

    # Redirects any HTTP request to HTTPS
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.wildcard_domain.arn
    ssl_support_method  = "sni-only"
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 404
    response_page_path    = "/404.html"
    response_code         = 404
  }

  tags = local.tags

  lifecycle {
    ignore_changes = [
      viewer_certificate
    ]
  }
}

# Creates the DNS record to point on the main CloudFront distribution ID
resource "aws_route53_record" "website_cdn_root_record" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = local.domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website_cdn_root.domain_name
    zone_id                = aws_cloudfront_distribution.website_cdn_root.hosted_zone_id
    evaluate_target_health = false
  }
}


# Creates policy to allow public access to the S3 bucket
resource "aws_s3_bucket_policy" "update_website_root_bucket_policy" {
  bucket = aws_s3_bucket.website_root.id
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "PolicyForWebsiteEndpointsPublicContent",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "${aws_s3_bucket.website_root.arn}/*",
        "${aws_s3_bucket.website_root.arn}"
      ]
    }
  ]
}
POLICY
}
