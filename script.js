let player;
let isPlaying = false;
let progressInterval;

// Key lưu trữ trong localStorage
const STORAGE_KEY = 'yt_player_state';

// 1. Tối ưu Regex hỗ trợ đầy đủ các dạng link
function getYouTubeVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[1].length === 11) ? match[1] : null;
}

// 2. Lưu trạng thái hiện tại vào LocalStorage
function savePlayerState() {
  if (!player || typeof player.getVideoData !== 'function') return;
  
  const videoData = player.getVideoData();
  const videoId = videoData ? videoData.video_id : null;

  if (videoId) {
    const state = {
      videoId: videoId,
      currentTime: typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : 0,
      isPlaying: isPlaying,
      title: document.getElementById('song-title')?.textContent || "YouTube Audio Track",
      artist: document.getElementById('song-artist')?.textContent || `ID: ${videoId}`
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

// 3. Xử lý trạng thái Player
function onPlayerStateChange(event) {
  const playPauseBtn = document.getElementById('play-pause-btn');

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    if (playPauseBtn) playPauseBtn.textContent = '⏸';
    startProgressBar();
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    isPlaying = false;
    if (playPauseBtn) playPauseBtn.textContent = '▶';
    clearInterval(progressInterval);
  }
  
  savePlayerState();
}

// 4. Khởi tạo YouTube Player API & Khôi phục bài hát đã lưu
function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt-player-container', {
    height: '0',
    width: '0',
    playerVars: {
      'autoplay': 0,
      'controls': 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  // Khôi phục bài hát từ LocalStorage nếu có
  const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (savedState && savedState.videoId) {
    updateUI(savedState.videoId, savedState.title, savedState.artist);
    
    // Nạp lại video và tua tới thời gian cũ
    player.cueVideoById({
      videoId: savedState.videoId,
      startSeconds: savedState.currentTime || 0
    });

    // Nếu trước đó đang phát, tiếp tục phát (Cần tương tác người dùng nếu trình duyệt chặn Autoplay)
    if (savedState.isPlaying) {
      player.playVideo();
    }
  }
}

// 5. Cập nhật giao diện UI
function updateUI(videoId, title, artist) {
  const songTitle = document.getElementById('song-title');
  const songArtist = document.getElementById('song-artist');
  const songCover = document.getElementById('song-cover');

  if (songCover) songCover.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  if (songTitle) songTitle.textContent = title || "YouTube Audio Track";
  if (songArtist) songArtist.textContent = artist || `ID: ${videoId}`;
}

// 6. Cập nhật thanh tiến trình & tự động lưu vị trí phát
function startProgressBar() {
  clearInterval(progressInterval);
  const progressBar = document.getElementById('progress-bar');

  progressInterval = setInterval(() => {
    if (player && typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      
      if (duration > 0 && progressBar) {
        const pct = (currentTime / duration) * 100;
        progressBar.style.width = pct + '%';
      }

      // Lưu lại thời gian phát định kỳ (mỗi 2 giây)
      savePlayerState();
    }
  }, 500);
}

// 7. Lắng nghe sự kiện DOM
document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('yt-url-input');
  const loadBtn = document.getElementById('load-yt-btn');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const likeBtn = document.getElementById('like-btn');

  // Load nhạc mới từ URL YouTube
  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      const videoId = getYouTubeVideoId(url);

      if (!videoId) {
        alert("Đường link YouTube không hợp lệ. Vui lòng kiểm tra lại!");
        return;
      }

      if (!player) {
        alert("Hệ thống phát YouTube chưa sẵn sàng. Vui lòng đợi trong giây lát!");
        return;
      }

      const title = "YouTube Audio Track";
      const artist = `ID: ${videoId}`;

      // Phát video mới từ đầu
      player.loadVideoById(videoId);
      isPlaying = true;
      if (playPauseBtn) playPauseBtn.textContent = '⏸';

      updateUI(videoId, title, artist);
      startProgressBar();

      // Lưu bài nhạc mới vào LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        videoId: videoId,
        currentTime: 0,
        isPlaying: true,
        title: title,
        artist: artist
      }));
    });
  }

  // Nút Play / Pause
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (!player) return;

      if (isPlaying) {
        player.pauseVideo();
        playPauseBtn.textContent = '▶';
        isPlaying = false;
        clearInterval(progressInterval);
      } else {
        player.playVideo();
        playPauseBtn.textContent = '⏸';
        isPlaying = true;
        startProgressBar();
      }
      savePlayerState();
    });
  }

  // Nút Like
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('liked');
    });
  }
});