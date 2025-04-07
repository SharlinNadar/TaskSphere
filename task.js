import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Get the status modal and message elements
const statusModal = document.getElementById("status-modal");
const modalMessage = document.getElementById("status-message");
const closeModal = document.querySelector(".status-modal .close-btn");

// Function to show the status modal with a message
function showStatusModal(message) {
    modalMessage.textContent = message;
    statusModal.style.display = "block"; // Show the modal

    closeModal.addEventListener("click", () => {
        statusModal.style.display = "none"; // Close modal on click of close button
    });

    window.addEventListener("click", (event) => {
        if (event.target === statusModal) {
            statusModal.style.display = "none"; // Close modal when clicked outside
        }
    });
}

// Check if user is logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User authenticated:", user.uid);

        // Fetch user tasks
        const tasksRef = collection(db, "tasks");
        const q = query(tasksRef, where("assignedTo", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const taskList = document.getElementById("task-list");
        taskList.innerHTML = ''; // Clear existing tasks

        querySnapshot.forEach((doc) => {
            const task = doc.data();
            const li = document.createElement("li");
            li.classList.add("task-item");
            li.innerHTML = `
                <span class="task-title">${task.title}</span>
                <span class="task-status">${task.status}</span>
                <button class="edit-btn" data-id="${doc.id}">Edit</button>
                <button class="delete-btn" data-id="${doc.id}">Delete</button>
            `;
            taskList.appendChild(li);
        });

        // Add event listeners for Edit and Delete buttons
        document.querySelectorAll(".edit-btn").forEach((button) => {
            button.addEventListener("click", editTask);
        });

        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", deleteTask);
        });

    } else {
        console.error("User not authenticated. Redirecting to login.");
        window.location.href = "login.html";
    }
});

// Logout functionality
document.getElementById("logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "login.html"; 
    }).catch((error) => {
        console.error("Logout failed:", error);
    });
});

// Modal functionality
const createTaskBtn = document.getElementById("create-task-btn");
const modal = document.getElementById("create-task-modal");
const closeModalInCreateTask = document.querySelector(".modal .close");

// Open modal for creating new task
createTaskBtn.addEventListener("click", () => {
    document.getElementById("modal-title").textContent = "Create New Task";
    document.getElementById("task-id").value = ''; // Reset task ID
    document.getElementById("submit-btn").textContent = "Create Task";
    modal.style.display = "block";
});

// Close modal for creating new task
closeModalInCreateTask.addEventListener("click", () => {
    modal.style.display = "none";
});

// Close modal when clicked outside
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Edit task
async function editTask(event) {
    const taskId = event.target.getAttribute("data-id");
    const taskRef = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(taskRef);

    if (taskSnap.exists()) {
        const taskData = taskSnap.data();
        document.getElementById("task-id").value = taskId;
        document.getElementById("task-title").value = taskData.title;
        document.getElementById("task-desc").value = taskData.description;
        document.getElementById("task-status").value = taskData.status;
        document.getElementById("modal-title").textContent = "Edit Task";
        document.getElementById("submit-btn").textContent = "Update Task";
        modal.style.display = "block";
    } else {
        showStatusModal("Task not found.");
    }
}

// Delete task
async function deleteTask(event) {
    const taskId = event.target.getAttribute("data-id");
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    showStatusModal("Task deleted successfully");
    window.location.reload(); // Reload to refresh the task list
}

// Create or update task
document.getElementById("create-task-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const taskId = document.getElementById("task-id").value;
    const taskTitle = document.getElementById("task-title").value;
    const taskDesc = document.getElementById("task-desc").value;
    const taskStatus = document.getElementById("task-status").value;
    
    const user = auth.currentUser;

    if (taskId) {
        // Update existing task
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, {
            title: taskTitle,
            description: taskDesc,
            status: taskStatus
        });
        showStatusModal("Task updated successfully");
    } else {
        // Create new task
        await addDoc(collection(db, "tasks"), {
            title: taskTitle,
            description: taskDesc,
            status: taskStatus,
            assignedTo: user.uid
        });
        showStatusModal("Task created successfully");
    }

    modal.style.display = "none"; // Close modal
    window.location.reload(); // Refresh task list
});
