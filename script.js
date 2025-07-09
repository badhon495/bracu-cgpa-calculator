// BRACU CGPA Calculator - Clean & Optimized

class CGPACalculator {
    constructor() {
        this.currentCgpaInput = document.getElementById('currentCgpa');
        this.previousCreditsInput = document.getElementById('previousCredits');
        this.numCoursesInput = document.getElementById('numCourses');
        this.generateButton = document.getElementById('generateCoursesButton');
        this.calculateButton = document.getElementById('calculateButton');
        this.courseContainer = document.getElementById('courseInputsContainer');
        this.semesterSection = document.getElementById('semesterCoursesSection');
        this.resultDiv = document.getElementById('result');
        this.errorDiv = document.getElementById('error-message');
        this.loadingDiv = document.getElementById('loadingIndicator');
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.generateButton.addEventListener('click', () => this.generateCourseFields());
        this.calculateButton.addEventListener('click', () => this.calculateNewCgpa());
        this.addInputValidation();
    }

    addInputValidation() {
        // Real-time validation for CGPA
        this.currentCgpaInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (value > 4.0) {
                e.target.style.borderColor = '#ed8796';
                this.showError('CGPA cannot exceed 4.0');
            } else {
                e.target.style.borderColor = '#5b6078';
                this.hideError();
            }
        });

        // Real-time validation for credits
        this.previousCreditsInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (value < 0) {
                e.target.style.borderColor = '#ed8796';
                this.showError('Credits cannot be negative');
            } else {
                e.target.style.borderColor = '#5b6078';
                this.hideError();
            }
        });

        // Real-time validation for number of courses
        this.numCoursesInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value > 10) {
                e.target.style.borderColor = '#ed8796';
                this.showError('Maximum 10 courses allowed');
            } else if (value < 1) {
                e.target.style.borderColor = '#ed8796';
                this.showError('At least 1 course required');
            } else {
                e.target.style.borderColor = '#5b6078';
                this.hideError();
            }
        });
    }

    showLoading() {
        this.loadingDiv.style.display = 'block';
        this.errorDiv.style.display = 'none';
    }

    hideLoading() {
        this.loadingDiv.style.display = 'none';
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
        this.hideLoading();
    }

    hideError() {
        this.errorDiv.style.display = 'none';
    }

    generateCourseFields() {
        const numCourses = parseInt(this.numCoursesInput.value);
        
        if (isNaN(numCourses) || numCourses <= 0) {
            this.showError('Please enter a valid number of courses');
            return;
        }

        if (numCourses > 10) {
            this.showError('Maximum 10 courses allowed');
            return;
        }

        this.showLoading();
        this.hideError();

        // Add a small delay to show loading animation
        setTimeout(() => {
            this.courseContainer.innerHTML = '';
            
            for (let i = 1; i <= numCourses; i++) {
                const courseRow = this.createCourseRow(i);
                this.courseContainer.appendChild(courseRow);
            }

            this.semesterSection.style.display = 'block';
            this.hideLoading();
            
            // Smooth scroll to new section
            this.semesterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }

    createCourseRow(index) {
        const row = document.createElement('div');
        row.className = 'course-row';
        row.innerHTML = `
            <label for="course-${index}">Course ${index}</label>
            <input type="number" id="course-credit-${index}" class="course-credit" placeholder="3" value="3" min="1" max="6">
            <select id="course-grade-${index}" class="course-grade">
                <option value="">Select Grade</option>
                <option value="4.0">A (4.0)</option>
                <option value="3.7">A- (3.7)</option>
                <option value="3.3">B+ (3.3)</option>
                <option value="3.0">B (3.0)</option>
                <option value="2.7">B- (2.7)</option>
                <option value="2.3">C+ (2.3)</option>
                <option value="2.0">C (2.0)</option>
                <option value="1.7">C- (1.7)</option>
                <option value="1.3">D+ (1.3)</option>
                <option value="1.0">D (1.0)</option>
                <option value="0.7">D- (0.7)</option>
                <option value="0.0">F (0.0)</option>
            </select>
        `;
        
        return row;
    }

    calculateNewCgpa() {
        const currentCgpa = parseFloat(this.currentCgpaInput.value);
        const previousCredits = parseFloat(this.previousCreditsInput.value);
        const numCourses = parseInt(this.numCoursesInput.value);

        if (isNaN(currentCgpa) || currentCgpa < 0) {
            this.showError('Please enter a valid current CGPA');
            return;
        }
        if (currentCgpa > 4.0) {
            this.showError('CGPA cannot exceed 4.0');
            return;
        }
        if (isNaN(previousCredits) || previousCredits < 0) {
            this.showError('Please enter valid previous credits');
            return;
        }
        if (isNaN(numCourses) || numCourses < 0) {
            this.showError('Please enter a valid number of courses');
            return;
        }

        this.showLoading();
        this.hideError();

        // Add calculation delay for better UX
        setTimeout(() => {
            let previousTotalGradePoints = currentCgpa * previousCredits;
            let semesterTotalCreditsThisSemester = 0;
            let semesterGradePointsThisSemester = 0;

            const generatedCourseCreditInputs = document.querySelectorAll('.course-credit');
            if (generatedCourseCreditInputs.length !== numCourses && numCourses > 0) {
                this.showError('Please generate course fields first');
                return;
            }

            for (let i = 0; i < numCourses; i++) {
                const creditInput = document.getElementById(`course-credit-${i + 1}`);
                const gradeSelect = document.getElementById(`course-grade-${i + 1}`);
                
                const courseCredit = parseFloat(creditInput.value);
                const courseGpa = parseFloat(gradeSelect.value);
                
                if (isNaN(courseCredit) || courseCredit <= 0) {
                    this.showError(`Please enter valid credits for Course ${i + 1}`);
                    return;
                }
                if (courseCredit > 6) {
                    this.showError(`Course ${i + 1} credits cannot exceed 6`);
                    return;
                }
                if (isNaN(courseGpa)) {
                    this.showError(`Please select a grade for Course ${i + 1}`);
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
                    this.showError('Invalid calculation: Grade points without credits');
                    return;
                }
            } else {
                newCgpa = finalTotalGradePoints / finalTotalCredits;
            }
            
            this.hideLoading();
            
            // Display result
            this.resultDiv.style.display = 'block';
            this.resultDiv.innerHTML = `
                <div style="font-size: 1.5rem; opacity: 0.8;">
                    Your New CGPA is:
                </div>
                <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${this.roundToTwoDecimals(newCgpa)}
                </div>
                <div style="font-size: 0.9rem; opacity: 0.7;">
                    Total Credits: ${finalTotalCredits} | Up to 3 digits: ${newCgpa.toFixed(3)}
                </div>
            `;
            
            // Scroll to result
            this.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
    }

    // Round up value if third decimal digit is 5 or more
    roundToTwoDecimals(value) {
        const valueString = value.toFixed(3);
        const thirdDecimal = parseInt(valueString.charAt(valueString.length - 1));
        
        if (thirdDecimal >= 5) {
            const roundedUp = Math.ceil(value * 100) / 100;
            return roundedUp.toFixed(2);
        } else {
            return value.toFixed(2);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CGPACalculator();
});
