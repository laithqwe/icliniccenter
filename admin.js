const GAS_URL = "https://script.google.com/macros/s/AKfycbyEpXeu7impHEj81k0wWzRRuZk4OfZ6XVMpiX0ifhLMi-sjw6RSFntnPHMHUjOmS2vxnA/exec";

document.addEventListener("DOMContentLoaded", () => { 
  loadAdminAppointments(); 
});

// جلب مواعيد المدير
function loadAdminAppointments(){
  fetch(`${GAS_URL}?action=getManagerAppointments`)
    .then(res => res.json())
    .then(renderAdminAppointments)
    .catch(err => console.error(err));
}

// عرض المواعيد مع تصفية Pending فقط
function renderAdminAppointments(appointments){
  const container = document.getElementById("appointmentsContainer");
  container.innerHTML = "";

  // إظهار الحجوزات التي حالتها Pending فقط
  const pendingAppointments = appointments.filter(r => r.status === "Pending");

  if(pendingAppointments.length === 0){
    container.innerHTML = "لا توجد مواعيد جديدة";
    return;
  }

  pendingAppointments.forEach(r => {
    const div = document.createElement("div");
    div.className = "card admin-card";
    div.innerHTML = `
      <strong>${r.name}</strong> | ${r.phone} | ${r.date} | الحالة: ${r.status}
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
        // إزالة بطاقة الحجز من الصفحة مباشرة
        const card = document.getElementById(`note-${id}`).parentElement;
        if(card) card.remove();
      } else {
        alert("فشل تحديث الحالة: " + result.message);
      }
    })
    .catch(err => console.error("خطأ في تحديث الحالة:", err));
}
