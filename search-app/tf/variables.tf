
variable "env" {
  type        = string
  description = "The current running environment (eng | pr | staging | uat | prod)"
}

variable "engineer" {
  type        = string
  description = "The name of the engineer when env is eng"
  default = ""
}

variable "pr_number" {
  type        = string
  default     = ""
  description = "The number of the pr when env is pr"
}