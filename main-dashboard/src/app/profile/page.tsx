"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Plus, MapPin, Mail, Phone, Link as LinkIcon, Edit2, Shield, Bell, CreditCard, LogOut, Moon, User, Check, Smartphone, CircleDashed } from "lucide-react";

const smoothEase = [0.22, 1, 0.36, 1] as any;
const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.8,
            ease: smoothEase
        }
    })
};

const fadeContent: any = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: smoothEase }
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.3, ease: smoothEase }
    }
};

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState("Personal Information");
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Functional States
    const [twoFactor, setTwoFactor] = useState(false);
    const [theme, setTheme] = useState("light");
    const [notifs, setNotifs] = useState({
        email: true,
        push: true,
        sms: false,
        digest: true
    });

    // Tab Menu Items
    const menuItems = [
        { label: "Personal Information", icon: <User size={18} /> },
        { label: "Security & Passwords", icon: <Shield size={18} /> },
        { label: "Notifications", icon: <Bell size={18} /> },
        { label: "Billing & Subscriptions", icon: <CreditCard size={18} /> },
        { label: "Appearance", icon: <Moon size={18} /> },
    ];

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setIsSaved(false);

        // Simulate API Call
        setTimeout(() => {
            setIsSaving(false);
            setIsSaved(true);

            // Reset saved state after 3 seconds
            setTimeout(() => {
                setIsSaved(false);
            }, 3000);
        }, 1500);
    };

    // Render Form Content dynamically based on activeTab
    const renderTabContent = () => {
        switch (activeTab) {
            case "Security & Passwords":
                return (
                    <motion.div key="security" variants={fadeContent} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                        <h3 className="font-serif text-3xl tracking-tight mb-2">Security & Passwords</h3>
                        <p className="text-sm text-slate-500 mb-6">Manage your password and security preferences to keep your account safe.</p>
                        <form className="flex flex-col gap-6" onSubmit={handleSave}>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Current Password</label>
                                <input type="password" placeholder="••••••••" className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-slate-900" required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">New Password</label>
                                    <input type="password" placeholder="New Password" className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-slate-900" required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Confirm New Password</label>
                                    <input type="password" placeholder="Confirm Password" className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-slate-900" required />
                                </div>
                            </div>

                            {/* 2FA Toggle */}
                            <div className="mt-4 p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                <div>
                                    <h4 className="font-semibold text-slate-900">Two-Factor Authentication (2FA)</h4>
                                    <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                                </div>
                                <button type="button" onClick={() => setTwoFactor(!twoFactor)} className={`w-12 h-6 rounded-full relative transition-colors shadow-inner flex items-center px-1 ${twoFactor ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm transform ${twoFactor ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Submit Button */}
                            <SaveButton isSaving={isSaving} isSaved={isSaved} />
                        </form>
                    </motion.div>
                );

            case "Notifications":
                return (
                    <motion.div key="notifications" variants={fadeContent} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                        <h3 className="font-serif text-3xl tracking-tight mb-2">Notifications</h3>
                        <p className="text-sm text-slate-500 mb-6">Choose what you want to be notified about.</p>

                        <form className="flex flex-col gap-6" onSubmit={handleSave}>
                            {/* Notification Toggles */}
                            {[
                                { id: 'email', title: 'Email Notifications', desc: 'Receive summaries and updates via email.', active: notifs.email },
                                { id: 'push', title: 'Push Notifications', desc: 'Get instantaneous alerts on your desktop.', active: notifs.push },
                                { id: 'sms', title: 'SMS Alerts', desc: 'Receive critical security alerts via SMS.', active: notifs.sms },
                                { id: 'digest', title: 'Daily Digest', desc: 'A quick summary of your daily financial activity.', active: notifs.digest },
                            ].map((notif, idx) => (
                                <div key={idx} className="p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:border-slate-200 transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{notif.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{notif.desc}</p>
                                    </div>
                                    <button type="button" onClick={() => setNotifs({ ...notifs, [notif.id]: !notif.active })} className={`w-12 h-6 rounded-full relative transition-colors shadow-inner flex items-center px-1 ${notif.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${notif.active ? 'transform translate-x-6' : 'transform translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                            <SaveButton isSaving={isSaving} isSaved={isSaved} />
                        </form>
                    </motion.div>
                );

            case "Billing & Subscriptions":
                return (
                    <motion.div key="billing" variants={fadeContent} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                        <h3 className="font-serif text-3xl tracking-tight mb-2">Billing & Subscriptions</h3>
                        <p className="text-sm text-slate-500 mb-6">Manage your payment methods and current plan.</p>

                        {/* Current Plan Card */}
                        <div className="bg-slate-900 text-white rounded-3xl p-8 mb-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                            <h4 className="font-sans text-xs tracking-[0.2em] uppercase font-bold text-emerald-400 mb-2">Current Plan</h4>
                            <div className="font-serif text-5xl tracking-tight mb-4">Pro Tier</div>
                            <p className="text-slate-400 text-sm w-2/3 mb-8">You have access to all premium features, analytics, and priority support.</p>
                            <div className="flex gap-4">
                                <button type="button" className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-slate-200 transition-colors text-sm">Upgrade Plan</button>
                                <button type="button" className="px-6 py-2 border border-slate-700 text-white font-semibold rounded-full hover:bg-slate-800 transition-colors text-sm">Cancel</button>
                            </div>
                        </div>

                        <form className="flex flex-col gap-6" onSubmit={handleSave}>
                            <div className="flex items-center justify-between p-5 rounded-2xl border border-rose-100 bg-rose-50/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                                        <span className="font-serif text-sm font-bold opacity-50">VISA</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 text-sm">Visa ending in 4242</h4>
                                        <p className="text-xs text-slate-500">Expires 12/28</p>
                                    </div>
                                </div>
                                <button type="button" className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors uppercase tracking-widest">Remove</button>
                            </div>

                            <button type="button" className="p-5 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 hover:border-slate-500 transition-colors hover:bg-slate-50">
                                <Plus size={16} /> <span className="text-sm font-semibold">Add Payment Method</span>
                            </button>
                            <SaveButton isSaving={isSaving} isSaved={isSaved} />
                        </form>
                    </motion.div>
                );

            case "Appearance":
                return (
                    <motion.div key="appearance" variants={fadeContent} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                        <h3 className="font-serif text-3xl tracking-tight mb-2">Appearance</h3>
                        <p className="text-sm text-slate-500 mb-6">Customize how DailyActivity looks on your device.</p>

                        <form className="flex flex-col gap-8" onSubmit={handleSave}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Light Mode Mock */}
                                <div onClick={() => setTheme("light")} className={`border rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors shadow-inner ${theme === 'light' ? 'border-black bg-slate-50 ring-2 ring-black/5' : 'border-slate-200 hover:border-black bg-white'}`}>
                                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-500 border border-slate-200">
                                        <Moon size={24} className="opacity-0 hidden" />
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                                    </div>
                                    <span className="font-bold text-sm">Light Mode</span>
                                </div>

                                {/* Dark Mode Mock */}
                                <div onClick={() => setTheme("dark")} className={`border rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${theme === 'dark' ? 'border-slate-500 bg-[#111111] text-white ring-2 ring-slate-800' : 'border-slate-200 hover:border-slate-400 bg-[#0a0a0a] text-white'}`}>
                                    <div className="w-16 h-16 rounded-full bg-slate-800 shadow-sm flex items-center justify-center text-blue-300">
                                        <Moon size={24} />
                                    </div>
                                    <span className="font-bold text-sm relative">Dark Mode <span className={`absolute -top-3 -right-6 text-[8px] text-white px-2 py-0.5 rounded-full lowercase ${theme === 'dark' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>{theme === 'dark' ? 'active' : 'soon'}</span></span>
                                </div>
                            </div>
                            <SaveButton isSaving={isSaving} isSaved={isSaved} />
                        </form>
                    </motion.div>
                );

            case "Personal Information":
            default:
                // Render Default Personal Information Component
                return (
                    <motion.div key="personal" variants={fadeContent} initial="hidden" animate="visible" exit="exit">
                        <h3 className="font-serif text-3xl tracking-tight mb-8">Personal Information</h3>
                        <form className="flex flex-col gap-6" onSubmit={handleSave}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">First Name</label>
                                    <input type="text" defaultValue="Jefri" className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-slate-900" required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Last Name</label>
                                    <input type="text" defaultValue="Doe" className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-slate-900" required />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Email Address</label>
                                <input type="email" defaultValue="hello@jefridoe.com" className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-slate-900" required />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Phone Number</label>
                                <input type="tel" defaultValue="+62 822 1234 5678" className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-slate-900" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Bio</label>
                                <textarea rows={4} defaultValue="Software Engineer passionate about building aesthetic and functional financial tools." className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium text-slate-900 resize-none" />
                            </div>

                            <SaveButton isSaving={isSaving} isSaved={isSaved} />
                        </form>
                    </motion.div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfaf9] text-[#0d0c0c] font-sans selection:bg-[#f4dbe0] overflow-x-hidden">

            {/* 1. Header Minimalis */}
            <header className="w-full p-6 md:px-12 md:py-10 flex justify-between items-center z-50">
                <a href="/" className="font-bold text-xl tracking-tight text-slate-900 hover:opacity-70 transition-opacity">
                    DailyActivity
                </a>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 group px-5 py-2.5 rounded-full border border-slate-200 hover:border-slate-800 transition-colors bg-white">
                        <Smartphone size={14} strokeWidth={2} />
                        <span className="text-sm font-medium">Download App</span>
                    </button>
                </div>
            </header>

            {/* 2. Main Content Profile */}
            <main className="w-full max-w-[1200px] mx-auto px-6 md:px-12 pb-24">

                {/* Header Profile Section */}
                <motion.div
                    custom={0} initial="hidden" animate="visible" variants={fadeUp}
                    className="pt-8 md:pt-16 pb-12 border-b border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12"
                >
                    {/* Avatar Besar */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border-4 border-white shadow-sm transition-transform duration-500 group-hover:scale-105">
                            <span className="font-serif text-5xl md:text-7xl font-medium text-slate-400 group-hover:text-slate-600 transition-colors">J</span>
                        </div>
                        <button className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-10 h-10 md:w-12 md:h-12 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110">
                            <Edit2 size={16} />
                        </button>
                    </div>

                    <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left mt-2 md:mt-6">
                        <h1 className="font-serif text-5xl md:text-6xl tracking-tight mb-2">Jefri Doe</h1>
                        <p className="text-lg text-slate-500 font-medium mb-6">Software Engineer & Financial Enthusiast</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-slate-600">
                            <div className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> Jakarta, ID</div>
                            <div className="flex items-center gap-1.5"><Mail size={16} className="text-slate-400" /> hello@jefridoe.com</div>
                            <div className="flex items-center gap-1.5"><Phone size={16} className="text-slate-400" /> +62 822 1234 5678</div>
                        </div>
                    </div>
                </motion.div>

                {/* Layout Kolom Ganda (Kiri & Kanan) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 pt-12 min-h-[600px]">

                    {/* Navigasi / Settings Panel (Kolom Kiri) */}
                    <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-1 flex flex-col gap-2">
                        <p className="text-xs tracking-[0.2em] font-medium uppercase text-slate-500 mb-4 px-4">Account Settings</p>

                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(item.label)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === item.label ? 'bg-black text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100'}`}
                            >
                                {item.icon}
                                <span className="font-medium text-left">{item.label}</span>
                            </button>
                        ))}

                        <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 mt-8 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100">
                            <LogOut size={18} />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </motion.div>

                    {/* Konten Detail Form (Kolom Kanan) */}
                    <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-3">
                        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                {renderTabContent()}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
};

// Sub-komponen Button Save dinamis yang digunakan ulang di setiap tab
const SaveButton = ({ isSaving, isSaved }: { isSaving: boolean, isSaved: boolean }) => (
    <div className="mt-8 flex justify-end">
        <button
            type="submit"
            disabled={isSaving || isSaved}
            className={`px-8 py-3 w-48 font-medium rounded-full shadow-md flex items-center justify-center gap-2 transition-all duration-300 ${isSaved ? 'bg-emerald-500 text-white hover:scale-100' :
                isSaving ? 'bg-slate-800 text-slate-300 hover:scale-100' :
                    'bg-black text-white hover:bg-slate-800 hover:scale-105'
                }`}
        >
            {isSaving ? (
                <><CircleDashed size={18} className="animate-spin" /> Saving...</>
            ) : isSaved ? (
                <><Check size={18} /> Custom Saved!</>
            ) : (
                "Save Changes"
            )}
        </button>
    </div>
);

export default ProfilePage;
