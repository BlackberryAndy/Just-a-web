document.addEventListener('DOMContentLoaded', () => {
  
  // 1. CHỌN NGÀY TRONG TUẦN
  const dayDots = document.querySelectorAll('.day-dot');
  dayDots.forEach(dot => {
    dot.addEventListener('click', () => {
      dayDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      saveData();
    });
  });

  // 2. CHỌN MOOD
  const moodEmojis = document.querySelectorAll('.header-emoji');
  moodEmojis.forEach(emoji => {
    emoji.addEventListener('click', () => {
      moodEmojis.forEach(e => e.classList.remove('active'));
      emoji.classList.add('active');
      saveData();
    });
  });

  // 3. TRACKER NƯỚC
  const glasses = document.querySelectorAll('.glass-icon');
  glasses.forEach((glass, index) => {
    glass.addEventListener('click', () => {
      const isFilled = glass.classList.contains('active');
      glasses.forEach((g, idx) => {
        if (idx <= index) {
          if (isFilled && idx === index) g.classList.remove('active');
          else g.classList.add('active');
        } else {
          g.classList.remove('active');
        }
      });
      saveData();
    });
  });

  // 4. XỬ LÝ TẢI HÌNH ẢNH UP LOAD
  const imgInput = document.getElementById('img-input');
  const imgPreview = document.getElementById('image-preview');

  imgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const base64Img = event.target.result;
        imgPreview.innerHTML = `<img src="${base64Img}" alt="Uploaded image">`;
        saveData();
      };
      reader.readAsDataURL(file);
    }
  });

  // 5. TỰ ĐỘNG LƯU VÀO LOCALSTORAGE
  const inputs = document.querySelectorAll('.save-input');
  const checkBoxes = document.querySelectorAll('.save-chk');

  inputs.forEach(input => input.addEventListener('input', saveData));
  checkBoxes.forEach(chk => chk.addEventListener('change', saveData));

  function saveData() {
    const uploadedImg = imgPreview.querySelector('img')?.src || null;

    const data = {
      inputs: Array.from(inputs).map(input => input.value),
      checkboxes: Array.from(checkBoxes).map(chk => chk.checked),
      activeDay: document.querySelector('.day-dot.active')?.dataset.day || null,
      activeMood: document.querySelector('.header-emoji.active')?.dataset.mood || null,
      waterCount: document.querySelectorAll('.glass-icon.active').length,
      image: uploadedImg
    };
    localStorage.setItem('interactive_planner_data', JSON.stringify(data));
  }

  // KHÔI PHỤC DỮ LIỆU KHI TẢI TRANG
  function loadData() {
    const saved = localStorage.getItem('interactive_planner_data');
    if (!saved) return;

    const data = JSON.parse(saved);

    if (data.inputs) {
      inputs.forEach((input, index) => {
        if (data.inputs[index] !== undefined) input.value = data.inputs[index];
      });
    }

    if (data.checkboxes) {
      checkBoxes.forEach((chk, index) => {
        if (data.checkboxes[index] !== undefined) chk.checked = data.checkboxes[index];
      });
    }

    if (data.activeDay) {
      dayDots.forEach(d => {
        if (d.dataset.day === data.activeDay) d.classList.add('active');
      });
    }

    if (data.activeMood) {
      moodEmojis.forEach(e => {
        if (e.dataset.mood === data.activeMood) e.classList.add('active');
      });
    }

    if (data.waterCount) {
      glasses.forEach((g, idx) => {
        if (idx < data.waterCount) g.classList.add('active');
      });
    }

    if (data.image) {
      imgPreview.innerHTML = `<img src="${data.image}" alt="Uploaded image">`;
    }
  }

  loadData();
});

// Hàm Xóa toàn bộ dữ liệu làm lại
function clearPlanner() {
  if (confirm("Bạn có chắc chắn muốn xóa hết nội dung để bắt đầu ngày mới không?")) {
    localStorage.removeItem('interactive_planner_data');
    location.reload();
  }
}