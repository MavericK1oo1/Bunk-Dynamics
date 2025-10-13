document.addEventListener('DOMContentLoaded', () => {
    const attendedInput = document.getElementById('attendedLectures');
    const totalInput = document.getElementById('totalLectures');
    const asOfDateInput = document.getElementById('asOfDate');
    const lecturesPerDayInput = document.getElementById('lecturesPerDay');
    const workingDaysSelect = document.getElementById('workingDays');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');
    const currentAttendanceDisplay = document.getElementById('currentAttendance');
    
    const targetSection = document.getElementById('targetAttendanceSection');
    const targetSlider = document.getElementById('targetPercentage');
    const sliderValueDisplay = document.getElementById('sliderValue');

    const chartContainer = document.getElementById('chartContainer');
    const chartCanvas = document.getElementById('attendanceTrendChart').getContext('2d');
    let attendanceTrendChart;

    // === Holiday Section ===
    let holidays = [];
    const holidayInput = document.getElementById('holidayDate');
    const addHolidayBtn = document.getElementById('addHolidayBtn');
    const holidayListDiv = document.getElementById('holidayList');

    function updateHolidayList() {
        holidayListDiv.innerHTML = "";
        holidays.forEach(date => {
            const tag = document.createElement("div");
            tag.classList.add("holiday-tag");
            tag.innerHTML = `${new Date(date).toLocaleDateString()} <button onclick="removeHoliday('${date}')">×</button>`;
            holidayListDiv.appendChild(tag);
        });
    }

    window.removeHoliday = function(date) {
        holidays = holidays.filter(d => d !== date);
        updateHolidayList();
    };

    addHolidayBtn.addEventListener('click', () => {
        const dateValue = holidayInput.value;
        if (dateValue && !holidays.includes(dateValue)) {
            holidays.push(dateValue);
            updateHolidayList();
        }
    });

    // === Set Default "As of Date" ===
    asOfDateInput.valueAsDate = new Date();

    function updateUIonAttendanceChange() {
        const attended = parseInt(attendedInput.value) || 0;
        const total = parseInt(totalInput.value) || 0;
        chartContainer.classList.add('hidden');

        let percentage = 0;
        if (total > 0) {
            percentage = (attended / total) * 100;
            currentAttendanceDisplay.textContent = `${percentage.toFixed(2)}%`;
        } else {
            currentAttendanceDisplay.textContent = '0.00%';
        }

        if (percentage < 75 && total > 0) {
            targetSection.classList.add('hidden');
            startDateInput.disabled = true;
            endDateInput.disabled = true;
            calculateBtn.disabled = true;
            resultDiv.innerHTML = `
                <p style="font-size: 1.5rem; margin-bottom: 5px;">😂</p>
                Hey sleepy head, your attendance is too low!
                <br><strong>Time to go to college, not plan a holiday!</strong>
            `;
        } else {
            targetSection.classList.remove('hidden');
            startDateInput.disabled = false;
            endDateInput.disabled = false;
            calculateBtn.disabled = false;
            targetSlider.max = Math.min(100, percentage.toFixed(2) || 100);
            resultDiv.innerHTML = `Your results will appear here.`;
        }
    }

    targetSlider.addEventListener('input', () => {
        sliderValueDisplay.textContent = `${parseFloat(targetSlider.value).toFixed(2)}%`;
    });

    attendedInput.addEventListener('input', updateUIonAttendanceChange);
    totalInput.addEventListener('input', updateUIonAttendanceChange);

    calculateBtn.addEventListener('click', () => {
        const attended = parseInt(attendedInput.value);
        const total = parseInt(totalInput.value);
        const lecturesPerDay = parseInt(lecturesPerDayInput.value);
        const workingDays = parseInt(workingDaysSelect.value);
        const asOfDate = new Date(asOfDateInput.value.replace(/-/g, '/'));
        const startDate = new Date(startDateInput.value.replace(/-/g, '/'));
        const endDate = new Date(endDateInput.value.replace(/-/g, '/'));
        const targetPercentage = parseFloat(targetSlider.value);

        // === Validation ===
        if (isNaN(attended) || isNaN(total) || isNaN(lecturesPerDay) || !asOfDateInput.value || !startDateInput.value || !endDateInput.value) {
            resultDiv.innerHTML = `<p style='color:red;'>⚠️ Please fill in all fields correctly.</p>`;
            chartContainer.classList.add('hidden');
            return;
        }
        if (endDate < startDate) {
            resultDiv.innerHTML = `<p style='color:red;'>End Date cannot be before Start Date.</p>`;
            chartContainer.classList.add('hidden');
            return;
        }
        if (startDate < asOfDate) {
            resultDiv.innerHTML = `<p style='color:red;'>The bunking Start Date cannot be before the 'As of Date'.</p>`;
            chartContainer.classList.add('hidden');
            return;
        }

        // === Baseline Attendance ===
        let baselineAttended = attended;
        let baselineTotal = total;

        const dayBeforeStartDate = new Date(startDate);
        dayBeforeStartDate.setDate(dayBeforeStartDate.getDate() - 1);

        if (dayBeforeStartDate >= asOfDate) {
            let currentDate = new Date(asOfDate);
            currentDate.setDate(currentDate.getDate() + 1);
            while (currentDate <= dayBeforeStartDate) {
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek > 0 && dayOfWeek <= workingDays) {
                    baselineAttended += lecturesPerDay;
                    baselineTotal += lecturesPerDay;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        // === Working Days in Bunk Period (excluding holidays) ===
        let workingDaysInBunkPeriod = 0;
        let currentDateInBunkPeriod = new Date(startDate);
        while (currentDateInBunkPeriod <= endDate) {
            const dayOfWeek = currentDateInBunkPeriod.getDay();
            const dateStr = currentDateInBunkPeriod.toISOString().split('T')[0];
            if (dayOfWeek > 0 && dayOfWeek <= workingDays && !holidays.includes(dateStr)) {
                workingDaysInBunkPeriod++;
            }
            currentDateInBunkPeriod.setDate(currentDateInBunkPeriod.getDate() + 1);
        }

        const scheduledLectures = workingDaysInBunkPeriod * lecturesPerDay;
        const finalTotalLectures = baselineTotal + scheduledLectures;

        const minLecturesNeeded = (targetPercentage / 100) * finalTotalLectures;
        const totalLecturesIfAllAttended = baselineAttended + scheduledLectures;
        const theoreticalBunks = Math.floor(totalLecturesIfAllAttended - minLecturesNeeded);
        const actualBunks = Math.min(scheduledLectures, Math.max(0, theoreticalBunks));

        if (theoreticalBunks < 0) {
            resultDiv.innerHTML = `
                <p>Even if you attend all upcoming classes, you can't reach ${targetPercentage.toFixed(2)}%.</p>
                <p>You need to attend more classes!</p>
            `;
            chartContainer.classList.add('hidden');
            return;
        }

        const finalAttendedLectures = baselineAttended + (scheduledLectures - actualBunks);
        const finalAttendance = (finalAttendedLectures / finalTotalLectures) * 100;
        const baselineAttendancePercent = baselineTotal > 0 ? (baselineAttended / baselineTotal * 100).toFixed(2) : "N/A";

        let bunkMessage = `You can miss <strong>${actualBunks}</strong> lecture(s).`;
        if (actualBunks > 0 && actualBunks === scheduledLectures) {
            bunkMessage = `🎉 Go for it! You can miss all <strong>${scheduledLectures}</strong> scheduled lectures in this period.`;
        }

        resultDiv.innerHTML = `
            <p style="font-size:0.9rem; color:#a0a0b0;">After attending classes until your bunk period starts, your attendance will be <strong>${baselineAttendancePercent}%</strong>.</p>
            <hr style="border: none; border-top: 1px solid #4a4a6a; margin: 15px 0;">
            <p>${bunkMessage}</p>
            <p>If you do, your final attendance on ${endDate.toLocaleDateString()} will be:</p>
            <strong style="font-size: 1.8rem; color: #ff5f6d;">${finalAttendance.toFixed(2)}%</strong>
        `;

        drawTrendChart(startDate, endDate, baselineAttended, baselineTotal, actualBunks, lecturesPerDay, workingDays);
    });

    // === Chart ===
    function drawTrendChart(startDate, endDate, baselineAttended, baselineTotal, bunksToTake, lecturesPerDay, workingDays) {
        const labels = [];
        const totalLecturesData = [];
        const attendancePercentData = [];

        let currentAttended = baselineAttended;
        let currentTotal = baselineTotal;
        let bunksRemaining = bunksToTake;

        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            labels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            const dayOfWeek = currentDate.getDay();
            const dateStr = currentDate.toISOString().split('T')[0];

            if (dayOfWeek > 0 && dayOfWeek <= workingDays && !holidays.includes(dateStr)) {
                const lecturesToBunkToday = Math.min(bunksRemaining, lecturesPerDay);
                currentTotal += lecturesPerDay;
                currentAttended += (lecturesPerDay - lecturesToBunkToday);
                bunksRemaining -= lecturesToBunkToday;
            }

            totalLecturesData.push(currentTotal);
            const percentage = currentTotal > 0 ? (currentAttended / currentTotal) * 100 : 0;
            attendancePercentData.push(percentage);

            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (attendanceTrendChart) attendanceTrendChart.destroy();

        attendanceTrendChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Lectures',
                        data: totalLecturesData,
                        borderColor: '#D9534F',
                        backgroundColor: 'rgba(217, 83, 79, 0.1)',
                        yAxisID: 'yLectures',
                        tension: 0.1
                    },
                    {
                        label: 'Attendance %',
                        data: attendancePercentData,
                        borderColor: '#5cb85c',
                        backgroundColor: 'rgba(92, 184, 92, 0.1)',
                        yAxisID: 'yPercent',
                        tension: 0.1
                    }
                ]
            },
            options: {
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    title: { display: true, text: 'Lecture & Attendance Projection' },
                    tooltip: {
                        callbacks: {
                            label: context => {
                                let label = context.dataset.label || '';
                                let value = context.raw;
                                return context.dataset.yAxisID === 'yPercent'
                                    ? `${label}: ${value.toFixed(2)}%`
                                    : `${label}: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    yLectures: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Lecture Count' }
                    },
                    yPercent: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Attendance %' },
                        ticks: { callback: value => value.toFixed(0) + '%' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });

        chartContainer.classList.remove('hidden');
    }

    updateUIonAttendanceChange();
});

