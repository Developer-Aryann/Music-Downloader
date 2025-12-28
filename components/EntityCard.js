import { decodeHtml } from "@/lib/api";

export default function EntityCard({ item, type, onClick, onInfo }) {
    const getImage = () => {
        if (item.image) {
            return item.image[item.image.length - 1]?.url || item.image[0]?.url;
        }
        return 'https://placehold.co/400x400/121212/ffffff?text=No+Image';
    };

    const getName = () => decodeHtml(item.name || item.title || 'Unknown');
    const getSub = () => {
        if (type === 'artist') return 'Artist';
        if (type === 'album') return decodeHtml(item.artists?.primary?.map(a => a.name).join(', ') || item.primaryArtists || 'Album');
        if (type === 'playlist') return decodeHtml(`By ${item.firstname || item.subtitle || 'Melodix'}`);
        return decodeHtml(item.subtitle || '');
    };

    return (
        <div
            onClick={onClick}
            className="group bg-surface hover:bg-surface-hover p-4 rounded-2xl transition-all duration-300 cursor-pointer border border-white/5 hover:border-white/10 relative"
        >
            <div className="relative aspect-square mb-4 overflow-hidden rounded-xl shadow-lg">
                <img
                    src={getImage()}
                    alt={getName()}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />

                {onInfo && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onInfo(item); }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-black z-10"
                    >
                        <span className="material-icons-round text-lg">info</span>
                    </button>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <span className="material-icons-round text-3xl">play_arrow</span>
                    </button>
                </div>
            </div>
            <h4 className="text-sm font-bold truncate text-white mb-1 group-hover:text-primary transition-colors">{getName()}</h4>
            <p className="text-xs text-gray-400 truncate capitalize">{getSub()}</p>
        </div>
    );
}
