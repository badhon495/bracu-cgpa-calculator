// Ultra Simple CG Words - Responsive Implementation with Collision
let activeCGWords = 0;
let cgWordObjects = []; // Track all CG words for collision
let MIN_CG_WORDS = 3;
let MAX_CG_WORDS = 6;

function updateScreenBasedLimits() {
    const screenWidth = window.innerWidth;
    
    if (screenWidth < 480) { // Mobile phones
        MIN_CG_WORDS = 3;
        MAX_CG_WORDS = 6;
    } else if (screenWidth < 768) { // Tablets
        MIN_CG_WORDS = 5;
        MAX_CG_WORDS = 10;
    } else if (screenWidth < 1024) { // Small laptops
        MIN_CG_WORDS = 8;
        MAX_CG_WORDS = 14;
    } else if (screenWidth < 1440) { // Standard laptops/desktops
        MIN_CG_WORDS = 12;
        MAX_CG_WORDS = 18;
    } else { // Large screens
        MIN_CG_WORDS = 15;
        MAX_CG_WORDS = 25;
    }
}

// Update limits on load and resize
updateScreenBasedLimits();
window.addEventListener('resize', updateScreenBasedLimits);

function createFallingCG() {
    // Use probability-based creation for natural randomness
    const probability = activeCGWords < MIN_CG_WORDS ? 0.9 : 
                       activeCGWords >= MAX_CG_WORDS ? 0.1 : 
                       Math.max(0.1, 0.8 - (activeCGWords / MAX_CG_WORDS));
    
    if (Math.random() > probability) {
        return;
    }
    
    const word = document.createElement('div');
    word.textContent = 'CG';
    
    // Responsive font size
    const baseFontSize = window.innerWidth < 768 ? 25 : 35;
    const fontSize = Math.random() * 15 + baseFontSize;
    
    // Random colors for variety
    const colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Styling - less bright, background effect
    word.style.position = 'fixed';
    word.style.fontSize = fontSize + 'px';
    word.style.fontWeight = 'bold';
    word.style.color = color;
    word.style.opacity = '0.15';
    word.style.zIndex = '1';
    word.style.pointerEvents = 'none';
    word.style.textShadow = `0 0 10px ${color}30`;
    
    document.body.appendChild(word);
    activeCGWords++;
    
    // Create physics object for collision detection
    const cgObject = {
        element: word,
        x: Math.random() * (window.innerWidth - 80),
        y: -60,
        vx: (Math.random() - 0.5) * 0.2, // Much slower horizontal velocity: -0.1 to 0.1
        vy: Math.random() * 0.2 + 0.2, // Much slower vertical velocity: 0.2-0.4
        size: fontSize,
        color: color
    };
    
    cgWordObjects.push(cgObject);
    
    // Set initial position
    word.style.left = cgObject.x + 'px';
    word.style.top = cgObject.y + 'px';
}

// Simple physics update function
function updatePhysics() {
    cgWordObjects.forEach((obj, index) => {
        // Update position with much slower movement
        obj.x += obj.vx;
        obj.y += obj.vy;
        obj.vy += 0.02; // Much reduced gravity from 0.05 to 0.02
        obj.vx *= 0.95; // Further increased air resistance from 0.98 to 0.95
        
        // Bounce off walls with minimal energy
        if (obj.x <= 0 || obj.x >= window.innerWidth - obj.size) {
            obj.vx *= -0.2; // Much reduced bounce from -0.4 to -0.2
            obj.x = Math.max(0, Math.min(window.innerWidth - obj.size, obj.x));
        }
        
        // Update DOM position
        obj.element.style.left = obj.x + 'px';
        obj.element.style.top = obj.y + 'px';
        
        // Remove if off screen
        if (obj.y > window.innerHeight + 100) {
            if (obj.element.parentNode) {
                obj.element.parentNode.removeChild(obj.element);
            }
            cgWordObjects.splice(index, 1);
            activeCGWords = Math.max(0, activeCGWords - 1);
        }
    });
    
    // Check collisions
    for (let i = 0; i < cgWordObjects.length; i++) {
        for (let j = i + 1; j < cgWordObjects.length; j++) {
            checkCollision(cgWordObjects[i], cgWordObjects[j]);
        }
    }
}

function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (obj1.size + obj2.size) / 3;
    
    if (distance < minDistance && distance > 0) {
        // Collision response
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Separate objects
        const overlap = minDistance - distance;
        obj1.x += nx * overlap * 0.5;
        obj1.y += ny * overlap * 0.5;
        obj2.x -= nx * overlap * 0.5;
        obj2.y -= ny * overlap * 0.5;
        
        // Exchange velocities with much more dampening for very slow effect
        const tempVx = obj1.vx;
        const tempVy = obj1.vy;
        obj1.vx = obj2.vx * 0.2; // Further reduced from 0.4 to 0.2 for very slow collisions
        obj1.vy = obj2.vy * 0.2; // Further reduced from 0.4 to 0.2 for very slow collisions
        obj2.vx = tempVx * 0.2;  // Further reduced from 0.4 to 0.2 for very slow collisions
        obj2.vy = tempVy * 0.2;  // Further reduced from 0.4 to 0.2 for very slow collisions
        
        // Visual collision effect
        [obj1, obj2].forEach(obj => {
            obj.element.style.textShadow = `0 0 20px ${obj.color}, 0 0 30px ${obj.color}`;
            setTimeout(() => {
                obj.element.style.textShadow = `0 0 10px ${obj.color}30`;
            }, 150);
        });
    }
}

// Continuous random generation instead of batch creation
function startContinuousGeneration() {
    const scheduleNext = () => {
        const randomDelay = Math.random() * 2000 + 500; // 0.5s to 2.5s
        setTimeout(() => {
            createFallingCG();
            scheduleNext(); // Schedule next word
        }, randomDelay);
    };
    
    scheduleNext(); // Start the cycle
}

// Start continuous generation and physics loop
startContinuousGeneration();

// Start physics animation loop
function startPhysicsLoop() {
    function animate() {
        updatePhysics();
        requestAnimationFrame(animate);
    }
    animate();
}

startPhysicsLoop();
