"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession, signOut } from "@/lib/auth-client";
import { Loader2, ArrowRight, TrendingUp, ShieldCheck, Sparkles, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  // Check for session to show Quick Access instead of auto-redirect
  useEffect(() => {
    if (!isSessionLoading && session?.user) {
      setShowQuickAccess(true);
    }
  }, [session, isSessionLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signIn.email({
        email,
        password,
      });

      localStorage.removeItem("is_demo");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      if (email !== "admin@test.com") setIsLoading(false);
    }
  };

  const handleQuickAccess = () => {
    router.push("/dashboard");
  };

  const handleSwitchAccount = async () => {
    setIsLoading(true);
    await signOut();
    setShowQuickAccess(false);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      {/* --- Left Side: Aesthetic Animation & content --- */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 blur-[120px] opacity-40 animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 blur-[120px] opacity-30 animate-pulse delay-1000" />
          <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[100px] opacity-20" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full max-w-xl px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <span className="text-xl font-bold tracking-tight">FinanceMy</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
              Masa Depan <br />
              Manajemen Keuangan.
            </h1>

            <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
              Kelola aset, pantau pengeluaran, dan capai kebebasan finansial Anda dengan platform yang cerdas dan intuitif.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <TrendingUp className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="font-semibold text-lg">Smart Analytics</h3>
                <p className="text-sm text-zinc-500 mt-1">AI-powered insights for your spending assets.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <ShieldCheck className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-semibold text-lg">Bank Security</h3>
                <p className="text-sm text-zinc-500 mt-1">Enterprise-grade encryption for your data.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        {/* Mobile Background Decoration */}
        <div className="lg:hidden absolute overflow-hidden inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[80px]" />
        </div>

        <AnimatePresence mode="wait">
          {showQuickAccess && session?.user ? (
            <motion.div
              key="quick-access"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md space-y-8 relative z-10"
            >
              <div className="text-center space-y-4">
                <div className="h-24 w-24 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 shadow-xl overflow-hidden">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-zinc-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Selamat Datang Kembali 👋</h2>
                  <h3 className="text-xl font-medium mt-2 text-indigo-600 dark:text-indigo-400">
                    {session.user.name?.split(' ')[0] || "User"}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Masuk sebagai <span className="font-medium text-foreground">{session.user.email}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  onClick={handleQuickAccess}
                  className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                >
                  Lanjutkan ke Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSwitchAccount}
                  disabled={isLoading}
                  className="w-full h-11 border-dashed rounded-xl hover:bg-muted/50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Gunakan Akun Lain
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-md space-y-8 relative z-10"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Selamat Datang 👋</h2>
                <p className="text-muted-foreground mt-2">Masuk untuk mengakses dashboard finansial Anda.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="pl-4 h-11 bg-muted/30 border-muted-foreground/20 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                        Lupa password?
                      </Link>
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-4 h-11 bg-muted/30 border-muted-foreground/20 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <Button disabled={isLoading} className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <span className="flex items-center justify-center gap-2">
                      Masuk ke Akun <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-muted-foreground/20"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground">Atau masuk dengan</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => signIn.social({ provider: "google", redirectTo: '/dashboard' })} className="h-11 rounded-xl hover:bg-muted/50 transition-all">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Google
                </Button>
                <Button variant="outline" onClick={() => signIn.social({ provider: "github", redirectTo: '/dashboard' })} className="h-11 rounded-xl hover:bg-muted/50 transition-all">
                  <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
                  GitHub
                </Button>
              </div>

              <div className="pt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-indigo-500"
                  onClick={() => {
                    setEmail("guest@financemy.com");
                    setPassword("guest123");
                  }}
                >
                  <User className="w-3 h-3 mr-1" /> Masuk sebagai Tamu (Demo)
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-8">
                Dengan masuk, Anda menyetujui <a href="#" className="underline hover:text-foreground">Syarat & Ketentuan</a> kami.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute bottom-6 text-[10px] text-muted-foreground/50">
          © 2025 FinanceMy Inc. Secure & Encrypted.
        </div>
      </div>
    </div>
  );
}
