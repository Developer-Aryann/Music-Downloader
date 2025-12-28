"use client";
import { useState } from "react";

export default function Header({ onSearch, toggleSidebar, openModal }) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    const handleCleanStorage = () => {
        openModal(
            'confirm',
            'Clear History',
            'Are you sure you want to clear your recently played and saved history? This will reset your Home page.',
            () => {
                localStorage.clear();
                window.location.reload();
            }
        );
    };

    return (
        <header className="flex items-center justify-between p-4 md:p-6 sticky top-0 bg-black/50 backdrop-blur-md z-40 gap-4">
            {/* Left side: Menu and Nav */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden material-icons-round text-white p-2 hover:bg-white/10 rounded-full transition"
                >
                    menu
                </button>
                <div className="hidden sm:flex items-center gap-2">
                    <button className="material-icons-round w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white transition">chevron_left</button>
                    <button className="material-icons-round w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white transition">chevron_right</button>
                </div>
            </div>

            {/* Right side: Search and Clean */}
            <div className="flex items-center gap-3 md:gap-6 flex-1 justify-end">
                <form onSubmit={handleSubmit} className="flex-1 max-w-md relative group">
                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-xl">search</span>
                    <input
                        type="text"
                        placeholder="Search songs, artists, albums..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-surface-hover/50 hover:bg-surface-hover border border-transparent focus:border-primary/30 py-2 md:py-2.5 pl-11 pr-4 rounded-full text-sm font-medium outline-none transition-all placeholder:text-gray-500"
                    />
                </form>

                <button
                    onClick={handleCleanStorage}
                    title="Clear History"
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                >
                    <span className="material-icons-round">delete_sweep</span>
                </button>
            </div>
        </header>
    );
}
