// ================================================
// Classroom Resource Request Portal - script.js
// ================================================

// Array to store all requests
var requests = [];

// If editId is null we are adding a new request,
// otherwise we are editing the request with that id
var editId = null;

// Each resource belongs to a category
var categories = {
  "Projector": "Electronics",
  "Laptop": "Electronics",
  "Speaker": "Electronics",
  "Extension Board": "Electronics",
  "Marker": "Stationery",
  "Duster": "Stationery",
  "Extra Chairs": "Furniture",
  "Extra Tables": "Furniture",
  "Other": "Other"
};

// Getting form and message box from HTML
var form = document.getElementById("requestForm");
var messageBox = document.getElementById("messageBox");

// ------------------------------------------------
// Show success / error message
// type can be "success" or "error"
// ------------------------------------------------
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message " + type;
}

// ------------------------------------------------
// Form submit event
// ------------------------------------------------
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop page from reloading

  // Get values from the form
  var name = document.getElementById("studentName").value.trim();
  var rollNo = document.getElementById("rollNo").value.trim();
  var room = document.getElementById("roomNo").value.trim();
  var resource = document.getElementById("resource").value;
  var quantity = Number(document.getElementById("quantity").value);
  var date = document.getElementById("reqDate").value;
  var priority = document.getElementById("priority").value;
  var reason = document.getElementById("reason").value.trim();

  // ---------- Input validation ----------
  if (name === "" || rollNo === "" || room === "" || resource === "" || date === "" || reason === "") {
    showMessage("Error: Please fill all the fields!", "error");
    return;
  }

  if (name.length < 3) {
    showMessage("Error: Name must be at least 3 characters long.", "error");
    return;
  }

  // isNaN means "is not a number". If name is a number, it is wrong.
  if (!isNaN(name)) {
    showMessage("Error: Name cannot be a number.", "error");
    return;
  }

  // Registration number must be 8 characters and only numbers
  if (rollNo.length !== 8 || isNaN(rollNo)) {
    showMessage("Error: Registration number must be exactly 8 digits.", "error");
    return;
  }

  if (quantity < 1 || quantity > 20) {
    showMessage("Error: Quantity must be between 1 and 20.", "error");
    return;
  }

  // Date should not be in the past
  var today = new Date();
  today.setHours(0, 0, 0, 0); // set time to 12 AM so only date is compared
  var chosenDate = new Date(date);
  if (chosenDate < today) {
    showMessage("Error: Date cannot be in the past.", "error");
    return;
  }

  if (reason.length < 10) {
    showMessage("Error: Reason must be at least 10 characters long.", "error");
    return;
  }

  // ---------- Add or update ----------
  if (editId === null) {
    // Adding a new request
    var newRequest = {
      id: Date.now(), // unique id using current time
      name: name,
      rollNo: rollNo,
      room: room,
      resource: resource,
      category: categories[resource],
      quantity: quantity,
      date: date,
      priority: priority,
      reason: reason,
      status: "Pending"
    };

    requests.push(newRequest);
    showMessage("Success: Request submitted successfully!", "success");
  } else {
    // Updating an existing request
    for (var i = 0; i < requests.length; i++) {
      if (requests[i].id === editId) {
        requests[i].name = name;
        requests[i].rollNo = rollNo;
        requests[i].room = room;
        requests[i].resource = resource;
        requests[i].category = categories[resource];
        requests[i].quantity = quantity;
        requests[i].date = date;
        requests[i].priority = priority;
        requests[i].reason = reason;
      }
    }
    showMessage("Success: Request updated successfully!", "success");
  }

  resetForm();
  showRequests();
  updateDashboard();
});

// ------------------------------------------------
// Reset the form back to "new request" mode
// ------------------------------------------------
function resetForm() {
  form.reset();
  document.getElementById("quantity").value = 1;
  document.getElementById("priority").value = "Medium";
  document.getElementById("formTitle").textContent = "New Resource Request";
  document.getElementById("submitBtn").textContent = "Submit Request";
  document.getElementById("cancelBtn").classList.add("hidden");
  editId = null;
}

