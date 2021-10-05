

terraform {
  backend "s3" {
    bucket         = "lune-dev-terraform-state"
    key            = "app"
    region         = "us-east-1"
    dynamodb_table = "terraform_state_lock"
  }
}
