# The Private IPv4 Addresses of the api droplets
output "api_servers_private" {
  value = digitalocean_droplet.api.*.ipv4_address_private
}
