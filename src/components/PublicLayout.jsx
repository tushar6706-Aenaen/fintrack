import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout() {
    return (
        <div className="relative flex flex-col min-h-screen bg-zinc-950 text-white overflow-hidden">
            {/* Header for public pages - without user-specific features */}
            <Header isPublic={true} />

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto z-10 relative">
                <Outlet /> {/* Renders public pages (About, Contact, Privacy) */}
            </main>
            
            {/* Footer */}
            <Footer />
        </div>
    );
}
