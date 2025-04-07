import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Check if user is logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User authenticated:", user.uid);

        // Fetch user details
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log("User data:", userData);

            document.getElementById("user-name").textContent = userData.name || user.email;
            document.getElementById("user-role").textContent = userData.role || "User";
        } else {
            console.warn("No Firestore document found for user:", user.uid);
            document.getElementById("user-role").textContent = "User (No role found)";
        }

        // Fetch tasks for user
        const tasksRef = collection(db, "tasks");
        const q = query(tasksRef, where("assignedTo", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        let pendingCount = 0;
        let completedCount = 0;
        let inProgressCount = 0;

        querySnapshot.forEach((doc) => {
            const task = doc.data();
            if (task.status === 'pending') pendingCount++;
            if (task.status === 'completed') completedCount++;
            if (task.status === 'in-progress') inProgressCount++;
        });

        // Update dashboard task counts
        document.getElementById("pending-tasks").textContent = pendingCount;
        document.getElementById("completed-tasks").textContent = completedCount;
        document.getElementById("inprogress-tasks").textContent = inProgressCount;

        // Calculate progress percentage
        const totalTasks = pendingCount + completedCount + inProgressCount;
        const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
        document.getElementById("progress-fill").style.width = `${progressPercentage}%`;
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
const closeModal = document.querySelector(".modal .close");

// Open modal
createTaskBtn.addEventListener("click", () => {
    modal.style.display = "block";
});

// Close modal
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Close modal when clicked outside
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});
