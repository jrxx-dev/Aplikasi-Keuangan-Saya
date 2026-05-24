"use client";

// import { useChat } from "ai/react"; // DISABLED TEMPORARILY
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sparkles,
    Send,
    RefreshCw,
    Bot,
    User,
    ChevronRight,
    Loader2,
    Mic,
    Volume2,
    Check
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";

// Mock types
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function AIInsightsWidget() {
    // MOCK useChat Implementation
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const append = async (message: { role: 'user' | 'assistant', content: string }) => {
        setIsLoading(true);
        const userMsg: Message = { id: Date.now().toString(), role: message.role, content: message.content };
        setMessages(prev => [...prev, userMsg]);

        // Simulate AI Response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Maaf, fitur AI saat ini sedang disabled sementara untuk perbaikan teknis. Namun data analitik di halaman ini adalah data real time Anda. Silakan jelajahi tab 'Advanced Analytics' untuk melihat detailnya. 😊"
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsLoading(false);
        }, 1500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const currentInput = input;
        setInput(""); // Clear input immediately

        await append({ role: 'user', content: currentInput });
    };

    // End MOCK implementation

    const [hasStarted, setHasStarted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleStartAnalysis = async () => {
        setHasStarted(true);
        // Clear previous context if any
        setMessages([]);

        await append({
            role: "user",
            content: "Berikan analisis mendalam tentang kondisi keuanganku saat ini berdasarkan data yang kamu miliki. Fokus pada 3 poin utama: Cash Flow, Kebocoran Pengeluaran, dan Potensi Tabungan. Akhiri dengan 1 saran konkret yang bisa kulakukan hari ini. Gunakan tone yang profesional tapi santai, gunakan emoji yang relevan."
        });
    };

    const handleQuickPrompt = async (prompt: string) => {
        if (!hasStarted) setHasStarted(true);
        await append({
            role: "user",
            content: prompt
        });
    };

    return (
        <Card className="border-none shadow-2xl bg-zinc-950 text-white overflow-hidden relative h-[600px] flex flex-col rounded-3xl ring-1 ring-white/10">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/20 to-zinc-950 pointer-events-none" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20 animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none" />

            {/* HEADER */}
            <CardHeader className="relative z-10 border-b border-white/5 backdrop-blur-md bg-white/5 pb-4 pt-5 px-6 shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-zinc-900"></span>
                            </span>
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                                FinanceGPT
                                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                                    Pro
                                </span>
                            </CardTitle>
                            <CardDescription className="text-zinc-400 text-xs flex items-center gap-1.5 mt-0.5">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                Smart Financial Advisor
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasStarted && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setMessages([]); setHasStarted(false); }}
                                className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
                                title="Reset Chat"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            {/* CHAT CONTENT */}
            <div className="flex-1 overflow-hidden relative z-10 bg-zinc-950/50" ref={scrollRef}>
                <ScrollArea className="h-full px-6 py-6" >
                    {!hasStarted ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                                <Bot className="w-24 h-24 text-indigo-400/80 relative z-10" />
                            </div>

                            <div className="space-y-3 max-w-sm mx-auto">
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                                    Halo, Saya FinanceGPT
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Saya telah menganalisis data keuangan Anda. Apa yang ingin Anda ketahui hari ini?
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                                <Button
                                    onClick={handleStartAnalysis}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-6 rounded-2xl shadow-lg shadow-indigo-500/10 justify-start px-5 relative overflow-hidden group border border-indigo-500/50 transition-all hover:-translate-y-1"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <Sparkles className="w-5 h-5 mr-3 text-indigo-200" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm">Analisis Lengkap</span>
                                        <span className="text-[10px] text-indigo-200/70 font-normal">Cashflow, Kebocoran, Potensi</span>
                                    </div>
                                </Button>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleQuickPrompt("Bagaimana cara saya menabung lebih banyak bulan ini?")}
                                        className="h-auto py-4 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:border-indigo-500/30 text-zinc-300 hover:text-white justify-start px-4 rounded-xl text-left transition-all hover:-translate-y-0.5"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-xs">Cara Investasi</span>
                                            <span className="text-[10px] text-zinc-500">Tips menabung</span>
                                        </div>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleQuickPrompt("Sebutkan 3 pengeluaran terbesarku bulan ini dan sarannya.")}
                                        className="h-auto py-4 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:border-rose-500/30 text-zinc-300 hover:text-white justify-start px-4 rounded-xl text-left transition-all hover:-translate-y-0.5"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-xs">Audit Boros</span>
                                            <span className="text-[10px] text-zinc-500">Cek pengeluaran</span>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-4">
                            {messages.map((m, i) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={cn(
                                        "flex gap-4 w-full",
                                        m.role === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm mt-1",
                                        m.role === 'user'
                                            ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                                            : "bg-gradient-to-br from-indigo-500 to-violet-600 border-transparent text-white"
                                    )}>
                                        {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>

                                    <div className={cn(
                                        "relative group max-w-[85%]",
                                        m.role === 'user' ? "items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-md",
                                            m.role === 'user'
                                                ? "bg-zinc-800 text-zinc-100 rounded-tr-sm border border-zinc-700/50"
                                                : "bg-indigo-950/40 text-indigo-50 backdrop-blur-sm border border-indigo-500/20 rounded-tl-sm"
                                        )}>
                                            {m.role === 'assistant' ? (
                                                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-indigo-200 prose-strong:text-white prose-li:text-indigo-100/90 marker:text-indigo-500">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {m.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{m.content}</p>
                                            )}
                                        </div>

                                        {/* Timestamp / Status */}
                                        <div className={cn(
                                            "text-[10px] text-zinc-500 mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1",
                                            m.role === 'user' ? "justify-end" : "justify-start"
                                        )}>
                                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {m.role === 'user' && <Check className="w-3 h-3 text-indigo-500" />}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-4 w-full"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-transparent text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-indigo-950/30 border border-indigo-500/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* Scroll to bottom gradient overlay */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
            </div>

            {/* INPUT AREA */}
            <CardFooter className="relative z-10 p-4 pt-2 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5">
                <form onSubmit={handleSubmit} className="flex gap-3 w-full items-end relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 hover:border-indigo-500/30 transition-all shrink-0"
                    >
                        <Mic className="w-5 h-5" />
                    </Button>

                    <div className="relative flex-1">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Tanya tentang keuanganmu..."
                            className="w-full h-12 pl-4 pr-12 bg-zinc-900/50 border-zinc-800 focus:border-indigo-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl text-sm transition-all shadow-inner"
                        />
                        {/* Suggestion hint if empty */}
                        {!input && !isLoading && hasStarted && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
                                <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-700">Enter</span>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className={cn(
                            "h-12 w-12 rounded-2xl transition-all duration-300 shrink-0 shadow-lg",
                            isLoading || !input.trim()
                                ? "bg-zinc-800 text-zinc-500 border border-zinc-700"
                                : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:scale-105 hover:shadow-indigo-500/25 border border-indigo-400/20"
                        )}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
