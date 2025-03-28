// Use your deployed backend URL
const backendUrl = 'https://teamdekhobe.onrender.com';
const candidatesApiUrl = `${backendUrl}/api/candidates`;
const vacanciesApiUrl = `${backendUrl}/api/vacancies`;

// Helper function to format timestamps as DD/MM/YY [HH:MM]
function parseTimestamp(ts) {
  // Check if ts is in MongoDB Extended JSON format
  if (ts && typeof ts === "object" && ts.$date) {
    if (ts.$date.$numberLong) {
      return new Date(parseInt(ts.$date.$numberLong, 10));
    }
    return new Date(ts.$date);
  }
  // Otherwise assume ts is already a valid date string or Date object
  return new Date(ts);
}

function formatTimestamp(ts) {
  const date = parseTimestamp(ts);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} [${hours}:${minutes}]`;
}

// Function to load candidates from MongoDB Atlas and display them
function loadCandidates() {
  fetch(candidatesApiUrl)
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById("candidatesList");
      list.innerHTML = "";
      data.forEach(candidate => {
        console.log("Candidate:", candidate); // Debug candidate data

        const li = document.createElement("li");
        li.dataset.cluster = candidate.Cluster;
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";

        // Use candidate.Timestamp or candidate.createdAt
        const timestamp = candidate.Timestamp || candidate.createdAt;

        // Build candidate info with timestamp
        const infoSpan = document.createElement("span");
        infoSpan.innerHTML = `<span style="color: gray;">${timestamp ? formatTimestamp(timestamp) + " " : ""}</span>` + 
                            `<span style="color: white;">${candidate.Name}</span> ` +
                             `(<span style="color: blue;">${candidate.Cluster}</span> - <span style="color: cyan;">${candidate.Branch}</span>) — ` +
                             `<span style="color: red;">${candidate.Contact}</span> `;

        // "Text 'em!" link
        const linkSpan = document.createElement("span");
        const link = document.createElement("a");
        link.style.color = "green";
        if (candidate.Contact.includes('@')) {
          const subject = encodeURIComponent("Let's team up! (from TeamDekho)");
          const body = encodeURIComponent("Hi, I found you on TeamDekho. Wanna team?");
          link.href = `mailto:${candidate.Contact}?subject=${subject}&body=${body}`;
        } else {
          let phone = candidate.Contact.replace(/\D/g, '');
          if (!phone.startsWith("91")) { phone = "91" + phone; }
          const message = encodeURIComponent("Hi, found you on TeamDekho");
          link.href = `https://wa.me/${phone}?text=${message}`;
          link.target = "_blank";
        }
        link.textContent = "Text 'em!";
        linkSpan.appendChild(link);

        li.appendChild(infoSpan);
        li.appendChild(linkSpan);
        list.appendChild(li);
      });
    })
    .catch(error => {
      console.error("Error loading candidates:", error);
    });
}


// Handle form submission for join.html (adding a candidate)
// Function to load vacancies from MongoDB Atlas and display them
function loadVacancies() {
  fetch(vacanciesApiUrl)
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById("vacanciesList");
      list.innerHTML = "";
      data.forEach(vacancy => {
        const li = document.createElement("li");
        li.style.display = "block";
        li.style.marginBottom = "10px";
        
        const teamName = vacancy.TeamName || "Team Name Missing";
        const contact = vacancy.Contact || "Contact Missing";
        const timestamp = vacancy.Timestamp ? formatTimestamp(vacancy.Timestamp) : "";
        const description = vacancy.Description || "Description Missing";

        // Header container: left side (info) and right side ("Text 'em!" link)
        const headerDiv = document.createElement("div");
        headerDiv.style.display = "flex";
        headerDiv.style.justifyContent = "space-between";
        headerDiv.style.alignItems = "center";
        
        // Left side: team name, contact, timestamp
        const leftDiv = document.createElement("div");
        leftDiv.style.color = "white";
        leftDiv.innerHTML = `<span style="color: gray;">${timestamp}</span> ${teamName} (<span style="color: red;">${contact}</span>)`;
        
        // Right side: "Text 'em!" link
        const rightDiv = document.createElement("div");
        const textLink = document.createElement("a");
        textLink.style.color = "green";
        if (vacancy.Contact) {
          if (vacancy.Contact.includes('@')) {
            const subject = encodeURIComponent("Regarding your team vacancy on TeamDekho");
            const body = encodeURIComponent(`Hi, I saw your vacancy for ${description} on TeamDekho and I'm interested in learning more.`);
            textLink.href = `mailto:${vacancy.Contact}?subject=${subject}&body=${body}`;
          } else {
            let phone = vacancy.Contact.replace(/\D/g, '');
            if (!phone.startsWith("91")) {
              phone = "91" + phone;
            }
            const message = encodeURIComponent("Hi, I'm interested in your team vacancy on TeamDekho.");
            textLink.href = `https://wa.me/${phone}?text=${message}`;
            textLink.target = "_blank";
          }
          textLink.textContent = "Text 'em!";
        } else {
          textLink.textContent = "Contact info missing";
        }
        rightDiv.appendChild(textLink);
        
        headerDiv.appendChild(leftDiv);
        headerDiv.appendChild(rightDiv);
        
        // Second line: Description row
        const descDiv = document.createElement("div");
        descDiv.style.color = "cyan";
        descDiv.textContent = `[${description}]`;

        li.appendChild(headerDiv);
        li.appendChild(descDiv);
        list.appendChild(li);
      });
    })
    .catch(error => {
      console.error("Error loading vacancies:", error);
    });
}

