// src/components/DashboardHeader.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Sun,
    Moon,
    Plus,
    ListFilter,
    ArrowDownNarrowWide
} from "lucide-react";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardHeader() {
    // You can manage active state here or pass it from a parent component
    const [activeFilter, setActiveFilter] = useState("All");

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
        // You would also trigger a data fetch or filter logic here
    };

    return (
        <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex flex-col gap-4">
            {/* Top Row: Title, Theme Toggle, and New Task Button */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-white font-bold text-3xl tracking-wide">
                        Task Manager
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Organize your tasks efficiently and boost your productivity.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="p-2 text-zinc-400 hover:text-white">
                        <Moon className="w-5 h-5" />
                    </Button>
                    <Button className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-semibold flex items-center gap-2 rounded-xl px-4 py-2 hover:from-violet-700 hover:to-indigo-800 transition-colors shadow-lg shadow-violet-500/20">
                        <Plus className="w-4 h-4" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Bottom Row: Filters, Search, and Sort options */}
            <div className="flex items-center gap-4">
                {/* Status Filters */}
                <div className="flex-1 flex items-center gap-2">
                    <Button
                        variant={activeFilter === "Dashboard" ? "default" : "ghost"}
                        onClick={() => handleFilterClick("Dashboard")}
                        className={`font-semibold rounded-xl px-4 py-2 ${
                            activeFilter === "Dashboard"
                                ? "bg-zinc-800 text-white"
                                : "bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                    >
                        Dashboard
                    </Button>
                    <Button
                        variant={activeFilter === "All" ? "default" : "ghost"}
                        onClick={() => handleFilterClick("All")}
                        className={`font-semibold rounded-xl px-4 py-2 ${
                            activeFilter === "All"
                                ? "bg-zinc-800 text-white"
                                : "bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                    >
                        All
                    </Button>
                    <Button
                        variant={activeFilter === "Active" ? "default" : "ghost"}
                        onClick={() => handleFilterClick("Active")}
                        className={`font-semibold rounded-xl px-4 py-2 ${
                            activeFilter === "Active"
                                ? "bg-zinc-800 text-white"
                                : "bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                    >
                        Active
                    </Button>
                    <Button
                        variant={activeFilter === "Completed" ? "default" : "ghost"}
                        onClick={() => handleFilterClick("Completed")}
                        className={`font-semibold rounded-xl px-4 py-2 ${
                            activeFilter === "Completed"
                                ? "bg-zinc-800 text-white"
                                : "bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                    >
                        Completed
                    </Button>
                </div>

                {/* Search Bar and Dropdowns */}
                <div className="flex items-center gap-4">
                    <div className="relative flex items-center">
                        <Input
                            type="text"
                            placeholder="Search tasks..."
                            className="w-64 bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl pl-4 pr-10 py-2"
                        />
                        <ListFilter className="absolute right-4 w-4 h-4 text-zinc-500" />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-zinc-800 border border-zinc-700 text-white font-semibold flex items-center gap-2 rounded-xl">
                                <ArrowDownNarrowWide className="w-4 h-4 text-zinc-400" />
                                Newest...
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 bg-zinc-900 border border-zinc-700">
                            <DropdownMenuItem>Newest</DropdownMenuItem>
                            <DropdownMenuItem>Oldest</DropdownMenuItem>
                            <DropdownMenuItem>Priority</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-zinc-800 border border-zinc-700 text-white font-semibold flex items-center gap-2 rounded-xl">
                                Category
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 bg-zinc-900 border border-zinc-700">
                            <DropdownMenuItem>All</DropdownMenuItem>
                            <DropdownMenuItem>Work</DropdownMenuItem>
                            <DropdownMenuItem>Personal</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}