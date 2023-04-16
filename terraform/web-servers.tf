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
resource "vercel_project_domain" "web_www" {
  domain     = "${var.web_subdomain}.${var.domain}"
  project_id = vercel_project.web.id
}

################################################################################
# Redirects vercel domains -> www.puzzlely.io                                  #
################################################################################
resource "vercel_project_domain" "web_git_redirect" {
  domain     = "puzzlely-git-main-ragofjoes.vercel.app"
  project_id = vercel_project.web.id

  redirect             = vercel_project_domain.web_www.domain
  redirect_status_code = 308
}

resource "vercel_project_domain" "web_git_vercel_redirect" {
  domain     = "puzzlely-ragofjoes.vercel.app"
  project_id = vercel_project.web.id

  redirect             = vercel_project_domain.web_www.domain
  redirect_status_code = 308
}

resource "vercel_project_domain" "web_vercel_redirect" {
  domain     = "puzzlely.vercel.app"
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
