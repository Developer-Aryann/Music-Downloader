"use client";
import { useState, useRef, useEffect } from "react";
import { decodeHtml } from "@/lib/api";

export default function Player({ currentSong, isPlaying, onTogglePlay, onNext, onPrev, isFavorite, onToggleFavorite }) {
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isDownloading, setIsDownloading] = useState(false);
    const audioRef = useRef(null);
    const progressInterval = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        const url = currentSong.downloadUrl?.[currentSong.downloadUrl.length - 1]?.url;
        if (!url) return;

        // If the song changed, update the source
        if (audio.src !== url) {
            audio.src = url;
            audio.load();
            setProgress(0);
            setCurrentTime(0);
        }

        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    startTimer();
                }).catch(error => {
                    // Auto-play was prevented or interrupted
                    console.log("Play interrupted or prevented:", error);
                });
            }
        } else {
            audio.pause();
            stopTimer();
        }

        return () => stopTimer();
    }, [currentSong, isPlaying]);

    const startTimer = () => {
        stopTimer();
        progressInterval.current = setInterval(() => {
            if (audioRef.current) {
                const cur = audioRef.current.currentTime;
                const dur = audioRef.current.duration;
                const p = (cur / dur) * 100;
                setProgress(p || 0);
                setCurrentTime(cur || 0);
            }
        }, 1000);
    };

    const stopTimer = () => {
        if (progressInterval.current) clearInterval(progressInterval.current);
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const p = x / rect.width;
        if (audioRef.current) {
            const newTime = p * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setProgress(p * 100);
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDownload = async () => {
        if (!currentSong || !currentSong.downloadUrl?.length || isDownloading) return;
        setIsDownloading(true);
        const url = currentSong.downloadUrl[currentSong.downloadUrl.length - 1].url;
        const name = `${currentSong.name || currentSong.title}.mp3`;

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (!currentSong) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2 md:px-4 md:pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`max-w-7xl mx-auto bg-black/80 backdrop-blur-2xl border border-white/10 p-3 md:p-4 rounded-3xl flex flex-col md:flex-row items-center gap-3 md:gap-4 shadow-2xl relative overflow-hidden transition-all duration-500 ${isPlaying ? 'animate-card-beat border-primary/30' : ''}`}>

                {/* Background Beat Pulse - Floating Ripple Effect */}
                {isPlaying && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full animate-ripple pointer-events-none"></div>
                )}

                <audio
                    ref={audioRef}
                    onEnded={onNext}
                />

                {/* Song Info */}
                <div className="flex items-center gap-3 w-full md:w-1/4 relative shrink-0 z-10">
                    <div className="relative group shrink-0">
                        <img
                            src={currentSong.image?.[currentSong.image?.length - 1]?.url || 'https://placehold.co/100x100/121212/ffffff?text=Song'}
                            alt={decodeHtml(currentSong.name || 'Song')}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover shadow-lg border-2 border-white/10 transition-all duration-700 ${isPlaying ? 'animate-image-beat animate-aura' : 'scale-100'}`}
                        />
                        {isPlaying && (
                            <div className="absolute -bottom-1 -right-1 flex items-end gap-0.5 bg-black/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10 scale-75 h-7">
                                <div className="w-1 bg-primary animate-playing-bar" style={{ animationDelay: '0s' }}></div>
                                <div className="w-1 bg-primary animate-playing-bar" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1 bg-primary animate-playing-bar" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1 bg-primary animate-playing-bar" style={{ animationDelay: '0.3s' }}></div>
                                <div className="w-1 bg-primary animate-playing-bar" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-sm md:text-base font-bold truncate text-white leading-tight">{decodeHtml(currentSong.name || currentSong.title)}</h4>
                        <p className="text-[11px] md:text-xs text-gray-400 truncate mt-0.5 font-medium">
                            {decodeHtml(currentSong.artists?.primary?.map(a => a.name).join(', ') || currentSong.primaryArtists || currentSong.subtitle || 'Unknown Artist')}
                        </p>
                    </div>
                    <button
                        onClick={onToggleFavorite}
                        className={`material-icons-round transition text-xl md:text-2xl ${isFavorite ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                    >
                        {isFavorite ? 'favorite' : 'favorite_border'}
                    </button>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center flex-1 w-full gap-1 md:gap-2 z-10">
                    <div className="flex items-center gap-4 md:gap-6">
                        <button className="hidden sm:block material-icons-round text-xl md:text-2xl text-gray-500 hover:text-white transition">shuffle</button>
                        <button onClick={onPrev} className="material-icons-round text-2xl md:text-3xl text-white hover:text-primary transition">skip_previous</button>
                        <button
                            onClick={onTogglePlay}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-[0_0_20px_rgba(29,185,84,0.4)]"
                        >
                            <span className="material-icons-round text-2xl md:text-3xl leading-none">
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </button>
                        <button onClick={onNext} className="material-icons-round text-2xl md:text-3xl text-white hover:text-primary transition">skip_next</button>
                        <button className="hidden sm:block material-icons-round text-xl md:text-2xl text-gray-500 hover:text-white transition">repeat</button>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-2xl group px-2 md:px-0">
                        <span className="text-[10px] md:text-[11px] text-gray-300 w-8 md:w-10 text-right font-mono font-bold">{formatTime(currentTime)}</span>
                        <div
                            className="h-1 md:h-1.5 flex-1 bg-white/10 rounded-full cursor-pointer relative"
                            onClick={handleSeek}
                        >
                            <div
                                className="absolute inset-y-0 left-0 bg-primary rounded-full group-hover:bg-primary/80 transition-colors"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full opacity-100 shadow-md transform scale-100 transition-all"></div>
                            </div>
                        </div>
                        <span className="text-[10px] md:text-[11px] text-gray-300 w-8 md:w-10 font-mono font-bold">
                            {formatTime(currentSong.duration)}
                        </span>
                    </div>
                </div>

                {/* Extra Controls */}
                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-5 w-auto md:w-1/4 z-10 px-2 md:px-0">
                    <button
                        onClick={handleDownload}
                        className={`material-icons-round transition text-xl md:text-2xl ${isDownloading ? 'text-primary animate-spin' : 'text-gray-400 hover:text-primary'}`}
                        title={isDownloading ? "Downloading..." : "Download"}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'sync' : 'download'}
                    </button>
                    <div className="hidden md:flex items-center gap-2 group w-24">
                        <span className="material-icons-round text-gray-400 text-sm">{volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}</span>
                        <div className="h-1 flex-1 bg-white/10 rounded-full cursor-pointer relative overflow-hidden">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => {
                                    const v = parseFloat(e.target.value);
                                    setVolume(v);
                                    if (audioRef.current) audioRef.current.volume = v;
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="absolute inset-y-0 left-0 bg-white/60" style={{ width: `${volume * 100}%` }}></div>
                        </div>
                    </div>
                    <button className="hidden md:block material-icons-round text-gray-400 hover:text-white transition">queue_music</button>
                </div>
            </div>
        </div>
    );
}
