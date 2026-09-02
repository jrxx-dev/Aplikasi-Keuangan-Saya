"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { WidgetThemeProvider } from "@/contexts/widget-theme-context";
import { PageWrapper } from "@/components/page-wrapper";
import { ChatWidget } from "@/components/finance/chat-widget";
import GlobalSummary from "@/components/global-summary";

interface DashboardLayoutClientProps {
  defaultOpen: boolean;
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  defaultOpen,
  children,
}: DashboardLayoutClientProps) {
  return (
    <WidgetThemeProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="floating" />
        <SidebarInset className="bg-transparent overflow-hidden h-screen w-screen relative z-10">
          <div className="flex flex-1 flex-col h-full w-full p-4 md:p-6 lg:p-8 overflow-hidden gap-6">
            <div className="shrink-0">
              <GlobalSummary />
            </div>

            <div className="glass-panel flex-1 flex flex-col overflow-hidden relative shadow-2xl ring-1 ring-white/10">
              <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide scroll-smooth">
                <PageWrapper>
                  <div className="flex flex-1 flex-col pt-4 min-h-0">{children}</div>
                </PageWrapper>
                <ChatWidget />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </WidgetThemeProvider>
  );
}
