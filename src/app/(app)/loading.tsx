import {
  PageHeaderSkeleton,
  StatGridSkeleton,
  Skeleton,
} from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-5 shadow-sm"
          >
            <Skeleton className="h-4 w-48" />
            <Skeleton className="mt-2 h-3 w-32" />
            <Skeleton className="mt-5 h-32 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
