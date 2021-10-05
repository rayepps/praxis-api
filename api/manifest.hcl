
service "graphcms" {
  environment = [
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_PROJECT_ID"
  ]
  endpoint "enrichEventOnChange" {
    version = "0.0.1"
  }
  endpoint "enrichTrainingOnChange" {
    version = "0.0.1"
  }
  endpoint "cleanupEventOnDelete" {
    version = "0.0.1"
  }
}

service "events" {
  endpoint "search" {
    version = "0.0.1"
  }
}

service "system" {
  endpoint "listCompanies" {
    version = "0.0.1"
  }
  endpoint "listCitiesInState" {
    version = "0.0.1"
  }
  endpoint "listTags" {
    version = "0.0.1"
  }
}