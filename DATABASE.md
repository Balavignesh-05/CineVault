# CineVault Database Schema Documentation

Database: **PostgreSQL (Supabase)**  
ORM: **Prisma v5**

---

## 🗄️ Entity Relationship Diagram

```
User (1) <---> (*) Session
User (1) <---> (*) FilmLog
User (1) <---> (*) Review
User (1) <---> (*) List (Collection)
User (1) <---> (*) WatchlistItem
User (1) <---> (*) Notification
User (1) <---> (*) UserAchievement
User (1) <---> (*) Report

Film (1) <---> (*) FilmLog
Film (1) <---> (*) Review
Film (1) <---> (*) ListFilm
Film (1) <---> (*) WatchlistItem
Film (1) <---> (*) FilmGenre

Review (1) <---> (*) ReviewComment
Review (1) <---> (*) ReviewLike
ReviewComment (1) <---> (*) ReviewComment (Replies)
List (1) <---> (*) ListFilm
List (1) <---> (*) ListLike
Achievement (1) <---> (*) UserAchievement
```

---

## 📐 Core Prisma Models

### 1. `User` (`users`)
- `id`: UUID (Primary Key)
- `username`: VarChar(30), Unique
- `email`: VarChar(255), Unique
- `passwordHash`: String (hashed using bcrypt)
- `displayName`: VarChar(60)
- `bio`: Text
- `avatarUrl`: String
- `website`: String
- `location`: String
- `isPrivate`: Boolean (default: `false`)
- `isVerified`: Boolean (default: `false`)
- `role`: Enum (`guest`, `member`, `moderator`, `admin`)
- `status`: String (`active`, `suspended`, `banned`)
- `createdAt`, `updatedAt`: Timestamptz

### 2. `Film` (`films`)
- `id`: UUID (Primary Key)
- `tmdbId`: Int, Unique
- `imdbId`: String
- `title`: VarChar(255)
- `originalTitle`: VarChar(255)
- `slug`: VarChar(300), Unique
- `releaseDate`: Date
- `runtime`: Int (minutes)
- `overview`: Text
- `tagline`: String
- `posterUrl`: String
- `backdropUrl`: String
- `avgRating`: Decimal(3, 2)
- `ratingCount`: Int
- `createdAt`: Timestamptz

### 3. `FilmLog` (`film_logs`)
- `id`: UUID (Primary Key)
- `userId`: Foreign Key to `User.id` (Cascade Delete)
- `filmId`: Foreign Key to `Film.id` (Cascade Delete)
- `watchedDate`: Date
- `isRewatch`: Boolean (default: `false`)
- `rating`: Decimal(3, 1) (0.5 to 5.0)
- `liked`: Boolean (default: `false`)
- `createdAt`: Timestamptz

### 4. `Review` (`reviews`)
- `id`: UUID (Primary Key)
- `userId`: Foreign Key to `User.id`
- `filmId`: Foreign Key to `Film.id`
- `logId`: Foreign Key to `FilmLog.id` (Unique, optional)
- `body`: Text
- `containsSpoilers`: Boolean (default: `false`)
- `isPublished`: Boolean (default: `true`)
- `isFeatured`: Boolean (default: `false`)
- `isApproved`: Boolean (default: `true`)
- `likeCount`: Int (default: `0`)
- `commentCount`: Int (default: `0`)
- `createdAt`, `updatedAt`: Timestamptz

### 5. `ReviewComment` (`review_comments`)
- `id`: UUID (Primary Key)
- `reviewId`: Foreign Key to `Review.id`
- `userId`: Foreign Key to `User.id`
- `parentId`: Foreign Key to `ReviewComment.id` (self-referential for threaded replies)
- `body`: Text
- `likeCount`: Int (default: `0`)
- `createdAt`: Timestamptz

### 6. `List` (`lists` - Custom Collections)
- `id`: UUID (Primary Key)
- `userId`: Foreign Key to `User.id`
- `title`: VarChar(255)
- `slug`: VarChar(300)
- `description`: Text
- `coverImageUrl`: String
- `isPublic`: Boolean (default: `true`)
- `isRanked`: Boolean (default: `false`)
- `isPublished`: Boolean (default: `true`)
- `isFeatured`: Boolean (default: `false`)
- `likeCount`: Int (default: `0`)
- `filmCount`: Int (default: `0`)
- `createdAt`, `updatedAt`: Timestamptz

### 7. `WatchlistItem` (`watchlist_items`)
- `id`: UUID (Primary Key)
- `userId`: Foreign Key to `User.id`
- `filmId`: Foreign Key to `Film.id`
- `status`: Enum (`planned`, `watching`, `watched`)
- `addedAt`: Timestamptz

### 8. `Notification` (`notifications`)
- `id`: UUID (Primary Key)
- `recipientId`: Foreign Key to `User.id`
- `actorId`: Foreign Key to `User.id`
- `type`: Enum (`follow`, `like`, `comment`, `mention`)
- `entityType`: String (`review`, `collection`, `achievement`, etc.)
- `entityId`: String
- `readAt`: Timestamptz (null if unread)
- `createdAt`: Timestamptz

### 9. `Achievement` & `UserAchievement` (`achievements`, `user_achievements`)
- `Achievement`: `key`, `title`, `description`, `tier` (`bronze`, `silver`, `gold`, `diamond`), `requirement`, `iconName`, `category`.
- `UserAchievement`: `userId`, `achievementId`, `progress`, `unlockedAt`.

### 10. `Report` (`reports`)
- `id`: UUID (Primary Key)
- `reporterId`: Foreign Key to `User.id`
- `entityType`: String (`movie`, `review`, `comment`, `collection`, `profile`)
- `entityId`: String
- `reason`: String (`spam`, `harassment`, `hate_speech`, `nsfw`, `fake_info`, `other`)
- `status`: String (`pending`, `approved`, `dismissed`, `warned`, `suspended`, `deleted`)
- `resolvedBy`: String
- `createdAt`: Timestamptz

### 11. `AdminLog` (`admin_logs`)
- `id`: UUID (Primary Key)
- `adminId`: String
- `action`: VarChar(100)
- `targetType`: VarChar(50)
- `targetId`: String
- `details`: Text
- `createdAt`: Timestamptz
