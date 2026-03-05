export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-space-900 flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-saiyan-500 to-aura-500 animate-pulse opacity-80" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-saiyan-400 to-aura-400 animate-pulse opacity-60" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-saiyan-500 to-aura-500 animate-pulse opacity-90" />
      </div>
      <p className="text-text-secondary mt-6 text-sm tracking-wide">Powering up...</p>
    </div>
  );
}
