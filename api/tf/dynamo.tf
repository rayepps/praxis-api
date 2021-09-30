
resource "aws_dynamodb_table" "main" {

  name              = "${local.env_name}_notforglory"
  billing_mode      = "PAY_PER_REQUEST"
  stream_enabled    = true
  stream_view_type  = "NEW_IMAGE"
    
  hash_key  = "HK"
  range_key = "SK"

  attribute {
    name = "HK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  global_secondary_index {
    name               = "reverse"
    hash_key           = "SK"
    range_key          = "HK"
    projection_type    = "ALL"
  }

  tags = local.tags

}
