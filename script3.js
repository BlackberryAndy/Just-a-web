document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. DỮ LIỆU MẪU (DATA SAMPLE)
  // ==========================================
  let playlistData = [
    {
      id: 1,
      title: "Vintage Melody",
      artist: "Artist A",
      desc: "Giai điệu hoài niệm phong cách cổ điển.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      coverUrl: "https://picsum.photos/id/1018/100/100",
      content: `<h2>Vintage Melody</h2><p><strong>Tác giả:</strong> Artist A</p><hr style="margin:10px 0; border-color: #8c7662"><p>Một bài hát mang đậm hơi thở thập niên 80, mở đầu bằng tiếng guitar mộc mạc và âm thanh rè nhẹ của đĩa than.</p>`
    },
    {
      id: 2,
      title: "Retro Journal Track",
      artist: "Artist B",
      desc: "Nhạc nền hoàn hảo cho buổi chiều đọc sách.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      coverUrl: "https://picsum.photos/id/1025/100/100",
      content: `<h2>Retro Journal Track</h2><p><strong>Tác giả:</strong> Artist B</p><hr style="margin:10px 0; border-color: #8c7662"><p>Những nốt piano êm dịu giúp bạn thả hồn vào từng trang nhật ký cũ.</p>`
    },
    {
      id: 3,
      title: "Acoustic Memories",
      artist: "Artist C",
      desc: "Tiếng đàn guitar nhẹ nhàng và ấm áp.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      coverUrl: "https://picsum.photos/id/1069/100/100",
      content: `<h2>Acoustic Memories</h2><p><strong>Tác giả:</strong> Artist C</p><hr style="margin:10px 0; border-color: #8c7662"><p>Giai điệu mộc mạc, lưu giữ những ký ức đẹp đẽ nhất của thời thanh xuân.</p>`
    }
  ];

  let currentTrackIndex = 0;
  let isPlaying = false;
  const audio = new Audio();

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
  // 3. TRÌNH PHÁT NHẠC (MUSIC PLAYER)
  // ==========================================
  function loadTrack(index) {
    if (playlistData.length === 0) {
      // Khi playlist trống
      audio.src = "";
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

    audio.src = track.audioUrl;
    songTitleEl.textContent = track.title;
    songArtistEl.textContent = track.artist;

    // Cập nhật ảnh bìa đĩa than
    if (track.coverUrl) {
      vinylCover.innerHTML = `<img src="${track.coverUrl}" alt="cover" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      vinylCover.textContent = "Cover";
    }

    // Cập nhật khung đọc sách/truyện
    readerContainer.innerHTML = `<div style="padding: 20px; text-align: left; width: 100%; color: #f4f1ea;">${track.content}</div>`;

    renderPlaylist();
    progressFill.style.width = "0%";
    currentTimeEl.textContent = "00:00";
    durationEl.textContent = "00:00";
  }

  function playTrack() {
    if (playlistData.length === 0) return;
    audio.play().then(() => {
      isPlaying = true;
      vinylRecord.classList.add("vinyl-spinning");
    }).catch(err => console.log("Lỗi khi phát audio:", err));
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    vinylRecord.classList.remove("vinyl-spinning");
  }

  playBtn.addEventListener("click", () => {
    if (!audio.src && playlistData.length > 0) loadTrack(0);
    playTrack();
  });

  pauseBtn.addEventListener("click", pauseTrack);

  // Tiến trình bài hát
  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(audio.currentTime);
      durationEl.textContent = formatTime(audio.duration);
    }
  });

  // Chuyển bài khi hết nhạc
  audio.addEventListener("ended", () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlistData.length;
    loadTrack(currentTrackIndex);
    playTrack();
  });

  // Click tua nhạc
  progressBar.addEventListener("click", (e) => {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (duration) {
      audio.currentTime = (clickX / width) * duration;
    }
  });

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  // ==========================================
  // 4. HIỂN THỊ & XÓA BÀI HÁT PLAYLIST
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

      li.innerHTML = `
        <div class="item-thumbnail">${thumbHtml}</div>
        <div class="item-details">
          <div class="item-title">${item.title}</div>
          <div class="item-author">${item.artist}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <button class="delete-item-btn" title="Xóa khỏi playlist">✕</button>
      `;

      // Event click vào dòng để phát bài đó
      li.addEventListener("click", (e) => {
        // Nếu click vào nút xóa thì không kích hoạt phát nhạc
        if (e.target.classList.contains("delete-item-btn")) return;
        loadTrack(originalIndex);
        playTrack();
      });

      // Event click nút Xóa bài hát
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
    
    // Xóa item khỏi mảng
    playlistData.splice(index, 1);

    if (playlistData.length === 0) {
      loadTrack(0);
    } else if (isCurrentPlaying) {
      // Nếu xóa bài đang phát, phát bài liền sau (hoặc quay lại bài 0)
      const nextIndex = index >= playlistData.length ? 0 : index;
      loadTrack(nextIndex);
      if (isPlaying) playTrack();
    } else {
      // Nếu xóa bài phía trước bài đang phát, điều chỉnh lại index bài hiện tại
      if (index < currentTrackIndex) {
        currentTrackIndex--;
      }
      renderPlaylist();
    }
  }

  // Thêm Playlist Mới
  addPlaylistBtn.addEventListener("click", () => {
    const title = prompt("Nhập tên truyện / bài hát mới:");
    if (!title) return;
    const artist = prompt("Nhập tên tác giả / ca sĩ:", "Unknown Artist");
    const desc = prompt("Nhập mô tả ngắn:", "Mô tả ngắn...");
    const content = prompt("Nhập nội dung hiển thị trong khung đọc (HTML/Văn bản):", `<h2>${title}</h2><p>${desc}</p>`);

    const newItem = {
      id: Date.now(),
      title: title,
      artist: artist || "Unknown Artist",
      desc: desc || "",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      coverUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 50) + 10}/100/100`,
      content: content || `<h2>${title}</h2><p>Chưa có nội dung chi tiết.</p>`
    };

    playlistData.push(newItem);
    renderPlaylist();
    
    // Nếu là bài đầu tiên thêm vào
    if (playlistData.length === 1) {
      loadTrack(0);
    }
  });

  // ==========================================
  // 5. TÌM KIẾM (SEARCH)
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
  // 6. ĐÁNH GIÁ SAO TƯƠNG TÁC (INTERACTIVE RATING)
  // ==========================================
  let currentRating = 0;
  const stars = starRating.querySelectorAll(".star");
  const ratingLabels = [
    "Rất tệ", 
    "Tạm được", 
    "Bình thường", 
    "Rất tốt", 
    "Tuyệt vời!"
  ];

  stars.forEach((star) => {
    // Rê chuột vào sao
    star.addEventListener("mouseenter", () => {
      const val = parseInt(star.dataset.value);
      highlightStars(val, "hover");
      ratingText.textContent = ratingLabels[val - 1];
    });

    // Rê chuột ra khỏi khu vực sao
    star.addEventListener("mouseleave", () => {
      clearHoverStars();
      highlightStars(currentRating, "active");
      ratingText.textContent = currentRating > 0 
        ? `Đã đánh giá: ${currentRating}/5 sao (${ratingLabels[currentRating - 1]})` 
        : "Đánh giá trải nghiệm bằng sao";
    });

    // Click chọn số sao
    star.addEventListener("click", () => {
      currentRating = parseInt(star.dataset.value);
      highlightStars(currentRating, "active");
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
  // 7. CÁC TÍNH NĂNG KHÁC (Avatar User)
  // ==========================================
  addUserBtn.addEventListener("click", () => {
    const newAvatarUrl = prompt("Nhập URL hình ảnh Avatar của bạn:");
    if (newAvatarUrl) {
      userAvatar.innerHTML = `<img src="${newAvatarUrl}" style="width:100%;height:100%;object-fit:cover;">`;
    }
  });

  // Khởi tạo trạng thái ứng dụng ban đầu
  loadTrack(0);
});