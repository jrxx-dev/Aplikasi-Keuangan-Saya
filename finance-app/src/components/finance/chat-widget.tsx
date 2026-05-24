"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, X, MessageSquare, Loader2, Sparkles, User, Minimize2, Trash2, Mic, Paperclip, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { quickAddTransaction, handleAIAction } from "@/lib/actions/finance"; // Import Action

interface Message {
    role: "user" | "assistant";
    content: string;
    imageUrl?: string;
    reasoning_details?: any;
}

export function ChatWidget() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: string; data: any; originalText: string } | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Halo! Saya FinanceMy AI. Ada yang bisa saya bantu terkait keuangan Anda hari ini?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const processingAction = useRef(false);
    const transcriptRef = useRef(""); // Ref to hold latest transcript for auto-send
    const [attachment, setAttachment] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Quick Voice Mode States
    type QuickStatus = "idle" | "listening" | "processing" | "success" | "error";
    const [quickStatus, setQuickStatus] = useState<QuickStatus>("idle");
    const quickStatusRef = useRef<QuickStatus>("idle");
    const [quickTranscript, setQuickTranscript] = useState("");
    const [quickResult, setQuickResult] = useState<string | null>(null);

    // Sync status ref to avoid closure staleness and TS narrowing issues
    useEffect(() => {
        quickStatusRef.current = quickStatus;
    }, [quickStatus]);

    // Missing States Recovery
    const [isVoiceMode, setIsVoiceMode] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 1. Basic Validation (Image only)
            if (!file.type.startsWith('image/')) {
                alert("Please upload an image file.");
                return;
            }

            // 2. Client-side Resize & Compression
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 600; // Cap at 600px to ensure tiny payload

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 0.6 standard
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                    setAttachment(dataUrl);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const executeAction = async (actionData: any) => {
        try {
            console.log("🚀 Auto-executing Action:", actionData);
            let result;

            if (actionData.action) {
                result = await handleAIAction(actionData);
            } else {
                await quickAddTransaction(actionData);
                result = { success: true, message: "Transaksi berhasil disimpan!" };
            }

            if (result.success || (result as any)?.success) {
                router.refresh();
            }

            // Add Success Message
            const icon = result.success ? "✅" : "❌";
            const messageStr = (result as any).message || "Aksi berhasil diproses.";

            setMessages(prev => [...prev, {
                role: "assistant",
                content: `${icon} *${messageStr}*`
            }]);

        } catch (error) {
            console.error("Action Execution Failed", error);
            setMessages(prev => [...prev, { role: "assistant", content: "❌ Gagal menjalankan aksi." }]);
        }
    };

    const processAction = async (fullText: string) => {
        // Robust regex to capture JSON across newlines/spaces
        const actionRegex = /:::ACTION:\s*(\{[\s\S]*?\})\s*:::/;
        const match = fullText.match(actionRegex);

        if (match && match[1]) {
            try {
                const actionData = JSON.parse(match[1]);
                console.log("Found Action:", actionData);

                // DIRECT EXECUTION - No Confirmation
                await executeAction(actionData);

                // Scroll to bottom
                setTimeout(() => scrollAreaRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' }), 100);
            } catch (error) {
                console.error("Failed to parse action", error);
            }
        }
    };

    // Legacy handleConfirmAction removed/placeholder if needed
    const handleConfirmAction = async () => { };
    const handleCancelAction = () => {
        setPendingAction(null);
    };




    const processQuickCommand = async (text: string) => {
        setQuickStatus('processing');
        try {
            // Construct a standalone interaction
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "user", content: `(DIRECT COMMAND MODE) ${text}` }
                    ]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Quick Command API Error:", response.status, response.statusText, errorData);
                throw new Error(errorData.error || `Network error: ${response.status}`);
            }

            let fullContent = "";
            // Handle Streaming or JSON Response
            if (response.headers.get("Content-Type")?.includes("application/json")) {
                const data = await response.json();
                fullContent = data.content;
            } else {
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed || trimmed === 'data: [DONE]') continue;

                            if (trimmed.startsWith('data: ')) {
                                try {
                                    const json = JSON.parse(trimmed.slice(6));
                                    const content = json.choices?.[0]?.delta?.content || "";
                                    fullContent += content;
                                } catch (e) {
                                    console.error("Error parsing SSE JSON in Quick Mode", e);
                                }
                            }
                        }
                    }
                }
            }

            // Parse Action
            const actionRegex = /:::ACTION:\s*(\{[\s\S]*?\})\s*:::/;
            const match = fullContent.match(actionRegex);

            if (match && match[1]) {
                const actionData = JSON.parse(match[1]);

                let result;
                // Handle New Protocol vs Legacy
                if (actionData.action) {
                    result = await handleAIAction(actionData);
                    setQuickResult((result as any).message || "Berhasil");
                } else {
                    // Legacy Create Support (Just in case)
                    await quickAddTransaction(actionData);
                    setQuickResult(`${actionData.description} - ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(actionData.amount)}`);
                    result = { success: true };
                }

                if (result.success || (result as any)?.success) {
                    router.refresh(); // Refresh UI State
                }

                if (result.success) {
                    setQuickStatus('success');
                } else {
                    setQuickStatus('error');
                }
            } else {
                setQuickResult("Perintah tidak dikenali sebagai aksi.");
                setQuickStatus('error');
            }

        } catch (error) {
            console.error(error);
            setQuickResult("Gagal memproses perintah.");
            setQuickStatus('error');
        }
    };

    // Auto-hide Quick Mode result
    useEffect(() => {
        if (quickStatus === 'success' || quickStatus === 'error') {
            const timer = setTimeout(() => {
                setQuickStatus('idle');
                setQuickTranscript("");
                setQuickResult(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [quickStatus]);

    const silenceTimer = useRef<NodeJS.Timeout | null>(null);
    const baseInputRef = useRef("");

    const handleSubmit = async (e?: React.FormEvent, overrideContent?: string) => {
        e?.preventDefault();
        const contentToSend = overrideContent || input;
        const currentAttachment = overrideContent ? null : attachment; // Ignore attachment if override (voice)

        if ((!contentToSend.trim() && !currentAttachment) || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: contentToSend,
            imageUrl: currentAttachment || undefined
        };

        setMessages(prev => [...prev, userMessage]);

        // Clear Inputs
        if (!overrideContent) {
            setInput("");
            setAttachment(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }

        setIsLoading(true);
        if (!isOpen) setIsOpen(true);

        try {
            // Prepare messages for API (handle multimodal)
            const apiMessages = [...messages, userMessage].map(msg => {
                if (msg.imageUrl) {
                    return {
                        role: msg.role,
                        content: [
                            { type: "text", text: msg.content || "Analisis gambar ini." },
                            { type: "image_url", image_url: { url: msg.imageUrl } }
                        ]
                    };
                }
                return { role: msg.role, content: msg.content };
            });

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: apiMessages }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Chat API Error:", response.status, response.statusText, errorData);
                throw new Error(errorData.error || `Failed to send message: ${response.status} ${response.statusText}`);
            }
            if (!response.body) throw new Error("No response body");

            // Handle Streaming or JSON Response
            if (response.headers.get("Content-Type")?.includes("application/json")) {
                const data = await response.json();
                const assistantMessage: Message = {
                    role: "assistant",
                    content: data.content,
                    reasoning_details: data.reasoning_details
                };
                setMessages(prev => [...prev, assistantMessage]);
                await processAction(assistantMessage.content);
            } else {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let assistantMessage: Message = { role: "assistant", content: "" };

                let hasReasoningStarted = false;

                setMessages(prev => [...prev, assistantMessage]);

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed === 'data: [DONE]') continue;

                        if (trimmed.startsWith('data: ')) {
                            try {
                                const json = JSON.parse(trimmed.slice(6));
                                const content = json.choices?.[0]?.delta?.content || "";
                                const reasoning = json.choices?.[0]?.delta?.reasoning || "";

                                if (reasoning) {
                                    if (!hasReasoningStarted) {
                                        assistantMessage.content += "*Thinking...*\n";
                                        hasReasoningStarted = true;
                                    }
                                    assistantMessage.content += reasoning;
                                }

                                if (content) {
                                    // If we were reasoning, add a newline before content
                                    if (hasReasoningStarted && !assistantMessage.content.endsWith("\n\n")) {
                                        assistantMessage.content += "\n\n";
                                        hasReasoningStarted = false; // Reset to stop adding newlines
                                    }
                                    assistantMessage.content += content;
                                }

                                if (content || reasoning) {
                                    setMessages(prev => {
                                        const newMessages = [...prev];
                                        newMessages[newMessages.length - 1] = { ...assistantMessage };
                                        return newMessages;
                                    });
                                }

                                // Capture final reasoning_details if provided in stream end
                                if (json.choices?.[0]?.message?.reasoning_details) {
                                    assistantMessage.reasoning_details = json.choices?.[0]?.message?.reasoning_details;
                                }
                            } catch (e) {
                                console.error("Error parsing SSE JSON", e);
                            }
                        }
                    }
                }
                await processAction(assistantMessage.content);
            }

            // AUTO-OPEN MIC if in Voice Mode
            if (isVoiceMode && !pendingAction) {
                // Wait a bit for the user to read/listen, or we could use TTS finish event if we had it.
                // For now, simple delay.
                setTimeout(() => {
                    if (!isListening && quickStatus === 'idle') {
                        // We need to differentiate if we use Quick Mode or Main Chat Mode for voice.
                        // The user asked for "Quick Voice" style auto-response maybe?
                        // Let's assume Main Chat Voice if the chat is open, or Quick Voice if using that.
                        // Actually, handleChatVoice() opens Main Chat mic.
                        handleChatVoice();
                    }
                }, 1000);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan. Silakan coba lagi nanti." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatVoice = () => {
        // Toggle off if already listening
        if (isListening) {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            setIsListening(false);
            setIsVoiceMode(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Maaf, browser Anda tidak mendukung fitur input suara.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onstart = () => {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            silenceTimer.current = setTimeout(() => {
                recognition.stop();
            }, 5000); // 5s initial silence timeout
        };

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result) => result.transcript)
                .join('');

            transcriptRef.current = transcript;
            setInput(transcript);

            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            silenceTimer.current = setTimeout(() => {
                recognition.stop();
            }, 2200); // 2.2s silence for chat
        };

        recognition.onerror = (event: any) => {
            console.warn("Chat Voice Error:", event.error);
            setIsListening(false);
            setIsVoiceMode(false);
            recognition.stop();
        };

        recognition.onend = () => {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            setIsListening(false);
            setIsVoiceMode(false);
            const finalTranscript = transcriptRef.current.trim();
            if (finalTranscript) {
                setInput(finalTranscript);
            }
        };

        setIsListening(true);
        setIsVoiceMode(true);
        transcriptRef.current = "";
        recognition.start();
    };

    const handleQuickVoice = () => {
        // Toggle off if already listening
        if (quickStatus === 'listening') {
            // User manually stopping
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            if (transcriptRef.current.trim()) {
                processQuickCommand(transcriptRef.current);
            } else {
                setQuickStatus('idle');
            }
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Maaf, browser Anda tidak mendukung fitur input suara.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = true;
        recognition.continuous = true;

        let shouldStop = false;
        let accumulatedTranscript = ""; // Track text across sessions

        recognition.onstart = () => {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            // Initial silence timeout (if user never speaks at all)
            silenceTimer.current = setTimeout(() => {
                shouldStop = true;
                recognition.stop();
            }, 8000);
        };

        recognition.onresult = (event: any) => {
            const currentTranscript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result) => result.transcript)
                .join('');

            // Combine previous sessions with current session
            const fullTranscript = (accumulatedTranscript + " " + currentTranscript).trim();

            transcriptRef.current = fullTranscript;
            setQuickTranscript(fullTranscript);

            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            silenceTimer.current = setTimeout(() => {
                console.log("⏹️ Silence detected (8s), finishing...");
                shouldStop = true;
                recognition.stop();
            }, 8000); // 8s silence for Quick Mode
        };

        recognition.onerror = (event: any) => {
            console.warn("Quick Voice Error:", event.error);
            const errorType = event.error;

            if (errorType === 'network' || errorType === 'no-speech') {
                // Ignore and try restart in onend
                return;
            }

            // Real error
            shouldStop = true;
            setQuickStatus('error');
            setQuickResult("Gagal: " + errorType);
            recognition.stop();
        };

        recognition.onend = () => {
            // If we shouldn't stop yet, restart!
            if (!shouldStop && quickStatusRef.current === 'listening') {
                console.log("🔄 Browser stopped, restarting to maintain 8s window...");

                // Save what we have so far before restarting
                if (transcriptRef.current.trim()) {
                    accumulatedTranscript = transcriptRef.current;
                }

                try {
                    recognition.start();
                } catch (e) {
                    shouldStop = true;
                }
                return;
            }

            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            const finalTranscript = transcriptRef.current.trim();

            if (quickStatusRef.current === 'listening') {
                if (finalTranscript) {
                    processQuickCommand(finalTranscript);
                } else {
                    setQuickStatus('idle');
                }
            }
        };

        setQuickStatus('listening');
        setQuickTranscript("");
        transcriptRef.current = "";
        recognition.start();
    };





    // Auto-scroll logic - only scroll when messages change, not when opening chat
    useEffect(() => {
        if (bottomRef.current && isOpen && messages.length > 0) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages]); // Removed isOpen from dependencies to prevent scroll on open/close

    const handleClearChat = () => {
        setMessages([{ role: "assistant", content: "Halo! Saya FinanceMy AI. Ada yang bisa saya bantu terkait keuangan Anda hari ini?" }]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none font-sans">
            <AnimatePresence>
                {/* QUICK VOICE OVERLAY */}
                {quickStatus !== 'idle' && (
                    <motion.div
                        key="quick-overlay"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto mb-4 origin-bottom-right"
                    >
                        <Card className="w-[300px] shadow-2xl border-white/20 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl overflow-hidden rounded-[1.5rem] ring-1 ring-black/5 dark:ring-white/10">
                            <div className="p-5 flex flex-col gap-3">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    <span>Voice Action</span>
                                    {quickStatus === 'listening' && (
                                        <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> REC
                                        </div>
                                    )}
                                </div>

                                {/* Transcript Area */}
                                <div className="min-h-[60px] max-h-[300px] overflow-y-auto text-lg leading-relaxed font-medium text-foreground/90 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                                    {quickStatus === 'listening' ? (
                                        quickTranscript || <span className="text-muted-foreground/40 italic">Katakan sesuatu...</span>
                                    ) : quickStatus === 'processing' ? (
                                        <div className="flex items-center gap-2 text-blue-500">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="animate-pulse">Menganalisis...</span>
                                        </div>
                                    ) : quickStatus === 'success' ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-2 text-emerald-500 font-bold"><Sparkles className="w-5 h-5 fill-current" /> Berhasil Disimpan!</span>
                                            <span className="text-sm text-muted-foreground font-normal border-l-2 border-emerald-500 pl-2 ml-1 break-words">{quickResult}</span>
                                        </div>
                                    ) : (
                                        <span className="text-red-500 font-semibold flex items-center gap-2">
                                            <X className="w-5 h-5" /> Gagal: {quickResult}
                                        </span>
                                    )}
                                </div>

                                {/* Visual Bar */}
                                {(quickStatus === 'listening' || quickStatus === 'processing') && (
                                    <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden relative">
                                        {quickStatus === 'listening' ? (
                                            <motion.div
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                                                animate={{ width: ["0%", "100%", "0%"], x: ["0%", "0%", "100%"] }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                            />
                                        ) : (
                                            <motion.div
                                                className="h-full bg-blue-500 w-full"
                                                initial={{ x: '-100%' }}
                                                animate={{ x: '100%' }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* CHAT WINDOW (Only show if isOpen) */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, rotate: -5 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="mb-4 pointer-events-auto origin-bottom-right"
                    >
                        <Card className="w-[360px] md:w-[420px] h-[600px] flex flex-col shadow-2xl border-white/20 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl overflow-hidden rounded-[2rem] ring-1 ring-black/5 dark:ring-white/10">
                            {/* HEADER */}
                            <CardHeader className="p-4 px-6 border-b border-black/5 dark:border-white/5 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 flex flex-row items-center justify-between space-y-0 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-black rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                                            FinanceMy AI
                                        </CardTitle>
                                        <p className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground">
                                            Financial Advisor
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10" onClick={handleClearChat} title="Clear Chat">
                                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setIsOpen(false)}>
                                        <Minimize2 className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </CardHeader>

                            {/* MESSAGES AREA */}
                            <CardContent className="flex-1 p-0 overflow-hidden relative bg-slate-50/50 dark:bg-black/20">
                                <ScrollArea className="h-full px-4 py-6" ref={scrollAreaRef}>
                                    <div className="space-y-6">
                                        {messages.map((msg, i) => {
                                            const isUser = msg.role === "user";
                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                    className={cn(
                                                        "flex gap-3",
                                                        isUser ? "flex-row-reverse pl-8" : "pr-8"
                                                    )}
                                                >
                                                    {/* Avatar */}
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-auto",
                                                        isUser ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/5"
                                                    )}>
                                                        {isUser ? (
                                                            <User className="w-4 h-4 text-white" />
                                                        ) : (
                                                            <Bot className="w-4 h-4 text-blue-500" />
                                                        )}
                                                    </div>

                                                    {/* Bubble */}
                                                    <div className={cn(
                                                        "group relative px-5 py-3.5 shadow-sm text-sm leading-relaxed",
                                                        isUser
                                                            ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-[1.5rem] rounded-br-sm"
                                                            : "bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 text-foreground rounded-[1.5rem] rounded-bl-sm"
                                                    )}>
                                                        {msg.imageUrl && (
                                                            <div className="mb-3 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                                                                <img src={msg.imageUrl} alt="attachment" className="max-w-full h-auto object-cover" />
                                                            </div>
                                                        )}
                                                        {isUser ? (
                                                            <div className="whitespace-pre-wrap">{msg.content}</div>
                                                        ) : (
                                                            <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-normal">
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    components={{
                                                                        ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                                        ol: ({ node, ...props }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                                        li: ({ node, ...props }: any) => <li className="my-0.5" {...props} />,
                                                                        p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
                                                                        strong: ({ node, ...props }: any) => <strong className="font-semibold text-blue-600 dark:text-blue-400" {...props} />,
                                                                        a: ({ node, ...props }: any) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                                    }}
                                                                >
                                                                    {msg.content}
                                                                </ReactMarkdown>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {isLoading && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex gap-3 pr-8"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0 shadow-sm mt-auto">
                                                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                                </div>
                                                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 px-5 py-4 rounded-[1.5rem] rounded-bl-sm shadow-sm flex items-center gap-1.5">
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ repeat: Infinity, duration: 1, repeatDelay: 0.2 }}
                                                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                                    />
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ repeat: Infinity, duration: 1, delay: 0.2, repeatDelay: 0.2 }}
                                                        className="w-1.5 h-1.5 rounded-full bg-purple-500"
                                                    />
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ repeat: Infinity, duration: 1, delay: 0.4, repeatDelay: 0.2 }}
                                                        className="w-1.5 h-1.5 rounded-full bg-pink-500"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                        {/* Scroll Anchor */}
                                        <div ref={bottomRef} className="h-2" />
                                    </div>
                                </ScrollArea>
                            </CardContent>

                            {/* FOOTER */}
                            <CardFooter className="p-4 bg-white/50 dark:bg-black/50 backdrop-blur-md border-t border-black/5 dark:border-white/5">
                                <form onSubmit={(e) => handleSubmit(e)} className="flex w-full items-center gap-2 relative">
                                    {/* Attachment Preview */}
                                    {attachment && (
                                        <div className="absolute -top-20 left-4 bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-lg border border-black/5 dark:border-white/10 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 z-10">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/5 border border-black/5">
                                                <img src={attachment} className="w-full h-full object-cover" />
                                            </div>
                                            <Button type="button" size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-red-500/10 hover:text-red-500" onClick={handleRemoveAttachment}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}

                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <Input
                                            placeholder={isListening && quickStatus === 'idle' ? "Mendengarkan..." : "Ketik atau foto struk..."}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            className={cn(
                                                "relative bg-white/80 dark:bg-black/50 border-black/5 dark:border-white/10 focus-visible:ring-blue-500/30 text-sm h-12 rounded-full px-5 shadow-inner pr-24", // Increased padding right
                                                isListening && quickStatus === 'idle' && "border-red-500/50 focus-visible:ring-red-500/30 animate-pulse bg-red-50/50"
                                            )}
                                            disabled={isLoading}
                                        />

                                        {/* Hidden File Input */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />

                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            {/* Clip / Image Btn */}
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-8 w-8 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-blue-500"
                                                disabled={isLoading}
                                                title="Upload Gambar/Struk"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleChatVoice()}
                                                className={cn(
                                                    "h-8 w-8 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10",
                                                    isListening && quickStatus === 'idle' ? "text-red-500 bg-red-100 dark:bg-red-900/20 animate-pulse scale-110" : "text-muted-foreground"
                                                )}
                                                disabled={isLoading}
                                                title="Input Suara"
                                            >
                                                <Mic className={cn("w-4 h-4", isListening && quickStatus === 'idle' && "fill-current")} />
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || (!input.trim() && !attachment)}
                                        className={cn(
                                            "shrink-0 rounded-full h-12 w-12 shadow-lg transition-all duration-300",
                                            input.trim() || attachment
                                                ? "bg-gradient-to-tr from-blue-600 to-purple-600 text-white hover:scale-105 hover:shadow-blue-500/30"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        <Send className={cn("w-5 h-5", (input.trim() || attachment) && "ml-0.5")} />
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PENDING ACTION CONFIRMATION - Positioned above buttons */}
            <AnimatePresence>
                {pendingAction && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="pointer-events-auto mb-4 w-[320px]"
                    >
                        {/* ... confirmation card ... */}
                        <Card className="shadow-2xl border-yellow-200 dark:border-yellow-800 bg-yellow-50/95 dark:bg-yellow-900/30 backdrop-blur-xl overflow-hidden rounded-2xl">
                            {/* ... content ... */}
                            <div className="p-4 flex flex-col gap-3">
                                {/* ... content ... */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Konfirmasi Aksi
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 rounded-full hover:bg-yellow-200/50 dark:hover:bg-yellow-800/50"
                                        onClick={handleCancelAction}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-foreground">
                                        {pendingAction.type === 'delete'
                                            ? '🗑️ Hapus Transaksi?'
                                            : pendingAction.type === 'update'
                                                ? '✏️ Update Transaksi?'
                                                : '💾 Simpan Transaksi Baru?'
                                        }
                                    </p>
                                    <div className="text-xs bg-white/70 dark:bg-black/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                                        <p className="font-semibold text-foreground">
                                            {pendingAction.data.data?.description || pendingAction.data.criteria?.description || 'Item'}
                                        </p>
                                        {pendingAction.data.data?.amount && (
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(pendingAction.data.data.amount)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md"
                                        onClick={handleConfirmAction}
                                    >
                                        ✓ Ya, Lakukan
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 font-bold"
                                        onClick={handleCancelAction}
                                    >
                                        ✗ Batal
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FLOATING ACTION BUTTONS */}
            <div className="flex flex-col gap-4 pointer-events-auto items-center">
                {/* QUICK VOICE BUTTON */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        onClick={() => {
                            setIsOpen(false); // Force close main chat
                            handleQuickVoice();
                        }}
                        size="icon"
                        className={cn(
                            "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 border border-white/20 dark:border-white/10",
                            quickStatus === 'listening'
                                ? "bg-red-500 animate-pulse ring-4 ring-red-500/20"
                                : "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                        )}
                        title="Perintah Suara Cepat (Overlay)"
                    >
                        {quickStatus === 'listening' ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Mic className="w-7 h-7 text-white" />
                        )}
                    </Button>
                </motion.div>

                {/* MAIN CHAT TOGGLE */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="relative group">
                        <div className={cn(
                            "absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-500 group-hover:opacity-60",
                            isOpen ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-600"
                        )} />
                        <Button
                            onClick={() => setIsOpen(!isOpen)}
                            size="icon"
                            className={cn(
                                "relative h-16 w-16 rounded-full shadow-2xl transition-all duration-500 border border-white/10",
                                isOpen
                                    ? "bg-white text-rose-500 dark:bg-zinc-900 hover:rotate-90"
                                    : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white hover:brightness-110"
                            )}
                        >
                            <AnimatePresence mode="wait">
                                {isOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                    >
                                        <X className="w-6 h-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="open"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                    >
                                        <Bot className="w-8 h-8" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
