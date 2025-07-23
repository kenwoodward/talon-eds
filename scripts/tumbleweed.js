function createTumbleweed() {
  const tumbleweed = document.createElement('div');
  tumbleweed.className = 'tumbleweed';
  tumbleweed.innerHTML = '🌾';
  tumbleweed.style.cssText = `
    position: fixed;
    top: ${Math.random() * (window.innerHeight - 100)}px;
    left: -50px;
    font-size: 30px;
    z-index: 9999;
    pointer-events: none;
    animation: tumbleweed-roll 8s linear forwards;
  `;
  
  document.body.appendChild(tumbleweed);
  
  // Remove the tumbleweed after animation completes
  setTimeout(() => {
    if (tumbleweed.parentNode) {
      tumbleweed.parentNode.removeChild(tumbleweed);
    }
  }, 8000);
}

function startTumbleweedAnimation() {
  // Create first tumbleweed immediately
  createTumbleweed();
  
  // Set interval for subsequent tumbleweeds
  setInterval(createTumbleweed, 30000); // 30 seconds
}

// Start the animation when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startTumbleweedAnimation);
} else {
  startTumbleweedAnimation();
} 