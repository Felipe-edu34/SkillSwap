export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="academic-card p-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-64 bg-slate-200 rounded" />
            <div className="h-4 w-48 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-16 bg-slate-50 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="academic-card p-6 h-56 bg-white" />
        <div className="academic-card p-6 h-56 bg-white" />
      </div>
    </div>
  );
}
