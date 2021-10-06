

terraform {
  backend "s3" {
    bucket         = "praxisco-terraform-state"
    key            = "account-infrastructure"
    region         = "us-east-1"
    dynamodb_table = "terraform_state_lock"
  }
}