// Handle form submission for vacancy.html (posting a vacancy)
const vacancyForm = document.getElementById("vacancyForm");
if (vacancyForm) {
  vacancyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const vacancy = {
      TeamName: document.getElementById("teamName").value,
      Description: document.getElementById("description").value,
      Contact: document.getElementById("contactVacancy").value,
    };

    fetch(vacanciesApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vacancy),
    })
      .then(response => response.json())
      .then(() => {
        alert("Vacancy posted successfully!");
        loadVacancies();
        vacancyForm.reset();
      })
      .catch(error => {
        console.error("Error posting vacancy:", error);
        alert("Error posting vacancy. Please try again.");
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


document.addEventListener('DOMContentLoaded', function() {
  // Deployed backend URLs
  const backendUrl = 'https://teamdekhobe.onrender.com';
  const candidatesApiUrl = `${backendUrl}/api/candidates`;

  // Identify current user (for demonstration)
  const currentUserName = localStorage.getItem('teamDekhoUser') || prompt("Enter your name (for demo):");
  if (currentUserName) {
    localStorage.setItem('teamDekhoUser', currentUserName);
  }

  // Modal toggle functionality using class "active"
  const openJoinModal = document.getElementById("openJoinModal");
  const closeJoinModal = document.getElementById("closeJoinModal");
  const joinModal = document.getElementById("joinModal");

  if (openJoinModal && closeJoinModal && joinModal) {
    openJoinModal.addEventListener("click", function() {
      joinModal.classList.add("active");
      console.log("Join modal opened");
    });

    closeJoinModal.addEventListener("click", function() {
      joinModal.classList.remove("active");
      console.log("Join modal closed");
    });

    window.addEventListener("click", function(event) {
      if (event.target === joinModal) {
        joinModal.classList.remove("active");
        console.log("Join modal closed by clicking outside");
      }
    });
  } else {
    console.error("One or more modal elements not found.");
  }

  // Branch dropdown dynamic population based on selected cluster
  const branchOptions = {
    "CS": ["AI", "CD", "CS", "CY", "IS"],
    "EC": ["EC", "EE", "EI", "ET"],
    "ME": ["AS", "BT", "CH", "IM", "ME"]
  };

  const clusterSelect = document.getElementById("cluster");
  if (clusterSelect) {
    clusterSelect.addEventListener("change", function() {
      const cluster = this.value;
      const branchSelect = document.getElementById("branch");
      branchSelect.innerHTML = "<option value=''>Select your branch</option>";
      if (branchOptions[cluster]) {
        branchOptions[cluster].forEach(branch => {
          const option = document.createElement("option");
          option.value = branch;
          option.textContent = branch;
          branchSelect.appendChild(option);
        });
      }
    });
  }

  // Filter functionality: Toggle candidate display based on cluster filter
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      filterButtons.forEach(button => button.classList.remove("active"));
      this.classList.add("active");
      const filter = this.dataset.cluster;
      const candidates = document.querySelectorAll("#candidatesList li");
      candidates.forEach(candidate => {
        candidate.style.display = (filter === "all" || candidate.dataset.cluster === filter) ? "flex" : "none";
      });
    });
  });

  // Form submission to add a new candidate
  const joinForm = document.getElementById("joinForm");
  if (joinForm) {
    joinForm.addEventListener("submit", function(event) {
      event.preventDefault();
      const name = document.getElementById("name").value;
      const cluster = document.getElementById("cluster").value;
      const branch = document.getElementById("branch").value;
      const contact = document.getElementById("contact").value;

      fetch(candidatesApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: name, Cluster: cluster, Branch: branch, Contact: contact }),
      })
      .then(response => response.json())
      .then(data => {
        console.log("Candidate added:", data);
        joinModal.classList.remove("active");
        joinForm.reset();
        loadCandidates(); // Reload candidate list to show new entry
      })
      .catch(error => {
        console.error("Error adding candidate:", error);
        alert("Failed to add your entry. Please try again later.");
      });
    });
  }

  // Function to load candidates from API and display them
  function loadCandidates() {
    fetch(candidatesApiUrl)
      .then(response => response.json())
      .then(data => {
        const list = document.getElementById("candidatesList");
        list.innerHTML = "";
        data.forEach(candidate => {
          console.log("Candidate:", candidate);
          const li = document.createElement("li");
          li.dataset.cluster = candidate.Cluster;
          li.style.display = "flex";
          li.style.justifyContent = "space-between";
          li.style.alignItems = "center";

          // Use candidate.Timestamp or candidate.createdAt
          const timestamp = candidate.Timestamp || candidate.createdAt;

          const infoSpan = document.createElement("span");
          infoSpan.innerHTML = `<span style="color: gray;">${timestamp ? formatTimestamp(timestamp) + " " : ""}</span>` +
                               `<span style="color: white;">${candidate.Name}</span> ` +
                               `(<span style="color: blue;">${candidate.Cluster}</span> - <span style="color: cyan;">${candidate.Branch}</span>) — ` +
                               `<span style="color: red;">${candidate.Contact}</span> `;

          const linkSpan = document.createElement("span");
          const link = document.createElement("a");
          link.style.color = "green";
          if (candidate.Contact.includes('@')) {
            const subject = encodeURIComponent("Let's team up! (from TeamDekho)");
            const body = encodeURIComponent("Hi, I found you on TeamDekho. Wanna team?");
            link.href = `mailto:${candidate.Contact}?subject=${subject}&body=${body}`;
          } else {
            let phone = candidate.Contact.replace(/\D/g, '');
            if (!phone.startsWith("91")) { phone = "91" + phone; }
            const message = encodeURIComponent("Hi, found you on TeamDekho");
            link.href = `https://wa.me/${phone}?text=${message}`;
            link.target = "_blank";
          }
          link.textContent = "Text 'em!";
          linkSpan.appendChild(link);

          li.appendChild(infoSpan);
          li.appendChild(linkSpan);
          list.appendChild(li);
        });
      })
      .catch(error => {
        console.error("Error loading candidates:", error);
      });
  }
  loadCandidates();
});

