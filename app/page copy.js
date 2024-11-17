"use client";
import { useState, useRef, useEffect } from "react";
import debounce from "lodash.debounce";

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioRef = useRef(null);

  const handleDownload = (songUrl) => {
    const a = document.createElement("a");
    a.href = songUrl;
    a.download = songUrl.split("/").pop();
    a.click();
  };

  // Debounced search function
  const handleSearch = debounce(async (e) => {
    const query = encodeURIComponent(e.target.value.trim());
    if (!query) {
      setSongs([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://jiosavan-coderaryan.vercel.app/search?query=${query}`
      );
      const data = await response.json();
      if (data.status && data.results) {
        setSongs(data.results);
      } else {
        setSongs([]);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, 500);

  const handlePlay = (song) => {
    if (currentSong?.id === song.id && isPlaying) {
      setIsPlaying(false);
      audioRef.current.pause(); // Pause the song
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setShowPlayer(true);
      audioRef.current.src = song.audio_url; // Set the audio source
      audioRef.current.play(); // Start playing the selected song
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setShowPlayer(false);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("ended", handleAudioEnd);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleAudioEnd);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0F172A] text-[#F8FAFC]">
      {/* Top Navigation */}
      <header className="hidden sm:flex items-center justify-between px-4 sm:px-8 py-4 bg-[#1E293B] shadow-md">
        <h1 className="text-xl font-bold text-[#F8FAFC]">Music Downloader</h1>
        <input
          className="p-3 w-full max-w-sm bg-[#334155] rounded-lg border border-[#475569] focus:ring-2 focus:ring-[#38BDF8] focus:outline-none"
          type="text"
          placeholder="Search your favorite music"
          onKeyUp={handleSearch}
        />
      </header>

      {/* Main Section */}
      <main className="flex flex-col items-center justify-center flex-grow p-4 sm:p-8">
        <h1 className="text-2xl sm:hidden font-bold text-[#E2E8F0] mb-4">
          Music Downloader
        </h1>
        <input
          className="p-3 w-full max-w-md bg-[#1E293B] rounded-lg border border-[#475569] focus:ring-2 focus:ring-[#38BDF8] focus:outline-none sm:hidden"
          type="text"
          placeholder="Search your favorite music"
          onKeyUp={handleSearch}
        />
        {songs.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition cursor-pointer relative"
              >
                <img
                  src={song.thumbnail}
                  alt={song.name}
                  className="w-full aspect-square object-cover rounded-md mb-4"
                />
                <h3 className="font-semibold truncate">{song.name}</h3>
                <p className="text-sm text-gray-400 truncate">
                  {song.primaryArtists}
                </p>

                {/* Play/Pause button (visible on hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePlay(song)}
                    className="text-white bg-[#1DB954] p-3 rounded-full hover:bg-[#1ed760] transition-all"
                  >
                    {currentSong?.id === song.id && isPlaying ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM112,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"></path>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 5v14l11-7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-8">
            <p className="text-[#94A3B8]">
              No songs found. Start typing to search!
            </p>
            <p className="text-[#94A3B8] mt-2">
              <code>
                <a href="https://telegam.dog/coderaryan">
                  <u>Created by Coderaryan</u>
                </a>
              </code>
            </p>
          </div>
        )}
      </main>

      {/* Bottom Music Player */}
      {showPlayer && currentSong && (
        <footer className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 bg-[#1E293B] rounded-full shadow-lg flex flex-col items-center px-4 py-2">
          {/* Music Player Steak bar */}
          <div className="flex items-center gap-2 justify-between w-[98%] mb-3">
            <span className="text-xs text-zinc-400">2:14</span>
            <div className="h-1 rounded-full w-full bg-zinc-600">
              <div className="bg-white w-40 h-1 rounded-full"></div>
            </div>
            <span className="text-xs text-zinc-400">3:45</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                  audioRef.current.pause();
                } else {
                  setIsPlaying(true);
                  audioRef.current.play();
                }
              }}
              className="text-[#CBD5E1] hover:text-[#38BDF8] transition"
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM112,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 sm:w-8 sm:h-8"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <div className="ml-4 flex-1">
              <h4 className="text-sm sm:text-base font-semibold text-[#F8FAFC]">
                {currentSong.name}
              </h4>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                {currentSong.primaryArtists}
              </p>
            </div>

            <button
              onClick={() => handleDownload(currentSong.audio_url)}
              className="px-4 py-2 text-sm sm:text-base bg-[#38BDF8] text-white hover:bg-[#0284C7] transition rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                fill="#000000"
                viewBox="0 0 256 256"
              >
                <path d="M248,128a87.34,87.34,0,0,1-17.6,52.81,8,8,0,1,1-12.8-9.62A71.34,71.34,0,0,0,232,128a72,72,0,0,0-144,0,8,8,0,0,1-16,0,88,88,0,0,1,3.29-23.88C74.2,104,73.1,104,72,104a48,48,0,0,0,0,96H96a8,8,0,0,1,0,16H72A64,64,0,1,1,81.29,88.68,88,88,0,0,1,248,128Zm-69.66,42.34L160,188.69V128a8,8,0,0,0-16,0v60.69l-18.34-18.35a8,8,0,0,0-11.32,11.32l32,32a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Z"></path>
              </svg>
            </button>
          </div>
        </footer>
      )}

      {/* Audio Player */}
      <audio ref={audioRef} onEnded={handleAudioEnd} />
    </div>
  );
}
