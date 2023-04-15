################################################################################
# Create a VPC for isolating our traffic                                       #
################################################################################
resource "digitalocean_vpc" "vpc" {
  # The human friendly name of our VPC.
  name = "puzzlely-vpc"

  # The region to deploy our VPC to.
  region = var.region

  # The private ip range within our VPC
  ip_range = "192.168.32.0/24"
}

################################################################################
# Firewall Rules for our Webserver Droplets                                    #
################################################################################
resource "digitalocean_firewall" "firewall" {
  # The name we give our firewall for ease of use                            #
  name = "puzzlely-firewall"

  # The droplets to apply this firewall to                                   #
  droplet_ids = digitalocean_droplet.api.*.id

  #--------------------------------------------------------------------------#
  # Internal VPC Rules. We have to let ourselves talk to each other          #
  #--------------------------------------------------------------------------#
  inbound_rule {
    protocol         = "tcp"
    port_range       = "1-65535"
    source_addresses = [digitalocean_vpc.vpc.ip_range]
  }

  inbound_rule {
    protocol         = "udp"
    port_range       = "1-65535"
    source_addresses = [digitalocean_vpc.vpc.ip_range]
  }

  inbound_rule {
    protocol         = "icmp"
    source_addresses = [digitalocean_vpc.vpc.ip_range]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = [digitalocean_vpc.vpc.ip_range]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = [digitalocean_vpc.vpc.ip_range]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = [digitalocean_vpc.vpc.ip_range]
  }

  #--------------------------------------------------------------------------#
  # Selective Inbound Traffic Rules                                          #
  #--------------------------------------------------------------------------#
  # SSH
  inbound_rule {
    protocol              = "tcp"
    port_range            = "22"
    # Allows all IPv4 and IPv6 addresses
    source_addresses      = ["0.0.0.0/0", "::/0"]
  }

  #--------------------------------------------------------------------------#
  # Selective Outbound Traffic Rules                                         #
  #--------------------------------------------------------------------------#
  # DNS
  outbound_rule {
    protocol              = "udp"
    port_range            = "53"
    # Allows all IPv4 and IPv6 addresses
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  # HTTP
  outbound_rule {
    protocol              = "tcp"
    port_range            = "80"
    # Allows all IPv4 and IPv6 addresses
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  # HTTPS
  outbound_rule {
    protocol              = "tcp"
    port_range            = "443"
    # Allows all IPv4 and IPv6 addresses
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  # MySQL
  outbound_rule {
    protocol              = "tcp"
    port_range            = "3306"
    # Allows all IPv4 and IPv6 addresses
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  # ICMP (Ping)
  outbound_rule {
    protocol              = "icmp"
    # Allows all IPv4 and IPv6 addresses
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}
