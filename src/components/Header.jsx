// src/components/AnimatedHeader.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import {
    LayoutDashboard,
    Receipt,
    PiggyBank,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Wallet,
    TrendingUp,
    Bell,
    Search,
    Sparkles,
    Zap,
    Star
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Navigation links configuration
const links = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, color: "from-blue-500 to-cyan-500" },
    { name: "Expenses", path: "/expenses", icon: Receipt, color: "from-red-500 to-rose-500" },
    { name: "Budgets", path: "/budgets", icon: PiggyBank, color: "from-emerald-500 to-green-500" },
    { name: "Reports", path: "/reports", icon: BarChart3, color: "from-violet-500 to-purple-500" },
    { name: "Goals", path: "/saving-goals", icon: TrendingUp, color: "from-amber-500 to-orange-500" },
];

// Enhanced animation variants
const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1
        }
    },
    scroll: {
        backgroundColor: "rgba(24, 24, 27, 0.95)",
        backdropFilter: "blur(20px)",
        transition: { duration: 0.3 }
    }
};

const linkVariants = {
    initial: { y: -20, opacity: 0, scale: 0.8 },
    animate: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: {
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: { scale: 0.95 }
};

const logoVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
        scale: 1,
        rotate: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            type: "spring",
            stiffness: 100
        }
    },
    hover: {
        scale: 1.1,
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.6 }
    }
};

// Simplified mobile menu variants for better performance
const mobileMenuVariants = {
    initial: {
        x: "100%",
        opacity: 0
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            type: "tween",
            duration: 0.3,
            ease: "easeOut",
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    },
    exit: {
        x: "100%",
        opacity: 0,
        transition: {
            type: "tween",
            duration: 0.25,
            ease: "easeIn"
        }
    }
};

