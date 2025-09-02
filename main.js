const GAS_URL = "https://script.google.com/macros/s/AKfycbyEpXeu7impHEj81k0wWzRRuZk4OfZ6XVMpiX0ifhLMi-sjw6RSFntnPHMHUjOmS2vxnA/exec";

document.addEventListener("DOMContentLoaded",()=>{
  if(document.getElementById("clinics")) loadClinics();
  if(document.getElementById("checkStatusBtn")) document.getElementById("checkStatusBtn").addEventListener("click", checkStatus);
});

function loadClinics(){
  fetch(`${GAS_URL}?action=getClinics`)
    .then(res=>res.json())
    .then(renderClinics)
    .catch(err=>console.error(err));
}

function renderClinics(clinics){
  const container=document.getElementById("clinics");
  container.innerHTML="";
  clinics.forEach(c=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
      <input id="name-${c.id}" type="text" placeholder="اسمك">
      <input id="phone-${c.id}" type="text" placeholder="رقم الهاتف">
      <input id="date-${c.id}" type="date">
      <button onclick="book('${c.id}')">حجز</button>
    `;
    container.appendChild(card);
  });
}

function book(id){
  const name=document.getElementById(`name-${id}`).value.trim();
  const phone=document.getElementById(`phone-${id}`).value.trim();
  const date=document.getElementById(`date-${id}`).value;
  if(!name||!phone||!date){alert("الرجاء ملء جميع الحقول"); return;}
  fetch(`${GAS_URL}?action=addAppointment&clinicId=${id}&name=${encodeURIComponent(name)}&phone=${phone}&date=${date}`)
    .then(res=>res.json())
    .then(()=>alert("تم إرسال طلب الحجز"))
    .catch(err=>console.error(err));
}

function checkStatus(){
  const phone=document.getElementById("statusPhone").value.trim();
  if(!phone){alert("أدخل رقم الهاتف"); return;}
  fetch(`${GAS_URL}?action=checkStatus&phone=${phone}`)
    .then(res=>res.json())
    .then(data=>{
      const container=document.getElementById("statusResult");
      container.innerHTML="";
      if(data.length===0){container.innerHTML="لا يوجد حجوزات"; return;}
      data.forEach(r=>{
        container.innerHTML+=`
          <div class="card">
            عيادة: ${r.clinicId} | التاريخ: ${r.date} | الحالة: <b>${r.status}</b>
            ${r.note?`<p>ملاحظة المدير: ${r.note}</p>`:""}
          </div>`;
      });
    }).catch(err=>console.error(err));
}
// زر عرض العيادات
document.getElementById('showClinicsBtn').addEventListener('click', function(){
  document.getElementById('clinics').style.display = 'flex'; // يظهر الكروت
  this.style.display = 'none'; // يخفي الزر بعد الضغط
  loadClinics(); // دالة موجودة مسبقًا في main.js لتحميل العيادات
});
