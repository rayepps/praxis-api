

terraform {
  backend "s3" {
    bucket         = "notforglory-terraform-state"
    key            = "search-app"
    region         = "us-east-1"
    dynamodb_table = "terraform_state_lock"
  }
}
