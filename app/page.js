"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Player from "@/components/Player";
import TrackItem from "@/components/TrackItem";
import EntityCard from "@/components/EntityCard";
import { api, decodeHtml } from "@/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    songs: [],
    albums: [],
    artists: [],
    playlists: []
  });
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentType, setCurrentType] = useState("songs");
  const [favorites, setFavorites] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', content: null, onConfirm: null });
  const [trendingData, setTrendingData] = useState({ songs: [], page: 1, hasMore: true });
  const [artistData, setArtistData] = useState({ list: [], page: 1, hasMore: true });
  const [loadingMore, setLoadingMore] = useState(false);

  const openModal = (type, title, content, onConfirm = null) => {
    setModal({ isOpen: true, type, title, content, onConfirm });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  // Load from localStorage
  useEffect(() => {
    const savedSong = localStorage.getItem("lastSong");
    const savedResults = localStorage.getItem("lastResults");
    const savedFavorites = localStorage.getItem("favorites");

    if (savedSong) {
      try {
        setCurrentSong(JSON.parse(savedSong));
      } catch (e) { }
    }

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) { }
    }

    const keywords = ["Hindi Hits", "Arijit Singh", "Lofi Hindi", "90s Bollywood", "Trending India", "Romantic Hindi", "New Release"];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        handleSearch(randomKeyword, true);
      }
    } else {
      handleSearch(randomKeyword, true);
    }
  }, []);

  // Fetch Trending/Artists if empty
  useEffect(() => {
    if (activeTab === 'trending' && trendingData.songs.length === 0) {
      fetchTrending(1);
    }
    if (activeTab === 'artists' && artistData.list.length === 0) {
      fetchArtists(1);
    }
  }, [activeTab]);

  const fetchTrending = async (page) => {
    const isInitial = page === 1;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await api.searchSongs("Trending", page, 20);
      const newSongs = data.data?.results || data.results || [];
      setTrendingData(prev => ({
        songs: isInitial ? newSongs : [...prev.songs, ...newSongs],
        page: page,
        hasMore: newSongs.length === 20
      }));
    } catch (error) {
      console.error("Trending fetch failed:", error);
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  };

  const fetchArtists = async (page) => {
    const isInitial = page === 1;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      // Using a generic query for popular artists since there's no "all artists" endpoint
      const data = await api.searchArtists("A", page, 24);
      const newArtists = data.data?.results || data.results || [];
      setArtistData(prev => ({
        list: isInitial ? newArtists : [...prev.list, ...newArtists],
        page: page,
        hasMore: newArtists.length === 24
      }));
    } catch (error) {
      console.error("Artists fetch failed:", error);
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  };

  // Save to localStorage
  useEffect(() => {
    if (currentSong) localStorage.setItem("lastSong", JSON.stringify(currentSong));
  }, [currentSong]);

  useEffect(() => {
    if (results.songs.length > 0) localStorage.setItem("lastResults", JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (song) => {
    if (!song) return;
    setFavorites(prev => {
      const isFav = prev.find(s => s.id === song.id);
      if (isFav) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  };

  const handleSearch = async (searchQuery, keepTab = false) => {
    if (!searchQuery) return;
    setQuery(searchQuery);
    setLoading(true);
    if (!keepTab) setActiveTab("search");

    try {
      // Fetch each category individually to bypass global search limits (which usually return only 3-5 items)
      // This ensures we always get a full list (18+) for every section on Home and Search tabs.
      const [songsRes, albumsRes, artistsRes, playlistsRes] = await Promise.all([
        api.searchSongs(searchQuery, 1, 18),
        api.searchAlbums(searchQuery, 1, 18),
        api.searchArtists(searchQuery, 1, 18),
        api.searchPlaylists(searchQuery, 1, 18)
      ]);

      const songs = songsRes.data?.results || songsRes.results || [];
      const albums = albumsRes.data?.results || albumsRes.results || [];
      const artists = artistsRes.data?.results || artistsRes.results || [];
      const playlists = playlistsRes.data?.results || playlistsRes.results || [];

      setResults({ songs, albums, artists, playlists });
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const playSong = async (song) => {
    // If it's already playing, just toggle
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
      return;
    }

    setLoading(true);
    try {
      let fullSong = song;
      // Always try to fetch full details if downloadUrl is missing or incomplete
      if (!song.downloadUrl || song.downloadUrl.length === 0) {
        const res = await api.getSongDetails(song.id);
        if (res.success || res.status === "SUCCESS") {
          // Handle various API return structures
          const songData = res.data?.[0] || res.data || res.results?.[0];
          if (songData && (songData.downloadUrl || songData.download_url)) {
            fullSong = {
              ...song,
              ...songData,
              downloadUrl: songData.downloadUrl || songData.download_url
            };
          }
        }
      }

      if (fullSong.downloadUrl && fullSong.downloadUrl.length > 0) {
        setCurrentSong(fullSong);
        setIsPlaying(true);

        // Fetch suggestions for the new song
        const suggested = await api.getSuggestions(fullSong.id);
        if (suggested.success || suggested.status === "SUCCESS") {
          const suggestions = suggested.data || suggested.data?.results || [];
          setQueue(suggestions);
        }
      } else {
        console.error("This song cannot be played: No audio URL found", fullSong);
        openModal('info', 'Playback Error', 'Unable to play this song. No audio source available for streaming.');
      }
    } catch (error) {
      console.error("Failed to play song:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntityClick = async (id, type) => {
    setLoading(true);
    try {
      let data;
      if (type === 'album') data = await api.getAlbumDetails(id);
      if (type === 'playlist') data = await api.getPlaylistDetails(id);
      if (type === 'artist') data = await api.getArtistDetails(id);

      if (data.success || data.status === "SUCCESS") {
        const payload = data.data || data;
        const songs = payload.songs || payload.songs?.results || [];
        if (songs.length > 0) {
          setResults(prev => ({ ...prev, songs }));
          setCurrentType("songs");
          setActiveTab("search");
        }
      }
    } catch (error) {
      console.error("Details fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      );
    }

    if (activeTab === "home") {
      return (
        <div className="p-4 md:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Featured Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Discover New Rhythm</h2>
              <button className="text-sm font-bold text-primary hover:text-primary/80 transition flex items-center gap-1" onClick={() => handleSearch('Trending', true)}>
                <span className="material-icons-round text-sm">refresh</span>
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {(results.songs.length > 0 ? results.songs : []).slice(0, 18).map((song) => (
                <EntityCard key={song.id} item={song} type="song" onClick={() => playSong(song)} onInfo={handleInfo} />
              ))}
            </div>
          </section>

          {/* Playlists Section */}
          {results.playlists?.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold">Curated Playlists</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {(results.playlists || []).slice(0, 18).map((playlist) => (
                  <EntityCard key={playlist.id} item={playlist} type="playlist" onClick={() => handleEntityClick(playlist.id, 'playlist')} onInfo={handleInfo} />
                ))}
              </div>
            </section>
          )}

          {/* Albums Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Popular Albums</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {(results.albums.length > 0 ? results.albums : []).slice(0, 18).map((album) => (
                <EntityCard key={album.id} item={album} type="album" onClick={() => handleEntityClick(album.id, 'album')} onInfo={handleInfo} />
              ))}
            </div>
          </section>

          {/* Artists Section */}
          {results.artists?.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold">Top Artists</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {(results.artists || []).slice(0, 18).map((artist) => (
                  <EntityCard
                    key={artist.id}
                    item={artist}
                    type="artist"
                    onClick={() => handleEntityClick(artist.id, 'artist')}
                    onInfo={handleInfo}
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      );
    }

    if (activeTab === "search") {
      return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            {['songs', 'albums', 'artists', 'playlists'].map(type => (
              <button
                key={type}
                onClick={() => setCurrentType(type)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${currentType === type ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {currentType === 'songs' && results.songs.length > 0 && (
            <div className="space-y-1">
              {results.songs.map((song, index) => (
                <TrackItem
                  key={song.id}
                  track={song}
                  index={index}
                  isActive={currentSong?.id === song.id}
                  isPlaying={isPlaying}
                  onPlay={playSong}
                />
              ))}
            </div>
          )}

          {currentType !== 'songs' && results[currentType]?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {results[currentType].map((item) => (
                <EntityCard
                  key={item.id}
                  item={item}
                  type={currentType.slice(0, -1)}
                  onClick={() => handleEntityClick(item.id, currentType.slice(0, -1))}
                  onInfo={handleInfo}
                />
              ))}
            </div>
          )}

          {results[currentType]?.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <span className="material-icons-round text-6xl mb-4">search_off</span>
              <p>No results found for your search.</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "trending") {
      return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Trending Now</h2>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Top Picks for You</span>
          </div>
          <div className="space-y-1">
            {trendingData.songs.map((song, index) => (
              <TrackItem
                key={`${song.id}-${index}`}
                track={song}
                index={index}
                isActive={currentSong?.id === song.id}
                isPlaying={isPlaying}
                onPlay={playSong}
              />
            ))}
          </div>
          {trendingData.hasMore && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => fetchTrending(trendingData.page + 1)}
                disabled={loadingMore}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all flex items-center gap-2"
              >
                {loadingMore && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                {loadingMore ? 'Loading...' : 'Load More Trending'}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "artists") {
      return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Popular Artists</h2>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Global Stars</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {artistData.list.map((artist, index) => (
              <EntityCard
                key={`${artist.id}-${index}`}
                item={artist}
                type="artist"
                onClick={() => handleEntityClick(artist.id, 'artist')}
                onInfo={handleInfo}
              />
            ))}
          </div>
          {artistData.hasMore && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => fetchArtists(artistData.page + 1)}
                disabled={loadingMore}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all flex items-center gap-2"
              >
                {loadingMore && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                {loadingMore ? 'Loading...' : 'Load More Artists'}
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-4 h-full min-h-[60vh]">
        <div className="relative">
          <span className="material-icons-round text-8xl text-primary/20 animate-pulse">music_note</span>
          <span className="material-icons-round absolute inset-0 text-7xl text-primary flex items-center justify-center">auto_awesome</span>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">Your Music Journey</h3>
          <p className="text-gray-400 max-w-xs mt-2 mx-auto">Discover, play, and save your favorite rhythms from around the world.</p>
        </div>
        <button
          onClick={() => setActiveTab('home')}
          className="px-10 py-4 bg-primary text-black font-black rounded-full hover:scale-105 transition-transform mt-6 shadow-xl shadow-primary/20"
        >
          Explore Now
        </button>
      </div>
    )
  };

  const handleNext = () => {
    if (queue.length > 0) {
      const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
      const nextSong = queue[currentIndex + 1] || queue[0];
      playSong(nextSong);
    }
  };

  const handlePrev = () => {
    if (queue.length > 0) {
      const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
      const prevSong = queue[currentIndex - 1] || queue[queue.length - 1];
      playSong(prevSong);
    }
  };

  const handleInfo = (item) => {
    openModal('info', decodeHtml(item.name || item.title || 'Details'), (
      <div className="space-y-4">
        <div className="flex gap-4">
          <img
            src={item.image?.[item.image?.length - 1]?.url || item.image?.[0]?.url}
            className="w-24 h-24 rounded-xl shadow-lg border border-white/10"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{decodeHtml(item.name || item.title)}</h3>
            <p className="text-sm text-gray-400 capitalize">{item.type} • {item.language || item.year || 'Various'}</p>
            {item.primaryArtists && <p className="text-xs text-gray-500 mt-1 line-clamp-2">Artists: {decodeHtml(item.primaryArtists)}</p>}
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</h4>
          <p className="text-sm text-gray-300 leading-relaxed">{decodeHtml(item.description || item.subtitle || 'No additional information available for this item.')}</p>
        </div>
        <div className="flex gap-2">
          {(item.type === 'song' || item.type === 'album') && (
            <button
              onClick={() => { playSong(item); closeModal(); }}
              className="flex-1 py-3 bg-primary text-black font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Play Now
            </button>
          )}
          <button
            onClick={closeModal}
            className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans select-none">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Global Modal / Popup */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-md glass border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {modal.title}
              </h2>
              <button onClick={closeModal} className="material-icons-round text-gray-500 hover:text-white transition">close</button>
            </div>

            <div className="text-gray-300">
              {typeof modal.content === 'string' ? (
                <p className="text-sm leading-relaxed">{modal.content}</p>
              ) : modal.content}
            </div>

            {modal.type === 'confirm' && (
              <div className="flex gap-3 mt-8">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { modal.onConfirm(); closeModal(); }}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-surface/50 to-black">
        {/* Background Watermark */}
        <div className="fixed bottom-32 -right-8 rotate-90 pointer-events-none select-none opacity-[0.02] hidden lg:block">
          <span className="text-8xl font-black text-white whitespace-nowrap tracking-tighter">CODERARYAN</span>
        </div>

        <Header
          onSearch={handleSearch}
          toggleSidebar={() => setIsSidebarOpen(true)}
          openModal={openModal}
        />

        <main className={`flex-1 overflow-y-auto no-scrollbar scroll-smooth transition-all duration-500 ${currentSong ? 'pb-80 md:pb-48' : 'pb-20'}`}>
          {renderContent()}
        </main>

        <Player
          currentSong={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onNext={handleNext}
          onPrev={handlePrev}
          isFavorite={favorites.some(s => s.id === currentSong?.id)}
          onToggleFavorite={() => toggleFavorite(currentSong)}
        />
      </div>
    </div>
  );
}