document.addEventListener('DOMContentLoaded', function() {
  // Deployed backend URLs
  const backendUrl = 'https://teamdekhobe.onrender.com';
  const candidatesApiUrl = `${backendUrl}/api/candidates`;

  // Identify current user (for demonstration, using prompt)
  const currentUserName = localStorage.getItem('teamDekhoUser') || prompt("Enter your name (for demo):");
  if (currentUserName) {
    localStorage.setItem('teamDekhoUser', currentUserName);
  }

  // Modal toggle functionality using .active class
  const openJoinModal = document.getElementById("openJoinModal");
  const closeJoinModal = document.getElementById("closeJoinModal");
  const joinModal = document.getElementById("joinModal");

  if (openJoinModal && closeJoinModal && joinModal) {
    openJoinModal.addEventListener("click", function() {
      joinModal.classList.add("active");
      console.log("Join modal opened");
    });

    closeJoinModal.addEventListener("click", function() {
      joinModal.classList.remove("active");
      console.log("Join modal closed");
    });

    window.addEventListener("click", function(event) {
      if (event.target === joinModal) {
        joinModal.classList.remove("active");
        console.log("Join modal closed by clicking outside");
      }
    });
  } else {
    console.error("Modal elements not found.");
  }

  // Branch dropdown dynamic population based on selected cluster
  const branchOptions = {
    "CS": ["AI", "CD", "CS", "CY", "IS"],
    "EC": ["EC", "EE", "EI", "ET"],
    "ME": ["AS", "BT", "CH", "IM", "ME"]
  };

  const clusterSelect = document.getElementById("cluster");
  if (clusterSelect) {
    clusterSelect.addEventListener("change", function() {
      const cluster = this.value;
      const branchSelect = document.getElementById("branch");
      branchSelect.innerHTML = "<option value=''>Select your branch</option>";
      if (branchOptions[cluster]) {
        branchOptions[cluster].forEach(branch => {
          const option = document.createElement("option");
          option.value = branch;
          option.textContent = branch;
          branchSelect.appendChild(option);
        });
      }
    });
  }

  // Filter functionality: Toggle candidate display based on cluster filter
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      filterButtons.forEach(button => button.classList.remove("active"));
      this.classList.add("active");
      const filter = this.dataset.cluster;
      const candidates = document.querySelectorAll("#candidatesList li");
      candidates.forEach(candidate => {
        candidate.style.display = (filter === "all" || candidate.dataset.cluster === filter) ? "flex" : "none";
      });
    });
  });

  // Function to delete a candidate entry
  function deleteCandidate(candidateId, candidateContact, listItem) {
    // Ask user to reenter their phone number for confirmation
    const userInput = prompt("To remove your entry, please reenter your phone number:");
    if (userInput && userInput.trim() === candidateContact.trim()) {
      // Send DELETE request to backend
      fetch(`${candidatesApiUrl}/${candidateId}`, { method: 'DELETE' })
        .then(response => {
          if (response.ok) {
            listItem.remove();
            alert("Your entry has been removed.");
          } else {
            alert("Failed to delete your entry. Please try again later.");
          }
        })
        .catch(error => {
          console.error("Error deleting candidate:", error);
          alert("Error deleting your entry. Please try again later.");
        });
    } else {
      alert("Phone number does not match. Entry not deleted.");
    }
  }

  // Helper functions to parse and format timestamps
  function parseTimestamp(ts) {
    if (ts && typeof ts === "object" && ts.$date) {
      if (ts.$date.$numberLong) {
        return new Date(parseInt(ts.$date.$numberLong, 10));
      }
      return new Date(ts.$date);
    }
    return new Date(ts);
  }

  function formatTimestamp(ts) {
    const date = parseTimestamp(ts);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} [${hours}:${minutes}]`;
  }

  // Function to load candidates from API and display them
  function loadCandidates() {
    fetch(candidatesApiUrl)
      .then(response => response.json())
      .then(data => {
        const list = document.getElementById("candidatesList");
        list.innerHTML = "";
        data.forEach(candidate => {
          console.log("Candidate:", candidate);
          const li = document.createElement("li");
          li.dataset.cluster = candidate.Cluster;
          li.style.display = "flex";
          li.style.justifyContent = "space-between";
          li.style.alignItems = "center";

          // Use candidate.Timestamp or candidate.createdAt
          const timestamp = candidate.Timestamp || candidate.createdAt;

          const infoSpan = document.createElement("span");
          infoSpan.innerHTML = `<span style="color: gray;">${timestamp ? formatTimestamp(timestamp) + " " : ""}</span>` +
                               `<span style="color: white;">${candidate.Name}</span> ` +
                               `(<span style="color: blue;">${candidate.Cluster}</span> - <span style="color: cyan;">${candidate.Branch}</span>) — ` +
                               `<span style="color: red;">${candidate.Contact}</span> `;

          // Action span: Contains "Text 'em!" link and delete "X"
          const actionSpan = document.createElement("span");
          actionSpan.style.display = "flex";
          actionSpan.style.alignItems = "center";

          // "Text 'em!" link
          const textLink = document.createElement("a");
          textLink.style.color = "green";
          if (candidate.Contact.includes('@')) {
            const subject = encodeURIComponent("Let's team up! (from TeamDekho)");
            const body = encodeURIComponent("Hi, I found you on TeamDekho. Wanna team?");
            textLink.href = `mailto:${candidate.Contact}?subject=${subject}&body=${body}`;
          } else {
            let phone = candidate.Contact.replace(/\D/g, '');
            if (!phone.startsWith("91")) { phone = "91" + phone; }
            const message = encodeURIComponent("Hi, found you on TeamDekho");
            textLink.href = `https://wa.me/${phone}?text=${message}`;
            textLink.target = "_blank";
          }
          textLink.textContent = "Text 'em!";
          actionSpan.appendChild(textLink);

          // Add delete button if the candidate was added by the current user.
          // (Assuming current user is identified by their contact or name.)
          if (candidate.Contact === currentUserName || candidate.Name === currentUserName) {
            const deleteBtn = document.createElement("span");
            deleteBtn.classList.add("delete-btn");
            deleteBtn.textContent = "✖";
            deleteBtn.title = "Remove entry (confirm by reentering your phone number)";
            deleteBtn.addEventListener("click", function() {
              deleteCandidate(candidate._id, candidate.Contact, li);
            });
            actionSpan.appendChild(deleteBtn);
          }

          li.appendChild(infoSpan);
          li.appendChild(actionSpan);
          list.appendChild(li);
        });
      })
      .catch(error => {
        console.error("Error loading candidates:", error);
      });
  }
  loadCandidates();

  // Handle form submission to add a new candidate
  const joinForm = document.getElementById("joinForm");
  if (joinForm) {
    joinForm.addEventListener("submit", function(event) {
      event.preventDefault();
      const name = document.getElementById("name").value;
      const cluster = document.getElementById("cluster").value;
      const branch = document.getElementById("branch").value;
      const contact = document.getElementById("contact").value;

      fetch(candidatesApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: name, Cluster: cluster, Branch: branch, Contact: contact }),
      })
      .then(response => response.json())
      .then(data => {
        console.log("Candidate added:", data);
        joinModal.classList.remove("active");
        joinForm.reset();
        loadCandidates(); // Reload candidate list to show new entry
      })
      .catch(error => {
        console.error("Error adding candidate:", error);
        alert("Failed to add your entry. Please try again later.");
      });
    });
  }
});

