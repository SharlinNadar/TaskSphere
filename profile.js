import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const usernameEl = document.getElementById('username');
const userRoleEl = document.getElementById('user-role');
const userEmailEl = document.getElementById('user-email');
const editBtn = document.getElementById('edit-profile-btn');
const editForm = document.getElementById('edit-profile-form');
const nameInput = document.getElementById('edit-name');
const roleInput = document.getElementById('edit-role');
const emailInput = document.getElementById('edit-email');

let currentUserData = {};

// Load Profile
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        currentUserData = docSnap.data();
      } else {
        // Document does not exist, create it
        currentUserData = {
          fullName: user.displayName || 'New User',
          role: 'Participant',
          email: user.email
        };
        await setDoc(userRef, currentUserData);
        console.log('New user document created.');
      }

      // Populate UI
      usernameEl.textContent = currentUserData.fullName || 'No Name';
      userRoleEl.textContent = currentUserData.role || 'No Role';
      userEmailEl.textContent = user.email;

      nameInput.value = currentUserData.fullName || '';
      roleInput.value = currentUserData.role || '';
      emailInput.value = user.email;

    } catch (error) {
      console.error('Error loading profile:', error);
      Swal.fire('Error', 'Failed to load profile data.', 'error');
    }
  } else {
    window.location.href = 'login.html';
  }
});

// Toggle Edit Form
editBtn.addEventListener('click', () => {
  nameInput.value = currentUserData.fullName || '';
  roleInput.value = currentUserData.role || '';
  emailInput.value = auth.currentUser.email;

  editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
});

// Save Profile Changes
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newName = nameInput.value.trim();
  const newRole = roleInput.value.trim();

  const updates = {};
  if (newName !== currentUserData.fullName) updates.fullName = newName;
  if (newRole !== currentUserData.role) updates.role = newRole;

  if (Object.keys(updates).length === 0) {
    return Swal.fire('No Changes', 'Nothing to update.', 'info');
  }

  const confirm = await Swal.fire({
    title: 'Confirm Update',
    text: 'Do you want to save these changes?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, update it!',
    cancelButtonText: 'Cancel'
  });

  if (!confirm.isConfirmed) return;

  try {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      await updateDoc(userRef, updates);
    } else {
      await setDoc(userRef, {
        ...updates,
        email: auth.currentUser.email
      });
    }

    // Update UI and local memory
    if (updates.fullName) {
      usernameEl.textContent = updates.fullName;
      currentUserData.fullName = updates.fullName;
    }
    if (updates.role) {
      userRoleEl.textContent = updates.role;
      currentUserData.role = updates.role;
    }

    editForm.style.display = 'none';
    Swal.fire('Success', 'Profile updated successfully!', 'success');
  } catch (error) {
    console.error('Error updating profile:', error);
    Swal.fire('Error', 'Failed to update profile.', 'error');
  }
});
