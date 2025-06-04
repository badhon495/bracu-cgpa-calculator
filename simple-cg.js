// Ultra Simple CG Words - Direct Implementation
function createFallingCG() {
    const word = document.createElement('div');
    word.textContent = 'CG';
    
    // Very basic styling - no fancy effects
    word.style.position = 'fixed';
    word.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    word.style.top = '-50px';
    word.style.fontSize = '40px';
    word.style.fontWeight = 'bold';
    word.style.color = '#ff6b9d';
    word.style.zIndex = '9999';
    word.style.pointerEvents = 'none';
    word.style.textShadow = '0 0 10px #ff6b9d';
    
    document.body.appendChild(word);
    
    // Animate manually with setInterval
    let top = -50;
    const interval = setInterval(() => {
        top += 5;
        word.style.top = top + 'px';
        
        if (top > window.innerHeight + 100) {
            clearInterval(interval);
            if (word.parentNode) {
                word.parentNode.removeChild(word);
            }
        }
    }, 50);
}

// Create first word after page loads
setTimeout(() => {
    createFallingCG();
}, 1000);

// Create new words every 3 seconds
setInterval(() => {
    createFallingCG();
}, 3000);
