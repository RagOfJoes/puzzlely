# The Private IPv4 Addresses of the api droplets
output "api_servers_private" {
  value = digitalocean_droplet.api.*.ipv4_address_private
}

# The Private IPv4 Addresses of the web droplets
output "web_servers_private" {
  value = digitalocean_droplet.web.*.ipv4_address_private
}

# The fully qualified domain name of the api load balancer
# output "api_loadbalancer_fqdn" {
#   value = digitalocean_record.api.fqdn
# }
#
# The fully qualified domain name of the web load balancer
# output "web_loadbalancer_fqdn" {
#   value = digitalocean_record.web.fqdn
# }
