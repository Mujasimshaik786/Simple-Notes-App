document.addEventListener("DOMContentLoaded", function () {
    const viewNotesButton = document.getElementById("view-notes");
    const notesContainer = document.getElementById("notes-container");
    const darkModeToggle = document.getElementById("toggle-dark-mode");

    // Display notes
    viewNotesButton.addEventListener("click", function () {
        fetch('/get_notes')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                notesContainer.innerHTML = ""; // 
                data.notes.forEach(note => {
                    let div = document.createElement("div");
                    div.classList.add("note-card");
                    div.setAttribute("data-id", note.id);
                    div.innerHTML = `
                        <h3>${note.title}</h3>
                        <p>${note.content}</p>
                        <button class="important-btn" data-id="${note.id}">
                        ${note.important?"Unmark Important":"Mark as Important"}
                        </button>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    `;
                    notesContainer.appendChild(div);
                });

                attachEventListeners(); 
            })
            .catch(error => console.error('Error fetching notes:', error));
    });

    // Dark mode 
    function updateDarkMode() {
        if (localStorage.getItem("darkMode") === "enabled") {
            document.body.classList.add("dark-mode");
            darkModeToggle.textContent = "Light Mode";
        } else {
            document.body.classList.remove("dark-mode");
            darkModeToggle.textContent = "Dark Mode";
        }
    }

    darkModeToggle.addEventListener("click", function () {
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "disabled");
        } else {
            localStorage.setItem("darkMode", "enabled");
        }
        updateDarkMode();
    });

    updateDarkMode();

    // Attach event listeners for edit & delete
    function attachEventListeners() {
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function () {
                const noteCard = this.closest(".note-card");
                const noteId = noteCard.getAttribute("data-id");

                if (confirm("Are you sure you want to delete this note?")) {
                    fetch(`/delete/${noteId}`, { method: "POST" })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                noteCard.remove();
                            } else {
                                alert("Failed to delete note.");
                            }
                        })
                        .catch(err => console.error("Delete Error:", err));
                }
            });
        });

        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", function () {
                const noteCard = this.closest(".note-card");
                const noteId = noteCard.getAttribute("data-id");
                const currentTitle = noteCard.querySelector("h3").textContent;
                const currentContent = noteCard.querySelector("p").textContent;

                const newTitle = prompt("Edit Title", currentTitle);
                const newContent = prompt("Edit Content", currentContent);

                if (newTitle && newContent) {
                    fetch(`/edit/${noteId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({ title: newTitle, content: newContent })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                noteCard.querySelector("h3").textContent = newTitle;
                                noteCard.querySelector("p").innerHTML = newContent.replace(/\n/g, "<br>");
                            } else {
                                alert("Failed to edit note.");
                            }
                        })
                        .catch(err => console.error("Edit Error:", err));
                }
            });
        });

        document.querySelectorAll(".important-btn").forEach(button => {
            button.addEventListener("click", function () {
                const noteId = this.getAttribute("data-id");
        
                fetch(`/mark_important/${noteId}`, { method: "POST" })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const noteCard = this.closest(".note-card");
                            const title = noteCard.querySelector("h3");
                            
                            if (data.important) {
                                title.innerHTML += " ⭐"; // Add star
                                this.textContent = "Unmark Important"; // Change button text
                            } else {
                                title.innerHTML = title.innerHTML.replace(" ⭐", ""); // Remove star
                                this.textContent = "Mark as Important"; // Change button text
                            }
                        } else {
                            alert("Failed to mark important.");
                        }
                    })
                    .catch(err => console.error("Error marking important:", err));
            });
        });



    }
});