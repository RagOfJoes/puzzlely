################################################################################
# Create vercel project                                                        #
################################################################################
resource "vercel_project" "web" {
  framework                  = "nextjs"
  name                       = "puzzlely"
  root_directory             = "web"
  serverless_function_region = "sfo1"

  git_repository = {
    repo = "RagOfJoes/puzzlely"
    type = "github"
  }
}

################################################################################
# Use our own domain with project                                              #
################################################################################
resource "vercel_project_domain" "web_root" {
  domain     = var.domain
  git_branch = "main"
  project_id = vercel_project.web.id
}

resource "vercel_project_domain" "web_www" {
  domain     = "${var.web_subdomain}.${var.domain}"
  git_branch = "main"
  project_id = vercel_project.web.id
}

################################################################################
# Redirect puzzlely.io -> www.puzzlely.io                                      #
################################################################################
resource "vercel_project_domain" "web_root_redirect" {
  domain     = var.domain
  project_id = vercel_project.web.id

  redirect             = vercel_project_domain.web_www.domain
  redirect_status_code = 308
}

################################################################################
# Create a deployment source for project                                       #
################################################################################
resource "vercel_deployment" "web" {
  production = true
  project_id = vercel_project.web.id
  ref        = "main"
}
