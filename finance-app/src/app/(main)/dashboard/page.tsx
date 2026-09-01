"use client";

export default function Page() {
  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <p className="text-lg mb-2">✓ Dashboard working!</p>
          <p className="text-muted-foreground">Authenticated access granted.</p>
        </div>
      </div>
    </div>
  );
}
