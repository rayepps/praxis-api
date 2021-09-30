
##
## ENV
##

variable "env" {
  type        = string
  description = "The current running environment (dev|qa|stage|lt|uat|dr|prod)"
}

variable "region" {
  type        = string
  description = "The AWS region infrastrucre should be built in"
}

##
## OPTIONAL
##

# Used to make eng-rayepps when running env=eng
variable "engineer" {
  type        = string
  description = "Your name"
  default     = ""
}

# Used to make pr-105 when running env=pr
variable "pr_number" {
  type        = string
  description = "Your name"
  default     = ""
}


##
## SECRETS
##

variable "token_signature_secret" {
  type = string
}

variable "api_key" {
  type = string
}

variable "stripe_key" {
  type = string
}

variable "stripe_secret" {
  type = string
}

variable "stripe_webhook_secret" {
  type = string
}

variable "google_client_email" {
  type = string
}

variable "google_private_key" {
  type = string
}

variable "google_project_id" {
  type = string
}
