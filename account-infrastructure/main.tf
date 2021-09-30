

##
## DNS
##

locals {
  domain_name = "notforglory.link"
}

module "notforglory_domain_cert" {
  source      = "./dns_cert"
  domain_name = local.domain_name
}


