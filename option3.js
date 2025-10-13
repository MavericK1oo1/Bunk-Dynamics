document.addEventListener('DOMContentLoaded', () => {
    // Input elements
    const attendedInput = document.getElementById('attendedLectures');
    const totalInput = document.getElementById('totalLectures');
    const asOfDateInput = document.getElementById('asOfDate'); // Kept for context
    const lecturesTodayInput = document.getElementById('lecturesToday');
    const lecturesToBunkInput = document.getElementById('lecturesToBunk');
    const calculateBtn = document.getElementById('calculateBtn');

    // Display elements
    const currentAttendanceDisplay = document.getElementById('current-attendance-display');
    const currentPercentValue = document.getElementById('current-percent-value');
    const resultContainer = document.getElementById('result-container');
    const resultEmoji = resultContainer.querySelector('.result-emoji');
    const resultMessage = resultContainer.querySelector('.result-message');
    const finalAttendanceValue = resultContainer.querySelector('.final-attendance-value');

    // Set default date for the 'as of' date input
    asOfDateInput.valueAsDate = new Date();

    function updateCurrentAttendance() {
        const attended = parseInt(attendedInput.value);
        const total = parseInt(totalInput.value);

        if (!isNaN(attended) && !isNaN(total) && total > 0) {
            const percentage = (attended / total) * 100;
            currentPercentValue.textContent = `${percentage.toFixed(2)}%`;
            currentAttendanceDisplay.classList.remove('hidden');
        } else {
            currentAttendanceDisplay.classList.add('hidden');
        }
    }

    attendedInput.addEventListener('input', updateCurrentAttendance);
    totalInput.addEventListener('input', updateCurrentAttendance);

    calculateBtn.addEventListener('click', () => {
        const attended = parseInt(attendedInput.value);
        const total = parseInt(totalInput.value);
        const asOfDateValue = asOfDateInput.value;
        const lecturesToday = parseInt(lecturesTodayInput.value);
        const lecturesToBunk = parseInt(lecturesToBunkInput.value);

        // --- Input Validation ---
        if (isNaN(attended) || isNaN(total) || isNaN(lecturesToday) || isNaN(lecturesToBunk) || !asOfDateValue) {
            showResult('🚨', 'Please fill in all the fields.', '', 'is-loss');
            return;
        }
        if (attended > total) {
            showResult('🤔', 'Attended lectures cannot be more than total lectures.', '', 'is-loss');
            return;
        }
        if (lecturesToBunk > lecturesToday) {
            showResult('🤔', 'You can\'t bunk more classes than are scheduled!', '', 'is-loss');
            return;
        }
        
        // --- Calculations ---
        const currentPercentage = total > 0 ? (attended / total) * 100 : 100;
        
        const newTotalLectures = total + lecturesToday;
        const lecturesAttendedToday = lecturesToday - lecturesToBunk;
        const newAttendedLectures = attended + lecturesAttendedToday;
        
        const finalPercentage = newTotalLectures > 0 ? (newAttendedLectures / newTotalLectures) * 100 : 100;

        if (finalPercentage < currentPercentage) {
            const diff = (currentPercentage - finalPercentage).toFixed(2);
            showResult('😭', `Ouch! A drop of ${diff}%. Was it worth it?`, `${finalPercentage.toFixed(2)}%`, 'is-loss');
        } else {
            showResult('😎', 'Nice one! You\'re still in the clear.', `${finalPercentage.toFixed(2)}%`, 'is-gain');
        }
    });

    function showResult(emoji, message, finalPercent, statusClass) {
        resultContainer.className = 'result-container'; // Reset classes
        resultContainer.classList.add(statusClass);

        resultEmoji.textContent = emoji;
        resultMessage.textContent = message;
        finalAttendanceValue.textContent = finalPercent;
        
        resultContainer.classList.remove('hidden');
    }
});