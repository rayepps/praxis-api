

##
## DNS
##

locals {
  domain_name = "praxisco.link"
}

module "praxis_domain_cert" {
  source      = "./dns_cert"
  domain_name = local.domain_name
}


