import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import './App.css';
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recentDownloads, setRecentDownloads] = useState([]);
  const [showFAQ, setShowFAQ] = useState(false);

  const [playlistInfo, setPlaylistInfo] = useState([]);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.body.className = isDarkMode ? 'light' : 'dark';
  };

  const isValidYouTubePlaylist = (link) => {
    return link.includes('youtube.com/playlist?list=');
  };

  const handleGetPlaylistInfo = async () => {
    setStatus('🔍 Fetching playlist info...');
    try {
      const res = await fetch(`${SERVER_URL}/get-playlist-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistUrl: url }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlaylistInfo(data);
        setStatus(`✅ "${data.title}" with ${data.totalItems} videos`);
        toast("Playlist info loaded");
      } else {
        const err = await res.json();
        setStatus(`❌ ${err.error}`);
        toast.error("Failed to load playlist info");
      }
    } catch (err) {
      setStatus('❌ Server error');
      toast.error("Server error");
    }
  };



  const handleDownload = async (customUrl) => {
    const playlistUrl = customUrl || url;
    if (!isValidYouTubePlaylist(playlistUrl)) {
      setStatus('⚠️ Please enter a valid YouTube playlist URL');
      return;
    }

    setStatus('Processing...');
    try {
      const res = await fetch(`${SERVER_URL}/download-playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistUrl }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const zipUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = 'playlist.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();

        setRecentDownloads(prev => [playlistUrl, ...prev.slice(0, 4)]);
        setStatus('✅ Download started!');
      } else {
        const err = await res.json();
        setStatus(`❌ ${err.error}`);
      }
    } catch (err) {
      setStatus('❌ Server error');
    }
  };

  const clearInput = () => {
    setUrl('');
    setStatus('');
  };

  return (
    <div className="app">
      <header className="navbar">
        <h1 className="logo">YouTube Playlist MP3 Downloader</h1>
        <button onClick={toggleTheme} className="theme-switcher">
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      <main className="content">
        <div className="input-area">
          <input
            type="text"
            placeholder="Enter YouTube Playlist URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="copy-btn" onClick={handleGetPlaylistInfo}>Get Playlist Info</button>
          <button onClick={clearInput} className="clear-btn">Clear</button>
        </div>

        <button onClick={() => handleDownload()} className="download-btn">Download</button>
        {status === 'Processing...' && (
          <div className="processing">
            <img src='Hourglass.gif' alt="Processing" className="loader" />
            <p className="message">✨ Hold tight, magic is happening... ✨</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        )}
        {status && <p className="status-msg">{status}</p>}

        {showPlaylist && playlistInfo.length > 0 && (
          <div className="playlist-preview">
            <h3>Playlist Preview</h3>
            <ul>
              {playlistInfo.map((title, idx) => (
                <li key={idx}>{title}</li>
              ))}
            </ul>
          </div>
        )}


        {recentDownloads.length > 0 && (
          <div className="recent">
            <h3>Recent Downloads</h3>
            <ul>
              {recentDownloads.map((link, idx) => (
                <li key={idx}>
                  <a href="" onClick={() => handleDownload(link)}>{link}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="faq">
          <button onClick={() => setShowFAQ(!showFAQ)} className="faq-toggle">
            ❓ How it works
          </button>
          {showFAQ && (
            <div className="faq-content">
              <p>Paste a YouTube playlist URL and hit download.</p>
              <p>The app will fetch the audio and give you a ZIP of MP3 files.</p>
            </div>
          )}
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </main>


      <footer className="footer">
        👉 <a href="https://github.com/ayushmitra06/yt-audio-downloader" target="_blank" rel="noopener noreferrer">View Code on GitHub</a> |
        🚀 Made by <strong>Ayush Mitra</strong> |
        🔗 <a href="https://www.linkedin.com/in/ayushmitra06/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </footer>
    </div>
  );
}

export default App;