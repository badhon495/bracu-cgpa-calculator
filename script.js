// Falling Letters System - CG Words with Collision Physics
class SimpleFallingLetters {
    constructor() {
        this.word = 'CG';
        this.colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
        this.letterCount = 0;
        this.cgWords = []; // Array to track all active CG words for collision detection
        this.animationId = null;
        this.isTabVisible = true; // Track tab visibility
        this.generationTimeoutId = null; // Track generation timeout
        this.updateScreenBasedLimits(); // Set responsive limits
        this.init();
    }

    updateScreenBasedLimits() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const screenArea = screenWidth * screenHeight;
        
        // Base calculation on screen area for better responsiveness
        if (screenWidth < 480) { // Mobile phones
            this.minLetters = 3;
            this.maxLetters = 6;
        } else if (screenWidth < 768) { // Tablets
            this.minLetters = 5;
            this.maxLetters = 10;
        } else if (screenWidth < 1024) { // Small laptops
            this.minLetters = 8;
            this.maxLetters = 14;
        } else if (screenWidth < 1440) { // Standard laptops/desktops
            this.minLetters = 12;
            this.maxLetters = 18;
        } else { // Large screens
            this.minLetters = 15;
            this.maxLetters = 25;
        }
    }

    init() {
        // Update limits on resize
        window.addEventListener('resize', () => {
            this.updateScreenBasedLimits();
        });
        
        // Handle tab visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Start continuous random generation
        this.startContinuousGeneration();
        
        // Start collision detection and physics animation loop
        this.startPhysicsLoop();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Tab became inactive - pause everything
            this.pauseAnimation();
        } else {
            // Tab became active - resume everything
            this.resumeAnimation();
        }
    }

    pauseAnimation() {
        this.isTabVisible = false;
        
        // Stop physics animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear any pending generation timeouts
        if (this.generationTimeoutId) {
            clearTimeout(this.generationTimeoutId);
            this.generationTimeoutId = null;
        }
        
        // Remove all existing CG words to prevent accumulation
        this.cgWords.forEach(cgWord => {
            if (cgWord.element && cgWord.element.parentNode) {
                cgWord.element.parentNode.removeChild(cgWord.element);
            }
        });
        this.cgWords = [];
        this.letterCount = 0;
    }

    resumeAnimation() {
        this.isTabVisible = true;
        
        // Restart physics loop
        this.startPhysicsLoop();
        
        // Restart generation
        this.startContinuousGeneration();
    }

    startContinuousGeneration() {
        // Clear any existing generation timeout first
        if (this.generationTimeoutId) {
            clearTimeout(this.generationTimeoutId);
        }
        
        // Random interval generation for natural feel
        const scheduleNextWord = () => {
            // Don't schedule if tab is not visible
            if (!this.isTabVisible) return;
            
            const randomDelay = Math.random() * 2000 + 500; // 0.5s to 2.5s random delay
            
            this.generationTimeoutId = setTimeout(() => {
                // Double-check visibility before creating
                if (!this.isTabVisible) return;
                
                // Create word if we're below maximum and randomly based on current count
                const shouldCreate = this.letterCount < this.minLetters || 
                    (this.letterCount < this.maxLetters && Math.random() < this.getCreationProbability());
                
                if (shouldCreate) {
                    this.createCGWord();
                }
                
                // Schedule next word
                scheduleNextWord();
            }, randomDelay);
        };
        
        // Start the continuous generation
        scheduleNextWord();
    }
    
    getCreationProbability() {
        // Higher probability when we have fewer words, lower when approaching max
        const ratio = this.letterCount / this.maxLetters;
        return Math.max(0.1, 0.8 - ratio); // 80% when empty, 10% when near max
    }

    startPhysicsLoop() {
        const updatePhysics = () => {
            // Only continue if tab is visible
            if (!this.isTabVisible) return;
            
            this.updateCGWordPositions();
            this.checkCollisions();
            this.cleanupOffscreenWords();
            this.animationId = requestAnimationFrame(updatePhysics);
        };
        updatePhysics();
    }

    updateCGWordPositions() {
        this.cgWords.forEach(cgWord => {
            // Apply gravity and velocity
            cgWord.velocityY += cgWord.gravity;
            cgWord.x += cgWord.velocityX;
            cgWord.y += cgWord.velocityY;
            
            // Apply horizontal damping (air resistance) - increased for slower movement
            cgWord.velocityX *= 0.95; // Further increased damping from 0.98 to 0.95
            
            // Update DOM position
            cgWord.element.style.left = cgWord.x + 'px';
            cgWord.element.style.top = cgWord.y + 'px';
            
            // Bounce off screen edges - reduced bounce energy
            if (cgWord.x <= 0 || cgWord.x >= window.innerWidth - cgWord.width) {
                cgWord.velocityX *= -0.2; // Much reduced bounce energy from -0.4 to -0.2
                cgWord.x = Math.max(0, Math.min(window.innerWidth - cgWord.width, cgWord.x));
            }
        });
    }

    checkCollisions() {
        for (let i = 0; i < this.cgWords.length; i++) {
            for (let j = i + 1; j < this.cgWords.length; j++) {
                const word1 = this.cgWords[i];
                const word2 = this.cgWords[j];
                
                if (this.isColliding(word1, word2)) {
                    this.handleCollision(word1, word2);
                }
            }
        }
    }

    isColliding(word1, word2) {
        const dx = word1.x - word2.x;
        const dy = word1.y - word2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (word1.width + word2.width) / 3; // Collision radius
        return distance < minDistance;
    }

    handleCollision(word1, word2) {
        // Calculate collision response
        const dx = word2.x - word1.x;
        const dy = word2.y - word1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return; // Prevent division by zero
        
        // Normalize collision vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Separate overlapping objects
        const overlap = (word1.width + word2.width) / 3 - distance;
        word1.x -= nx * overlap * 0.5;
        word1.y -= ny * overlap * 0.5;
        word2.x += nx * overlap * 0.5;
        word2.y += ny * overlap * 0.5;
        
        // Calculate relative velocity
        const rvx = word2.velocityX - word1.velocityX;
        const rvy = word2.velocityY - word1.velocityY;
        const relativeVelocity = rvx * nx + rvy * ny;
        
        // Don't resolve if objects are separating
        if (relativeVelocity > 0) return;
        
        // Collision impulse with restitution (bounciness) - reduced for slower effect
        const restitution = 0.15; // Further reduced from 0.3 to 0.15 for very gentle collisions
        const impulse = (1 + restitution) * relativeVelocity / 2;
        
        // Apply impulse to velocities
        word1.velocityX += impulse * nx;
        word1.velocityY += impulse * ny;
        word2.velocityX -= impulse * nx;
        word2.velocityY -= impulse * ny;
        
        // Add visual effect on collision
        this.addCollisionEffect(word1, word2);
    }

    addCollisionEffect(word1, word2) {
        // Flash effect on collision
        [word1, word2].forEach(word => {
            word.element.style.textShadow = `0 0 20px ${word.color}, 0 0 30px ${word.color}`;
            setTimeout(() => {
                word.element.style.textShadow = `0 0 10px ${word.color}30`;
            }, 150);
        });
    }

    cleanupOffscreenWords() {
        this.cgWords = this.cgWords.filter(cgWord => {
            if (cgWord.y > window.innerHeight + 100) {
                // Remove from DOM
                if (cgWord.element && cgWord.element.parentNode) {
                    cgWord.element.parentNode.removeChild(cgWord.element);
                }
                this.letterCount = Math.max(0, this.letterCount - 1);
                return false; // Remove from array
            }
            return true; // Keep in array
        });
    }

    createCGWord() {
        if (this.letterCount >= this.maxLetters) {
            return;
        }

        // Create DOM element
        const element = document.createElement('div');
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // Responsive font size based on screen width
        const baseFontSize = window.innerWidth < 768 ? 25 : 35;
        const size = Math.random() * 15 + baseFontSize;
        
        element.textContent = this.word;
        element.style.cssText = `
            position: fixed;
            font-size: ${size}px;
            font-weight: 900;
            color: ${color};
            opacity: 0.15;
            pointer-events: none;
            z-index: 1;
            font-family: 'Inter', sans-serif;
            text-shadow: 0 0 10px ${color}30;
            letter-spacing: 1px;
        `;

        document.body.appendChild(element);

        // Create physics object
        const cgWordObject = {
            element: element,
            x: Math.random() * (window.innerWidth - 80),
            y: -60,
            velocityX: (Math.random() - 0.5) * 0.2, // Even slower horizontal velocity: -0.1 to 0.1
            velocityY: Math.random() * 0.2 + 0.1, // Much slower initial downward velocity: 0.1-0.3
            gravity: 0.01 + Math.random() * 0.01, // Much slower gravity: 0.01-0.02
            width: size,
            height: size,
            color: color
        };

        // Set initial position
        element.style.left = cgWordObject.x + 'px';
        element.style.top = cgWordObject.y + 'px';

        // Add to tracking array
        this.cgWords.push(cgWordObject);
        this.letterCount++;
    }

    destroy() {
        // Stop physics animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clear generation timeout
        if (this.generationTimeoutId) {
            clearTimeout(this.generationTimeoutId);
        }
        
        // Clean up all CG words
        this.cgWords.forEach(cgWord => {
            if (cgWord.element && cgWord.element.parentNode) {
                cgWord.element.parentNode.removeChild(cgWord.element);
            }
        });
        
        this.cgWords = [];
        this.letterCount = 0;
    }
}

