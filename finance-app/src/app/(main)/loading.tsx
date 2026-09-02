import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';

export default function Loading() {
  return (
    <div className="w-full">
      <DashboardSkeleton />
    </div>
  );
}
