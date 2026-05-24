"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { handleAIAction } from "@/lib/actions/finance";
import { toast } from "sonner";

export function TestUpdateBalance() {
    const [accountName, setAccountName] = useState("BRI");
    const [balance, setBalance] = useState("50000000");
    const [loading, setLoading] = useState(false);

    const testUpdate = async () => {
        setLoading(true);
        try {
            console.log("🧪 [TEST] Testing update_balance with:", { accountName, balance });

            const result: any = await handleAIAction({
                action: "update_balance",
                data: {
                    accountName,
                    balance: parseInt(balance)
                }
            });

            console.log("🧪 [TEST] Result:", result);

            if (result.success) {
                toast.success(result.message);
                // Force reload
                setTimeout(() => {
                    window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
                }, 500);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("🧪 [TEST] Error:", error);
            toast.error("Test failed: " + String(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle>🧪 Test Update Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Account Name:</label>
                    <Input
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="BRI"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">New Balance:</label>
                    <Input
                        type="number"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        placeholder="50000000"
                    />
                </div>
                <Button onClick={testUpdate} disabled={loading} className="w-full">
                    {loading ? "Testing..." : "Test Update Balance"}
                </Button>
            </CardContent>
        </Card>
    );
}
