/* 
  MVP DATA
  This replaces a backend for now.
*/

const clients = [
  { id: 1, name: "Sarah Johnson" },
  { id: 2, name: "Mike Thompson" },
  { id: 3, name: "Emily Davis" },
  { id: 4, name: "David Hobgood" },
  { id: 5, name: "Jessica Martinez" },
  { id: 6, name: "Robert Anderson" },
  { id: 7, name: "Lisa Chen" },
  { id: 8, name: "James Wilson" },
  { id: 9, name: "Amanda Brown" },
  { id: 10, name: "Christopher Lee" },
  { id: 11, name: "Michelle Garcia" },
  { id: 12, name: "Daniel Rodriguez" },
  { id: 13, name: "Rachel Taylor" },
  { id: 14, name: "Kevin Moore" },
  { id: 15, name: "Maria Sanchez" },
  { id: 16, name: "Brandon Jackson" },
  { id: 17, name: "Jennifer White" },
  { id: 18, name: "Matthew Harris" },
  { id: 19, name: "Lauren Clark" },
  { id: 20, name: "Joshua Lewis" }
];

/* Sort clients by last name, then first name */
clients.sort((a, b) => {
  const aNames = a.name.trim().split(' ');
  const bNames = b.name.trim().split(' ');
  
  const aLastName = aNames[aNames.length - 1].toLowerCase();
  const bLastName = bNames[bNames.length - 1].toLowerCase();
  
  // Compare last names
  if (aLastName !== bLastName) {
    return aLastName.localeCompare(bLastName);
  }
  
  // If last names are same, compare first names
  const aFirstName = aNames[0].toLowerCase();
  const bFirstName = bNames[0].toLowerCase();
  return aFirstName.localeCompare(bFirstName);
});

/* -----------------------------
   SIGN IN LOGIC
-------------------------------- */
const validCredentials = [
  { username: "Megan", password: "1234" },
  { username: "Bill", password: "1234" }
];

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const isValid = validCredentials.some(
      cred => cred.username === username && cred.password === password
    );

    if (isValid) {
      errorMessage.style.display = "none";
      window.location.href = "clients.html";
    } else {
      errorMessage.textContent = "Username or password is incorrect. Please try again.";
      errorMessage.style.display = "block";
      document.getElementById("password").value = "";
    }
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
    
    // Special case for David Hobgood
    if (client.name === "David Hobgood") {
      link.href = "david-hobgood.html";
    } else {
      link.href = `client.html?id=${client.id}`;
    }

    li.appendChild(link);
    clientList.appendChild(li);
  });
}

/* -----------------------------
   CLIENT CHART LOGIC
-------------------------------- */
const clientNameEl = document.getElementById("clientName");
const clientNameHeaderEl = document.getElementById("clientNameHeader");
const saveButton = document.getElementById("saveWorkout");
const saveStatus = document.getElementById("saveStatus");

if (clientNameEl) {
  const params = new URLSearchParams(window.location.search);
  const clientId = Number(params.get("id"));

  const client = clients.find(c => c.id === clientId);
  const clientName = client ? client.name : "Client";
  
  clientNameEl.textContent = clientName;
  if (clientNameHeaderEl) {
    clientNameHeaderEl.textContent = clientName;
  }
}

// Save button handler works for both generic and specific client pages
if (saveButton) {
  saveButton.addEventListener("click", () => {
    // MVP: just simulate a save
    saveStatus.textContent = "Workout saved successfully!";
    saveStatus.classList.add("show");
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      saveStatus.classList.remove("show");
    }, 3000);
  });
}