
service "graphcms" {
  environment = [
    "GRAPHCMS_WEBHOOK_KEY",
    "GRAPHCMS_API_TOKEN",
    "GRAPHCMS_API_URL",
    "GOOGLE_GEOCODING_API_KEY",
    "WEBFLOW_API_TOKEN"
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
  endpoint "syncEventOnPublish" {
    version = "0.0.1"
  }
  endpoint "syncTrainingOnPublish" {
    version = "0.0.1"
  }
  endpoint "desyncEventOnUnpublish" {
    version = "0.0.1"
  }
  endpoint "desyncTrainingOnUnpublish" {
    version = "0.0.1"
  }
}

service "events" {
  environment = [
    "GRAPHCMS_API_TOKEN",
    "GRAPHCMS_API_URL"
  ]
  endpoint "search" {
    version = "0.0.1"
  }
}

service "system" {
  environment = [
    "GRAPHCMS_API_TOKEN",
    "GRAPHCMS_API_URL"
  ]
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

service "cron" {
  environment = [
    "GRAPHCMS_API_TOKEN",
    "GRAPHCMS_API_URL",
    "WEBFLOW_API_TOKEN"
  ]
  endpoint "cleanupPastEvents" {
    version = "0.0.1"
  }
  endpoint "enrichEvents" {
    version = "0.0.1"
  }
  endpoint "enrichTrainings" {
    version = "0.0.1"
  }
}