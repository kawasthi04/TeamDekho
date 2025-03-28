document.addEventListener('DOMContentLoaded', function() {
  // Use your deployed backend URL
  const backendUrl = 'https://teamdekhobe.onrender.com';
  const candidatesApiUrl = `${backendUrl}/api/candidates`;
  const vacanciesApiUrl = `${backendUrl}/api/vacancies`;

  // Helper functions for timestamp formatting
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

  // Function to load vacancies from API and display them
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
          
          // Header container with left and right sections
          const headerDiv = document.createElement("div");
          headerDiv.style.display = "flex";
          headerDiv.style.justifyContent = "space-between";
          headerDiv.style.alignItems = "center";
          
          // Left side: team info and timestamp
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
              if (!phone.startsWith("91")) { phone = "91" + phone; }
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

  // Modal toggle functionality for Join Modal
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
    console.error("Join modal elements not found.");
  }

  // Branch dropdown dynamic population
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

  // Filter functionality for candidate list
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

  // Load candidates and vacancies on page load
  if (document.getElementById("candidatesList")) {
    loadCandidates();
  }
  if (document.getElementById("vacanciesList")) {
    loadVacancies();
  }
});
