"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface VoiceInputProps {
    onTranscriptReady: (data: TransactionData) => void;
    isOpen: boolean;
    onClose: () => void;
}

interface TransactionData {
    amount: number;
    type: "income" | "expense";
    category: string;
    description: string;
    confidence: number;
}

export function VoiceInput({ onTranscriptReady, isOpen, onClose }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [parsedData, setParsedData] = useState<TransactionData | null>(null);
    const [error, setError] = useState("");

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check if browser supports Speech Recognition
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (!SpeechRecognition) {
                setError("Browser Anda tidak mendukung Voice Recognition");
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.lang = "id-ID";
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);

                // If final result, process it
                if (event.results[current].isFinal) {
                    setIsListening(false);
                    setIsProcessing(true);
                    processTranscript(transcriptText);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
                setError("Terjadi kesalahan saat mendengarkan");
                toast.error("Gagal mendengarkan suara");
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = () => {
        if (!recognitionRef.current) {
            toast.error("Voice recognition tidak tersedia");
            return;
        }

        setTranscript("");
        setError("");
        setParsedData(null);
        setIsListening(true);

        try {
            recognitionRef.current.start();
            toast.info("Mulai berbicara...");
        } catch (err) {
            console.error("Error starting recognition:", err);
            setIsListening(false);
            toast.error("Gagal memulai voice recognition");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    const processTranscript = (text: string) => {
        try {
            const parsed = parseTransactionFromText(text);
            setParsedData(parsed);
            setIsProcessing(false);

            if (parsed.confidence > 0.5) {
                toast.success("Transaksi berhasil dipahami!");
            } else {
                toast.warning("Transaksi kurang jelas, mohon periksa kembali");
            }
        } catch (err) {
            setIsProcessing(false);
            setError("Gagal memahami perintah");
            toast.error("Tidak dapat memahami transaksi");
        }
    };

    const parseTransactionFromText = (text: string): TransactionData => {
        const lowerText = text.toLowerCase();
        let amount = 0;
        let type: "income" | "expense" = "expense";
        let category = "Lainnya";
        let description = text;
        let confidence = 0;

        // Parse amount
        const amountPatterns = [
            /(\d+\.?\d*)\s*(juta|million)/i,
            /(\d+\.?\d*)\s*(ribu|thousand|rb|k)/i,
            /(\d+\.?\d*)\s*(ratus|hundred)/i,
            /(\d{1,3}(?:\.\d{3})*(?:,\d+)?)/,
        ];

        for (const pattern of amountPatterns) {
            const match = lowerText.match(pattern);
            if (match) {
                let num = parseFloat(match[1].replace(/\./g, "").replace(/,/g, "."));
                const unit = match[2]?.toLowerCase();

                if (unit?.includes("juta") || unit?.includes("million")) {
                    num *= 1000000;
                } else if (unit?.includes("ribu") || unit?.includes("thousand") || unit?.includes("rb") || unit?.includes("k")) {
                    num *= 1000;
                } else if (unit?.includes("ratus") || unit?.includes("hundred")) {
                    num *= 100;
                }

                amount = num;
                confidence += 0.3;
                break;
            }
        }

        // Determine type (income/expense)
        const incomeKeywords = [
            "terima", "dapat", "gaji", "pendapatan", "income", "masuk",
            "bonus", "hadiah", "komisi", "hasil", "untung"
        ];

        const expenseKeywords = [
            "beli", "bayar", "belanja", "buat", "transfer", "kirim",
            "keluar", "expense", "biaya", "ongkos", "spend"
        ];

        if (incomeKeywords.some(keyword => lowerText.includes(keyword))) {
            type = "income";
            confidence += 0.2;
        } else if (expenseKeywords.some(keyword => lowerText.includes(keyword))) {
            type = "expense";
            confidence += 0.2;
        }

        // Category detection
        const categories: Record<string, string[]> = {
            "Makanan & Minuman": ["makan", "minum", "kopi", "restoran", "cafe", "snack", "breakfast", "lunch", "dinner"],
            "Transportasi": ["bensin", "transport", "ojek", "grab", "gojek", "parkir", "tol", "taksi", "uber"],
            "Belanja": ["belanja", "beli", "shopping", "barang", "pakaian", "baju", "sepatu"],
            "Tagihan": ["listrik", "air", "internet", "wifi", "pulsa", "token", "pdam", "pln"],
            "Kesehatan": ["dokter", "obat", "rumah sakit", "apotek", "medical", "health"],
            "Hiburan": ["film", "cinema", "game", "hiburan", "konser", "travel", "wisata"],
            "Pendidikan": ["sekolah", "kuliah", "kursus", "buku", "les"],
            "Gaji": ["gaji", "salary", "upah", "honor"],
            "Transfer": ["transfer", "kirim", "send"],
        };

        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                category = cat;
                confidence += 0.3;
                break;
            }
        }

        // Clean description (remove amount mentions)
        description = text
            .replace(/\d+\.?\d*\s*(juta|ribu|ratus|rb|k|million|thousand)/gi, "")
            .replace(/rp\.?\s*\d+/gi, "")
            .trim();

        if (!description) {
            description = `${type === "income" ? "Pemasukan" : "Pengeluaran"} ${category}`;
        }

        return {
            amount,
            type,
            category,
            description,
            confidence: Math.min(confidence, 1)
        };
    };

    const handleConfirm = () => {
        if (parsedData) {
            onTranscriptReady(parsedData);
            handleClose();
        }
    };

    const handleClose = () => {
        stopListening();
        setTranscript("");
        setParsedData(null);
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg"
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold mb-2">
                                        Voice Input Transaksi
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Ucapkan transaksi Anda dengan jelas
                                    </p>
                                </div>

                                {/* Voice Visualizer */}
                                <div className="flex justify-center">
                                    <motion.div
                                        className="relative"
                                        animate={isListening ? {
                                            scale: [1, 1.1, 1],
                                        } : {}}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                        }}
                                    >
                                        <Button
                                            size="lg"
                                            onClick={isListening ? stopListening : startListening}
                                            disabled={isProcessing}
                                            className={`w-24 h-24 rounded-full ${isListening
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-primary hover:bg-primary/90"
                                                }`}
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-10 h-10 animate-spin" />
                                            ) : isListening ? (
                                                <MicOff className="w-10 h-10" />
                                            ) : (
                                                <Mic className="w-10 h-10" />
                                            )}
                                        </Button>

                                        {isListening && (
                                            <>
                                                {[1, 2, 3].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="absolute inset-0 rounded-full border-2 border-red-500"
                                                        initial={{ scale: 1, opacity: 0.5 }}
                                                        animate={{
                                                            scale: [1, 2, 2.5],
                                                            opacity: [0.5, 0.2, 0],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: i * 0.4,
                                                        }}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Status */}
                                <div className="text-center">
                                    {isListening && (
                                        <Badge variant="destructive" className="animate-pulse">
                                            Mendengarkan...
                                        </Badge>
                                    )}
                                    {isProcessing && (
                                        <Badge variant="secondary">
                                            Memproses...
                                        </Badge>
                                    )}
                                    {parsedData && !isListening && !isProcessing && (
                                        <Badge variant="default" className="bg-green-500">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Berhasil!
                                        </Badge>
                                    )}
                                </div>

                                {/* Transcript */}
                                {transcript && (
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm font-medium mb-1">Transcript:</p>
                                        <p className="text-sm text-muted-foreground italic">
                                            "{transcript}"
                                        </p>
                                    </div>
                                )}

                                {/* Parsed Data */}
                                {parsedData && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-3"
                                    >
                                        <div className="p-4 border rounded-lg space-y-3 bg-card">
                                            <h4 className="font-medium text-sm flex items-center justify-between">
                                                <span>Data Transaksi:</span>
                                                <Badge
                                                    variant={parsedData.confidence > 0.7 ? "default" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {Math.round(parsedData.confidence * 100)}% confidence
                                                </Badge>
                                            </h4>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Tipe:</span>
                                                    <p className="font-medium">
                                                        {parsedData.type === "income" ? "Pemasukan" : "Pengeluaran"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Jumlah:</span>
                                                    <p className="font-medium">
                                                        Rp {parsedData.amount.toLocaleString("id-ID")}
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-muted-foreground">Kategori:</span>
                                                    <p className="font-medium">{parsedData.category}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-muted-foreground">Deskripsi:</span>
                                                    <p className="font-medium">{parsedData.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                                        <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                                        <p className="text-sm text-destructive">{error}</p>
                                    </div>
                                )}

                                {/* Tips */}
                                {!transcript && !isListening && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                        <p className="text-sm font-medium mb-2">💡 Contoh perintah:</p>
                                        <ul className="text-xs space-y-1 text-muted-foreground">
                                            <li>• "Beli makan siang 50 ribu"</li>
                                            <li>• "Terima gaji 5 juta"</li>
                                            <li>• "Bayar listrik 500 ribu"</li>
                                            <li>• "Transfer pulsa 25 ribu"</li>
                                        </ul>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleClose}
                                        className="flex-1"
                                    >
                                        Batal
                                    </Button>
                                    {parsedData && (
                                        <Button
                                            onClick={handleConfirm}
                                            className="flex-1"
                                            disabled={parsedData.confidence < 0.3}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Gunakan Data Ini
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
