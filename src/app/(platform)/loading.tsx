export default function PlatformLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="academic-card p-6 space-y-3">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-96 max-w-full bg-slate-100 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="academic-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-3.5 w-28 bg-slate-100 rounded" />
              </div>
              <div className="h-7 w-16 bg-indigo-50 rounded-md" />
            </div>
            <div className="h-16 bg-slate-50 rounded-lg border border-slate-100" />
            <div className="flex items-center gap-2 pt-2">
              <div className="h-6 w-24 bg-emerald-50 rounded" />
              <div className="h-6 w-24 bg-indigo-50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
