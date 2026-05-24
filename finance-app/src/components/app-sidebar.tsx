"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import {
  Gem, LayoutDashboard, TrendingUp, FileText, Target, PiggyBank, ArrowLeftRight, Settings, HelpCircle,
  Bug, CalendarClock, Home, ChevronRight, Coins, CalendarRange, LineChart, Users, GraduationCap, Landmark, Heart,
  Receipt, Umbrella, Map, Plane, ShieldCheck, Sparkles, Briefcase, MoreHorizontal, Info, ChevronDown, ShoppingBag, Plus
} from "lucide-react"
import { motion } from "framer-motion"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useLanguage } from "@/components/providers/language-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const { toggleSidebar } = useSidebar()
  const { t } = useLanguage()

  // Dynamic navigation based on language
  const navGroups = [
    {
      label: t('sidebar.summary'),
      items: [
        { title: t('sidebar.reports'), url: "/reports", icon: FileText },
      ]
    },
    {
      label: t('sidebar.management'),
      items: [
        { title: t('sidebar.budgets'), url: "/budgets", icon: PiggyBank },
        { title: t('sidebar.accounts'), url: "/accounts", icon: Gem },
      ]
    },
    {
      label: t('sidebar.finance'),
      items: [
        { title: "Planner Impian", url: "/planner", icon: ShoppingBag },
        { title: t('common.goals'), url: "/goals", icon: Target },
        { title: t('sidebar.subscriptions'), url: "/subscriptions", icon: CalendarClock },
        { title: t('sidebar.debts'), url: "/debts", icon: Gem },
        { title: t('sidebar.savings'), url: "/savings", icon: Coins },
      ]
    },
    {
      label: t('sidebar.explore'),
      items: [
        {
          title: t('sidebar.ecosystem'),
          icon: Sparkles,
          items: [
            { title: t('sidebar.calendar'), url: "/calendar", icon: CalendarRange },
            { title: t('sidebar.investments'), url: "/investments", icon: LineChart },
            { title: t('sidebar.assets'), url: "/assets", icon: Landmark },
            { title: t('sidebar.zakat'), url: "/zakat", icon: Heart },
            { title: t('sidebar.family'), url: "/family", icon: Users },
            { title: t('sidebar.education'), url: "/education", icon: GraduationCap },
            { title: t('sidebar.tax'), url: "/tax", icon: Receipt },
            { title: t('sidebar.pension'), url: "/pension", icon: Umbrella },
            { title: t('sidebar.insurance'), url: "/insurance", icon: ShieldCheck },
            { title: t('sidebar.travel'), url: "/travel", icon: Plane },
          ]
        }
      ]
    },
  ]

  const navSecondary = [
    { title: t('common.settings'), url: "/settings", icon: Settings },
    { title: t('sidebar.logs'), url: "/logs", icon: Bug },
    { title: t('sidebar.help'), url: "/help", icon: HelpCircle },
  ]


  const userData = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email,
    avatar: session.user.image || "/codeguide-logo.png",
  } : {
    name: "Guest",
    email: "guest@example.com",
    avatar: "/codeguide-logo.png",
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2 hover:bg-transparent data-[state=open]:hover:bg-transparent group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:overflow-visible"
            >
              <button
                onClick={toggleSidebar}
                className="flex items-center gap-3 w-full group cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:overflow-visible"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shrink-0 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:min-w-10 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:shadow-none"
                >
                  <Gem className="w-6 h-6 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
                </motion.div>
                <div className="flex flex-col items-start gap-0.5 group-data-[collapsible=icon]:hidden">
                  <span className="text-base font-bold font-parkinsans text-foreground transition-all">
                    FinanceMy
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                    Personal Dashboard
                  </span>
                </div>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Special Dashboard Home Button */}
        <SidebarGroup className="px-3 group-data-[collapsible=icon]:px-0 gap-3 flex flex-col items-center group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:mb-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard" className="!p-0 h-auto hover:bg-transparent">
                <Link
                  href="/dashboard"
                  className="relative flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white overflow-hidden group/dash shadow-md shadow-indigo-500/20 ring-1 ring-white/10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:min-w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:flex-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/dash:opacity-100 transition-opacity" />

                  <div className="relative z-20 flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md shrink-0 border border-white/10 group-data-[collapsible=icon]:hidden shadow-sm">
                    <Home className="w-5 h-5" />
                  </div>

                  <Home className="w-5 h-5 shrink-0 relative z-20 hidden group-data-[collapsible=icon]:block drop-shadow-md" />

                  <div className="flex flex-col gap-0.5 relative z-20 group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-sm leading-none tracking-tight">Dashboard</span>
                    <span className="text-[11px] text-white/80 leading-none font-medium">Overview</span>
                  </div>

                  {/* Decorative faint glow */}
                  <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-white/10 blur-xl rounded-full" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Analytics" className="!p-0 h-auto hover:bg-transparent">
                <Link
                  href="/analytics"
                  className="relative flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white overflow-hidden group/dash shadow-md shadow-emerald-500/20 ring-1 ring-white/10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:min-w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:flex-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/dash:opacity-100 transition-opacity" />

                  <div className="relative z-20 flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md shrink-0 border border-white/10 group-data-[collapsible=icon]:hidden shadow-sm">
                    <TrendingUp className="w-5 h-5" />
                  </div>

                  <TrendingUp className="w-5 h-5 shrink-0 relative z-20 hidden group-data-[collapsible=icon]:block drop-shadow-md" />

                  <div className="flex flex-col gap-0.5 relative z-20 group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-sm leading-none tracking-tight">Analytics</span>
                    <span className="text-[11px] text-white/80 leading-none font-medium">Insights</span>
                  </div>

                  {/* Decorative faint glow */}
                  <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/10 blur-xl rounded-full" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Transactions" className="!p-0 h-auto hover:bg-transparent">
                <Link
                  href="/transactions"
                  className="relative flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white overflow-hidden group/dash shadow-md shadow-sky-500/20 ring-1 ring-white/10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:min-w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:flex-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/dash:opacity-100 transition-opacity" />

                  <div className="relative z-20 flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md shrink-0 border border-white/10 group-data-[collapsible=icon]:hidden shadow-sm">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>

                  <ArrowLeftRight className="w-5 h-5 shrink-0 relative z-20 hidden group-data-[collapsible=icon]:block drop-shadow-md" />

                  <div className="flex flex-col gap-0.5 relative z-20 group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-sm leading-none tracking-tight">Transactions</span>
                    <span className="text-[11px] text-white/80 leading-none font-medium">Activity</span>
                  </div>

                  {/* Decorative faint glow */}
                  <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-white/10 blur-xl rounded-full" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

        </SidebarGroup>

        {/* Grouped Navigation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {navGroups.map((group, idx) => (
            <SidebarGroup key={idx}>
              <motion.div variants={itemVariants}>
                <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                  {group.label}
                </SidebarGroupLabel>
              </motion.div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item: any, itemIdx) => {
                    // Start of Nested Item Logic
                    if (item.items) {
                      return (
                        <Collapsible key={item.title} asChild defaultOpen={false} className="group/collapsible">
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton tooltip={item.title}>
                                <item.icon />
                                <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.items.map((subItem: any) => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild>
                                      <Link href={subItem.url}>
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      )
                    }

                    // Standard Flat Item
                    return (
                      <motion.div
                        key={item.title}
                        variants={itemVariants}
                        custom={itemIdx}
                      >
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild tooltip={item.title}>
                            <Link href={item.url!} className="group flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                              <motion.div
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                transition={{ type: "spring" as const, stiffness: 400, damping: 10 }}
                              >
                                <item.icon className="transition-colors group-hover:text-primary" />
                              </motion.div>
                              <span className="text-muted-foreground group-hover:text-foreground transition-colors group-data-[collapsible=icon]:hidden">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </motion.div>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </motion.div>

        {/* Secondary Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url} className="group flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: "spring" as const, stiffness: 400, damping: 10 }}
                      >
                        <item.icon className="transition-colors group-hover:text-primary" />
                      </motion.div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business Management Button (Bottom) */}
        <SidebarGroup className="mt-2 pb-2">
          <SidebarMenu>
            <Collapsible asChild className="group/collapsible">
              <SidebarMenuItem>
                <div className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white overflow-hidden shadow-md shadow-blue-500/20 ring-1 ring-white/10 transition-all duration-300 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:bg-none group-data-[collapsible=icon]:ring-0 group-data-[collapsible=icon]:shadow-none">
                  <div className="flex items-center gap-4 px-4 py-3.5 w-full relative z-20 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
                    <CollapsibleTrigger asChild>
                      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md shrink-0 border border-white/10 shadow-sm cursor-pointer hover:bg-white/30 hover:scale-105 transition-all active:scale-95 group-data-[state=open]/collapsible:bg-white/40 group-data-[state=open]/collapsible:shadow-inner group-data-[state=open]/collapsible:ring-1 group-data-[state=open]/collapsible:ring-white/30 group-data-[collapsible=icon]:bg-blue-600 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:border-none">
                        <Briefcase className="w-5 h-5 transition-transform duration-300 group-data-[state=open]/collapsible:scale-90 text-white" />
                      </div>
                    </CollapsibleTrigger>

                    <Link
                      href="/business"
                      className="flex flex-col gap-0.5 flex-1 select-none hover:opacity-80 transition-opacity group-data-[collapsible=icon]:hidden"
                    >
                      <span className="font-bold text-sm leading-none tracking-tight">Business</span>
                      <span className="text-[11px] text-white/80 leading-none font-medium text-left">Income & Ventures</span>
                    </Link>
                  </div>

                  <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                    <SidebarMenuSub className="border-none px-4 pb-3 pt-0 m-0 gap-1 flex flex-col">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild className="text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 h-9 rounded-lg px-2">
                          <Link href="/business/customers" className="flex items-center gap-3">
                            <Users className="w-4 h-4" />
                            <span className="font-medium text-xs">Pelanggan</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild className="text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 h-9 rounded-lg px-2">
                          <Link href="/business/akumulasi" className="flex items-center gap-3">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium text-xs">Akumulasi</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild className="text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 h-9 rounded-lg px-2">
                          <Link href="/business?view=settings" className="flex items-center gap-3">
                            <Settings className="w-4 h-4" />
                            <span className="font-medium text-xs">Settings</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild className="text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 h-9 rounded-lg px-2">
                          <Link href="/business?view=info" className="flex items-center gap-3">
                            <Info className="w-4 h-4" />
                            <span className="font-medium text-xs">Informasi Bisnis</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>

                  {/* Decorative faint glow for the whole box - hidden in collapsed */}
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 blur-2xl rounded-full pointer-events-none group-data-[collapsible=icon]:hidden" />
                </div>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent >

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar >
  )
}
