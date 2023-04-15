################################################################################
# Create Cloudflare records to point to web's vercel servers                   #
################################################################################
resource "cloudflare_record" "web_root" {
  name    = "@"
  proxied = false
  type    = "A"
  value   = "76.76.21.21"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "web" {
  name    = "www"
  proxied = false
  type    = "CNAME"
  value   = "cname.vercel-dns.com."
  zone_id = var.cloudflare_zone_id
}
