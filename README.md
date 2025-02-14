<a href="https://puzzlely.io?utm_source=Github&utm_medium=social">
 <p align="center" >
  <img height=250 style="border-radius: 30px;" src="https://raw.githubusercontent.com/RagOfJoes/puzzlely/main/web/public/og.png" />
  </p>
</a>
<h3 align="center">
  <strong>What if Connections, but infinite? No more waiting until tomorrow, no more rationing your daily word-grouping fix. Just pure, unbridled classification chaos.</strong>
</h3>

---

## Tech Stack

### Frontend (web)

- Typescript
- React-Router/Remix
- React
- Zod
- Radix
- Motion
- TailwindCSS

### Backend (api)

- Go
- Postgres
- OpenTelemetry

## Folder Structure

|  Codebase  |         Description         |
| :--------: | :-------------------------: |
| [api](api) |        Go API Server        |
| [web](web) | React-Router/Remix frontend |

## Architecture

```mermaid
%%{
  init: {
    'theme': 'dark',
    'themeVariables': {
      'primaryColor': '#21262d',
      'primaryTextColor': '#c9d1d9',
      'primaryBorderColor': '#30363d',
      'lineColor': '#8b949e',
      'secondaryColor': '#2b3138',
      'tertiaryColor': '#161b22'
    }
  }
}%%

flowchart LR
    subgraph internet[Public Internet]
        User(("Client Browser"))
        WWW["puzzlely.io"]
        click WWW href "https://puzzlely.io" "Primary domain"
    end

    subgraph github[GitHub Infrastructure]
        GHA["GitHub Actions<br>CI/CD Pipeline"]
        GHCR["Container Registry<br>ghcr.io"]
        GHA --> |"Push images"| GHCR
    end

    subgraph vps[DigitalOcean VPS]
        Traefik["Traefik<br>SSL & Routing"]

        subgraph internal[Internal Docker Network]
            Frontend["Frontend<br>React-Router"]
            Backend["Backend<br>Go API"]
            DB[(PostgreSQL<br>Data Store)]
            Watchtower["Watchtower<br>Auto-Deployment"]
        end
    end

    %% External connections
    User --> |"HTTPS"| WWW
    WWW --> |"443"| Traefik
    User --> |"HTTPS"| Traefik

    %% Internal routing
    Traefik --> |"5173"| Frontend
    Traefik --> |"8080"| Backend
    Backend --> |"5432"| DB

    %% Deployment flow
    GHCR -.-> |"Pull new images"| Frontend
    GHCR -.-> |"Pull new images"| Backend
    Watchtower -.-> |"Check for updates"| GHCR
    Watchtower --> |"Deploy updates"| Frontend
    Watchtower --> |"Deploy updates"| Backend

    %% Styling
    classDef container fill:#238636,stroke:#2ea043,stroke-width:2px,color:#ffffff
    classDef database fill:#1f6feb,stroke:#388bfd,stroke-width:2px,color:#ffffff
    classDef proxy fill:#a371f7,stroke:#8957e5,stroke-width:2px,color:#ffffff
    classDef external fill:#f78166,stroke:#f0883e,stroke-width:2px,color:#ffffff
    classDef registry fill:#3fb950,stroke:#56d364,stroke-width:2px,color:#ffffff
    classDef updater fill:#238636,stroke:#2ea043,stroke-width:2px,color:#ffffff

    class Frontend,Backend container
    class DB database
    class Traefik proxy
    class User,WWW external
    class GHCR,GHA registry
    class Watchtower updater
```

## Contributions

Puzzlely is open to contributions, but I recommend that you first create an issue or reply to a comment so we don't accidentally override each other.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
