// src/components/AnimatedHeader.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
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

const mobileMenuVariants = {
    initial: {
        x: "100%",
        opacity: 0,
        scale: 0.9
    },
    animate: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 120,
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    },
    exit: {
        x: "100%",
        opacity: 0,
        scale: 0.9,
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

const mobileItemVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 }
};

const notificationVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: {
        scale: 1,
        rotate: [0, -10, 10, 0],
        transition: {
            scale: { duration: 0.3 },
            rotate: { duration: 0.6, repeat: Infinity, repeatDelay: 3 }
        }
    }
};

export default function AnimatedHeader({ user, onSignOut }) {
    const { pathname } = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const { scrollY } = useScroll();

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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            <motion.header
                variants={headerVariants}
                initial="initial"
                animate="animate"
                className={`sticky lg:top-4 z-50 mx-auto py-4 w-full lg:max-w-5xl transition-all duration-300 ${isScrolled
                        ? 'bg-zinc-900/95 backdrop-blur-xl border-zinc-700/50 shadow-2xl shadow-black/40'
                        : 'bg-zinc-900/80 backdrop-blur-xl border-zinc-700/30 shadow-xl shadow-black/20'
                    } border lg:rounded-2xl py-3 px-6 flex items-center justify-between`}
            >
                {/* Left Section - Logo and Title */}
                <motion.div
                    variants={linkVariants}
                    className="flex items-center gap-3"
                >
                    <motion.div
                        variants={logoVariants}
                        whileHover="hover"
                        whileTap={{ scale: 0.9 }}
                        className="relative w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25"
                    >
                        <Wallet className="w-5 h-5 text-white relative z-10" />

                        {/* Animated background particles */}
                        <motion.div
                            className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 opacity-0"
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Sparkle effects */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                animate={{
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.7,
                                }}
                                style={{
                                    left: `${20 + i * 20}%`,
                                    top: `${20 + i * 15}%`,
                                }}
                            />
                        ))}
                    </motion.div>

                    <div className="hidden sm:block mr-4 lg:mr-4">
                        <motion.h1
                            className="text-white font-bold  text-xl tracking-wide bg-gradient-to-r from-white to-zinc-300 bg-clip-text"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Fintrack
                        </motion.h1>
                        <motion.p
                            className="text-xs text-zinc-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
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
                                    className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${active
                                            ? `bg-gradient-to-r ${link.color} text-white shadow-lg shadow-current/25`
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                        }`}
                                >
                                    <motion.div
                                        animate={active ? {
                                            rotate: [0, 5, -5, 0],
                                            scale: [1, 1.1, 1]
                                        } : {}}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 3
                                        }}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </motion.div>

                                    <span className="relative">
                                        {link.name}

                                        {/* Hover underline effect */}
                                        {!active && (
                                            <motion.div
                                                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                                                initial={{ width: 0 }}
                                                whileHover={{ width: "100%" }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                    </span>

                                    {/* Active indicator */}
                                    {active && (
                                        <motion.div
                                            className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                                        />
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* Search Bar (Medium screens) */}
                <motion.div
                    className="hidden md:flex lg:hidden items-center"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Search..."
                            className={`pl-10 pr-4 py-2 w-32 transition-all duration-300 bg-zinc-800/50 border-zinc-700 text-zinc-200 placeholder-zinc-500 rounded-lg ${searchFocused ? 'w-48 bg-zinc-800' : 'focus:w-48'
                                }`}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                    </div>
                </motion.div>

                {/* Right Section - Actions and User */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <motion.div
                        variants={notificationVariants}
                        initial="initial"
                        animate="animate"
                        className="hidden sm:block"
                    >
                        
                    </motion.div>

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
                                        className="relative h-10 w-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 ring-2 ring-transparent hover:ring-violet-500/20 transition-all duration-300"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage
                                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email || 'User'}`}
                                                alt="User Avatar"
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white font-semibold text-sm">
                                                {user.email?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {/* Online indicator */}
                                        <motion.div
                                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full"
                                            animate={{ scale: [1, 1.2, 1] }}
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
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
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
                                    onClick={onSignOut}
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
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl px-6 shadow-lg shadow-violet-500/25 font-medium"
                            >
                                <Link to="/login" className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Log In
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
                            className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                    </motion.div>
                </div>
            </motion.header>

            {/* Enhanced Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        variants={mobileMenuVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="fixed inset-y-0 right-0 w-80 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border-l border-zinc-800/50 shadow-2xl z-50 flex flex-col lg:hidden"
                    >
                        {/* Header */}
                        <motion.div
                            variants={mobileItemVariants}
                            className="flex justify-between items-center p-6 border-b border-zinc-800/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Navigation</h2>
                                    <p className="text-xs text-zinc-400">Expensio</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </motion.div>



                        {/* Navigation Links */}
                        <motion.nav
                            className="flex-1 p-4 space-y-2 overflow-y-auto"
                            variants={mobileItemVariants}
                        >
                            {links.map((link, index) => {
                                const Icon = link.icon;
                                const active = pathname === link.path;

                                return (
                                    <motion.div
                                        key={link.path}
                                        variants={mobileItemVariants}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${active
                                                    ? `bg-gradient-to-r ${link.color} text-white shadow-lg shadow-current/20`
                                                    : "text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${active
                                                    ? "bg-white/20"
                                                    : "bg-zinc-800/50"
                                                }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span>{link.name}</span>

                                            {active && (
                                                <motion.div
                                                    className="ml-auto"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 500 }}
                                                >
                                                    <Star className="w-4 h-4 text-white" />
                                                </motion.div>
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
                                className="p-4 border-t border-zinc-800/50"
                            >
                                <Button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        onSignOut();
                                    }}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25"
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