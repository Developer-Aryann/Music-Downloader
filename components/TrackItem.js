import { decodeHtml } from "@/lib/api";

export default function TrackItem({ track, index, isActive, isPlaying, onPlay }) {
    const getQualityLabel = (url) => {
        if (url.includes('320')) return '320kbps';
        if (url.includes('160')) return '160kbps';
        return '128kbps';
    };

    return (
        <div
            onClick={() => onPlay(track)}
            className={`group flex items-center gap-3 p-2 md:p-3 rounded-xl transition-all duration-300 cursor-pointer ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'
                }`}
        >
            <div className="w-10 flex items-center justify-center shrink-0">
                {isActive && isPlaying ? (
                    <div className="flex items-end justify-center gap-0.5 h-4 mb-1">
                        <div className="w-1 bg-primary animate-playing-bar" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 bg-primary animate-playing-bar" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 bg-primary animate-playing-bar" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                ) : (
                    <span className="material-icons-round text-gray-500 group-hover:text-primary transition-colors text-2xl">
                        {isActive ? 'pause' : 'play_arrow'}
                    </span>
                )}
            </div>

            <img
                src={track.image[1]?.url || track.image[0].url}
                alt={decodeHtml(track.name)}
                className="w-12 h-12 rounded-lg object-cover shadow-md"
            />

            <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-white'}`}>
                    {decodeHtml(track.name || track.title)}
                </h4>
                <p className="text-xs text-gray-400 truncate">
                    {decodeHtml(track.artists?.primary?.map(a => a.name).join(', ') || track.primaryArtists || track.subtitle || 'Unknown Artist')}
                </p>
            </div>

            <div className="hidden md:block text-xs text-gray-500 font-medium">
                {decodeHtml(track.album?.name || track.album || 'Unknown Album')}
            </div>

            <div className="flex items-center gap-4">
                {track.downloadUrl && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-gray-400 uppercase">
                        {getQualityLabel(track.downloadUrl[track.downloadUrl.length - 1].url)}
                    </span>
                )}
                <span className="text-sm text-gray-500 font-mono">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </span>
                <button className="material-icons-round text-gray-500 hover:text-white transition opacity-0 group-hover:opacity-100">more_horiz</button>
            </div>
        </div>
    );
}
