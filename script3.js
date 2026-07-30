document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. DỮ LIỆU MẪU & LOCAL STORAGE
  // ==========================================
  const STORAGE_KEY_PLAYLIST = "retro_reader_playlist_v1";
  const STORAGE_KEY_RATING = "retro_reader_rating_v1";
  const STORAGE_KEY_AVATAR = "retro_reader_avatar_v1";

  const defaultPlaylist = [
    {
      id: 1,
      title: "Vintage Melody",
      artist: "Artist A",
      desc: "Giai điệu hoài niệm phong cách cổ điển.",
      youtubeUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
      storyUrl: "https://truyenfull.vn/",
      coverUrl: "https://picsum.photos/id/1018/100/100",
      content: `<h2>Vintage Melody</h2><p><strong>Tác giả:</strong> Artist A</p><hr style="margin:10px 0; border-color: #8c7662"><p>Một bài hát mang đậm hơi thở thập niên 80, mở đầu bằng tiếng guitar mộc mạc.</p>`
    },
    {
      id: 2,
      title: "Retro Journal Track",
      artist: "Artist B",
      desc: "Nhạc nền hoàn hảo cho buổi chiều đọc sách.",
      youtubeUrl: "https://www.youtube.com/watch?v=DWcJFNfaw9c",
      storyUrl: "https://metruyencv.com/",
      coverUrl: "https://picsum.photos/id/1025/100/100",
      content: `<h2>Retro Journal Track</h2><p><strong>Tác giả:</strong> Artist B</p><hr style="margin:10px 0; border-color: #8c7662"><p>Những nốt piano êm dịu giúp bạn thả hồn vào từng trang nhật ký cũ.</p>`
    }
  ];

  // Lấy dữ liệu từ LocalStorage hoặc dùng dữ liệu mặc định
  let playlistData = JSON.parse(localStorage.getItem(STORAGE_KEY_PLAYLIST)) || defaultPlaylist;
  let savedRating = parseInt(localStorage.getItem(STORAGE_KEY_RATING)) || 0;
  let savedAvatar = localStorage.getItem(STORAGE_KEY_AVATAR) || "";

  function saveData() {
    localStorage.setItem(STORAGE_KEY_PLAYLIST, JSON.stringify(playlistData));
  }

  let currentTrackIndex = 0;
  let isPlaying = false;

  // ==========================================
  // 2. DOM ELEMENTS
  // ==========================================
  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const vinylRecord = document.getElementById("vinyl-record");
  const vinylCover = document.getElementById("vinyl-cover");
  const songTitleEl = document.getElementById("song-title");
  const songArtistEl = document.getElementById("song-artist");
  const progressBar = document.getElementById("progress-bar");
  const progressFill = document.getElementById("progress-fill");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");

  const readerContainer = document.getElementById("reader-container");
  const playlistList = document.getElementById("playlist-list");
  const addPlaylistBtn = document.getElementById("add-playlist-btn");

  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-btn");

  const starRating = document.getElementById("star-rating");
  const ratingText = document.getElementById("rating-text");
  const userAvatar = document.getElementById("user-avatar");
  const addUserBtn = document.getElementById("add-user-btn");

  // ==========================================
  // 3. TÍCH HỢP YOUTUBE IFRAME PLAYER (PHÁT NỀN)
  // ==========================================
  let ytPlayer = null;
  let progressInterval = null;

  // Trích xuất Video ID từ các định dạng URL YouTube khác nhau
  function extractYouTubeID(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // Khởi tạo YouTube API Script
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Tạo phần tử đệm cho player nếu chưa có
  let ytDiv = document.getElementById("youtube-player");
  if (!ytDiv) {
    ytDiv = document.createElement("div");
    ytDiv.id = "youtube-player";
    ytDiv.style.display = "none";
    document.body.appendChild(ytDiv);
  }

  window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtube-player', {
      height: '0',
      width: '0',
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  };

  function onPlayerStateChange(event) {
    // YT.PlayerState.ENDED = 0
    if (event.data === 0) {
      currentTrackIndex = (currentTrackIndex + 1) % playlistData.length;
      loadTrack(currentTrackIndex);
      playTrack();
    }
  }

  // ==========================================
  // 4. TRÌNH PHÁT NHẠC (MUSIC PLAYER)
  // ==========================================
  function loadTrack(index) {
    if (playlistData.length === 0) {
      if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
      songTitleEl.textContent = "Không có bài hát";
      songArtistEl.textContent = "N/A";
      vinylCover.innerHTML = "Cover";
      readerContainer.innerHTML = `<div class="reader-placeholder-text">Playlist hiện tại đang trống.</div>`;
      progressFill.style.width = "0%";
      currentTimeEl.textContent = "00:00";
      durationEl.textContent = "00:00";
      pauseTrack();
      return;
    }

    if (index < 0) index = 0;
    if (index >= playlistData.length) index = playlistData.length - 1;

    currentTrackIndex = index;
    const track = playlistData[index];

    // Cập nhật YouTube video ID vào Player
    const videoId = extractYouTubeID(track.youtubeUrl);
    if (ytPlayer && ytPlayer.cueVideoById && videoId) {
      ytPlayer.cueVideoById(videoId);
    }

    songTitleEl.textContent = track.title;
    songArtistEl.textContent = track.artist;

    // Cập nhật ảnh bìa đĩa than
    if (track.coverUrl) {
      vinylCover.innerHTML = `<img src="${track.coverUrl}" alt="cover" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      vinylCover.textContent = "Cover";
    }

    // Cập nhật khung đọc truyện & đường link ngoài
    const externalLinkHtml = track.storyUrl 
      ? `<p style="margin-top:15px;"><a href="${track.storyUrl}" target="_blank" style="color: #d4a373; text-decoration: underline;">📖 Đọc truyện gốc tại đây ↗</a></p>` 
      : '';

    readerContainer.innerHTML = `
      <div style="padding: 20px; text-align: left; width: 100%; color: #f4f1ea;">
        ${track.content}
        ${externalLinkHtml}
      </div>`;

    renderPlaylist();
    progressFill.style.width = "0%";
    currentTimeEl.textContent = "00:00";
    durationEl.textContent = "00:00";
  }

  function playTrack() {
    if (playlistData.length === 0) return;
    const track = playlistData[currentTrackIndex];
    const videoId = extractYouTubeID(track.youtubeUrl);

    if (ytPlayer && ytPlayer.playVideo) {
      if (videoId && ytPlayer.getVideoData && ytPlayer.getVideoData().video_id !== videoId) {
        ytPlayer.loadVideoById(videoId);
      } else {
        ytPlayer.playVideo();
      }
      isPlaying = true;
      vinylRecord.classList.add("vinyl-spinning");
      startProgressTimer();
    }
  }

  function pauseTrack() {
    if (ytPlayer && ytPlayer.pauseVideo) {
      ytPlayer.pauseVideo();
    }
    isPlaying = false;
    vinylRecord.classList.remove("vinyl-spinning");
    clearInterval(progressInterval);
  }

  playBtn.addEventListener("click", () => {
    playTrack();
  });

  pauseBtn.addEventListener("click", pauseTrack);

  // Tiến trình bài hát từ YouTube
  function startProgressTimer() {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (ytPlayer && ytPlayer.getCurrentTime && isPlaying) {
        const current = ytPlayer.getCurrentTime();
        const total = ytPlayer.getDuration();
        if (total > 0) {
          const progressPercent = (current / total) * 100;
          progressFill.style.width = `${progressPercent}%`;
          currentTimeEl.textContent = formatTime(current);
          durationEl.textContent = formatTime(total);
        }
      }
    }, 1000);
  }

  // Click tua nhạc trên thanh tiến trình
  progressBar.addEventListener("click", (e) => {
    if (!ytPlayer || !ytPlayer.getDuration) return;
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = ytPlayer.getDuration();
    if (duration) {
      const seekTime = (clickX / width) * duration;
      ytPlayer.seekTo(seekTime, true);
    }
  });

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  // ==========================================
  // 5. HIỂN THỊ & XÓA BÀI HÁT PLAYLIST
  // ==========================================
  function renderPlaylist(items = playlistData) {
    playlistList.innerHTML = "";

    if (items.length === 0) {
      playlistList.innerHTML = `<li style="text-align:center; padding:15px; opacity:0.7;">Playlist trống</li>`;
      return;
    }

    items.forEach((item) => {
      const originalIndex = playlistData.findIndex(p => p.id === item.id);
      const li = document.createElement("li");
      li.className = `playlist-item ${originalIndex === currentTrackIndex ? 'active' : ''}`;
      
      const thumbHtml = item.coverUrl 
        ? `<img src="${item.coverUrl}" style="width:100%;height:100%;object-fit:cover;">`
        : `<div class="item-thumbnail">No Cover</div>`;

      const linkBtn = item.storyUrl 
        ? `<a href="${item.storyUrl}" target="_blank" class="story-link-btn" title="Chuyển đến trang truyện" onclick="event.stopPropagation();">🔗</a>` 
        : '';

      li.innerHTML = `
        <div class="item-thumbnail">${thumbHtml}</div>
        <div class="item-details">
          <div class="item-title">${item.title} ${linkBtn}</div>
          <div class="item-author">${item.artist}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <button class="delete-item-btn" title="Xóa khỏi playlist">✕</button>
      `;

      // Click vào dòng để phát bài đó
      li.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-item-btn") || e.target.classList.contains("story-link-btn")) return;
        loadTrack(originalIndex);
        playTrack();
      });

      // Click nút Xóa bài hát
      const deleteBtn = li.querySelector(".delete-item-btn");
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTrack(originalIndex);
      });

      playlistList.appendChild(li);
    });
  }

  function deleteTrack(index) {
    const isCurrentPlaying = (index === currentTrackIndex);
    
    playlistData.splice(index, 1);
    saveData(); // Lưu lại thay đổi vào LocalStorage

    if (playlistData.length === 0) {
      loadTrack(0);
    } else if (isCurrentPlaying) {
      const nextIndex = index >= playlistData.length ? 0 : index;
      loadTrack(nextIndex);
      if (isPlaying) playTrack();
    } else {
      if (index < currentTrackIndex) {
        currentTrackIndex--;
      }
      renderPlaylist();
    }
  }

  // Thêm Playlist Mới (Cho phép điền Link YouTube + Link Website Truyện)
  addPlaylistBtn.addEventListener("click", () => {
    const title = prompt("Nhập tên truyện / bài hát mới:");
    if (!title) return;
    const artist = prompt("Nhập tên tác giả / ca sĩ:", "Unknown Artist");
    const desc = prompt("Nhập mô tả ngắn:", "Mô tả ngắn...");
    const youtubeUrl = prompt("Nhập link YouTube (để phát nhạc nền):", "https://www.youtube.com/watch?v=5qap5aO4i9A");
    const storyUrl = prompt("Nhập URL trang web chứa truyện (để dẫn liên kết ngoài):", "https://");
    const content = prompt("Nhập nội dung ngắn/trích dẫn hiển thị trong khung đọc:", `<h2>${title}</h2><p>${desc}</p>`);

    const newItem = {
      id: Date.now(),
      title: title,
      artist: artist || "Unknown Artist",
      desc: desc || "",
      youtubeUrl: youtubeUrl || "",
      storyUrl: storyUrl || "",
      coverUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 50) + 10}/100/100`,
      content: content || `<h2>${title}</h2><p>Chưa có nội dung chi tiết.</p>`
    };

    playlistData.push(newItem);
    saveData(); // Lưu ngay vào bộ nhớ
    renderPlaylist();
    
    if (playlistData.length === 1) {
      loadTrack(0);
    }
  });

  // ==========================================
  // 6. TÌM KIẾM (SEARCH)
  // ==========================================
  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    const filtered = playlistData.filter(item => 
      item.title.toLowerCase().includes(keyword) || 
      item.artist.toLowerCase().includes(keyword)
    );
    renderPlaylist(filtered);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    renderPlaylist(playlistData);
  });

  // ==========================================
  // 7. ĐÁNH GIÁ SAO TƯƠNG TÁC (CÓ LƯU TRẠNG THÁI)
  // ==========================================
  let currentRating = savedRating;
  const stars = starRating.querySelectorAll(".star");
  const ratingLabels = ["Rất tệ", "Tạm được", "Bình thường", "Rất tốt", "Tuyệt vời!"];

  function applyRatingUI(val) {
    highlightStars(val, "active");
    ratingText.textContent = val > 0 
      ? `Đã đánh giá: ${val}/5 sao (${ratingLabels[val - 1]})` 
      : "Đánh giá trải nghiệm bằng sao";
  }

  stars.forEach((star) => {
    star.addEventListener("mouseenter", () => {
      const val = parseInt(star.dataset.value);
      highlightStars(val, "hover");
      ratingText.textContent = ratingLabels[val - 1];
    });

    star.addEventListener("mouseleave", () => {
      clearHoverStars();
      applyRatingUI(currentRating);
    });

    star.addEventListener("click", () => {
      currentRating = parseInt(star.dataset.value);
      localStorage.setItem(STORAGE_KEY_RATING, currentRating);
      applyRatingUI(currentRating);
      ratingText.textContent = `Cảm ơn bạn đã đánh giá ${currentRating}/5 sao!`;
    });
  });

  function highlightStars(count, className) {
    stars.forEach((s) => {
      const val = parseInt(s.dataset.value);
      if (val <= count) {
        s.classList.add(className);
      } else if (className === "hover") {
        s.classList.remove("hover");
      } else {
        s.classList.remove("active");
      }
    });
  }

  function clearHoverStars() {
    stars.forEach(s => s.classList.remove("hover"));
  }

  // ==========================================
  // 8. CÁC TÍNH NĂNG KHÁC (Avatar User)
  // ==========================================
  if (savedAvatar) {
    userAvatar.innerHTML = `<img src="${savedAvatar}" style="width:100%;height:100%;object-fit:cover;">`;
  }

  addUserBtn.addEventListener("click", () => {
    const newAvatarUrl = prompt("Nhập URL hình ảnh Avatar của bạn:");
    if (newAvatarUrl) {
      userAvatar.innerHTML = `<img src="${newAvatarUrl}" style="width:100%;height:100%;object-fit:cover;">`;
      localStorage.setItem(STORAGE_KEY_AVATAR, newAvatarUrl);
    }
  });

  // Khởi tạo trạng thái ban đầu
  applyRatingUI(currentRating);
  loadTrack(0);
});