// CGPA Calculator Logic
class CGPACalculator {
    constructor() {
        this.generateCoursesButton = document.getElementById('generateCoursesButton');
        this.calculateButton = document.getElementById('calculateButton');
        this.courseInputsContainer = document.getElementById('courseInputsContainer');
        this.numCoursesInput = document.getElementById('numCourses');
        this.resultDiv = document.getElementById('result');
        this.errorDiv = document.getElementById('error-message');
        
        this.init();
    }

    init() {
        this.generateCoursesButton.addEventListener('click', () => this.generateCourseInputs());
        this.calculateButton.addEventListener('click', () => this.calculateNewCgpa());
        
        // Add loading state functionality
        this.addLoadingStates();
    }

    addLoadingStates() {
        // Add loading animation to buttons when clicked
        [this.generateCoursesButton, this.calculateButton].forEach(button => {
            button.addEventListener('click', (e) => {
                const originalText = button.textContent;
                button.innerHTML = '<span class="loading"></span>' + originalText;
                button.disabled = true;
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 500);
            });
        });
    }

    clearMessages() {
        this.resultDiv.textContent = '';
        this.errorDiv.textContent = '';
        this.errorDiv.style.display = 'none';
    }

    displayError(message) {
        this.clearMessages();
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
        
        // Add shake animation
        this.errorDiv.classList.add('shake');
        setTimeout(() => {
            this.errorDiv.classList.remove('shake');
        }, 500);
    }

    generateCourseInputs() {
        this.clearMessages();
        this.courseInputsContainer.innerHTML = ''; // Clear previous inputs
        const count = parseInt(this.numCoursesInput.value);

        if (isNaN(count) || count < 0) {
            this.displayError("Please enter a valid number of courses (0 or more).");
            return;
        }
        if (count > 20) { // Safety limit
            this.displayError("Maximum 20 courses allowed. Please enter a smaller number.");
            this.numCoursesInput.value = "20"; // Optionally reset to max
            return;
        }

        // Show helpful message if generating courses
        if (count > 0) {
            const infoDiv = document.createElement('div');
            infoDiv.style.cssText = `
                background: rgba(78, 205, 196, 0.1);
                border: 1px solid rgba(78, 205, 196, 0.3);
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                color: #4ecdc4;
                font-size: 0.9rem;
                text-align: center;
                animation: fadeInUp 0.5s ease-out;
            `;
            infoDiv.innerHTML = `
                ✨ Generated ${count} course field${count > 1 ? 's' : ''} with credits pre-filled to <strong>3</strong>.<br>
                <small style="opacity: 0.8;">You can edit the credits for each course as needed!</small>
            `;
            this.courseInputsContainer.appendChild(infoDiv);
            
            // Remove info after 4 seconds
            setTimeout(() => {
                if (infoDiv.parentNode) {
                    infoDiv.style.opacity = '0';
                    setTimeout(() => {
                        if (infoDiv.parentNode) {
                            infoDiv.parentNode.removeChild(infoDiv);
                        }
                    }, 300);
                }
            }, 4000);
        }

        // Add staggered animation to course rows
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createCourseRow(i);
            }, i * 100); // Stagger by 100ms
        }
    }

    createCourseRow(index) {
        const courseRow = document.createElement('div');
        courseRow.classList.add('course-row');
        courseRow.style.animationDelay = `${index * 0.1}s`;

        const courseLabel = document.createElement('label');
        courseLabel.textContent = `Course ${index + 1}:`;

        const creditsText = document.createElement('span');
        creditsText.textContent = "Credits:";
        const creditsInput = document.createElement('input');
        creditsInput.type = 'number';
        creditsInput.placeholder = 'e.g., 3';
        creditsInput.id = `courseCredit_${index}`;
        creditsInput.classList.add('course-credit');
        creditsInput.min = "0.5";
        creditsInput.step = "0.5";
        creditsInput.value = "3"; // Auto-fill with 3 (user can edit)
        creditsInput.title = "Credits auto-filled with 3, but you can change this value";

        const gpaText = document.createElement('span');
        gpaText.textContent = "GPA:";
        const gpaInput = document.createElement('input');
        gpaInput.type = 'number';
        gpaInput.step = '0.01';
        gpaInput.placeholder = 'e.g., 4.0';
        gpaInput.id = `courseGpa_${index}`;
        gpaInput.classList.add('course-gpa');
        gpaInput.min = "0";
        gpaInput.title = "Enter the GPA you achieved in this course";

        // Add input validation and enhancement
        [creditsInput, gpaInput].forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.style.transform = 'scale(1.02)';
                // Highlight the auto-filled credits on first focus
                if (input === creditsInput && input.value === '3') {
                    input.select(); // Select the text for easy editing
                }
            });
            
            input.addEventListener('blur', (e) => {
                e.target.parentElement.style.transform = 'scale(1)';
            });
        });

        courseRow.appendChild(courseLabel);
        courseRow.appendChild(creditsText);
        courseRow.appendChild(creditsInput);
        courseRow.appendChild(gpaText);
        courseRow.appendChild(gpaInput);

        this.courseInputsContainer.appendChild(courseRow);
    }

    calculateNewCgpa() {
        this.clearMessages();

        const currentCgpaStr = document.getElementById('currentCgpa').value;
        const previousCreditsStr = document.getElementById('previousCredits').value;
        const numCoursesStr = this.numCoursesInput.value;

        if (currentCgpaStr.trim() === '' || previousCreditsStr.trim() === '' || numCoursesStr.trim() === '') {
            this.displayError("Please fill in Current CGPA, Completed Credits, and Number of Courses.");
            return;
        }

        const currentCgpa = parseFloat(currentCgpaStr);
        const previousCredits = parseInt(previousCreditsStr);
        const numCourses = parseInt(numCoursesStr);

        if (isNaN(currentCgpa) || currentCgpa < 0) {
            this.displayError("Please enter a valid Current CGPA (0 or greater).");
            return;
        }
        if (isNaN(previousCredits) || previousCredits < 0) {
            this.displayError("Please enter valid Total Credits Completed (0 or greater).");
            return;
        }
        if (isNaN(numCourses) || numCourses < 0) {
            this.displayError("Please ensure the number of courses is a valid number (0 or greater).");
            return;
        }

        let previousTotalGradePoints = currentCgpa * previousCredits;
        let semesterTotalCreditsThisSemester = 0;
        let semesterGradePointsThisSemester = 0;

        const generatedCourseCreditInputs = document.querySelectorAll('.course-credit');
        if (generatedCourseCreditInputs.length !== numCourses && numCourses > 0) {
            this.displayError("Mismatch in course count and generated fields. Please click 'Generate Course Fields' again after setting the number of courses.");
            return;
        }

        for (let i = 0; i < numCourses; i++) {
            const creditInput = document.getElementById(`courseCredit_${i}`);
            const gpaInput = document.getElementById(`courseGpa_${i}`);

            if (!creditInput || !gpaInput) {
                this.displayError(`Input fields for Course ${i+1} are missing. Please click 'Generate Course Fields' again.`);
                return;
            }
            
            if (creditInput.value.trim() === '' || gpaInput.value.trim() === '') {
                this.displayError(`Please fill in credits and GPA for Course ${i + 1}.`);
                return;
            }

            const courseCredit = parseFloat(creditInput.value);
            const courseGpa = parseFloat(gpaInput.value);

            if (isNaN(courseCredit) || courseCredit <= 0) {
                this.displayError(`Please enter valid credits (greater than 0) for Course ${i + 1}.`);
                return;
            }

            if (isNaN(courseGpa) || courseGpa < 0) {
                this.displayError(`Please enter a valid GPA (e.g., 0.0 to 4.0 or 5.0) for Course ${i + 1}.`);
                return;
            }

            semesterTotalCreditsThisSemester += courseCredit;
            semesterGradePointsThisSemester += courseGpa * courseCredit;
        }

        const finalTotalCredits = previousCredits + semesterTotalCreditsThisSemester;
        const finalTotalGradePoints = previousTotalGradePoints + semesterGradePointsThisSemester;

        let newCgpa;
        if (finalTotalCredits === 0) {
            if (finalTotalGradePoints === 0) {
                newCgpa = 0;
            } else {
                this.displayError("Total credits are zero, but total grade points are not. This indicates an issue with input values. Please check inputs.");
                return;
            }
        } else {
            newCgpa = finalTotalGradePoints / finalTotalCredits;
        }
        
        // Display result with enhanced animation
        this.resultDiv.style.display = 'block';
        this.resultDiv.innerHTML = `
            <div style="font-size: 0.9rem; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.7);">
                Your New CGPA is:
            </div>
            <div style="font-size: 2rem; font-weight: 800; color: #4ecdc4;">
                ${newCgpa.toFixed(3)}
            </div>
        `;
        
        // Add success animation
        this.resultDiv.classList.add('pulse');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize simple falling CG letters
    const fallingLetters = new SimpleFallingLetters();
    
    // Initialize CGPA calculator
    const calculator = new CGPACalculator();
    
    // Handle window resize for responsive behavior
    let resizeTimeout;        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // CG count is now fixed at 5-7, no need to update based on screen size
            }, 250);
        });
    
    // Add scroll effects
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.content');
        const speed = scrolled * 0.5;
        
        if (parallax) {
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
    
    // Add enhanced focus effects for inputs
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'translateY(0)';
        });
    });
});
