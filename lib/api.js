const BASE_URL = "https://saavn.sumit.co/api";
const buildUrl = (path, params) => {
    const query = new URLSearchParams(params).toString();
    return `${BASE_URL}${path}${query ? `?${query}` : ""}`;
};

export const decodeHtml = (html) => {
    if (!html) return '';
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

export const api = {
    // Global search
    searchAll: async (query, limit = 20) => {
        const res = await fetch(buildUrl("/search", { query, limit }));
        return res.json();
    },

    // Songs search
    searchSongs: async (query, page = 1, limit = 20) => {
        const res = await fetch(buildUrl("/search/songs", { query, page, limit }));
        return res.json();
    },

    // Albums search
    searchAlbums: async (query, page = 1, limit = 20) => {
        const res = await fetch(buildUrl("/search/albums", { query, page, limit }));
        return res.json();
    },

    // Artists search
    searchArtists: async (query, page = 1, limit = 20) => {
        const res = await fetch(buildUrl("/search/artists", { query, page, limit }));
        return res.json();
    },

    // Playlists search
    searchPlaylists: async (query, page = 1, limit = 20) => {
        const res = await fetch(buildUrl("/search/playlists", { query, page, limit }));
        return res.json();
    },

    // Get details
    getSongDetails: async (id) => {
        const res = await fetch(buildUrl("/songs", { ids: id }));
        return res.json();
    },

    getAlbumDetails: async (id) => {
        const res = await fetch(buildUrl("/albums", { id }));
        return res.json();
    },

    getPlaylistDetails: async (id) => {
        const res = await fetch(buildUrl("/playlists", { id }));
        return res.json();
    },

    getArtistDetails: async (id) => {
        const res = await fetch(buildUrl("/artists", { id }));
        return res.json();
    },

    getArtistSongs: async (id, page = 1) => {
        const res = await fetch(buildUrl(`/artists/${encodeURIComponent(id)}/songs`, { page }));
        return res.json();
    },

    getArtistAlbums: async (id, page = 1) => {
        const res = await fetch(buildUrl(`/artists/${encodeURIComponent(id)}/albums`, { page }));
        return res.json();
    },
};
