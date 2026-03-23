/*
  app.js — Application Logic
  Data is loaded from and saved to localStorage via db.js (window.ECC).
*/

/* Load (or seed) the database */
const db = ECC.loadDB();

/* Sorted client list for use by this page */
const clients = ECC.getClients(db);

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
    } else if (client.name === "Brandon Jackson") {
      link.href = "brandon-jackson.html";
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

  const client = ECC.getClientById(db, clientId);
  const clientName = client ? client.name : "Client";
  
  clientNameHeaderEl.textContent = clientName;
}

// Save button handler — reads the workout grid and persists to localStorage
if (saveButton) {
  saveButton.addEventListener("click", () => {
    const params = new URLSearchParams(window.location.search);
    const clientId = Number(params.get("id"));
    const client = clientId ? ECC.getClientById(db, clientId) : null;

    if (client) {
      const grid = document.querySelector(".workout-grid");
      if (grid) {
        const rows = grid.querySelectorAll(".grid-row");

        // Collect sessions from header rows (Date / Trainer / Routine)
        const sessions = [];
        const SESSION_COLS = 7;
        const dateInputs    = rows[0].querySelectorAll("input:not([readonly])");
        const trainerInputs = rows[1].querySelectorAll("input:not([readonly])");
        const routineInputs = rows[2].querySelectorAll("input:not([readonly])");
        for (let col = 0; col < SESSION_COLS; col++) {
          sessions.push({
            date:    dateInputs[col]    ? dateInputs[col].value    : "",
            trainer: trainerInputs[col] ? trainerInputs[col].value : "",
            routine: routineInputs[col] ? routineInputs[col].value : ""
          });
        }

        // Collect exercise rows (rows index 4 onward, skipping the header row at index 3)
        const exercises = [];
        for (let r = 4; r < rows.length; r++) {
          const inputs = rows[r].querySelectorAll("input");
          const nameA   = inputs[0] ? inputs[0].value : "";
          const nameB   = inputs[1] ? inputs[1].value : "";
          const results = [];
          for (let c = 2; c < inputs.length; c++) {
            results.push(inputs[c] ? inputs[c].value : "");
          }
          exercises.push({ nameA, nameB, results });
        }

        const chartData = { sessions, exercises };

        // Update the latest chart, or create a new one if none exist
        let chart = ECC.getLatestChart(client);
        if (chart) {
          ECC.updateChartData(db, client, chart.id, chartData);
        } else {
          chart = ECC.addChartToClient(db, client);
          ECC.updateChartData(db, client, chart.id, chartData);
        }
      }
    }

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

  // Helper function to position dropdown correctly on mobile and desktop
  function showDropdown(input, options, dropdownClass, callback) {
    // Remove any existing dropdowns
    const existingDropdown = document.querySelector("." + dropdownClass);
    if (existingDropdown) {
      existingDropdown.remove();
    }
    
    // Create dropdown container
    const dropdown = document.createElement("div");
    dropdown.className = dropdownClass;
    dropdown.style.position = "absolute";
    dropdown.style.zIndex = "1000";
    dropdown.style.backgroundColor = "white";
    dropdown.style.border = "1px solid #ccc";
    dropdown.style.borderRadius = "4px";
    dropdown.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    
    options.forEach(option => {
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
        callback(input, option, dropdown);
      });
      
      dropdown.appendChild(optionDiv);
    });
    
    // Position dropdown using document-relative coordinates (fixes mobile scrolling issues)
    const rect = input.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    
    dropdown.style.top = (rect.bottom + scrollTop + 5) + "px";
    dropdown.style.left = (rect.left + scrollLeft) + "px";
    dropdown.style.minWidth = rect.width + "px";
    
    document.body.appendChild(dropdown);
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
        
        showDropdown(input, trainerOptions, "trainer-dropdown", (input, option, dropdown) => {
          if (option === "Other") {
            input.value = "";
            input.focus();
          } else {
            input.value = option;
          }
          dropdown.remove();
        });
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
        
        showDropdown(input, routineOptions, "routine-dropdown", (input, option, dropdown) => {
          input.value = option;
          dropdown.remove();
        });
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