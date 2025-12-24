document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  const todayStr = `${yyyy}-${mm}-${dd}`;
  document.getElementById('asOfDate').value = todayStr;

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('endDate').min =
    `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
});

let holidays = [];

/* ===== ADD HOLIDAY ===== */
document.getElementById('addHolidayBtn').addEventListener('click', () => {
  const dateValue = document.getElementById('holidayDate').value;

  if (dateValue && !holidays.includes(dateValue)) {
    holidays.push(dateValue); // YYYY-MM-DD only
    holidays.sort();
    updateHolidayList();
  }
});

/* ===== REMOVE HOLIDAY ===== */
function removeHoliday(date) {
  holidays = holidays.filter(d => d !== date);
  updateHolidayList();
}

/* ===== DISPLAY HOLIDAYS (LOCAL SAFE) ===== */
function updateHolidayList() {
  const list = document.getElementById('holidayList');
  list.innerHTML = '';

  holidays.forEach(dateStr => {
    const [y, m, d] = dateStr.split('-');
    const displayDate = new Date(y, m - 1, d); // LOCAL DATE (SAFE)

    const li = document.createElement('li');
    li.innerHTML = `
      ${displayDate.toDateString()}
      <button onclick="removeHoliday('${dateStr}')">Remove</button>
    `;
    list.appendChild(li);
  });
}

/* ===== MAIN CALCULATION ===== */
function calculateAttendance() {
  const totalLectures = parseInt(document.getElementById('totalLectures').value);
  const attendedLectures = parseInt(document.getElementById('attendedLectures').value);
  const asOfDateStr = document.getElementById('asOfDate').value;
  const lecturesPerDay = parseInt(document.getElementById('lecturesPerDay').value);
  const workingDays = parseInt(document.getElementById('workingDays').value);
  const endDateStr = document.getElementById('endDate').value;
  const resultDiv = document.getElementById('result');

  if (
    isNaN(totalLectures) ||
    isNaN(attendedLectures) ||
    isNaN(lecturesPerDay) ||
    isNaN(workingDays) ||
    !asOfDateStr ||
    !endDateStr
  ) {
    resultDiv.innerHTML = "<p style='color:red;'>⚠️ Please fill all fields correctly</p>";
    return;
  }

  const asOfDate = new Date(...asOfDateStr.split('-').map((v, i) => i === 1 ? v - 1 : v));
  const endDate = new Date(...endDateStr.split('-').map((v, i) => i === 1 ? v - 1 : v));

  if (endDate <= asOfDate) {
    resultDiv.innerHTML = "<p style='color:red;'>⚠️ End date must be after count date</p>";
    return;
  }

  let projectedTotal = totalLectures;
  let projectedAttended = attendedLectures;
  let totalFutureWorkingDays = 0;
  let output = "";

  let analysisDate = new Date(asOfDate);
  analysisDate.setDate(analysisDate.getDate() + 1);

  while (analysisDate <= endDate) {
    const dayOfWeek = analysisDate.getDay();

    const yyyy = analysisDate.getFullYear();
    const mm = String(analysisDate.getMonth() + 1).padStart(2, '0');
    const dd = String(analysisDate.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;

    if (dayOfWeek >= 1 && dayOfWeek <= workingDays) {
      if (holidays.includes(dateKey)) {
        output += `<p><strong>${analysisDate.toDateString()}:</strong> Holiday 🎉</p>`;
      } else {
        projectedTotal += lecturesPerDay;
        projectedAttended += lecturesPerDay;
        totalFutureWorkingDays++;
        const percent = ((projectedAttended / projectedTotal) * 100).toFixed(2);
        output += `<p><strong>${analysisDate.toDateString()}:</strong> Attendance will be ${percent}%</p>`;
      }
    } else {
      output += `<p><strong>${analysisDate.toDateString()}:</strong> Weekend ⛱️</p>`;
    }

    analysisDate.setDate(analysisDate.getDate() + 1);
  }

  const finalAttendance = ((projectedAttended / projectedTotal) * 100).toFixed(2);

  resultDiv.innerHTML = `
    <p><strong>Attendance on ${asOfDate.toDateString()}:</strong> ${(attendedLectures / totalLectures * 100).toFixed(2)}%</p>
    <p><strong>Projected Attendance on ${endDate.toDateString()}:</strong> ${finalAttendance}%</p>
    <p><strong>Total Future Working Days in Period:</strong> ${totalFutureWorkingDays}</p>
    <hr>
    ${output}
  `;
}









