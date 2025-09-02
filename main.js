const GAS_URL = "https://script.google.com/macros/s/AKfycbyEpXeu7impHEj81k0wWzRRuZk4OfZ6XVMpiX0ifhLMi-sjw6RSFntnPHMHUjOmS2vxnA/exec";

document.addEventListener("DOMContentLoaded", () => {
  if(document.getElementById("clinicSelect")) loadClinics();
  if(document.getElementById("checkStatusBtn")) document.getElementById("checkStatusBtn").addEventListener("click", checkStatus);
  if(document.getElementById("bookBtn")) document.getElementById("bookBtn").addEventListener("click", book);
});

// جلب العيادات
function loadClinics(){
  fetch(`${GAS_URL}?action=getClinics`)
    .then(res => res.json())
    .then(renderClinics)
    .catch(err => console.error(err));
}

function renderClinics(clinics){
  const select = document.getElementById("clinicSelect");
  select.innerHTML = '<option value="">-- اختر العيادة --</option>';
  clinics.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.name;
    select.appendChild(option);
  });
}

// حجز موعد
function book(){
  const clinicId = document.getElementById("clinicSelect").value;
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const date = document.getElementById("date").value;

  if(!clinicId){ alert("الرجاء اختيار العيادة"); return; }
  if(!name || !phone || !date){ alert("الرجاء ملء جميع الحقول"); return; }

  fetch(`${GAS_URL}?action=addAppointment&clinicId=${clinicId}&name=${encodeURIComponent(name)}&phone=${phone}&date=${date}`)
    .then(res => res.json())
    .then(()=> alert("تم إرسال طلب الحجز"))
    .catch(err => console.error(err));
}

// التحقق من حالة الحجز
function checkStatus(){
  const phone = document.getElementById("statusPhone").value.trim();
  if(!phone){ alert("أدخل رقم الهاتف"); return; }

  fetch(`${GAS_URL}?action=checkStatus&phone=${phone}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("statusResult");
      container.innerHTML = "";
      if(data.length === 0){ container.innerHTML = "لا يوجد حجوزات"; return; }
      data.forEach(r => {
        container.innerHTML += `
          <div class="card">
            عيادة: ${r.clinicId} | التاريخ: ${r.date} | الحالة: <b>${r.status}</b>
            ${r.note?`<p>ملاحظة المدير: ${r.note}</p>`:""}
          </div>`;
      });
    })
    .catch(err => console.error(err));
}
