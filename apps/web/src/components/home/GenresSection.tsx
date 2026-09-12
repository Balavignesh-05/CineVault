import Link from 'next/link';
import { 
  Film, Laugh, Ghost, Heart, Flame, Sword, 
  Rocket, Music, Baby, Search, MonitorPlay, 
  Map, ShieldAlert, BookOpen, Skull, Users, 
  Telescope, Target, Tv
} from 'lucide-react';
import { TMDBGenre } from '@/lib/tmdb/types';

interface GenresSectionProps {
  genres: TMDBGenre[];
}

const getGenreIcon = (id: number) => {
  switch (id) {
    case 28: return <Flame className="w-5 h-5" />; // Action
    case 12: return <Map className="w-5 h-5" />; // Adventure
    case 16: return <Baby className="w-5 h-5" />; // Animation
    case 35: return <Laugh className="w-5 h-5" />; // Comedy
    case 80: return <ShieldAlert className="w-5 h-5" />; // Crime
    case 99: return <MonitorPlay className="w-5 h-5" />; // Documentary
    case 18: return <Users className="w-5 h-5" />; // Drama
    case 10751: return <Heart className="w-5 h-5" />; // Family
    case 14: return <Sword className="w-5 h-5" />; // Fantasy
    case 36: return <BookOpen className="w-5 h-5" />; // History
    case 27: return <Ghost className="w-5 h-5" />; // Horror
    case 10402: return <Music className="w-5 h-5" />; // Music
    case 9648: return <Search className="w-5 h-5" />; // Mystery
    case 10749: return <Heart className="w-5 h-5" />; // Romance
    case 878: return <Rocket className="w-5 h-5" />; // Science Fiction
    case 10770: return <Tv className="w-5 h-5" />; // TV Movie
    case 53: return <Target className="w-5 h-5" />; // Thriller
    case 10752: return <Skull className="w-5 h-5" />; // War
    case 37: return <Telescope className="w-5 h-5" />; // Western
    default: return <Film className="w-5 h-5" />;
  }
};

const getGenreGradient = (id: number) => {
  const gradients = [
    'from-orange-500/20 to-red-600/20 hover:from-orange-500/40 hover:to-red-600/40 border-orange-500/30 text-orange-400',
    'from-amber-500/20 to-yellow-600/20 hover:from-amber-500/40 hover:to-yellow-600/40 border-amber-500/30 text-amber-400',
    'from-blue-500/20 to-cyan-600/20 hover:from-blue-500/40 hover:to-cyan-600/40 border-blue-500/30 text-blue-400',
    'from-emerald-500/20 to-teal-600/20 hover:from-emerald-500/40 hover:to-teal-600/40 border-emerald-500/30 text-emerald-400',
    'from-purple-500/20 to-fuchsia-600/20 hover:from-purple-500/40 hover:to-fuchsia-600/40 border-purple-500/30 text-purple-400',
    'from-rose-500/20 to-pink-600/20 hover:from-rose-500/40 hover:to-pink-600/40 border-rose-500/30 text-rose-400',
    'from-indigo-500/20 to-violet-600/20 hover:from-indigo-500/40 hover:to-violet-600/40 border-indigo-500/30 text-indigo-400',
  ];
  return gradients[id % gradients.length];
};

export function GenresSection({ genres }: GenresSectionProps) {
  if (!genres || genres.length === 0) return null;

  return (
    <section className="py-12 md:py-16 w-full">
      <div className="container space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white">
            Explore by Genre
          </h2>
          <p className="text-white/60 font-medium">
            Find exactly what you&apos;re in the mood for
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {genres.map((genre) => {
            const gradientClass = getGenreGradient(genre.id);
            return (
              <Link
                key={genre.id}
                href={`/search?genre=${genre.id}`}
                className={`
                  flex items-center gap-3 px-6 py-4 rounded-2xl 
                  bg-gradient-to-br backdrop-blur-md border border-solid
                  transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg
                  ${gradientClass}
                `}
              >
                <div className="bg-black/40 p-2 rounded-full backdrop-blur-sm">
                  {getGenreIcon(genre.id)}
                </div>
                <span className="font-semibold text-lg text-white">
                  {genre.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
