const MusicPlatforms = ({ spotifyUrl, appleMusicUrl, youtubeMusicUrl, amazonMusicUrl }) => {
  if (!spotifyUrl && !appleMusicUrl && !youtubeMusicUrl && !amazonMusicUrl) return null;

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
      {spotifyUrl && (
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Listen on Spotify"
          className="platform-btn"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Spotify_logo_with_text.svg/1280px-Spotify_logo_with_text.svg.png"
            alt="Spotify"
            className="platform-logo"
            loading="lazy"
            decoding="async"
          />
          <span className="platform-label">Spotify</span>
        </a>
      )}
      {appleMusicUrl && (
        <a
          href={appleMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Listen on Apple Music"
          className="platform-btn"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/960px-Apple_Music_icon.svg.png"
            alt="Apple Music"
            className="platform-logo"
            loading="lazy"
            decoding="async"
          />
          <span className="platform-label">Apple Music</span>
        </a>
      )}
      {youtubeMusicUrl && (
        <a
          href={youtubeMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Listen on YouTube Music"
          className="platform-btn"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/960px-Youtube_Music_icon.svg.png"
            alt="YouTube Music"
            className="platform-logo"
            loading="lazy"
            decoding="async"
          />
          <span className="platform-label">YouTube Music</span>
        </a>
      )}
      {amazonMusicUrl && (
        <a
          href={amazonMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Listen on Amazon Music"
          className="platform-btn"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Amazon_Music_logo.svg"
            alt="Amazon Music"
            className="platform-logo"
            loading="lazy"
            decoding="async"
          />
          <span className="platform-label">Amazon Music</span>
        </a>
      )}
    </div>
  );
};

export default MusicPlatforms;
