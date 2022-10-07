################################################################################
# Required Variables. These variables have no default and you will be requried #
# to provide them.                                                             #
################################################################################

#--------------------------------------------------------------------------#
# Provider credentials                                                     #
#--------------------------------------------------------------------------#
# Our DigitalOcean API token.
variable "do_token" {}

# Our Cloudflare Email
variable "cf_email" {}

# Our Cloudflare API Key
variable "cf_key" {}

# Our Cloudflare Origin CA Key
variable "cf_origin_key" {}

# Name of SSH key as it appears in the DigitalOcean dashboard
variable "ssh_key" {
  type = string
}

# Domain you have registered and DigitalOcean manages
variable "domain" {
  type    = string
  default = "puzzlely.io"
}

#--------------------------------------------------------------------------#
# API variables                                                            #
#--------------------------------------------------------------------------#
# The first part of api server URL
variable "api_subdomain" {
  type = string
}

#--------------------------------------------------------------------------#
# Web variables                                                            #
#--------------------------------------------------------------------------#
# The first part of web URL
variable "web_subdomain" {
  type = string
}

################################################################################
# Optional Variables. These have defaults set don't need to be modified for    #
# this to run. Modify them to your liking if you desire terraform              #
################################################################################

# Name of the project. Will be prepended to most resources
variable "name" {
  type    = string
  default = "puzzlely"
}

# Region to deploy infrstructure to
variable "region" {
  type    = string
  default = "sfo3"
}

# The number of droplets to create.
variable "droplet_count" {
  type    = number
  default = 1
}

# The size we want our droplets to be. 
# Can view slugs (valid options) https://slugs.do-api.dev/
variable "droplet_size" {
  type    = string
  default = "s-1vcpu-1gb"
}

# The operating system image we want to use. 
# Can view slugs (valid options) https://slugs.do-api.dev/
variable "image" {
  type    = string
  default = "ubuntu-20-04-x64"
}
