"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { signOut } from "@/lib/auth-client"
import { getNotifications, markAllRead } from "@/lib/actions/notifications"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconCoin,
  IconLock,
  IconDeviceDesktop,
  IconInfoCircle
} from "@tabler/icons-react"
import { toast } from "sonner"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([])

  // Fetch Notifications Logic
  const refreshNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  }

  useEffect(() => {
    refreshNotifications();
    // Polling for "Real-time" effect every 30s
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await markAllRead();
    refreshNotifications();
    toast.success("Semua notifikasi ditandai sudah dibaca");
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const userInitials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user.email[0].toUpperCase()

  const handleBillingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info("Fitur Billing Sedang Disiapkan 🚀", {
      description: "Nantikan kemudahan pembayaran yang lebih aman dan fleksibel.",
      duration: 4000,
      action: {
        label: "Oke",
        onClick: () => console.log("Billing toast clicked"),
      },
      classNames: {
        toast: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
        title: "text-amber-800 dark:text-amber-200 font-bold",
        description: "text-amber-600 dark:text-amber-400"
      }
    });
  }

  return (
    <>
      {/* 1. PROFILE INFORMATION DIALOG */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-white/20 overflow-hidden p-0 rounded-3xl shadow-2xl">

          {/* Header Background */}
          <div className="relative h-36 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          <div className="px-6 pb-6 -mt-16 relative z-10 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-75 blur group-hover:opacity-100 transition duration-1000"></div>
              <Avatar className="w-28 h-28 border-[6px] border-white dark:border-zinc-950 shadow-2xl rounded-full relative">
                <AvatarImage src={user.avatar} className="object-cover" />
                <AvatarFallback className="text-3xl bg-indigo-500 text-white font-black">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 bg-emerald-500 border-4 border-white dark:border-zinc-950 rounded-full w-6 h-6 z-20" title="Online"></div>
            </div>

            <DialogTitle className="mt-4 text-2xl font-black tracking-tight">{user.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground text-sm font-medium">{user.email}</span>
              <BadgeWrapper>PRO</BadgeWrapper>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <InfoCard label="Member ID" value={`#${Math.random().toString(36).substring(2, 8).toUpperCase()}`} />
              <InfoCard label="Status" value="Active • Verified" valueColor="text-emerald-500" />
              <InfoCard label="Plan" value="Professional" />
              <InfoCard label="Region" value="Indonesia (ID)" />
            </div>

            <Button onClick={() => setShowProfileDialog(false)} className="mt-6 w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold h-11 hover:scale-[1.02] transition-transform">
              Tutup Kartu Profil
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. NOTIFICATION CENTER DIALOG */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="sm:max-w-[420px] bg-[#f8f9fa] dark:bg-black border-white/20 p-0 rounded-3xl shadow-2xl overflow-hidden gap-0">
          <DialogHeader className="p-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex flex-row items-center justify-between sticky top-0 z-10 space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                <IconNotification className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-bold text-base leading-tight">Notifikasi</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">Pusat informasi terbaru Anda</DialogDescription>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllRead} variant="ghost" size="sm" className="h-8 text-xs font-semibold text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                Tandai dibaca
              </Button>
            )}
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2 bg-slate-50/50 dark:bg-black custom-scrollbar min-h-[300px]">
            {/* Dynamic Notifications */}
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                <IconNotification className="w-10 h-10 mb-2" />
                <p className="text-sm">Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <NotifItem
                  key={notif.id}
                  icon={
                    notif.type === 'success' ? <IconCoin className="w-5 h-5" /> :
                      notif.type === 'security' ? <IconLock className="w-5 h-5" /> :
                        notif.type === 'device' ? <IconDeviceDesktop className="w-5 h-5" /> :
                          <IconInfoCircle className="w-5 h-5" />
                  }
                  color={
                    notif.type === 'success' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      notif.type === 'security' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                  }
                  title={notif.title}
                  desc={notif.message}
                  time={formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: idLocale })}
                  isNew={!notif.isRead}
                />
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900">
            <Button variant="outline" className="w-full rounded-xl border-dashed border-slate-300 dark:border-zinc-700 text-muted-foreground text-xs h-9">
              Lihat Semua Riwayat
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* 3. SIDEBAR USER MENU TRIGGER */}
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="nav-user-dropdown-trigger">
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!p-0"
              >
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-8 w-8 rounded-full ring-2 ring-white/10 grayscale-[0.1] hover:grayscale-0 transition-all border border-white/10 shadow-sm">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-full bg-indigo-500 text-white font-bold" suppressHydrationWarning>{userInitials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-bold text-slate-700 dark:text-slate-200" suppressHydrationWarning>{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs flex items-center gap-1.5" suppressHydrationWarning>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4 group-data-[collapsible=icon]:hidden opacity-50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-2xl p-2 border-slate-200/60 dark:border-white/10 shadow-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={12}
            >
              <DropdownMenuLabel className="p-0 font-normal mb-2">
                <div className="flex items-center gap-3 px-2 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <Avatar className="h-10 w-10 rounded-xl border-2 border-white dark:border-zinc-800 shadow-sm">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-xl bg-indigo-500 text-white font-bold">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-bold text-base">{user.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">PRO</span>
                    </div>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuGroup className="space-y-1">
                {/* INFO PROFILE TRIGGER */}
                <DropdownMenuItem onClick={() => setShowProfileDialog(true)} className="gap-3 p-2.5 rounded-xl cursor-pointer focus:bg-indigo-50 dark:focus:bg-indigo-500/20">
                  <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                    <IconUserCircle className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">Informasi Akun</span>
                    <span className="text-[10px] text-muted-foreground">Lihat detail identitas</span>
                  </div>
                </DropdownMenuItem>

                {/* BILLING TRIGGER */}
                <DropdownMenuItem onClick={handleBillingClick} className="gap-3 p-2.5 rounded-xl cursor-pointer focus:bg-indigo-50 dark:focus:bg-indigo-500/20 opacity-90 hover:opacity-100">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <IconCreditCard className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Billing & Plan</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-amber-200 text-amber-600 bg-amber-50">Soon</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Langganan & tagihan</span>
                  </div>
                </DropdownMenuItem>

                {/* NOTIFICATIONS TRIGGER (OPENS DIALOG NOW) */}
                <DropdownMenuItem onClick={() => setShowNotificationDialog(true)} className="gap-3 p-2.5 rounded-xl cursor-pointer focus:bg-indigo-50 dark:focus:bg-indigo-500/20">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 relative">
                    <IconNotification className="size-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">Notifikasi</span>
                    <span className="text-xs text-indigo-500 font-medium">
                      {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : "Tidak ada pesan baru"}
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-2 bg-slate-100 dark:bg-white/5" />

              <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="gap-3 p-2.5 rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20 focus:text-rose-700">
                <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600">
                  <IconLogout className="size-4" />
                </div>
                <span className="font-bold text-sm">
                  {isSigningOut ? "Keluar..." : "Keluar Aplikasi"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}

// HELPER COMPONENTS FOR CLEANER CODE
function BadgeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 uppercase tracking-wide">
      {children}
    </span>
  )
}

function InfoCard({ label, value, valueColor = "text-slate-800 dark:text-slate-200" }: { label: string, value: string, valueColor?: string }) {
  return (
    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col items-start gap-1">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={`font-semibold text-sm ${valueColor}`}>{value}</span>
    </div>
  )
}

function NotifItem({ icon, color, title, desc, time, isNew }: any) {
  return (
    <div className={`flex gap-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all cursor-pointer group ${isNew ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
      <div className={`mt-0.5 p-2 w-9 h-9 flex items-center justify-center rounded-xl shadow-sm shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 space-y-0.5">
        <div className="flex justify-between items-start">
          <p className={`text-sm leading-none ${isNew ? 'font-bold' : 'font-medium'}`}>{title}</p>
          {isNew && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></span>}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{desc}</p>
        <p className="text-[10px] text-slate-400 mt-1 font-medium">{time}</p>
      </div>
    </div>
  )
}
