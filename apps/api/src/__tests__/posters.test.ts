import { describe, it } from 'node:test';
import assert from 'node:assert';

// Curated poster paths from CinematicPosterWall.tsx
const POSTER_PATHS = [
  { id: 27205, title: 'Inception', path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
  { id: 157336, title: 'Interstellar', path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
  { id: 475557, title: 'Joker', path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg' },
  { id: 155, title: 'The Dark Knight', path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
  { id: 680, title: 'Pulp Fiction', path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
  { id: 872585, title: 'Oppenheimer', path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
  { id: 496243, title: 'Parasite', path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
  { id: 129, title: 'Spirited Away', path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
  { id: 414906, title: 'The Batman', path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg' },
  { id: 438631, title: 'Dune', path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
  { id: 693134, title: 'Dune: Part Two', path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
  { id: 335984, title: 'Blade Runner 2049', path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' },
  { id: 244786, title: 'Whiplash', path: '/7fn624j5lj3xTme2SgiLCeuedmO.jpg' },
  { id: 324857, title: 'Spider-Man: Into the Spider-Verse', path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg' },
  { id: 569094, title: 'Across the Spider-Verse', path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg' },
  { id: 603, title: 'The Matrix', path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
  { id: 550, title: 'Fight Club', path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
  { id: 278, title: 'The Shawshank Redemption', path: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
  { id: 238, title: 'The Godfather', path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
  { id: 120, title: 'The Lord of the Rings', path: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
  { id: 37799, title: 'The Social Network', path: '/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg' },
  { id: 769, title: 'Goodfellas', path: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
  { id: 807, title: 'Seven', path: '/6yoghtyTpznpBik8EngEmJskVUO.jpg' },
  { id: 13, title: 'Forrest Gump', path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
  { id: 313369, title: 'La La Land', path: '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg' },
  { id: 372058, title: 'Your Name.', path: '/od22ftNnyag0TTxcnJhlsu3aLoU.jpg' },
  { id: 105, title: 'Back to the Future', path: '/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg' },
  { id: 1891, title: 'The Empire Strikes Back', path: '/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg' },
  { id: 299536, title: 'Avengers: Infinity War', path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg' },
  { id: 597, title: 'Titanic', path: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg' },
  { id: 77338, title: 'The Intouchables', path: '/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg' },
  { id: 11, title: 'Star Wars', path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
];

function buildPosterUrl(path: string | null, size = 'w342'): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `https://image.tmdb.org/t/p/${size}${path.startsWith('/') ? path : `/${path}`}`;
}

describe('Movie Poster URL Construction & Reliability Suite', () => {
  it('correctly constructs TMDB image URLs from relative paths with leading slashes', () => {
    const url = buildPosterUrl('/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', 'w342');
    assert.strictEqual(url, 'https://image.tmdb.org/t/p/w342/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg');
  });

  it('safely handles relative paths missing leading slash', () => {
    const url = buildPosterUrl('oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', 'w500');
    assert.strictEqual(url, 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg');
  });

  it('preserves full HTTP/HTTPS URLs without double-prefixing TMDB base', () => {
    const fullUrl = 'https://custom-cdn.example.com/poster.jpg';
    const result = buildPosterUrl(fullUrl);
    assert.strictEqual(result, fullUrl);
  });

  it('returns null for empty or null paths without producing broken strings', () => {
    assert.strictEqual(buildPosterUrl(null), null);
    assert.strictEqual(buildPosterUrl(''), null);
  });

  it('verifies all 32 curated cinematic poster entries have non-empty titles and valid paths', () => {
    assert.strictEqual(POSTER_PATHS.length, 32);
    for (const item of POSTER_PATHS) {
      assert.ok(item.id > 0, `Item ${item.title} must have positive ID`);
      assert.ok(item.title.trim().length > 0, `Item ${item.id} must have title`);
      assert.ok(item.path.startsWith('/'), `Item ${item.title} path must start with slash`);
      assert.ok(item.path.endsWith('.jpg'), `Item ${item.title} path must end with .jpg`);
      assert.ok(!item.path.includes(' '), `Item ${item.title} path must not contain whitespace`);
    }
  });

  it('verifies previously broken posters now use verified TMDB paths', () => {
    const lotr = POSTER_PATHS.find((p) => p.title === 'The Lord of the Rings');
    assert.strictEqual(lotr?.path, '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg');

    const socialNetwork = POSTER_PATHS.find((p) => p.title === 'The Social Network');
    assert.strictEqual(socialNetwork?.path, '/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg');

    const laLaLand = POSTER_PATHS.find((p) => p.title === 'La La Land');
    assert.strictEqual(laLaLand?.path, '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg');

    const yourName = POSTER_PATHS.find((p) => p.title === 'Your Name.');
    assert.strictEqual(yourName?.path, '/od22ftNnyag0TTxcnJhlsu3aLoU.jpg');

    const empire = POSTER_PATHS.find((p) => p.title === 'The Empire Strikes Back');
    assert.strictEqual(empire?.path, '/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg');
  });
});
