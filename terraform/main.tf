provider "cloudflare" {
  api_key              = var.cloudflare_key
  api_user_service_key = var.cloudflare_origin_key
  email                = var.cloudflare_email
}

provider "digitalocean" {
  token = var.digitalocean_token
}

provider "vercel" {
  api_token = var.vercel_token
}

terraform {
  cloud {
    organization = "puzzlely"

    workspaces {
      name = "production"
    }
  }
}
