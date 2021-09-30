
service "account" {
  endpoint "loginWithEmailPass" {
    version = "0.0.1"
  }
  endpoint "signupWithEmailPass" {
    version = "0.0.1"
  }
  endpoint "loginAsAnonymousGuest" {
    version = "0.0.1"
  }
}

service "language" {
  environment = [
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_PROJECT_ID"
  ]
  endpoint "translateText" {
    version = "0.0.1"
  }
}