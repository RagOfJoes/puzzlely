provider "cloudflare" {
  api_key              = var.cf_key
  api_user_service_key = var.cf_origin_key
  email                = var.cf_email
}

provider "digitalocean" {
  token = var.do_token
}

terraform {
  cloud {
    organization = "puzzlely"

    workspaces {
      name = "production"
    }
  }
}
