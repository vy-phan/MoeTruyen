export function MangaDetailSkeleton() {
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 md:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-base-content/10 bg-base-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="shrink-0 w-36 sm:w-48 md:w-56 aspect-[3/4] rounded-2xl bg-base-300" />
        <div className="flex-1 space-y-4 pt-4">
          <div className="h-10 w-3/4 bg-base-300 rounded-lg" />
          <div className="h-5 w-1/2 bg-base-300 rounded-lg" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-base-300 rounded-full" />
            <div className="h-8 w-20 bg-base-300 rounded-full" />
          </div>
          <div className="h-16 w-full max-w-lg bg-base-300 rounded-xl mt-4" />
          <div className="flex gap-3 pt-4">
            <div className="h-12 w-40 bg-base-300 rounded-xl" />
            <div className="h-12 w-40 bg-base-300 rounded-xl" />
          </div>
        </div>
      </div>
      
      {/* Description Skeleton */}
      <div className="h-32 w-full bg-base-200 rounded-2xl" />
      
      {/* Chapter List Skeleton */}
      <div className="h-96 w-full bg-base-200 rounded-2xl" />
    </div>
  );
}