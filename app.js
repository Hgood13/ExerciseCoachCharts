/* 
  MVP DATA
  This replaces a backend for now.
*/

const clients = [
  { id: 1, name: "Sarah Johnson" },
  { id: 2, name: "Mike Thompson" },
  { id: 3, name: "Emily Davis" }
];

/* -----------------------------
   SIGN IN LOGIC
-------------------------------- */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Mock sign-in success
    window.location.href = "clients.html";
  });
}

/* -----------------------------
   CLIENT LIST LOGIC
-------------------------------- */
const clientList = document.getElementById("clientList");

if (clientList) {
  clients.forEach(client => {
    const li = document.createElement("li");
    const link = document.createElement("a");

    link.textContent = client.name;
    link.href = `client.html?id=${client.id}`;

    li.appendChild(link);
    clientList.appendChild(li);
  });
}

/* -----------------------------
   CLIENT CHART LOGIC
-------------------------------- */
const clientNameEl = document.getElementById("clientName");
const saveButton = document.getElementById("saveWorkout");
const saveStatus = document.getElementById("saveStatus");

if (clientNameEl) {
  const params = new URLSearchParams(window.location.search);
  const clientId = Number(params.get("id"));

  const client = clients.find(c => c.id === clientId);
  clientNameEl.textContent = client ? client.name : "Client";

  saveButton.addEventListener("click", () => {
    // MVP: just simulate a save
    saveStatus.textContent = "Workout saved successfully.";
  });
}