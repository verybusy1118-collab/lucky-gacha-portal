const redWords = [
  "驚慌", "緊張", "焦慮", "擔憂", "煩躁",
  "憤怒", "暴怒", "生氣", "惱火", "火大",
  "不安", "心慌", "慌張", "驚嚇", "緊繃",
  "挫折", "激動", "激情", "委屈", "急躁",
  "忐忑", "慌亂", "震驚", "崩潰", "焦灼"
];

const yellowWords = [
  "興奮", "快樂", "愉悅", "開心", "振奮",
  "期待", "希望", "樂觀", "自信", "得意",
  "熱情", "投入", "專注", "好奇", "鼓舞",
  "活力", "幹勁", "輕快", "高昂", "昂揚",
  "歡喜", "欣喜", "雀躍", "躍動", "幸福"
];

const blueWords = [
  "難過", "悲傷", "失落", "失望", "沮喪",
  "無力", "疲倦", "疲憊", "孤單", "寂寞",
  "灰心", "無助", "無聊", "消沉", "自責",
  "委靡", "冷淡", "麻木", "倦怠", "呆滯",
  "空虛", "鬱悶", "煩悶", "困惑", "苦悶"
];

const greenWords = [
  "平靜", "放鬆", "安心", "安穩", "滿足",
  "舒服", "舒適", "輕鬆", "自在", "平和",
  "溫暖", "寬心", "知足", "從容", "安定",
  "安寧", "心安", "沉著", "踏實", "愜意",
  "悠閒", "平衡", "祥和", "釋然", "舒坦"
];

function generateGrid(containerId) {
  const grid = document.querySelector(`#${containerId} .mood-grid`);
  if (!grid) return;
  
  grid.innerHTML = '';
  
  // We have a 10x10 grid. 
  // Rows 0-4: Red (cols 0-4) and Yellow (cols 5-9)
  // Rows 5-9: Blue (cols 0-4) and Green (cols 5-9)
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      
      let word = '';
      if (row < 5 && col < 5) {
        cell.classList.add('cell-red');
        word = redWords[row * 5 + col];
      } else if (row < 5 && col >= 5) {
        cell.classList.add('cell-yellow');
        word = yellowWords[row * 5 + (col - 5)];
      } else if (row >= 5 && col < 5) {
        cell.classList.add('cell-blue');
        word = blueWords[(row - 5) * 5 + col];
      } else if (row >= 5 && col >= 5) {
        cell.classList.add('cell-green');
        word = greenWords[(row - 5) * 5 + (col - 5)];
      }
      
      cell.textContent = word;
      grid.appendChild(cell);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('map-container')) {
    generateGrid('map-container');
  }
  if (document.getElementById('dashboard-map')) {
    generateGrid('dashboard-map');
  }
});
