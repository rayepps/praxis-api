
##
## VARIABLES
##

variable "domain_name" {
  type = string
}

##
## DATA
##

data "aws_route53_zone" "main" {
  // Not creating the zone here because aws automatically
  // creates one when the domain is purchased
  name = var.domain_name
}

##
## TLD CERT - example.com
##

resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.main : record.fqdn]
}

resource "aws_route53_record" "main" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

##
## SUB CERT - *.example.com
##

resource "aws_acm_certificate" "sub" {
  domain_name       = "*.${var.domain_name}"
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "sub" {
  certificate_arn         = aws_acm_certificate.sub.arn
  validation_record_fqdns = [for record in aws_route53_record.sub : record.fqdn]
}

resource "aws_route53_record" "sub" {
  for_each = {
    for dvo in aws_acm_certificate.sub.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}
