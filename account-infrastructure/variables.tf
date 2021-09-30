
variable "account_name" {
  type        = string
  description = "The name of the AWS account"
}

variable "account_number" {
  type        = string
  description = "The number of the AWS account"
}

variable "vantage_handshake_id" {
  type        = string
  description = "Get this from vantage when you setup for an account, they provide it."
}

variable "vantage_iam_role" {
  type        = string
  description = "I'm not sure, I think this can be anything you want. I got it from vantage."
}