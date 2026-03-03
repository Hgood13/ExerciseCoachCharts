# Exercise Coach Charts - Major To-Do's

## Priority Tasks (Critical Path)

### 1. Finalize Login Page

### 2. Build Client Selection Page (clients.html)
- [ ] New Client Tab

### 3. Build Client Workout Chart Page (client.html)
- [x] Get client ID from URL parameter
- [x] Display client name
- [x] Add "Back to Clients" navigation button
- [x] Improved save status messaging

### 4. Implement Data Persistence
- [ ] Save chart data to localStorage when user enters data
- [ ] Load saved data from localStorage when returning to client page
- [ ] Format: client_[id] = workout data
- [ ] Add "Save" button or auto-save confirmation

### 5. Complete Navigation Flow
- [ ] Login → Clients page working
- [ ] Clients → Individual client page working
- [ ] Client page → Back to Clients link
- [ ] Test full workflow: login → select → edit → save → navigate away → return → verify data

### 6. Input Functionality & Data Capture
- [ ] Weights input captures properly
- [ ] Notes input captures properly
- [ ] Data validated before saving
- [ ] User feedback on save (message appears)

### 7. Mobile & Responsiveness
- [ ] Test on tablet/mobile sizes
- [ ] Chart is readable on smaller screens
- [ ] Touch-friendly buttons and inputs

## In Progress
- [x] Updated styles.css with Exercise Coach theme

## Backlog (After MVP)
- [ ] Add "Clear Workout" button on client page
- [ ] Add "Print Friendly" layout option
- [ ] Export workouts to CSV
- [ ] Data validation rules (max weight, required fields)
- [ ] User instructions/help modal
- [ ] Add more coaches to the system
- [ ] Timestamp tracking (when workouts were last edited)

## Completed
- [x] CSS redesign with professional theme
- [x] Created TODO.md file

## Notes
- MVP focuses on: Login → Select Client → Enter Data → Save & Return
- Using localStorage for data (no backend needed yet)
- Paper form mimicry is important for coach familiarity
- Keep it simple - advanced features come later
