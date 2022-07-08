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
