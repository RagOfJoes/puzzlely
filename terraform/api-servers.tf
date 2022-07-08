################################################################################
# Create n api servers with nginx installed and a custom message on main page  #
################################################################################
resource "digitalocean_droplet" "api" {
  # How many droplet(s) do we want. Taken from our variables
  count = var.droplet_count

  # Which image to use. Taken from our variables
  image = var.image

  # The human friendly name of our droplet. Combination of api, region, and 
  # count index. 
  name = "api-${var.name}-${var.region}-${count.index + 1}"

  # What region to deploy the droplet(s) to. Taken from our variables
  region = var.region

  # What size droplet(s) do I want? Taken from our variables
  size = var.droplet_size

  # The ssh keys to put on the server so we can access it. Read in through a 
  # data source
  ssh_keys = [data.digitalocean_ssh_key.main.id]

  # What VPC to put our droplets in
  vpc_uuid = digitalocean_vpc.vpc.id

  # Tags for identifying the droplets and allowing db firewall access
  tags = ["${var.name}-apiserver", "puzzlely"]

  # Sets up Docker for Droplet. Also creates a non-root user
  user_data = <<EOF
  #cloud-config
  package_update: true
  package_upgrade: true
  package_reboot_if_required: true

  groups:
    - ubuntu: [root,sys]
    - docker

  users:
    - name: puzzy
      groups: docker
      shell: /bin/bash
      lock_passwd: true
      sudo: ALL=(ALL) NOPASSWD:ALL
      ssh_authorized_keys:
        - ${data.digitalocean_ssh_key.main.id}

  packages:
    - apt-transport-https
    - ca-certificates
    - curl
    - gnupg-agent
    - software-properties-common
    - unattended-upgrades

  runcmd:
    - curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    - add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    - apt-get update -y
    - apt-get install -y docker-ce docker-ce-cli containerd.io
    - systemctl start docker
    - systemctl enable docker
    - curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    - chmod +x /usr/local/bin/docker-compose
  EOF

  #-----------------------------------------------------------------------------------------------#
  # Ensures that we create the new resource before we destroy the old one                         #
  # https://www.terraform.io/docs/configuration/resources.html#lifecycle-lifecycle-customizations #
  #-----------------------------------------------------------------------------------------------#
  lifecycle {
    create_before_destroy = true
  }
}
