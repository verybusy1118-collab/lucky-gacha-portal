document.addEventListener('DOMContentLoaded', () => {
  const setupScreen = document.getElementById('setup-screen');
  const appScreen = document.getElementById('app-screen');
  const setupForm = document.getElementById('setup-form');
  const mapContainer = document.getElementById('map-container');
  const avatar = document.getElementById('avatar');
  const avatarEmoji = document.getElementById('avatar-emoji');
  const btnBack = document.getElementById('btn-back');
  const btnSubmit = document.getElementById('btn-submit');

  let currentUser = {
    name: '',
    desc: '',
    x: 50, // percentage
    y: 50  // percentage
  };

  let isDragging = false;

  // Setup Form Submit
  setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser.name = document.getElementById('user-name').value;
    currentUser.desc = document.getElementById('user-desc').value;

    const groupInput = document.getElementById('group-code') ? document.getElementById('group-code').value.trim() : '';
    currentUser.dateGroup = groupInput || 'default';

    // Pick a cute animal emoji based on the name
    const animals = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐧','🐤','🦆','🦉','🦄','🐝','🐢','🐙','🐬','🐳','🦔','🦦','🦥'];
    let hash = 0;
    for (let i = 0; i < currentUser.name.length; i++) {
      hash = currentUser.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % animals.length;
    avatarEmoji.textContent = animals[index];
    
    // Switch screens
    setupScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    
    // Reset avatar position
    currentUser.x = 50;
    currentUser.y = 50;
    updateAvatarPosition();
    avatar.style.display = 'flex';
  });

  // Back Button
  btnBack.addEventListener('click', () => {
    appScreen.style.display = 'none';
    setupScreen.style.display = 'flex';
  });

  // Drag and Drop Logic
  avatar.addEventListener('mousedown', startDrag);
  avatar.addEventListener('touchstart', startDrag, { passive: false });

  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: false });

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  function startDrag(e) {
    if (e.target.id === 'btn-back' || e.target.id === 'btn-submit') return;
    isDragging = true;
    avatar.classList.add('dragging');
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();

    const rect = mapContainer.getBoundingClientRect();
    
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // Calculate position relative to container
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Constrain within map bounds
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    // Convert to percentage
    currentUser.x = (x / rect.width) * 100;
    currentUser.y = (y / rect.height) * 100;

    updateAvatarPosition();
  }

  function endDrag() {
    if (isDragging) {
      isDragging = false;
      avatar.classList.remove('dragging');
    }
  }

  function updateAvatarPosition() {
    avatar.style.left = `${currentUser.x}%`;
    avatar.style.top = `${currentUser.y}%`;
  }

  // Submit Data
  btnSubmit.addEventListener('click', () => {
    // Determine quadrant color for the badge
    let color = 'gray';
    if (currentUser.x < 50 && currentUser.y < 50) color = 'red';
    if (currentUser.x >= 50 && currentUser.y < 50) color = 'yellow';
    if (currentUser.x < 50 && currentUser.y >= 50) color = 'blue';
    if (currentUser.x >= 50 && currentUser.y >= 50) color = 'green';
    
    currentUser.quadrant = color;
    currentUser.timestamp = new Date().getTime();

    btnSubmit.disabled = true;
    btnSubmit.textContent = '送出中...';
    
    // Save to Firebase Realtime Database
    window.db.ref('emotions_portal').push(currentUser)
      .then(() => {
        // == 發放通關憑證 ==
        localStorage.setItem('cert_dynasty', 'true');

        // Show success and redirect or reset
        alert(`太棒了！你的情緒座標已送出。\n你在 ${
          color === 'red' ? '高能量/低愉悅' : 
          color === 'yellow' ? '高能量/高愉悅' : 
          color === 'blue' ? '低能量/低愉悅' : '低能量/高愉悅'
        } 區塊。`);
        
        // Reset form
        document.getElementById('user-name').value = '';
        document.getElementById('user-desc').value = '';
        btnBack.click();
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
        alert("傳送失敗，請再試一次！");
      });
  });
});
