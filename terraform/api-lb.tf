################################################################################
# Create a certificate for SSL for our Load Balancer                           #
################################################################################
resource "tls_private_key" "api" {
  # Name of the algorithm to use when generating the private key
  algorithm = "RSA"
}

resource "tls_cert_request" "api" {
  # Private key in PEM (RFC 1421) format, that the certificate will belong to
  private_key_pem = tls_private_key.api.private_key_pem

  # The subject for which a certificate is being requested
  subject {
    common_name  = "${var.api_subdomain}.${data.digitalocean_domain.domain.name}"
    organization = "Puzzlely"
  }
}

resource "cloudflare_origin_ca_certificate" "api" {
  # The Certificate Signing Request
  csr = tls_cert_request.api.cert_request_pem

  # An array of hostnames or wildcard names bound to the certificate
  hostnames = ["${var.api_subdomain}.${data.digitalocean_domain.domain.name}"]

  # The signature type desired on the certificate
  request_type = "origin-rsa"
}

resource "digitalocean_certificate" "api" {
  # Human friendly name of the certificate
  name = "${var.name}-api-certificate"

  # Type of certificate
  type = "custom"

  # The contents of a PEM-formatted private-key corresponding to the SSL certificate
  private_key = tls_private_key.api.private_key_pem

  # The contents of a PEM-formatted public TLS certificate
  leaf_certificate = cloudflare_origin_ca_certificate.api.certificate

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
    port     = 80
    protocol = "tcp"
  }

  #-----------------------------------------------------------------------------------------------#
  # Ensures that we create the new resource before we destroy the old one                         #
  # https://www.terraform.io/docs/configuration/resources.html#lifecycle-lifecycle-customizations #
  #-----------------------------------------------------------------------------------------------#
  lifecycle {
    create_before_destroy = true
  }
}
