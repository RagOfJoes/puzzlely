terraform {
  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
    }

    digitalocean = {
      source = "digitalocean/digitalocean"
    }

    vercel = {
      source  = "vercel/vercel"
    }
  }
}