const mobileItemVariants = {
    initial: { x: 30, opacity: 0 },
    animate: { 
        x: 0, 
        opacity: 1,
        transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
        x: 30, 
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

export default function AnimatedHeader({ user, onSignOut }) {
    const { pathname } = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const { scrollY } = useScroll();
    const prefersReducedMotion = useReducedMotion();

    // Handle scroll effects
    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const getCurrentPageName = () => {
        const currentLink = links.find(link => link.path === pathname);
        return currentLink?.name || "Dashboard";
    };

    return (
        <>
            {/* Backdrop blur overlay for mobile menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            <motion.header
                variants={headerVariants}
                initial="initial"
                animate="animate"
                className={`sticky top-6 z-50 w-[370px] mx-auto lg:w-full rounded-full transition-all duration-300 ${isScrolled
                        ? 'bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-700/50 shadow-2xl shadow-black/40'
                        : 'bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-700/30 shadow-xl shadow-black/20'
                    } lg:top-4 lg:mx-auto lg:max-w-5xl lg:border lg:rounded-2xl lg:border-zinc-700/30 relative overflow-hidden`}
            >
                {/* Simplified Background for Mobile - No animations */}
                {window.innerWidth > 768 ? (
                    !prefersReducedMotion && (
                        <div className="absolute inset-0 overflow-hidden">
                            {/* Gradient Background Animation - Desktop only */}
                            <motion.div
                                className="absolute inset-0"
                                animate={{
                                    background: [
                                        "linear-gradient(90deg, rgba(139,69,255,0.1) 0%, rgba(147,51,234,0.05) 50%, rgba(99,102,241,0.1) 100%)",
                                        "linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(139,69,255,0.05) 50%, rgba(147,51,234,0.1) 100%)",
                                        "linear-gradient(90deg, rgba(147,51,234,0.1) 0%, rgba(99,102,241,0.05) 50%, rgba(139,69,255,0.1) 100%)",
                                        "linear-gradient(90deg, rgba(139,69,255,0.1) 0%, rgba(147,51,234,0.05) 50%, rgba(99,102,241,0.1) 100%)"
                                    ]
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />

                            {/* Floating orbs - Desktop only */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full opacity-20"
                                    style={{
                                        background: `radial-gradient(circle, ${
                                            i % 3 === 0 ? 'rgba(139,69,255,0.3)' : 
                                            i % 3 === 1 ? 'rgba(99,102,241,0.3)' : 'rgba(147,51,234,0.3)'
                                        } 0%, transparent 70%)`,
                                        width: `${Math.random() * 60 + 30}px`,
                                        height: `${Math.random() * 60 + 30}px`,
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                    }}
                                    animate={{
                                        x: [0, Math.random() * 100 - 50, 0],
                                        y: [0, Math.random() * 50 - 25, 0],
                                        scale: [1, 1.1, 1],
                                        opacity: [0.1, 0.2, 0.1]
                                    }}
                                    transition={{
                                        duration: Math.random() * 8 + 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 2
                                    }}
                                />
                            ))}

                            {/* Sparkle particles - Desktop only */}
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={`sparkle-${i}`}
                                    className="absolute w-1 h-1 bg-white rounded-full"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                    }}
                                    animate={{
                                        scale: [0, 1, 0],
                                        opacity: [0, 1, 0],
                                        rotate: [0, 180, 360]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        delay: i * 0.8,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}

                            {/* Wave Effect - Desktop only */}
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
                                animate={{
                                    scaleX: [0, 1, 0],
                                    opacity: [0, 0.8, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                    )
                ) : (
                    /* Static background for mobile */
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/3 to-indigo-500/5" />
                )}

                <div className="flex items-center justify-between px-4 py-3 lg:px-6 relative z-10">
                    {/* Left Section - Logo and Title */}
                    <motion.div
                        variants={linkVariants}
                        className="flex items-center gap-3"
                    >
                        <motion.div
                            variants={logoVariants}
                            whileHover="hover"
                            whileTap={{ scale: 0.9 }}
                            className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25"
                            animate={!prefersReducedMotion && window.innerWidth > 768 ? {
                                boxShadow: [
                                    "0 8px 25px rgba(139,69,255,0.25)",
                                    "0 12px 35px rgba(139,69,255,0.4)",
                                    "0 8px 25px rgba(139,69,255,0.25)"
                                ],
                                background: [
                                    "linear-gradient(135deg, #8b5cf6 0%, #9333ea 50%, #4338ca 100%)",
                                    "linear-gradient(135deg, #9333ea 0%, #4338ca 50%, #8b5cf6 100%)",
                                    "linear-gradient(135deg, #4338ca 0%, #8b5cf6 50%, #9333ea 100%)",
                                    "linear-gradient(135deg, #8b5cf6 0%, #9333ea 50%, #4338ca 100%)"
                                ]
                            } : {}}
                            transition={{
                                boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                                background: { duration: 6, repeat: Infinity, ease: "linear" }
                            }}
                        >
                            <motion.div
                                animate={!prefersReducedMotion && window.innerWidth > 768 ? { 
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.1, 1]
                                } : {}}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                            </motion.div>

                            {/* Sparkle effects - only on desktop */}
                            {!prefersReducedMotion && window.innerWidth > 768 && [...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-white rounded-full"
                                    animate={{
                                        scale: [0, 1.5, 0],
                                        opacity: [0, 1, 0],
                                        rotate: [0, 180, 360]
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        delay: i * 0.8,
                                        ease: "easeInOut"
                                    }}
                                    style={{
                                        left: `${20 + i * 20}%`,
                                        top: `${20 + i * 20}%`,
                                    }}
                                />
                            ))}

                            {/* Pulse Ring - only on desktop */}
                            {!prefersReducedMotion && window.innerWidth > 768 && (
                                <motion.div
                                    className="absolute inset-0 rounded-lg sm:rounded-xl border-2 border-white/20"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0, 0.5]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            )}
                        </motion.div>

                        <div className="min-w-0 flex-1">
                            <motion.h1
                                className="text-white font-bold text-lg sm:text-xl tracking-wide bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text truncate"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ 
                                    opacity: 1, 
                                    x: 0,
                                    ...(prefersReducedMotion || window.innerWidth <= 768 ? {} : {
                                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                                    })
                                }}
                                transition={{ 
                                    opacity: { delay: 0.2 },
                                    x: { delay: 0.2 },
                                    backgroundPosition: { duration: 5, repeat: Infinity, ease: "linear" }
                                }}
                                style={{
                                    backgroundSize: "200% 100%"
                                }}
                            >
                                Fintrack
                            </motion.h1>
                            <motion.p
                                className="text-xs text-zinc-400 truncate"
                                initial={{ opacity: 0 }}
                                animate={{ 
                                    opacity: (prefersReducedMotion || window.innerWidth <= 768) ? 1 : [0.6, 1, 0.6],
                                }}
                                transition={{ 
                                    opacity: (prefersReducedMotion || window.innerWidth <= 768) ? { delay: 0.4 } : {
                                        delay: 0.4,
                                        duration: 2, 
                                        repeat: Infinity, 
                                        ease: "easeInOut" 
                                    }
                                }}
                            >
                                {getCurrentPageName()}
                            </motion.p>
                        </div>
                    </motion.div>

                {/* Middle Section - Navigation Links (Desktop) */}
                <nav className="hidden lg:flex items-center gap-2">
                    {links.map((link, index) => {
                        const Icon = link.icon;
                        const active = pathname === link.path;

                        return (
                            <motion.div
                                key={link.path}
                                variants={linkVariants}
                                initial="initial"
                                animate="animate"
                                whileHover="hover"
                                whileTap="tap"
                                transition={{ delay: 0.1 * index }}
                                className="relative"
                            >
                                <Link
                                    to={link.path}
                                    className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${active
                                            ? `bg-gradient-to-r ${link.color} text-white shadow-lg shadow-current/25`
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                        }`}
                                >
                                    {/* Animated background shimmer - only on desktop */}
                                    {!prefersReducedMotion && window.innerWidth > 768 && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                                            animate={{
                                                x: [-100, 300]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                repeatDelay: 4,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    )}

                                    <motion.div
                                        animate={!prefersReducedMotion && window.innerWidth > 768 && active ? {
                                            rotate: [0, 5, -5, 0],
                                            scale: [1, 1.15, 1]
                                        } : {}}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 3
                                        }}
                                        whileHover={{
                                            scale: 1.2,
                                            rotate: 10,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <Icon className="w-4 h-4 relative z-10" />
                                    </motion.div>

                                    <span className="relative z-10">
                                        {link.name}

                                        {/* Hover underline effect */}
                                        {!active && (
                                            <motion.div
                                                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 origin-left"
                                                initial={{ scaleX: 0 }}
                                                whileHover={{ scaleX: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                    </span>

                                    {/* Active indicator */}
                                    {active && (
                                        <motion.div
                                            className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"
                                            animate={!prefersReducedMotion && window.innerWidth > 768 ? {
                                                scale: [1, 1.3, 1],
                                                opacity: [1, 0.7, 1]
                                            } : {}}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* Right Section - Actions and User */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* User Profile */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 ring-2 ring-transparent hover:ring-violet-500/20 transition-all duration-300 p-0"
                                    >
                                        <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                                            <AvatarImage
                                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email || 'User'}`}
                                                alt="User Avatar"
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white font-semibold text-xs sm:text-sm">
                                                {user.email?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {/* Online indicator - no animation on mobile */}
                                        <motion.div
                                            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full"
                                            animate={!prefersReducedMotion && window.innerWidth > 768 ? { scale: [1, 1.2, 1] } : {}}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </Button>
                                </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-64 bg-zinc-900/95 backdrop-blur-xl border-zinc-700/50 text-zinc-50 shadow-2xl"
                                align="end"
                                forceMount
                                sideOffset={5}
                            >
                                <DropdownMenuLabel className="font-normal text-zinc-400 p-4">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage
                                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email || 'User'}`}
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-indigo-600 text-white font-bold">
                                                {user.email?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-white">
                                                {user.email?.split('@')[0] || 'User'}
                                            </p>
                                            <p className="text-xs leading-none text-zinc-400">
                                                {user.email}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className={`w-2 h-2 bg-emerald-500 rounded-full ${!prefersReducedMotion ? 'animate-pulse' : ''}`} />
                                                <span className="text-xs text-emerald-400">Online</span>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-700/50" />

                                <Link to="/settings">
                                    <DropdownMenuItem className="focus:bg-zinc-800/50 text-zinc-300 focus:text-white cursor-pointer group">
                                        <motion.div
                                            className="flex items-center w-full"
                                            whileHover={{ x: 2 }}
                                        >
                                            <Settings className="mr-3 h-4 w-4 group-hover:text-violet-400 transition-colors" />
                                            <span>Settings</span>
                                        </motion.div>
                                    </DropdownMenuItem>
                                </Link>

                                <DropdownMenuSeparator className="bg-zinc-700/50" />

                                <DropdownMenuItem
                                    onClick={() => {
                                        console.log("Desktop logout button clicked");
                                        onSignOut();
                                    }}
                                    className="focus:bg-red-950/20 cursor-pointer group"
                                >
                                    <motion.div
                                        className="flex items-center text-red-400 group-hover:text-red-300 w-full"
                                        whileHover={{ x: 2 }}
                                    >
                                        <LogOut className="mr-3 h-4 w-4" />
                                        <span>Log out</span>
                                    </motion.div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Button
                                asChild
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 text-sm shadow-lg shadow-violet-500/25 font-medium"
                            >
                                <Link to="/login" className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="hidden sm:inline">Log In</span>
                                </Link>
                            </Button>
                        </motion.div>
                    )}

                    {/* Mobile Menu Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden p-2 h-8 w-8 sm:h-10 sm:w-10 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    </motion.div>
                </div>
            </div>
            </motion.header>

            {/* Optimized Mobile Navigation Drawer */}
            <AnimatePresence mode="wait">
                {isMobileMenuOpen && (
                    <motion.div
                        variants={mobileMenuVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="fixed inset-y-0 right-0 w-full max-w-sm bg-zinc-950 border-l border-zinc-800/50 shadow-2xl z-50 flex flex-col lg:hidden"
                        // Use transform3d for better mobile performance
                        style={{ transform: 'translate3d(0, 0, 0)' }}
                    >
                        {/* Simplified Background for Mobile - Static only */}
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
                            {/* Static gradient for mobile performance */}
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 via-purple-500/2 to-indigo-500/3" />
                        </div>

                        {/* Header */}
                        <motion.div
                            variants={mobileItemVariants}
                            className="flex justify-between items-center p-4 border-b border-zinc-800/50 relative z-10"
                        >
                            <motion.div 
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <motion.div 
                                    className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/25"
                                >
                                    <Wallet className="w-4 h-4 text-white" />
                                </motion.div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        Navigation
                                    </h2>
                                    <p className="text-xs text-zinc-400">Fintrack</p>
                                </div>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Optimized Navigation Links */}
                        <motion.nav
                            className="flex-1 p-4 space-y-3 overflow-y-auto relative z-10"
                            variants={mobileItemVariants}
                        >
                            {links.map((link, index) => {
                                const Icon = link.icon;
                                const active = pathname === link.path;

                                return (
                                    <motion.div
                                        key={link.path}
                                        variants={mobileItemVariants}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ 
                                            opacity: 1, 
                                            y: 0,
                                            transition: { 
                                                delay: 0.05 + index * 0.05,
                                                duration: 0.3,
                                                ease: "easeOut"
                                            }
                                        }}
                                        whileHover={{ 
                                            scale: 1.02, 
                                            x: 4,
                                            transition: { duration: 0.2 }
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative"
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-semibold transition-all duration-300 ${active
                                                    ? `bg-gradient-to-r ${link.color} text-white shadow-xl shadow-current/20 border border-white/10`
                                                    : "text-zinc-300 hover:text-white bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700/30 hover:border-zinc-600/50"
                                                }`}
                                        >
                                            {/* No shimmer effect on mobile for performance */}

                                            {/* Icon container - no animations on mobile */}
                                            <div 
                                                className={`relative p-2.5 rounded-xl ${active
                                                        ? "bg-white/20 shadow-lg"
                                                        : "bg-zinc-700/50"
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5 relative z-10" />
                                            </div>

                                            <span className="flex-1 relative z-10">{link.name}</span>

                                            {/* Active indicator - simplified */}
                                            {active && (
                                                <motion.div
                                                    className="flex-shrink-0 relative"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Star className="w-4 h-4 text-white" />
                                                </motion.div>
                                            )}

                                            {/* Static arrow for non-active items */}
                                            {!active && (
                                                <div className="flex-shrink-0 opacity-40">
                                                    <svg 
                                                        className="w-4 h-4 text-zinc-400" 
                                                        fill="none" 
                                                        viewBox="0 0 24 24" 
                                                        stroke="currentColor"
                                                    >
                                                        <path 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                            strokeWidth={2} 
                                                            d="M9 5l7 7-7 7" 
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.nav>

                        {/* Bottom Actions */}
                        {user && (
                            <motion.div
                                variants={mobileItemVariants}
                                className="p-4 border-t border-zinc-800/50 relative z-10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Button
                                    onClick={() => {
                                        console.log("Mobile logout button clicked");
                                        setIsMobileMenuOpen(false);
                                        onSignOut();
                                    }}
                                    className="w-full mb-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}