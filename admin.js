const GAS_URL = "https://script.google.com/macros/s/AKfycbyEpXeu7impHEj81k0wWzRRuZk4OfZ6XVMpiX0ifhLMi-sjw6RSFntnPHMHUjOmS2vxnA/exec";

let clinicsMap = {}; // لتخزين اسم العيادة مقابل الـ id

document.addEventListener("DOMContentLoaded", async () => { 
  await loadClinics(); // جلب بيانات العيادات
  loadAdminAppointments(); 
  document.getElementById("filterBtn").addEventListener("click", loadAdminAppointments);
  document.getElementById("printBtn").addEventListener("click", printAppointments);
});

// جلب العيادات
async function loadClinics(){
  try {
    const res = await fetch(`${GAS_URL}?action=getClinics`);
    const clinics = await res.json();
    clinics.forEach(c => clinicsMap[c.id] = c.name);
  } catch(err){
    console.error("خطأ في جلب العيادات:", err);
  }
}

// جلب مواعيد المدير مع فلترة حسب الفترة
function loadAdminAppointments(){
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  fetch(`${GAS_URL}?action=getManagerAppointments`)
    .then(res => res.json())
    .then(appointments => {
      let filtered = appointments;

      // إذا تم إدخال فترة محددة: نعرض كل الحالات
      if(fromDate || toDate){
        if(fromDate){
          filtered = filtered.filter(a => new Date(a.date) >= new Date(fromDate));
        }
        if(toDate){
          filtered = filtered.filter(a => new Date(a.date) <= new Date(toDate));
        }
        document.getElementById("printBtn").style.display = "inline-block"; // إظهار زر الطباعة
      } else {
        // الوضع الطبيعي: عرض Pending فقط
        filtered = appointments.filter(r => r.status === "Pending");
        document.getElementById("printBtn").style.display = "none"; // إخفاء زر الطباعة
      }

      renderAdminAppointments(filtered);
    })
    .catch(err => console.error(err));
}

// عرض المواعيد
function renderAdminAppointments(appointments){
  const container = document.getElementById("appointmentsContainer");
  container.innerHTML = "";

  if(appointments.length === 0){
    container.innerHTML = "لا توجد مواعيد في هذه الفترة";
    return;
  }

  appointments.forEach(r => {
    const div = document.createElement("div");
    div.className = "card admin-card";
    div.id = `card-${r.id}`;
    const clinicName = clinicsMap[r.clinicId] || r.clinicId;
    div.innerHTML = `
      <strong>${r.name}</strong> | ${r.phone} | عيادة: ${clinicName} | التاريخ: ${r.date} | الحالة: ${r.status}
      <input type="text" id="note-${r.id}" placeholder="اكتب ملاحظة">
      <button onclick="updateStatusWithNote('${r.id}','Confirmed')">موافقة</button>
      <button onclick="updateStatusWithNote('${r.id}','Rejected')">رفض</button>
    `;
    container.appendChild(div);
  });
}

// تحديث الحالة مع الملاحظة وإزالة البطاقة فورًا
function updateStatusWithNote(id, status){
  const note = document.getElementById(`note-${id}`).value.trim();
  fetch(`${GAS_URL}?action=updateStatus&id=${id}&status=${status}&note=${encodeURIComponent(note)}`)
    .then(res => res.json())
    .then(result => {
      if(result.success){
        const card = document.getElementById(`card-${id}`);
        if(card) card.remove();
      } else {
        alert("فشل تحديث الحالة: " + result.message);
      }
    })
    .catch(err => console.error("خطأ في تحديث الحالة:", err));
}

// طباعة المواعيد بشكل منظم داخل جدول
function printAppointments(){
  const appointments = document.querySelectorAll("#appointmentsContainer .admin-card");
  if(appointments.length === 0){
    alert("لا توجد مواعيد للطباعة");
    return;
  }

  // بناء جدول الطباعة
  let tableHTML = `
    <h2 style="text-align:center;">حجوزات المدير</h2>
    <table border="1" cellspacing="0" cellpadding="8" style="width:100%; border-collapse: collapse; text-align: center;">
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الهاتف</th>
          <th>العيادة</th>
          <th>التاريخ</th>
          <th>الحالة</th>
          <th>ملاحظة المدير</th>
        </tr>
      </thead>
      <tbody>
  `;

  appointments.forEach(card => {
    const name = card.querySelector("strong")?.innerText || "";
    const phoneMatch = card.innerHTML.match(/\| (.*?) \|/);
    const phone = phoneMatch ? phoneMatch[1].trim() : "";
    const clinicMatch = card.innerHTML.match(/عيادة: (.*?) \|/);
    const clinic = clinicMatch ? clinicMatch[1].trim() : "";
    const dateMatch = card.innerHTML.match(/\| التاريخ: (.*?) \|/);
    const date = dateMatch ? dateMatch[1].trim() : "";
    const statusMatch = card.innerHTML.match(/الحالة: (.*?)\s/);
    const status = statusMatch ? statusMatch[1].trim() : "";
    const note = card.querySelector("input")?.value || "";

    tableHTML += `
      <tr>
        <td>${name}</td>
        <td>${phone}</td>
        <td>${clinic}</td>
        <td>${date}</td>
        <td>${status}</td>
        <td>${note}</td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table>`;

  // فتح نافذة الطباعة
  const printWindow = window.open("", "_blank");
  printWindow.document.write(tableHTML);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
