"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession, signOut } from "@/lib/auth-client";
import { Loader2, Wallet, ArrowRight, TrendingUp, ShieldCheck, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showQuickAccess, setShowQuickAccess] = useState(false);
    const router = useRouter();
    const { data: session, isPending: isSessionLoading } = useSession();

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
                rememberMe,
            });

            router.push("/dashboard");

        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
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
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="hidden bg-zinc-900 lg:flex flex-col justify-between p-10 text-white relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500 blur-[100px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600 blur-[100px]" />
                </div>

                <div className="relative z-10 flex items-center gap-2 text-lg font-medium">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                        <Wallet className="h-5 w-5" />
                    </div>
                    FinanceMy
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold tracking-tight mb-6">
                        Master your money with confidence.
                    </h1>
                    <div className="space-y-4 text-zinc-400">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                            </div>
                            <p>Real-time analytics and financial insights</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
                                <ShieldCheck className="h-5 w-5 text-blue-400" />
                            </div>
                            <p>Bank-grade security for your data</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-zinc-500">
                    &copy; 2025 FinanceMy Inc. All rights reserved.
                </div>
            </div>

            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
                <AnimatePresence mode="wait">
                    {showQuickAccess && session?.user ? (
                        <motion.div
                            key="quick-access"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mx-auto w-full max-w-[400px] space-y-6"
                        >
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 shadow-xl overflow-hidden">
                                    {session.user.image ? (
                                        <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-10 w-10 text-zinc-400" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Welcome back, {session.user.name?.split(' ')[0] || "User"}!
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        You are currently logged in as <span className="font-medium text-foreground">{session.user.email}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={handleQuickAccess}
                                    className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                                >
                                    Continue to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleSwitchAccount}
                                    disabled={isLoading}
                                    className="w-full h-11 border-dashed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <LogOut className="mr-2 h-4 w-4" />
                                    )}
                                    Sign in with a different account
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="login-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mx-auto w-full max-w-[400px] space-y-6"
                        >
                            <div className="flex flex-col space-y-2 text-center">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Welcome back
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Enter your email to access your dashboard
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20" role="alert">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm font-medium text-primary hover:text-primary/90 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-11"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={rememberMe}
                                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                        disabled={isLoading}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Remember me
                                    </Label>
                                </div>
                                <Button type="submit" className="w-full h-11 transition-all" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full h-11"
                                    onClick={async () => {
                                        await signIn.social({
                                            provider: "google",
                                            redirectTo: "/dashboard",
                                        });
                                    }}
                                >
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                    Google
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full h-11"
                                    onClick={async () => {
                                        await signIn.social({
                                            provider: "github",
                                            redirectTo: "/dashboard",
                                        });
                                    }}
                                >
                                    <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                    GitHub
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                type="button"
                                className="w-full h-11 border-dashed border border-zinc-700/50 text-muted-foreground hover:text-foreground hover:border-zinc-500 hover:bg-zinc-900/10 mt-2"
                                onClick={async () => {
                                    // Quick fill for demo purpose
                                    setEmail("guest@financemy.com");
                                    setPassword("guest123");
                                    // Optional: auto submit if you implement auto-login logic, but filling is safer for now
                                }}
                            >
                                Sign in as Guest (Demo)
                            </Button>

                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/sign-up" className="font-medium text-primary hover:underline underline-offset-4">
                                    Sign up
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
