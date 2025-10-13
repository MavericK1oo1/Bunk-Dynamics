document.addEventListener('DOMContentLoaded', () => {
  // Set default for 'Date of Count' and minimum for 'End Date'
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  document.getElementById('asOfDate').valueAsDate = today;
  document.getElementById('endDate').setAttribute('min', tomorrow.toISOString().split('T')[0]);
});

let holidays = [];

document.getElementById('addHolidayBtn').addEventListener('click', () => {
  const dateInput = document.getElementById('holidayDate');
  const dateValue = dateInput.value;

  if (dateValue && !holidays.includes(dateValue)) {
    holidays.push(dateValue);
    updateHolidayList();
  }
  dateInput.value = '';
});

function removeHoliday(date) {
  holidays = holidays.filter(d => d !== date);
  updateHolidayList();
}

function updateHolidayList() {
  const list = document.getElementById('holidayList');
  list.innerHTML = '';
  holidays.sort((a, b) => new Date(a) - new Date(b));
  holidays.forEach(date => {
    const li = document.createElement('li');
    const displayDate = new Date(date.replace(/-/g, '/')); 
    li.innerHTML = `${displayDate.toDateString()} 
      <button onclick="removeHoliday('${date}')">Remove</button>`;
    list.appendChild(li);
  });
}

function calculateAttendance() {
  // --- Get all input values ---
  const totalLecturesInput = parseInt(document.getElementById('totalLectures').value);
  const attendedLecturesInput = parseInt(document.getElementById('attendedLectures').value);
  const asOfDateInput = document.getElementById('asOfDate').value;
  const lecturesPerDay = parseInt(document.getElementById('lecturesPerDay').value);
  const workingDays = parseInt(document.getElementById('workingDays').value);
  const endDateInput = document.getElementById('endDate').value;
  const resultDiv = document.getElementById('result');

  // --- Validation ---
  if (isNaN(totalLecturesInput) || isNaN(attendedLecturesInput) || isNaN(lecturesPerDay) || isNaN(workingDays) || !endDateInput || !asOfDateInput) {
    resultDiv.innerHTML = "<p style='color:red;'>⚠️ Please fill in all fields correctly!</p>";
    return;
  }
  
  const asOfDate = new Date(asOfDateInput.replace(/-/g, '/'));
  const endDate = new Date(endDateInput.replace(/-/g, '/'));
  asOfDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (endDate <= asOfDate) {
    resultDiv.innerHTML = "<p style='color:red;'>⚠️ The 'End Date' must be after the 'Date of Count'.</p>";
    return;
  }

  // --- Initial Attendance Calculation ---
  const initialAttendancePercent = totalLecturesInput > 0 ? ((attendedLecturesInput / totalLecturesInput) * 100).toFixed(2) : "N/A";

  // --- Projection Logic ---
  // CHANGED: The projection now starts from the day AFTER the 'asOfDate'
  let analysisDate = new Date(asOfDate);
  analysisDate.setDate(analysisDate.getDate() + 1); 

  let projectedTotal = totalLecturesInput;
  let projectedAttended = attendedLecturesInput;
  let totalFutureWorkingDays = 0;
  let output = "";

  while (analysisDate <= endDate) {
    const dayOfWeek = analysisDate.getDay();
    const formattedDate = analysisDate.toISOString().split('T')[0];

    // Check if it's a working day and not a holiday
    if (dayOfWeek >= 1 && dayOfWeek <= workingDays) {
      if (holidays.includes(formattedDate)) {
        output += `<p><strong>${analysisDate.toDateString()}:</strong> Holiday 🎉</p>`;
      } else {
        // Assume perfect attendance for all future non-holiday working days
        projectedTotal += lecturesPerDay;
        projectedAttended += lecturesPerDay;
        totalFutureWorkingDays++;
        const attendancePercent = ((projectedAttended / projectedTotal) * 100).toFixed(2);
        output += `<p><strong>${analysisDate.toDateString()}:</strong> Attendance will be ${attendancePercent}%</p>`;
      }
    } else {
      output += `<p><strong>${analysisDate.toDateString()}:</strong> Weekend ⛱️</p>`;
    }
    analysisDate.setDate(analysisDate.getDate() + 1);
  }

  const finalAttendance = projectedTotal > 0 ? ((projectedAttended / projectedTotal) * 100).toFixed(2) : initialAttendancePercent;
  
  // CHANGED: The output format is updated for the new logic
  resultDiv.innerHTML = `
    <p><strong>Attendance on ${asOfDate.toDateString()}:</strong> ${initialAttendancePercent}%</p>
    <p><strong>Projected Attendance on ${endDate.toDateString()}:</strong> ${finalAttendance}%</p>
    <p><strong>Total Future Working Days in Period:</strong> ${totalFutureWorkingDays}</p>
    <hr>
    ${output}
  `;
}







