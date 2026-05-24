"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Plus, Activity, CreditCard, Sparkles, Calendar as CalendarIcon, Wallet, PiggyBank, ArrowDownRight, Coffee, ShoppingBag, Utensils } from "lucide-react";

// Variasi animasi untuk efek memudar halus (Premium Apple-like)
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

const DashboardHome = () => {
    return (
        <div className="min-h-screen bg-[#fcfaf9] text-[#0d0c0c] font-sans selection:bg-[#f4dbe0] overflow-x-hidden">

            {/* 1. Header Minimalis (Konsisten dengan Landing Page) */}
            <header className="w-full p-6 md:px-12 md:py-10 flex justify-between items-center z-50">
                <a href="/" className="font-bold text-xl tracking-tight text-slate-900 hover:opacity-70 transition-opacity">
                    DailyActivity
                </a>

                {/* User Profile Mini */}
                <div className="flex items-center gap-4">
                    <button className="hidden md:flex items-center gap-2 group px-5 py-2.5 rounded-full border border-slate-200 hover:border-slate-800 transition-colors">
                        <Plus size={16} strokeWidth={2} />
                        <span className="text-sm font-medium">New Entry</span>
                    </button>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 ring-slate-900 transition-all">
                        <span className="font-serif text-lg font-medium text-slate-600">J</span>
                    </div>
                </div>
            </header>

            {/* 2. Main Content Dashboard */}
            <main className="w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-24">

                {/* Welcome Section */}
                <motion.div
                    custom={0} initial="hidden" animate="visible" variants={fadeUp}
                    className="pt-8 md:pt-16 pb-12 border-b border-slate-100"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-xs md:text-sm text-slate-500 tracking-[0.2em] font-medium uppercase mb-4 flex items-center gap-2">
                                <Sparkles size={14} /> Overview
                            </p>
                            <h1 className="font-serif text-5xl md:text-7xl leading-none tracking-tight">
                                Good afternoon, <br /> <span className="text-slate-400">Jefri.</span>
                            </h1>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-1">
                            <span className="text-sm text-slate-500 font-medium">Daily Progress</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl md:text-4xl font-serif leading-none tracking-tight">72%</span>
                                <span className="text-sm text-slate-400 mb-1">On track</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">

                    {/* Card 1: Balance */}
                    <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="group cursor-pointer">
                        <div className="h-full bg-white rounded-3xl p-8 border border-slate-100 hover:border-slate-300 transition-all duration-500 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[240px]">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform duration-500 ease-out">
                                    <Wallet size={24} strokeWidth={1.5} />
                                </div>
                                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-500 bg-black text-white">
                                    <ArrowUpRight size={16} strokeWidth={2} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-3">Total Balance</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-serif text-4xl md:text-5xl tracking-tight">IDR 24.5<span className="text-2xl text-slate-400">M</span></span>
                                </div>
                                <div className="mt-4 flex gap-4 text-xs font-medium">
                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+ 1.2% this week</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Active Goals */}
                    <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="group cursor-pointer">
                        <div className="h-full bg-slate-900 rounded-3xl p-8 border border-slate-900 hover:border-slate-700 transition-all duration-500 shadow-sm flex flex-col justify-between min-h-[240px]">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 ease-out">
                                    <PiggyBank size={24} strokeWidth={1.5} />
                                </div>
                                <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-white text-black">
                                    <ArrowUpRight size={16} strokeWidth={2} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium mb-3">Active Goals</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-serif text-4xl md:text-5xl tracking-tight text-white">3 <span className="text-2xl text-slate-500 font-sans tracking-normal">Goals</span></span>
                                </div>
                                <div className="mt-5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-white w-[60%] h-full rounded-full" />
                                </div>
                                <p className="text-xs text-slate-400 mt-3 font-medium">Focus: Emergency Fund</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Today's Routine */}
                    <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="group cursor-pointer">
                        <div className="h-full bg-[#f4dbe0]/20 rounded-3xl p-8 border border-[#f4dbe0]/50 hover:border-[#f4dbe0] transition-all duration-500 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[240px]">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform duration-500 ease-out">
                                    <Activity size={24} strokeWidth={1.5} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-3">Today's Routine</p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="font-serif text-3xl md:text-4xl tracking-tight">4 <span className="text-xl text-slate-400 font-sans tracking-normal">tasks</span></span>
                                </div>
                                <ul className="flex flex-col gap-2">
                                    <li className="text-sm font-medium text-slate-700 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-rose-400" /> Morning Workout
                                    </li>
                                    <li className="text-sm font-medium text-slate-700 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-slate-300" /> Read 20 pages
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* --- DYNAMIC SECTIONS GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">

                    {/* Section: Weekly Activity (Chart representation) */}
                    <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-2">
                                    <Activity size={14} /> Weekly Activity
                                </p>
                                <h3 className="font-serif text-3xl tracking-tight">Financial Flow</h3>
                            </div>
                            <select className="bg-slate-50 border-none text-sm font-medium text-slate-600 px-4 py-2 rounded-full cursor-pointer outline-none hover:bg-slate-100 transition-colors">
                                <option>This Week</option>
                                <option>Last Week</option>
                            </select>
                        </div>

                        {/* Custom Minimalist CSS Bar Chart */}
                        <div className="flex items-end justify-between h-48 mt-auto gap-2">
                            {[
                                { day: 'Mon', in: 40, out: 20 },
                                { day: 'Tue', in: 60, out: 80 },
                                { day: 'Wed', in: 30, out: 40 },
                                { day: 'Thu', in: 90, out: 30 },
                                { day: 'Fri', in: 70, out: 60 },
                                { day: 'Sat', in: 20, out: 90 },
                                { day: 'Sun', in: 50, out: 30 }
                            ].map((data, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-3 w-full group">
                                    <div className="flex items-end gap-1 w-full h-40">
                                        <motion.div
                                            initial={{ height: 0 }} animate={{ height: `${data.in}%` }} transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: smoothEase }}
                                            className="w-1/2 bg-slate-200 rounded-t-md group-hover:bg-slate-300 transition-colors"
                                        />
                                        <motion.div
                                            initial={{ height: 0 }} animate={{ height: `${data.out}%` }} transition={{ duration: 1, delay: 0.6 + (idx * 0.1), ease: smoothEase }}
                                            className="w-1/2 bg-slate-900 rounded-t-md group-hover:bg-slate-700 transition-colors"
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-800 transition-colors">{data.day}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Section: Recent Transactions */}
                    <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-2">
                                    <CreditCard size={14} /> History
                                </p>
                                <h3 className="font-serif text-3xl tracking-tight">Recent Activity</h3>
                            </div>
                            <button className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                            {[
                                { title: 'Osteria Coffee', cat: 'F&B', amount: '- IDR 45.000', icon: <Coffee size={16} />, type: 'out' },
                                { title: 'Client Transfer', cat: 'Income', amount: '+ IDR 5.250.000', icon: <ArrowUpRight size={16} />, type: 'in' },
                                { title: 'Grocery Run', cat: 'Needs', amount: '- IDR 840.000', icon: <ShoppingBag size={16} />, type: 'out' },
                                { title: 'Dinner at Ray', cat: 'F&B', amount: '- IDR 320.000', icon: <Utensils size={16} />, type: 'out' },
                            ].map((tx, idx) => (
                                <div key={idx} className="flex justify-between items-center group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${tx.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600 group-hover:bg-slate-100'}`}>
                                            {tx.icon}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 group-hover:text-rose-400 transition-colors">{tx.title}</p>
                                            <p className="text-xs text-slate-400 font-medium">{tx.cat}</p>
                                        </div>
                                    </div>
                                    <span className={`font-serif text-lg font-medium tracking-tight ${tx.type === 'in' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {tx.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>

            </main>

        </div>
    );
};

export default DashboardHome;
