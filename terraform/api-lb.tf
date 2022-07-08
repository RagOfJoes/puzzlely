################################################################################
# Create a certificate for SSL for our Load Balancer                           #
################################################################################
resource "digitalocean_certificate" "api" {

  # Human friendly name of the certificate
  name = "${var.name}-api-certificate"

  # type of certificate. Use Let's Encrypt to create the ticket
  type = "lets_encrypt"

  # The fqdn to get the certificate for
  domains = ["${var.api_subdomain}.${data.digitalocean_domain.domain.name}"]

  # Ensure we create a new certificate successfully before deleting the old
  # one
  lifecycle {
    create_before_destroy = true
  }
}

################################################################################
# Load Balancer for distributing traffic amongst our api servers. Uses SSL     #
# termination and forwards HTTPS traffic to HTTP internally                    #
################################################################################
resource "digitalocean_loadbalancer" "api" {
  # The user friendly name of the load balancer
  name = "api-${var.region}"

  # What region to deploy the LB to
  region = var.region

  # Which droplets should the load balancer route traffic to
  droplet_ids = digitalocean_droplet.api.*.id

  # What VPC to put the load balancer in
  vpc_uuid = digitalocean_vpc.vpc.id

  # Force all HTTP traffic to come through via HTTPS
  redirect_http_to_https = true

  #--------------------------------------------------------------------------#
  # Forward all traffic received on port 443 using the http protocol to       #
  # Port 80 using the http protocol of the hosts behind this load balancer   #
  #--------------------------------------------------------------------------#
  forwarding_rule {
    entry_port     = 443
    entry_protocol = "https"

    target_port     = 80
    target_protocol = "http"

    certificate_name = digitalocean_certificate.api.name
  }

  forwarding_rule {
    entry_port     = 80
    entry_protocol = "http"

    target_port     = 80
    target_protocol = "http"

    certificate_name = digitalocean_certificate.api.name
  }
  
  healthcheck {
    port      = 80
    protocol  = "tcp"
  }

  #-----------------------------------------------------------------------------------------------#
  # Ensures that we create the new resource before we destroy the old one                         #
  # https://www.terraform.io/docs/configuration/resources.html#lifecycle-lifecycle-customizations #
  #-----------------------------------------------------------------------------------------------#
  lifecycle {
    create_before_destroy = true
  }
}

################################################################################
# Create a DNS A record for our loadbalancer. The name will be the subdomain.  #
################################################################################
resource "digitalocean_record" "api" {
  # Get the domain from our data source
  domain = data.digitalocean_domain.domain.name

  # An A record is an IPv4 name record. Like www.digitalocean.com
  type = "A"

  # Set the name to the region we chose. Can be anything
  name = var.api_subdomain

  # Point the record at the IP address of our load balancer
  value = digitalocean_loadbalancer.api.ip

  # The Time-to-Live for this record is 30 seconds. Then the cache invalidates
  ttl = 300
}