// ------------------------------------------------
// Show requests in the table (with search + filters)
// ------------------------------------------------
function showRequests() {
  var tbody = document.getElementById("requestTableBody");
  var searchText = document.getElementById("searchBox").value.toLowerCase();
  var statusFilter = document.getElementById("statusFilter").value;
  var categoryFilter = document.getElementById("categoryFilter").value;

  tbody.innerHTML = ""; // clear old rows
  var count = 0;

  for (var i = 0; i < requests.length; i++) {
    var r = requests[i];

    // Check search text (name, reg. no or resource)
    var matchesSearch =
      r.name.toLowerCase().includes(searchText) ||
      r.rollNo.includes(searchText) ||
      r.resource.toLowerCase().includes(searchText);

    // Check status and category filters
    var matchesStatus = (statusFilter === "All" || r.status === statusFilter);
    var matchesCategory = (categoryFilter === "All" || r.category === categoryFilter);

    if (matchesSearch && matchesStatus && matchesCategory) {
      count++;

      var row = "<tr>" +
        "<td>" + r.name + "</td>" +
        "<td>" + r.rollNo + "</td>" +
        "<td>" + r.room + "</td>" +
        "<td>" + r.resource + "</td>" +
        "<td>" + r.category + "</td>" +
        "<td>" + r.quantity + "</td>" +
        "<td>" + r.date + "</td>" +
        "<td class='priority-" + r.priority + "'>" + r.priority + "</td>" +
        "<td>" +
          "<span class='badge " + r.status + "'>" + r.status + "</span><br><br>" +
          "<select onchange='changeStatus(" + r.id + ", this.value)'>" +
            "<option value=''>Change...</option>" +
            "<option value='Pending'>Pending</option>" +
            "<option value='Approved'>Approved</option>" +
            "<option value='Rejected'>Rejected</option>" +
            "<option value='Delivered'>Delivered</option>" +
          "</select>" +
        "</td>" +
        "<td>" +
          "<button class='small-btn edit-btn' onclick='editRequest(" + r.id + ")'>Edit</button>" +
          "<button class='small-btn delete-btn' onclick='deleteRequest(" + r.id + ")'>Delete</button>" +
        "</td>" +
        "</tr>";

      tbody.innerHTML += row;
    }
  }

  // Show "No requests found" if nothing matched
  var noData = document.getElementById("noData");
  if (count === 0) {
    noData.classList.remove("hidden");
  } else {
    noData.classList.add("hidden");
  }
}

// ------------------------------------------------
// Change status of a request (status tracking)
// ------------------------------------------------
function changeStatus(id, newStatus) {
  if (newStatus === "") {
    return;
  }

  for (var i = 0; i < requests.length; i++) {
    if (requests[i].id === id) {
      requests[i].status = newStatus;
    }
  }

  showRequests();
  updateDashboard();
  showMessage("Success: Status changed to " + newStatus + ".", "success");
}

// ------------------------------------------------
// Edit a request: put its data back in the form
// ------------------------------------------------
function editRequest(id) {
  for (var i = 0; i < requests.length; i++) {
    if (requests[i].id === id) {
      document.getElementById("studentName").value = requests[i].name;
      document.getElementById("rollNo").value = requests[i].rollNo;
      document.getElementById("roomNo").value = requests[i].room;
      document.getElementById("resource").value = requests[i].resource;
      document.getElementById("quantity").value = requests[i].quantity;
      document.getElementById("reqDate").value = requests[i].date;
      document.getElementById("priority").value = requests[i].priority;
      document.getElementById("reason").value = requests[i].reason;
    }
  }

  editId = id;
  document.getElementById("formTitle").textContent = "Update Request";
  document.getElementById("submitBtn").textContent = "Update Request";
  document.getElementById("cancelBtn").classList.remove("hidden");

  // Scroll up to the form
  window.scrollTo(0, 0);
}

// ------------------------------------------------
// Delete a request (after asking for confirmation)
// ------------------------------------------------
function deleteRequest(id) {
  var sure = confirm("Are you sure you want to delete this request?");

  if (sure) {
    var newList = [];
    for (var i = 0; i < requests.length; i++) {
      if (requests[i].id !== id) {
        newList.push(requests[i]);
      }
    }
    requests = newList;

    showRequests();
    updateDashboard();
    showMessage("Success: Request deleted.", "success");
  }
}

// ------------------------------------------------
// Update dashboard numbers and progress bar
// ------------------------------------------------
function updateDashboard() {
  var pending = 0;
  var approved = 0;
  var rejected = 0;
  var delivered = 0;

  for (var i = 0; i < requests.length; i++) {
    if (requests[i].status === "Pending") pending++;
    if (requests[i].status === "Approved") approved++;
    if (requests[i].status === "Rejected") rejected++;
    if (requests[i].status === "Delivered") delivered++;
  }

  var total = requests.length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("approvedCount").textContent = approved;
  document.getElementById("rejectedCount").textContent = rejected;
  document.getElementById("deliveredCount").textContent = delivered;

  // Progress = delivered requests out of total requests
  var percent = 0;
  if (total > 0) {
    percent = Math.round((delivered / total) * 100);
  }

  document.getElementById("progressPercent").textContent = percent;
  document.getElementById("progressBar").style.width = percent + "%";
}

// ------------------------------------------------
// Run these when the page loads
// ------------------------------------------------
showRequests();
updateDashboard();
