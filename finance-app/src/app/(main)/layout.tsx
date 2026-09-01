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
    <div>
      {children}
    </div>
  )
}