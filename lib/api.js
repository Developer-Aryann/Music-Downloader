const BASE_URL = "https://saavn.sumit.co/api";

export const decodeHtml = (html) => {
    if (!html) return '';
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

export const api = {
    // Global search
    searchAll: async (query, limit = 20) => {
        const res = await fetch(`${BASE_URL}/search?query=${query}&limit=${limit}`);
        return res.json();
    },

    // Songs search
    searchSongs: async (query, page = 1, limit = 20) => {
        const res = await fetch(`${BASE_URL}/search/songs?query=${query}&page=${page}&limit=${limit}`);
        return res.json();
    },

    // Albums search
    searchAlbums: async (query, page = 1, limit = 20) => {
        const res = await fetch(`${BASE_URL}/search/albums?query=${query}&page=${page}&limit=${limit}`);
        return res.json();
    },

    // Artists search
    searchArtists: async (query, page = 1, limit = 20) => {
        const res = await fetch(`${BASE_URL}/search/artists?query=${query}&page=${page}&limit=${limit}`);
        return res.json();
    },

    // Playlists search
    searchPlaylists: async (query, page = 1, limit = 20) => {
        const res = await fetch(`${BASE_URL}/search/playlists?query=${query}&page=${page}&limit=${limit}`);
        return res.json();
    },

    // Get details
    getSongDetails: async (id) => {
        const res = await fetch(`${BASE_URL}/songs?ids=${id}`);
        return res.json();
    },

    getAlbumDetails: async (id) => {
        const res = await fetch(`${BASE_URL}/albums?id=${id}`);
        return res.json();
    },

    getPlaylistDetails: async (id) => {
        const res = await fetch(`${BASE_URL}/playlists?id=${id}`);
        return res.json();
    },

    getArtistDetails: async (id) => {
        const res = await fetch(`${BASE_URL}/artists?id=${id}`);
        return res.json();
    },

    getArtistSongs: async (id, page = 1) => {
        const res = await fetch(`${BASE_URL}/artists/${id}/songs?page=${page}`);
        return res.json();
    },

    getArtistAlbums: async (id, page = 1) => {
        const res = await fetch(`${BASE_URL}/artists/${id}/albums?page=${page}`);
        return res.json();
    },
};
