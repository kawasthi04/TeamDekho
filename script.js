const backendUrl = 'http://localhost:5000'; // Change this to your deployed backend URL if hosted externally

// Function to load candidates from MongoDB Atlas and display them
function loadCandidates() {
  fetch(`${backendUrl}/api/candidates`)
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById("candidatesList");
      list.innerHTML = ""; // Clear the current list
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

// Function to load vacancies from MongoDB Atlas and display them
function loadVacancies() {
  fetch(`${backendUrl}/api/vacancies`)
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById("vacanciesList");
      list.innerHTML = ""; // Clear the current list
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

// Handle form submission for adding a candidate
const joinForm = document.getElementById("joinForm");
if (joinForm) {
  joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const candidate = {
      Name: document.getElementById("name").value,
      Cluster: document.getElementById("cluster").value,
      Branch: document.getElementById("branch").value,
      Contact: document.getElementById("contact").value
    };

    fetch(`${backendUrl}/api/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(candidate)
    })
    .then(response => response.json())
    .then(() => {
      alert('Candidate added successfully!');
      loadCandidates(); // Refresh the list
      joinForm.reset();
    })
    .catch(error => {
      console.error('Error adding candidate:', error);
      alert('Error adding candidate. Please try again.');
    });
  });
}

// Handle form submission for adding a vacancy
const vacancyForm = document.getElementById("vacancyForm");
if (vacancyForm) {
  vacancyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const vacancy = {
      TeamName: document.getElementById("teamName").value,
      Description: document.getElementById("description").value,
      Contact: document.getElementById("contactVacancy").value
    };

    fetch(`${backendUrl}/api/vacancies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vacancy)
    })
    .then(response => response.json())
    .then(() => {
      alert('Vacancy posted successfully!');
      loadVacancies(); // Refresh the list
      vacancyForm.reset();
    })
    .catch(error => {
      console.error('Error posting vacancy:', error);
      alert('Error posting vacancy. Please try again.');
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
