import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ParticleBackground from "./ParticleBackground"; // Import the new particle background component

export default function Layout({ user, onSignOut }) {
    return (
        // The main container should be relative to position the particles absolutely within it
        <div className="relative flex flex-col min-h-screen bg-zinc-950 text-white overflow-hidden">
            {/* Particle Background Component */}
            <ParticleBackground />

            {/* The new Header component replaces both the sidebar and navbar */}
            <Header user={user} onSignOut={onSignOut} />

            {/* The main content area now occupies the remaining space */}
            <main className="flex-1 overflow-y-auto px-2 py-8 z-10 relative">
                {/* Add z-10 and relative to main to ensure content stays on top of the particles */}
                <Outlet /> {/* Renders nested routes (Dashboard, etc.) */}
            </main>
            <Footer/>
        </div>
    );
}
