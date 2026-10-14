"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// =========================================================================
// Pure Self-Contained SVG Icons (Zero module resolution or bundling issues)
// =========================================================================
function IconUser({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function IconLock({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function IconEye({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function IconEyeOff({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
    );
}


function IconDatabase({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
    );
}


function IconSparkles({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
    );
}

function IconSettings({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function IconCheckCircle({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
        </svg>
    );
}

function IconAlertCircle({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    );
}

function IconArrowRight({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}

function IconX({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

// =========================================================================
// Main Redeveloped Login Component
// =========================================================================
export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Database Configuration Modal State
    const [showDbModal, setShowDbModal] = useState(false);
    const [dbConfig, setDbConfig] = useState({
        server: "",
        port: "3306",
        database: "u889453186_cgs_computers",
        username: "root",
        password: "",
    });
    const [dbStatus, setDbStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [dbMessage, setDbMessage] = useState("");

    // Load initial DB config on mount
    useEffect(() => {
        fetch("/api/db-config")
            .then((res) => res.json())
            .then((data) => {
                if (data && data.server) {
                    setDbConfig(data);
                }
            })
            .catch(() => {
                // Silently ignore if offline
            });
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Invalid username or password");
            
            router.push("/dashboard");
            router.refresh();
        } catch (err: unknown) {
            setLoginError(err instanceof Error ? err.message : "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDbConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setDbStatus("loading");
        setDbMessage("");
        try {
            const res = await fetch("/api/db-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dbConfig),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update database config");
            
            setDbStatus("success");
            setDbMessage("Database connection saved and verified!");
            setTimeout(() => {
                setShowDbModal(false);
                setDbStatus("idle");
            }, 1200);
        } catch (err: unknown) {
            setDbStatus("error");
            setDbMessage(err instanceof Error ? err.message : "Failed to connect to database");
        }
    };

    const fillCredentials = (user: string, pass: string) => {
        setFormData({ username: user, password: pass });
        setLoginError("");
    };

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col lg:flex-row overflow-x-hidden selection:bg-blue-600 selection:text-white">
            
            {/* ========================================================= */}
            {/* LEFT PANEL: Brand Showcase, System Status & Feature Cards */}
            {/* ========================================================= */}
            <div className="relative w-full lg:w-[48%] xl:w-[45%] bg-gradient-to-br from-[#0a1128] via-[#101f42] to-[#1e1b4b] text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between overflow-hidden shadow-2xl">
                
                {/* Background Ambient Glows & Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />

                {/* Top Bar: Brand Badge & Live Status */}
                <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shadow-lg">
                            <Image 
                                src="/logo1.png" 
                                alt="CGS Logo" 
                                width={32} 
                                height={32} 
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div>
                            <span className="font-extrabold text-sm tracking-tight block text-white leading-none">
                                CGS Computers
                            </span>
                            <span className="text-[10px] font-bold text-blue-300 tracking-wider uppercase">
                                POS &amp; Inventory Suite
                            </span>
                        </div>
                    </div>

                    {/* Live Server Indicator Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-[11px] font-bold text-emerald-300 tracking-wide">
                            Live Terminal Ready
                        </span>
                    </div>
                </div>

                {/* Middle: Brand Pitch & Core Value Proposition */}
                <div className="relative z-10 my-8 sm:my-12 space-y-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-sm">
                            <IconSparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span>Enterprise Retail &amp; Wholesale Point of Sale</span>
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-[1.15]">
                            Manage Store Operations <br />
                            <span className="bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                                Fast, Accurate &amp; Connected
                            </span>
                        </h1>
                        
                        <p className="text-slate-300/80 text-sm sm:text-base leading-relaxed max-w-lg">
                            Streamline wholesale and retail billing, print invoices, manage multi-brand computer inventory, and maintain client ledgers seamlessly.
                        </p>
                    </div>

                </div>

                {/* Bottom Footer */}
                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-center text-xs text-slate-400">
                    <span className="text-xs tracking-wider text-slate-400">
                        Powered by <span className="font-bold text-white tracking-wide">RAPIDTECHPRO</span>
                    </span>
                </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT PANEL: Authentication Form & Action Center          */}
            {/* ========================================================= */}
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#f8fafc] relative">
                
                {/* Top Nav / Quick Action */}
                <div className="w-full max-w-md mx-auto flex items-center justify-end">
                    <button
                        type="button"
                        onClick={() => setShowDbModal(true)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                        title="Configure Database Host"
                    >
                        <IconSettings className="w-3.5 h-3.5 text-slate-500" />
                        <span>Database Server</span>
                    </button>
                </div>

                {/* Main Login Card */}
                <div className="w-full max-w-md mx-auto my-auto py-6">
                    <div className="space-y-6">
                        
                        {/* Header */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-3">
                                <IconLock className="w-3.5 h-3.5" />
                                <span>Sign In to Terminal</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Enter your credentials to access your point of sale workstation.
                            </p>
                        </div>

                        {/* Error Alert */}
                        {loginError && (
                            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
                                <IconAlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Authentication Failed</p>
                                    <p className="text-rose-700 font-normal mt-0.5">{loginError}</p>
                                </div>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-4">
                            
                            {/* Username Field */}
                            <div className="space-y-1.5">
                                <label 
                                    htmlFor="username" 
                                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                >
                                    Username or Operator ID
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <IconUser className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        autoFocus
                                        autoComplete="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:bg-white text-slate-900 font-semibold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-xs"
                                        placeholder="e.g. admin"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <label 
                                    htmlFor="password" 
                                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <IconLock className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white focus:bg-white text-slate-900 font-semibold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-xs"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Options: Remember Me */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold text-slate-600">Remember this terminal</span>
                                </label>
                                <span className="text-xs text-slate-400 font-medium">Need access? Ask Admin</span>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In to Terminal</span>
                                        <IconArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Demo / Quick Credentials Helper */}
                        <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/80 space-y-2">
                            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Quick Operator Login (Click to Fill):
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => fillCredentials("admin", "admin123")}
                                    className="p-2 rounded-lg bg-white hover:bg-blue-50/60 border border-slate-200 text-left transition hover:border-blue-300 cursor-pointer group"
                                >
                                    <span className="block font-bold text-slate-800 text-xs group-hover:text-blue-600">
                                        Administrator
                                    </span>
                                    <span className="font-mono text-[11px] text-slate-500">
                                        admin / admin123
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillCredentials("admin", "admin")}
                                    className="p-2 rounded-lg bg-white hover:bg-blue-50/60 border border-slate-200 text-left transition hover:border-blue-300 cursor-pointer group"
                                >
                                    <span className="block font-bold text-slate-800 text-xs group-hover:text-blue-600">
                                        Standard Admin
                                    </span>
                                    <span className="font-mono text-[11px] text-slate-500">
                                        admin / admin
                                    </span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="w-full max-w-md mx-auto text-center text-xs text-slate-400 pt-4">
                    <p>&copy; {new Date().getFullYear()} CGS Computers POS. All rights reserved.</p>
                </div>
            </div>

            {/* ========================================================= */}
            {/* DATABASE CONNECTION SETTINGS MODAL                         */}
            {/* ========================================================= */}
            {showDbModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-300">
                                    <IconDatabase className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Database Host Configuration</h3>
                                    <p className="text-[11px] text-slate-300">Set local network or cloud MySQL connection</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDbModal(false)}
                                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                            >
                                <IconX className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveDbConfig} className="p-6 space-y-4">
                            {dbMessage && (
                                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                                    dbStatus === "success" 
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                        : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}>
                                    {dbStatus === "success" ? <IconCheckCircle className="w-4 h-4" /> : <IconAlertCircle className="w-4 h-4" />}
                                    <span>{dbMessage}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase">Server IP / Host</label>
                                    <input
                                        type="text"
                                        required
                                        value={dbConfig.server}
                                        onChange={(e) => setDbConfig({ ...dbConfig, server: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        placeholder="e.g. 195.35.59.84 or 127.0.0.1"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase">Port</label>
                                    <input
                                        type="text"
                                        required
                                        value={dbConfig.port}
                                        onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        placeholder="3306"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase">Database Name</label>
                                <input
                                    type="text"
                                    required
                                    value={dbConfig.database}
                                    onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder="u889453186_cgs_computers"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase">DB User</label>
                                    <input
                                        type="text"
                                        required
                                        value={dbConfig.username}
                                        onChange={(e) => setDbConfig({ ...dbConfig, username: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        placeholder="root"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase">DB Password</label>
                                    <input
                                        type="password"
                                        value={dbConfig.password}
                                        onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowDbModal(false)}
                                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={dbStatus === "loading"}
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                                >
                                    {dbStatus === "loading" && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    <span>Save &amp; Reconnect</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
