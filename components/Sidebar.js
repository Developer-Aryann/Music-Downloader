"use client";

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
    const menuItems = [
        { id: 'home', icon: 'home', label: 'Home' },
        { id: 'search', icon: 'search', label: 'Search' },
        { id: 'trending', icon: 'trending_up', label: 'Trending' },
        { id: 'artists', icon: 'people', label: 'Artists' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 w-72 bg-black/95 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none border-r border-white/5 
                transition-transform duration-300 ease-in-out z-[70] md:relative md:translate-x-0 md:w-64 md:flex flex-col h-full
                ${isOpen ? 'translate-x-0 shadow-2xl shadow-primary/10' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gradient flex items-center gap-2">
                        <span className="material-icons-round text-primary">graphic_eq</span>
                        Melodix
                    </h1>
                    <button
                        onClick={onClose}
                        className="md:hidden material-icons-round text-gray-400 hover:text-white transition"
                    >
                        close
                    </button>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (window.innerWidth < 768) onClose();
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                                ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(29,185,84,0.15)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="material-icons-round">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 mx-2">
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-30">Developed By</p>
                        <p className="text-sm font-bold text-white/40 hover:text-primary transition-colors cursor-default">Coderaryan</p>
                    </div>
                    <p className="text-[9px] text-gray-600 mt-4 opacity-30">MELODIX v1.0.4</p>
                </div>
            </aside>
        </>
    );
}
