document.addEventListener("DOMContentLoaded", () => {

  const A = id => document.getElementById(id);
  let preHolidays = [];
  let bunkHolidays = [];
  let chart;

  A("asOfDate").valueAsDate = new Date();

  function updateAttendance() {
    const a = +A("attendedLectures").value || 0;
    const t = +A("totalLectures").value || 0;
    A("currentAttendance").textContent =
      t ? ((a / t) * 100).toFixed(2) + "%" : "0%";
  }

  A("attendedLectures").oninput = updateAttendance;
  A("totalLectures").oninput = updateAttendance;

  A("addPreHolidayBtn").onclick = () => {
    const d = A("preHolidayDate").value;
    if (d && !preHolidays.includes(d)) {
      preHolidays.push(d);
      A("preHolidayList").innerHTML += `<div>${d}</div>`;
    }
  };

  A("addBunkHolidayBtn").onclick = () => {
    const d = A("bunkHolidayDate").value;
    if (d && !bunkHolidays.includes(d)) {
      bunkHolidays.push(d);
      A("bunkHolidayList").innerHTML += `<div>${d}</div>`;
    }
  };

  A("calculateBtn").onclick = () => {

    let attended = +A("attendedLectures").value;
    let total = +A("totalLectures").value;
    const lpd = +A("lecturesPerDay").value;
    const wd = +A("workingDays").value;

    const today = new Date(A("asOfDate").value);
    const start = new Date(A("startDate").value);
    const end = new Date(A("endDate").value);

    /* -------- PRE-BUNK PERIOD -------- */
    let d = new Date(today);
    d.setDate(d.getDate() + 1);

    const preEnd = new Date(start);
    preEnd.setDate(preEnd.getDate() - 1);

    while (d <= preEnd) {
      const key = d.toISOString().split("T")[0];
      const day = d.getDay();
      if (day > 0 && day <= wd && !preHolidays.includes(key)) {
        attended += lpd;
        total += lpd;
      }
      d.setDate(d.getDate() + 1);
    }

    const baseAtt = attended;
    const baseTot = total;

    /* -------- BUNK PERIOD (MISS ALL) -------- */
    let bunkDays = [];
    d = new Date(start);

    while (d <= end) {
      const key = d.toISOString().split("T")[0];
      const day = d.getDay();
      if (day > 0 && day <= wd && !bunkHolidays.includes(key)) {
        bunkDays.push(key);
      }
      d.setDate(d.getDate() + 1);
    }

    const missedLectures = bunkDays.length * lpd;
    const finalTotal = baseTot + missedLectures;
    const finalAttendance = (baseAtt / finalTotal) * 100;

    A("result").innerHTML = `
      Attendance before bunk:
      <strong>${((baseAtt / baseTot) * 100).toFixed(2)}%</strong><br>
      Lectures missed:
      <strong>${missedLectures}</strong><br><br>
      Final Attendance:
      <strong>${finalAttendance.toFixed(2)}%</strong>
    `;

    drawGraph(baseAtt, baseTot, bunkDays, lpd);
  };

  function drawGraph(att, tot, days, lpd) {
    const labels = [], totalData = [], pctData = [];
    let a = att, t = tot;

    days.forEach(d => {
      labels.push(new Date(d).toLocaleDateString());
      t += lpd;
      totalData.push(t);
      pctData.push((a / t) * 100);
    });

    if (chart) chart.destroy();
    chart = new Chart(A("attendanceTrendChart"), {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Total Lectures", data: totalData, borderColor: "red", yAxisID: "y" },
          { label: "Attendance %", data: pctData, borderColor: "green", yAxisID: "y1" }
        ]
      },
      options: {
        scales: {
          y: { position: "left" },
          y1: { position: "right", min: 0, max: 100, grid: { drawOnChartArea: false } }
        }
      }
    });
  }

});


