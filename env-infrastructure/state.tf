

terraform {
  backend "s3" {
    bucket         = "notforglory-terraform-state"
    key            = "env-infrastructure"
    region         = "us-east-1"
    dynamodb_table = "terraform_state_lock"
  }
}
