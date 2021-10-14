
variable "env" {
  type        = string
  description = "The current running environment (dev|qa|stage|lt|uat|dr|prod)"
}

variable "pr_number" {
  type = string
  default = ""
  description = "If this is a pr env apply, the number of the pr"
}

variable "engineer" {
  type = string
  default = ""
  description = "If this is an eng env apply, the name of the engineer -- one work all lower case"
}