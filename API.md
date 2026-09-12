# CineVault API Documentation

Base URL: `http://localhost:5000/api/v1`

---

## 🔑 Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user account | No |
| `POST` | `/auth/login` | Log in with email/username & password | No |
| `GET` | `/auth/me` | Fetch currently authenticated user profile | Yes |
| `POST` | `/auth/logout` | Invalidate current session | Yes |

---

## 🎬 Films Routes (`/films`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/films/trending` | Fetch trending movies from TMDB | Optional |
| `GET` | `/films/popular` | Fetch popular movies from TMDB | Optional |
| `GET` | `/films/top-rated` | Fetch top rated movies | Optional |
| `GET` | `/films/upcoming` | Fetch upcoming movies | Optional |
| `GET` | `/films/now-playing` | Fetch movies currently in theaters | Optional |
| `GET` | `/films/search?q=` | Search movies by title | Optional |
| `GET` | `/films/:id` | Fetch movie details, credits, and stats | Optional |

---

## ⭐ Ratings Routes (`/ratings`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/ratings/film/:tmdbId` | Fetch film rating distribution and user rating | Optional |
| `POST` | `/ratings` | Submit or update star rating (0.5 - 5.0) | Yes |
| `DELETE` | `/ratings/film/:tmdbId` | Delete user rating for a film | Yes |

---

## 📝 Reviews Routes (`/reviews`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/reviews?filmId=` | Fetch reviews for a specific film | Optional |
| `GET` | `/reviews/me` | Fetch user's written reviews | Yes |
| `POST` | `/reviews` | Create a new film review | Yes |
| `PUT` | `/reviews/:id` | Edit an existing review | Yes |
| `DELETE` | `/reviews/:id` | Delete a review | Yes |
| `POST` | `/reviews/:id/like` | Like a review | Yes |
| `DELETE` | `/reviews/:id/like` | Unlike a review | Yes |

---

## 💬 Comments Routes (`/comments`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/comments?reviewId=` | Fetch threaded review comments | Optional |
| `POST` | `/comments` | Add a comment or reply to a review | Yes |
| `DELETE` | `/comments/:id` | Delete a comment | Yes |
| `POST` | `/comments/:id/like` | Like a comment | Yes |

---

## 📋 Collections Routes (`/collections`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/collections?userId=` | Fetch collections list | Optional |
| `GET` | `/collections/:id` | Fetch collection details & film items | Optional |
| `POST` | `/collections` | Create a new custom collection | Yes |
| `PUT` | `/collections/:id` | Edit collection metadata | Yes |
| `DELETE` | `/collections/:id` | Delete a collection | Yes |
| `POST` | `/collections/:id/films` | Add a film to collection | Yes |
| `DELETE` | `/collections/:id/films/:filmId` | Remove a film from collection | Yes |
| `PATCH` | `/collections/:id/films/reorder` | Reorder film positions | Yes |

---

## 📌 Watchlist Routes (`/watchlist`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/watchlist?status=` | Fetch user watchlist items | Yes |
| `POST` | `/watchlist` | Save film to watchlist (`planned`, `watching`, `watched`) | Yes |
| `PATCH` | `/watchlist/:filmId` | Update watchlist item status | Yes |
| `DELETE` | `/watchlist/:filmId` | Remove film from watchlist | Yes |
| `GET` | `/watchlist/check/:tmdbId` | Check if film is in watchlist | Yes |

---

## 🤖 AI Recommendations (`/recommendations`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/recommendations` | Fetch personalized categorized recommendations | Yes |

---

## 📊 Dashboard & Stats (`/dashboard` & `/stats`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/dashboard` | Fetch aggregated analytics, charts & activity | Yes |
| `GET` | `/stats/:username` | Fetch public user profile statistics | Optional |

---

## 🛡️ Admin & Moderation (`/admin`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/admin/stats` | Platform overview counters | Admin/Moderator |
| `GET` | `/admin/users` | List users with status filters | Admin/Moderator |
| `PATCH` | `/admin/users/:id/suspend` | Suspend a user account | Admin/Moderator |
| `PATCH` | `/admin/users/:id/ban` | Ban a user account | Admin/Moderator |
| `PATCH` | `/admin/users/:id/restore` | Restore user to active | Admin/Moderator |
| `GET` | `/admin/reviews` | List all reviews for moderation | Admin/Moderator |
| `PATCH` | `/admin/reviews/:id/approve` | Approve a review | Admin/Moderator |
| `PATCH` | `/admin/reviews/:id/feature` | Toggle featured review status | Admin/Moderator |
| `DELETE` | `/admin/reviews/:id` | Admin delete review | Admin/Moderator |
| `GET` | `/admin/collections` | List all collections | Admin/Moderator |
| `PATCH` | `/admin/collections/:id/feature` | Toggle featured collection | Admin/Moderator |
| `DELETE` | `/admin/collections/:id` | Delete collection | Admin/Moderator |
| `GET` | `/admin/reports` | List pending content reports | Admin/Moderator |
| `PATCH` | `/admin/reports/:id/resolve` | Resolve report (`approved`, `dismissed`, `warned`, `suspended`, `deleted`) | Admin/Moderator |
| `GET` | `/admin/logs` | Audit trail of admin actions | Admin/Moderator |

---

## 🚩 Reports (`/reports`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/reports` | Submit a content report | Yes |

---

## ⚙️ Settings (`/settings`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/settings` | Fetch user account settings | Yes |
| `PATCH` | `/settings` | Update user profile & privacy settings | Yes |
| `DELETE` | `/settings/account` | Permanently delete user account | Yes |
