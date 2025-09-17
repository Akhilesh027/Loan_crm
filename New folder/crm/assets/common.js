
// ---------- Simple “DB” in localStorage ----------
const LS_KEYS = {
  users: "crm_users",
  leads: "crm_leads",          // contacts visible to telecallers
  calls: "crm_calls",          // call logs by telecallers
  cases: "crm_cases",          // officer cases
  expenses: "crm_expenses",    // executive expenses & advances
  documents: "crm_documents"   // uploaded doc meta (simulated)
};

function getLS(key){ return JSON.parse(localStorage.getItem(key) || "[]"); }
function setLS(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
function upsertLS(key, item, idField="id"){
  const arr = getLS(key);
  const idx = arr.findIndex(x => x[idField] === item[idField]);
  if(idx>=0) arr[idx] = item; else arr.push(item);
  setLS(key, arr);
  return item;
}
function uid(prefix="id"){ return prefix + "_" + Math.random().toString(36).slice(2,9); }
function todayStr(){ const d=new Date(); return d.toISOString().slice(0,10); }
function daysBetween(a,b){ return Math.round((new Date(b)-new Date(a))/(1000*60*60*24)); }
function inRange(dateStr, start, end){
  const d=new Date(dateStr); return d>=new Date(start) && d<=new Date(end);
}
function rupee(n){ return new Intl.NumberFormat("en-IN",{style:"currency", currency:"INR"}).format(n||0); }
function qs(sel,root=document){ return root.querySelector(sel); }
function qsa(sel,root=document){ return [...root.querySelectorAll(sel)]; }

// ---------- Seed Dummy Data (only on first load) ----------
(function seed(){
  if(localStorage.getItem("__seeded__")) return;

  // Users (plain text for demo only)
  const users = [
    { id:"u1", role:"admin",     name:"Admin – Riya Gupta",     phone:"", email:"admin@pscrm.in",     username:"admin",     password:"admin@123" },
    { id:"u2", role:"telecaller",name:"Telecaller – Sandeep",    phone:"", email:"tele@pscrm.in",      username:"tele",      password:"tele@123" },
    { id:"u3", role:"officer",   name:"Officer – Priya Nair",    phone:"", email:"officer@pscrm.in",   username:"officer",   password:"officer@123" },
    { id:"u4", role:"executive", name:"Executive – Akash Verma", phone:"", email:"exec@pscrm.in",      username:"exec",      password:"exec@123" }
  ];
  setLS(LS_KEYS.users, users);

  // Leads (Indian names)
  const leads = [
    { id:uid("lead"), caseId:uid("CASE"), name:"Rohit Sharma",   phone:"9876543210", email:"rohit@example.com", area:"Kukatpally, Hyderabad", problem:"Credit card settlement", aadhaar:"XXXX-1234", pan:"ABCDE1234F", cibil:612, source:"executive", createdOn: todayStr(), referral:{name:"Vijay Kumar", phone:"9988776655"} },
    { id:uid("lead"), caseId:uid("CASE"), name:"Akhila Reddy",   phone:"9123456780", email:"akhila@example.com", area:"Madhapur, Hyderabad",  problem:"Personal loan restructure", aadhaar:"XXXX-5678", pan:"BCDEF2345G", cibil:676, source:"executive", createdOn: todayStr(), referral:null },
    { id:uid("lead"), caseId:uid("CASE"), name:"Karan Singh",    phone:"9012345678", email:"karan@example.com",  area:"Ameerpet, Hyderabad",  problem:"CIBIL correction", aadhaar:"XXXX-9012", pan:"CDEFG3456H", cibil:720, source:"referral",  createdOn: todayStr(), referral:{name:"Neha Jain", phone:"9876501234"} }
  ];
  setLS(LS_KEYS.leads, leads);

  // Initial calls (some pending today)
  const calls = [
    { id:uid("call"), leadId:leads[0].id, date: todayStr(), who:"tele", status:"no-response", note:"Not reachable", followUp: todayStr(), messageSent:false, waTo:leads[0].phone },
    { id:uid("call"), leadId:leads[1].id, date: todayStr(), who:"tele", status:"response",    note:"Asked details; wants call tomorrow", followUp: todayStr(), messageSent:true, waTo:leads[1].phone },
  ];
  setLS(LS_KEYS.calls, calls);

  // Cases (assigned to officer)
  const cases = [
    { id:leads[0].caseId, leadId:leads[0].id, officerId:"u3",
      assignDate: todayStr(), replyDate:"", closeDate:"",
      status:"pending", paymentStatus:"pending",
      offerAmount: 25000, advance: 5000, pendingAmount: 20000,
      timeline:[{date:todayStr(),note:"Case assigned to officer."}],
      docs:{aadhaar:true, pan:true, bankStatement:false, cibilReport:true},
      cibilBefore: leads[0].cibil, cibilAfter: null, problemType:"Credit card settlement", payments:[] }
  ];
  setLS(LS_KEYS.cases, cases);

  // Executive expenses/advances
  const expenses = [
    { id:uid("exp"), execId:"u4", date: todayStr(), type:"Travel",     amount:350, remarks:"Bank visits" },
    { id:uid("exp"), execId:"u4", date: todayStr(), type:"Phone",      amount:199, remarks:"Recharge" },
    { id:uid("adv"), execId:"u4", date: todayStr(), type:"AdvanceOut", amount:2000, remarks:"Advance to field ops" }
  ];
  setLS(LS_KEYS.expenses, expenses);

  setLS(LS_KEYS.documents, []);
  localStorage.setItem("__seeded__", "1");
})();

// ---------- Auth (very simple demo) ----------
function login(username, password){
  const users = getLS(LS_KEYS.users);
  const user = users.find(u=>u.username===username && u.password===password);
  return user || null;
}
function requireRole(expectedRole){
  const user = JSON.parse(sessionStorage.getItem("session_user")||"null");
  if(!user || (expectedRole && user.role!==expectedRole)){
    window.location.href = "index.html";
  }
  return user;
}
function logout(){ sessionStorage.removeItem("session_user"); window.location.href="index.html"; }

// ---------- Navigation helpers ----------
function navForRole(role){
  switch(role){
    case "telecaller": return "telecaller.html";
    case "officer":    return "officer.html";
    case "executive":  return "executive.html";
    case "admin":      return "admin.html";
    default:           return "index.html";
  }
}

// ---------- WhatsApp helper ----------
function waLink(phone, text){
  const t = encodeURIComponent(text||"");
  const p = phone.startsWith("91") ? phone : "91"+phone;
  return `https://wa.me/${p}?text=${t}`;
}

// ---------- Report helpers ----------
function callsByDateRange(start,end){
  return getLS(LS_KEYS.calls).filter(c=>inRange(c.date,start,end));
}
function sum(arr,sel){ return arr.reduce((a,x)=>a+(sel?sel(x):x),0); }

// ---------- Tiny templating ----------
function renderTable(el, rows, cols){
  el.innerHTML = `
    <table class="table">
      <thead><tr>${cols.map(c=>`<th>${c.label}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${c.render?c.render(r):r[c.key]??""}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  `;
}
