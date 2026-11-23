export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-6 animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="space-y-2.5">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-7 w-72 bg-slate-200 rounded" />
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-16 bg-slate-100 rounded-lg" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-emerald-50 rounded" />
                <div className="h-6 w-20 bg-indigo-50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
