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
const clientNameHeaderEl = document.getElementById("clientNameHeader");
const saveButton = document.getElementById("saveWorkout");
const saveStatus = document.getElementById("saveStatus");

if (clientNameHeaderEl) {
  const params = new URLSearchParams(window.location.search);
  const clientId = Number(params.get("id"));

  const client = clients.find(c => c.id === clientId);
  const clientName = client ? client.name : "Client";
  
  clientNameHeaderEl.textContent = clientName;
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

/* -----------------------------
   DATE ROW AUTO-FILL
-------------------------------- */
// Add click handler to date row cells to auto-fill with today's date
const workoutGrid = document.querySelector(".workout-grid");
if (workoutGrid) {
  const firstRow = workoutGrid.querySelector(".grid-row");
  if (firstRow) {
    const dateInputs = firstRow.querySelectorAll("input:not([readonly])");
    
    // Format today's date as M/D/YY
    const today = new Date();
    const todayFormatted = `${today.getMonth() + 1}/${today.getDate()}/${String(today.getFullYear()).slice(-2)}`;
    
    dateInputs.forEach(input => {
      input.addEventListener("click", () => {
        if (input.value === "") {
          input.value = todayFormatted;
        }
      });
    });
  }

  /* ----------------------------
     TRAINER ROW DROPDOWN
  -------------------------------- */
  // Add click handler to trainer row cells to show dropdown
  const allRows = workoutGrid.querySelectorAll(".grid-row");
  if (allRows.length > 1) {
    const trainerRow = allRows[1]; // Second row is trainer row
    const trainerInputs = trainerRow.querySelectorAll("input:not([readonly])");
    
    const trainerOptions = ["Aaron", "Bill", "Brandon", "Megan", "Other"];
    
    trainerInputs.forEach(input => {
      input.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Remove any existing dropdowns
        const existingDropdown = document.querySelector(".trainer-dropdown");
        if (existingDropdown) {
          existingDropdown.remove();
        }
        
        // Create dropdown container
        const dropdown = document.createElement("div");
        dropdown.className = "trainer-dropdown";
        dropdown.style.position = "fixed";
        dropdown.style.zIndex = "1000";
        dropdown.style.backgroundColor = "white";
        dropdown.style.border = "1px solid #ccc";
        dropdown.style.borderRadius = "4px";
        dropdown.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
        
        trainerOptions.forEach(option => {
          const optionDiv = document.createElement("div");
          optionDiv.textContent = option;
          optionDiv.style.padding = "8px 12px";
          optionDiv.style.cursor = "pointer";
          optionDiv.style.borderBottom = "1px solid #eee";
          optionDiv.style.fontSize = "14px";
          
          optionDiv.addEventListener("mouseenter", () => {
            optionDiv.style.backgroundColor = "#f0f0f0";
          });
          
          optionDiv.addEventListener("mouseleave", () => {
            optionDiv.style.backgroundColor = "white";
          });
          
          optionDiv.addEventListener("click", () => {
            if (option === "Other") {
              input.value = "";
              input.focus();
            } else {
              input.value = option;
            }
            dropdown.remove();
          });
          
          dropdown.appendChild(optionDiv);
        });
        
        // Position dropdown
        const rect = input.getBoundingClientRect();
        dropdown.style.top = (rect.bottom + 5) + "px";
        dropdown.style.left = rect.left + "px";
        dropdown.style.minWidth = rect.width + "px";
        
        document.body.appendChild(dropdown);
      });
    });
  }

  /* ----------------------------
     ROUTINE ROW DROPDOWN
  -------------------------------- */
  // Add click handler to routine row cells to show dropdown
  const allRows2 = workoutGrid.querySelectorAll(".grid-row");
  if (allRows2.length > 2) {
    const routineRow = allRows2[2]; // Third row is routine row
    const routineInputs = routineRow.querySelectorAll("input:not([readonly])");
    
    const routineOptions = ["A", "B"];
    
    routineInputs.forEach(input => {
      input.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Remove any existing dropdowns
        const existingDropdown = document.querySelector(".routine-dropdown");
        if (existingDropdown) {
          existingDropdown.remove();
        }
        
        // Create dropdown container
        const dropdown = document.createElement("div");
        dropdown.className = "routine-dropdown";
        dropdown.style.position = "fixed";
        dropdown.style.zIndex = "1000";
        dropdown.style.backgroundColor = "white";
        dropdown.style.border = "1px solid #ccc";
        dropdown.style.borderRadius = "4px";
        dropdown.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
        
        routineOptions.forEach(option => {
          const optionDiv = document.createElement("div");
          optionDiv.textContent = option;
          optionDiv.style.padding = "8px 12px";
          optionDiv.style.cursor = "pointer";
          optionDiv.style.borderBottom = "1px solid #eee";
          optionDiv.style.fontSize = "14px";
          
          optionDiv.addEventListener("mouseenter", () => {
            optionDiv.style.backgroundColor = "#f0f0f0";
          });
          
          optionDiv.addEventListener("mouseleave", () => {
            optionDiv.style.backgroundColor = "white";
          });
          
          optionDiv.addEventListener("click", () => {
            input.value = option;
            dropdown.remove();
          });
          
          dropdown.appendChild(optionDiv);
        });
        
        // Position dropdown
        const rect = input.getBoundingClientRect();
        dropdown.style.top = (rect.bottom + 5) + "px";
        dropdown.style.left = rect.left + "px";
        dropdown.style.minWidth = rect.width + "px";
        
        document.body.appendChild(dropdown);
      });
    });
  }
    
    // Close dropdown when clicking elsewhere
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".trainer-dropdown") && !e.target.closest(".routine-dropdown") && !e.target.closest(".grid-row input")) {
        const dropdown = document.querySelector(".trainer-dropdown");
        const dropdown2 = document.querySelector(".routine-dropdown");
        if (dropdown) {
          dropdown.remove();
        }
        if (dropdown2) {
          dropdown2.remove();
        }
      }
    });
  }