document.addEventListener('DOMContentLoaded', () => {
  const dashboardMap = document.getElementById('dashboard-map');
  const btnClear = document.getElementById('btn-clear');
  const modalOverlay = document.getElementById('details-modal');
  const closeModal = document.getElementById('close-modal');
  const modalList = document.getElementById('modal-list');
  const modalTitle = document.getElementById('modal-title');

  // Load and cluster data
  function renderDashboard(dataArray) {
    // Clear existing bubbles
    document.querySelectorAll('.heatmap-bubble').forEach(b => b.remove());

    if (!dataArray || dataArray.length === 0) return;

    // Clustering logic: Group points that are within a 5% radius of each other
    const clusters = [];
    const radius = 8; // 8% distance

    dataArray.forEach(point => {
      let addedToCluster = false;
      for (let cluster of clusters) {
        const dx = cluster.x - point.x;
        const dy = cluster.y - point.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist <= radius) {
          cluster.points.push(point);
          // Recalculate centroid
          cluster.x = cluster.points.reduce((sum, p) => sum + p.x, 0) / cluster.points.length;
          cluster.y = cluster.points.reduce((sum, p) => sum + p.y, 0) / cluster.points.length;
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        clusters.push({
          x: point.x,
          y: point.y,
          points: [point]
        });
      }
    });

    // Render clusters
    clusters.forEach(cluster => {
      const count = cluster.points.length;
      
      // Determine base color based on quadrant of the centroid
      let color = '#94a3b8'; // default
      let bgColor = 'rgba(148, 163, 184, 0.6)';
      if (cluster.x < 50 && cluster.y < 50) { color = '#ef4444'; bgColor = 'rgba(239, 68, 68, 0.6)'; } // red
      if (cluster.x >= 50 && cluster.y < 50) { color = '#eab308'; bgColor = 'rgba(234, 179, 8, 0.6)'; } // yellow
      if (cluster.x < 50 && cluster.y >= 50) { color = '#3b82f6'; bgColor = 'rgba(59, 130, 246, 0.6)'; } // blue
      if (cluster.x >= 50 && cluster.y >= 50) { color = '#22c55e'; bgColor = 'rgba(34, 197, 94, 0.6)'; } // green

      // Scale bubble size based on count (min 30px, max 100px)
      const baseSize = 30;
      const sizeMultiplier = 15;
      const size = Math.min(100, baseSize + (count - 1) * sizeMultiplier);

      const bubble = document.createElement('div');
      bubble.className = 'heatmap-bubble';
      bubble.style.left = `${cluster.x}%`;
      bubble.style.top = `${cluster.y}%`;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.backgroundColor = bgColor;
      bubble.style.boxShadow = `0 0 15px ${color}`;
      bubble.textContent = count;
      
      // On click, show details
      bubble.addEventListener('click', () => {
        showModal(cluster.points, color);
      });

      dashboardMap.appendChild(bubble);
    });
  }

  function showModal(points, color) {
    modalTitle.textContent = `æ­¤å??Ÿå…±??${points.length} äºº`;
    modalTitle.style.color = color;
    
    modalList.innerHTML = '';
    points.forEach(p => {
      const card = document.createElement('div');
      card.className = 'participant-card';
      card.style.borderLeftColor = color;
      
      const time = new Date(p.timestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'});
      
      card.innerHTML = `
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <p style="font-size: 0.75rem; margin-top: 0.5rem; opacity: 0.6;">${time}</p>
      `;
      modalList.appendChild(card);
    });

    modalOverlay.classList.add('active');
  }

  closeModal.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  // Close modal when clicking outside
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  let allData = [];
  let currentFilter = '';

  // Listen to Firebase Realtime Database ONCE
  window.db.ref('emotions_portal').on('value', (snapshot) => {
    const data = snapshot.val();
    allData = [];
    if (data) {
      for (let id in data) {
        allData.push({ id, ...data[id] });
      }
    }
    applyFilterAndRender();
  });

  function applyFilterAndRender() {
    let filtered = [];
    if (currentFilter && currentFilter !== '') {
      filtered = allData.filter(item => item.dateGroup === currentFilter);
    } else {
      // Show default/empty group if no filter is specified
      filtered = allData.filter(item => !item.dateGroup || item.dateGroup === 'default' || item.dateGroup === '');
    }
    renderDashboard(filtered);
  }

  document.getElementById('btn-load-group')?.addEventListener('click', () => {
    currentFilter = document.getElementById('group-code-input').value.trim();
    applyFilterAndRender();
  });

  btnClear.addEventListener('click', () => {
    if (confirm('ç¢ºå?è¦æ?ç©ºç•¶?æ—¥?Ÿç??…ç?åº§æ?è³‡æ??Žï?(å°‡åˆª?¤ç¬¦?ˆç•¶?æ—¥?Ÿç??€?‰ç???')) {
      let filtered = [];
      if (currentFilter && currentFilter !== '') {
        filtered = allData.filter(item => item.dateGroup === currentFilter);
      } else {
        filtered = allData.filter(item => !item.dateGroup || item.dateGroup === 'default' || item.dateGroup === '');
      }
      
      const updates = {};
      filtered.forEach(item => {
        updates[item.id] = null;
      });
      
      if (Object.keys(updates).length > 0) {
        window.db.ref('emotions_portal').update(updates).then(() => {
          // Firebase on('value') will auto update
        });
      }
    }
  });
});
