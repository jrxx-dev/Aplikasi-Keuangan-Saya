import { cookies } from "next/headers"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { WidgetThemeProvider } from "@/contexts/widget-theme-context"

import "@/app/(main)/theme.css"
import GlobalSummary from "@/components/global-summary"
import { PageWrapper } from "@/components/page-wrapper"

import { ChatWidget } from "@/components/finance/chat-widget"
import { GlobalErrorLogger } from "@/components/global-error-logger"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as React.CSSProperties
      }
    >
      <GlobalErrorLogger />
      <AppSidebar variant="floating" />
      <SidebarInset className="bg-transparent overflow-hidden h-screen w-screen relative z-10">
        <div className="flex flex-1 flex-col h-full w-full p-4 md:p-6 lg:p-8 overflow-hidden gap-6">
          {/* Persistent Header - Outside the main content box */}
          <div className="shrink-0">
            <GlobalSummary />
          </div>

          {/* The Main Glass Board - The Floating Box */}
          <div className="glass-panel flex-1 flex flex-col overflow-hidden relative shadow-2xl ring-1 ring-white/10">
            {/* Scrollable Content Area - Confined scrolling */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide scroll-smooth">
              <WidgetThemeProvider>
                <PageWrapper>
                  <div className="flex flex-1 flex-col pt-4 min-h-0">{children}</div>
                </PageWrapper>
              </WidgetThemeProvider>
              <ChatWidget />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}