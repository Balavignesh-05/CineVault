export default function MovieLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-surface">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-24 pb-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end">
            {/* Poster Skeleton */}
            <div className="hidden md:block w-64 h-96 bg-elevated rounded-xl shadow-2xl flex-shrink-0" />
            
            {/* Details Skeleton */}
            <div className="flex-1 space-y-6 w-full">
              <div className="h-12 md:h-16 bg-elevated rounded-lg w-3/4" />
              <div className="flex gap-4">
                <div className="h-6 bg-elevated rounded w-16" />
                <div className="h-6 bg-elevated rounded w-24" />
                <div className="h-6 bg-elevated rounded w-20" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-elevated rounded w-full" />
                <div className="h-4 bg-elevated rounded w-full" />
                <div className="h-4 bg-elevated rounded w-5/6" />
              </div>
              <div className="flex gap-4 pt-4">
                <div className="h-12 bg-elevated rounded-full w-32" />
                <div className="h-12 bg-elevated rounded-full w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <div className="space-y-6">
          <div className="h-8 bg-elevated rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-surface rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
