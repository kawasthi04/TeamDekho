// script.js

// Sheet2API API URLs (replace with your actual URLs from Sheet2API)
const candidatesApiUrl = 'https://sheet2api.com/v1/aJATW0fpTfaV/availablestudents';
const vacanciesApiUrl = 'https://sheet2api.com/v1/aJATW0fpTfaV/teamvacancies';

// Function to load candidates from Sheet2API and display them
function loadCandidates() {
  fetch(candidatesApiUrl)
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById("candidatesList");
      list.innerHTML = ""; // Clear the current list
      // Sort by timestamp (newest first), assuming Timestamp column exists
      data.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
      data.forEach(candidate => {
        const li = document.createElement("li");
        li.textContent = `${candidate.Name} (${candidate.Cluster} - ${candidate.Branch}) | Contact: ${candidate.Contact}`;
        list.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Error loading candidates:', error);
    });
}

// Function to load vacancies from Sheet2API and display them
function loadVacancies() {
  fetch(vacanciesApiUrl)
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById("vacanciesList");
      list.innerHTML = ""; // Clear the current list
      // Sort by timestamp (newest first), assuming Timestamp column exists
      data.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
      data.forEach(vacancy => {
        const li = document.createElement("li");
        li.textContent = `${vacancy.TeamName ? vacancy.TeamName + ": " : ""}${vacancy.Description} | Contact: ${vacancy.Contact}`;
        list.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Error loading vacancies:', error);
    });
}

// Handle form submission for join.html
const joinForm = document.getElementById("joinForm");
if (joinForm) {
  joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const candidate = {
      Name: document.getElementById("name").value,
      Cluster: document.getElementById("cluster").value,
      Branch: document.getElementById("branch").value,
      Contact: document.getElementById("contact").value,
      Timestamp: new Date().toISOString() // Add timestamp for sorting
    };

    // Send data to Sheet2API
    fetch(candidatesApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(candidate) // Sheet2API expects data directly, no "data" wrapper
    })
    .then(response => response.json())
    .then(() => {
      alert('Added successfully!');
      loadCandidates(); // Refresh the list
      joinForm.reset();
    })
    .catch(error => {
      console.error('Error adding candidate:', error);
      alert('Error adding your info. Please try again.');
    });
  });
}

// Handle form submission for vacancy.html
const vacancyForm = document.getElementById("vacancyForm");
if (vacancyForm) {
  vacancyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const vacancy = {
      TeamName: document.getElementById("teamName").value,
      Description: document.getElementById("description").value,
      Contact: document.getElementById("contactVacancy").value,
      Timestamp: new Date().toISOString() // Add timestamp for sorting
    };

    // Send data to Sheet2API
    fetch(vacanciesApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vacancy) // Sheet2API expects data directly, no "data" wrapper
    })
    .then(response => response.json())
    .then(() => {
      alert('Vacancy posted successfully!');
      loadVacancies(); // Refresh the list
      vacancyForm.reset();
    })
    .catch(error => {
      console.error('Error posting vacancy:', error);
      alert('Error posting your vacancy. Please try again.');
    });
  });
}

// Load data when the page loads 
if (document.getElementById("candidatesList")) {
  loadCandidates();
}
if (document.getElementById("vacanciesList")) {
  loadVacancies();
}
