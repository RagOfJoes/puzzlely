<a href="https://www.puzzlely.io?utm_source=Github&utm_medium=social">
 <p align="center" >
  <img height=250 style="border-radius: 30px;" src="https://raw.githubusercontent.com/RagOfJoes/puzzlely/development/web/public/dark/android-chrome-512x512.png" />
  <img height=250 style="border-radius: 30px;" src="https://raw.githubusercontent.com/RagOfJoes/puzzlely/development/web/public/light/android-chrome-512x512.png" />
  </p>
</a>
<h3 align="center">
  <strong>An online puzzle game that's inspired by the BBC's Only Connect game show. Play user created puzzles or create your own to challenge your friends and other users.</strong>
</h3>

---

## Prerequisites

These are the prerequisites for local development:

- Node.JS 12.22.0 or later
- Go 1.7 or later
- MySQL (You can choose to host your own or set one up with PlanetScale)
- Docker
- Honeycomb.io account
- OAuth2 credentials (For at least one of the following):
  - Discord
  - GitHub
  - Google

These are the prerequisites for production:

- Everything for local development
- Domain where you're able to edit DNS records
- Cloudflare
- DigitalOcean account
- Container registry (Example: Docker Hub, GitHub Container Registry, or, DigitalOcean Container Registry)
- Vercel account
- Terraform (w/ Terraform cloud)

## Folder Structure

|        Codebase         |           Description           |
| :---------------------: | :-----------------------------: |
| [api](api)              |           Go API Server         |
| [terraform](terraform)  |  Terraform configuration files  |
| [web](web)              |          Next.js frontend       |

## Architecture

```
                              https
                                |
                                |
                        API     |     Web
                  +-------------+-------------+
                  |                           |
                  |                           |
                  |                           |
           +------+-------+            +------+-------+
           |              |            |              |
           |  Cloudflare  |            |    Vercel    |
           |              |            |              |
           +------+-------+            +--------------+
                  |
                  |
                  |
           +------+-------+
           |              |
           |              |
           | Loadbalancer |
    +------+--------------+------+
    | VPC  |              |      |
    |      +------+-------+      |
    |             |              |
    |             |              |
    |             |              |
    |            http            |
    |             |              |
    |             |              |
    |             |              |
    |        +----+----+         |
    |        |         |         |
    |        | Droplet |         |
    |        |         |         |
    |        +----+----+         |
    |             |              |
    |             |              |
    +-------------+--------------+
                  |
       +----------+-----------+
       |                      |
       |                      |
+------+------+        +------+------+
|             |        |             |
| Planetscale |        |  Honeycomb  |
|    MySQL    |        |             |
|             |        +-------------+
+-------------+
```

## Contributions

Puzzlely is open to contributions, but I recommend that you first create an issue or reply to a comment so we don't accidentally override each other.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
