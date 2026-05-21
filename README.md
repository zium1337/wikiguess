# WikiGuess

Codzienna gra polegająca na odgadywaniu artykułu z Wikipedii. Każdego dnia system automatycznie pobiera nowy artykuł — gracz widzi opis podzielony na zdania odkrywane stopniowo z każdą błędną odpowiedzią. Celem jest odgadnięcie tytułu artykułu przy jak najmniejszej liczbie prób.

## Podział zadań

Maja - Frontend  
Wiktor - Backend

## Technologie

| Warstwa          | Technologia                              |
| ---------------- | ---------------------------------------- |
| Frontend         | React 19, TypeScript, Tailwind CSS, Vite |
| Backend          | Rust, Axum, SQLx                         |
| Baza danych      | PostgreSQL 16                            |
| Auth             | JWT (Bearer token) + cookie sesji        |
| Dokumentacja API | utoipa + Swagger UI                      |
| Konteneryzacja   | Docker, Docker Compose                   |

## Dokumentacja API

Backend udostępnia interaktywny Swagger UI pod adresem:

```
http://localhost:3000/docs/
```

Surowy schemat OpenAPI (JSON) dostępny jest pod:

```
http://localhost:3000/api-docs/openapi.json
```

### Endpointy (skrót)

| Metoda   | Ścieżka                      | Opis                                        |
| -------- | ---------------------------- | ------------------------------------------- |
| `POST`   | `/auth/register`             | Rejestracja użytkownika                     |
| `POST`   | `/auth/login`                | Logowanie                                   |
| `GET`    | `/article/today`             | Dzisiejszy artykuł                          |
| `GET`    | `/article/stats`             | Statystyki dzisiejszej gry                  |
| `POST`   | `/article/history`           | Historia artykułów ze statystykami          |
| `GET`    | `/game/state`                | Aktualny stan gry (tworzy sesję jeśli brak) |
| `POST`   | `/game/guess`                | Wysłanie odpowiedzi                         |
| `PATCH`  | `/user/change-password/{id}` | Zmiana hasła                                |
| `DELETE` | `/user/{id}`                 | Usunięcie konta                             |

## Schemat bazy danych

```
users
├── user_id      UUID PK
├── email        VARCHAR(255) UNIQUE NOT NULL
├── username     VARCHAR(100) UNIQUE NOT NULL
├── password     VARCHAR(255) NOT NULL
└── created_at   TIMESTAMPTZ

articles
├── article_id   UUID PK
├── url          VARCHAR(1000) NOT NULL
├── title        VARCHAR(500) NOT NULL
├── description  TEXT NOT NULL
└── used_at      TIMESTAMPTZ

game_sessions
├── session_id     UUID PK
├── user_id        UUID FK → users (nullable, dla niezalogowanych)
├── article_id     UUID FK → articles NOT NULL
├── revealed_count INTEGER NOT NULL DEFAULT 1
├── guesses_used   INTEGER NOT NULL DEFAULT 0
├── status         TEXT NOT NULL DEFAULT 'IN_PROGRESS'  -- IN_PROGRESS | WON | LOST
└── created_at     TIMESTAMPTZ

guess_counts
├── guess_id     UUID PK
├── user_id      UUID FK → users NOT NULL
├── date         TIMESTAMPTZ
└── num_guesses  INTEGER NOT NULL
```

## Uruchomienie lokalnie

**Wymagania:** Git, Docker Desktop (lub Docker Engine + Docker Compose)

```bash
# 1. Sklonuj repozytorium
git clone <repo-url>
cd wikiguess

# 2. Uruchom Docker Desktop (lub upewnij się, że daemon działa)

# 3. Zbuduj i uruchom wszystkie serwisy
docker compose up --build
```

Po chwili:

- Aplikacja dostępna pod: **http://localhost**
- Swagger UI: **http://localhost:3000/docs/**

Aby zatrzymać:

```bash
docker compose down
```

Aby zatrzymać i usunąć dane bazy:

```bash
docker compose down -v
```

## Diagram komunikacji

<img width="2653" height="3038" alt="obraz" src="https://github.com/user-attachments/assets/70482942-9af8-4970-9ea1-f05ca1e238a6" />
