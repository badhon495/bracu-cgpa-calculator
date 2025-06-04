// Simple Falling Letters System - CG Words
class SimpleFallingLetters {
    constructor() {
        this.word = 'CG';
        this.colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
        this.letterCount = 0;
        this.maxLetters = this.getOptimalLetterCount();
        this.init();
    }

    init() {
        this.startLetterGeneration();
    }

    getOptimalLetterCount() {
        const width = window.innerWidth;
        if (width < 480) return 3;
        if (width < 768) return 5;
        if (width < 1024) return 8;
        return 10;
    }

    createCGWord() {
        if (this.letterCount >= this.maxLetters) {
            return;
        }

        const cgWord = document.createElement('div');
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = Math.random() * 20 + 30; // 30px to 50px
        const x = Math.random() * (window.innerWidth - 100);
        const duration = Math.random() * 2 + 4; // 4s to 6s

        cgWord.textContent = this.word;
        cgWord.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: -50px;
            font-size: ${size}px;
            font-weight: 900;
            color: ${color};
            opacity: 0.8;
            pointer-events: none;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            text-shadow: 0 0 15px ${color};
            letter-spacing: 2px;
            animation: simpleFall ${duration}s linear forwards;
        `;

        document.body.appendChild(cgWord);
        this.letterCount++;

        // Remove after animation
        setTimeout(() => {
            if (cgWord.parentNode) {
                cgWord.parentNode.removeChild(cgWord);
                this.letterCount--;
            }
        }, duration * 1000);
    }

    startLetterGeneration() {
        // Generate CG words at regular intervals
        this.mainInterval = setInterval(() => {
            if (this.letterCount < this.maxLetters) {
                this.createCGWord();
            }
        }, 3000); // Every 3 seconds
    }

    destroy() {
        if (this.mainInterval) clearInterval(this.mainInterval);
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

        const gpaText = document.createElement('span');
        gpaText.textContent = "GPA:";
        const gpaInput = document.createElement('input');
        gpaInput.type = 'number';
        gpaInput.step = '0.01';
        gpaInput.placeholder = 'e.g., 4.0';
        gpaInput.id = `courseGpa_${index}`;
        gpaInput.classList.add('course-gpa');
        gpaInput.min = "0";

        // Add input validation and enhancement
        [creditsInput, gpaInput].forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.style.transform = 'scale(1.02)';
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
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Update max letters based on new screen size
            fallingLetters.maxLetters = fallingLetters.getOptimalLetterCount();
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
