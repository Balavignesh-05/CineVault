export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center gap-6">
      <h1 className="text-3xl font-black text-white">You&apos;re offline</h1>
      <p className="text-text-muted">Please check your internet connection and try again.</p>
    </div>
  );
}
