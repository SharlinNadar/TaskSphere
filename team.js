import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { app } from './firebase-config.js';

const db = getFirestore(app);

// Elements
const form = document.getElementById('create-team-form');
const teamContainer = document.getElementById('team-container');
const membersInputContainer = document.getElementById('members-input-container');
const membersListPreview = document.getElementById('members-list-preview');
const addMemberBtn = document.getElementById('add-member-btn');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const closeModalBtn = document.querySelector('.close-btn');

let memberInputs = [];

// ✅ Show message in modal
function showMessage(message) {
  modalMessage.textContent = message;
  modal.style.display = 'flex';
}

// ✅ Close modal
closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// ✅ Add new member input
addMemberBtn.addEventListener('click', () => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('member-input');

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.name = 'member-name[]';
  nameInput.placeholder = 'Member Name';
  nameInput.required = true;

  const roleInput = document.createElement('input');
  roleInput.type = 'text';
  roleInput.name = 'member-role[]';
  roleInput.placeholder = 'Role';
  roleInput.required = true;

  wrapper.appendChild(nameInput);
  wrapper.appendChild(roleInput);

  membersInputContainer.appendChild(wrapper);

  updateMembersPreview();
});

// ✅ Update preview of members
function updateMembersPreview() {
  membersListPreview.innerHTML = '';
  const names = document.querySelectorAll('input[name="member-name[]"]');
  const roles = document.querySelectorAll('input[name="member-role[]"]');

  names.forEach((nameInput, index) => {
    const li = document.createElement('li');
    li.textContent = `${nameInput.value || 'Unnamed'} - ${roles[index].value || 'No role'}`;
    membersListPreview.appendChild(li);
  });
}

// ✅ Listen to changes and update preview
membersInputContainer.addEventListener('input', updateMembersPreview);

// ✅ Create team handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const teamName = document.getElementById('team-name').value.trim();
  const description = document.getElementById('team-description').value.trim();
  const names = document.querySelectorAll('input[name="member-name[]"]');
  const roles = document.querySelectorAll('input[name="member-role[]"]');

  if (!teamName || !description || names.length === 0) {
    showMessage('Please fill all fields and add at least one member.');
    return;
  }

  const members = [];

  for (let i = 0; i < names.length; i++) {
    const name = names[i].value.trim();
    const role = roles[i].value.trim();

    if (!name || !role) {
      showMessage('Each member must have a name and a role.');
      return;
    }

    members.push({ name, role });
  }

  try {
    await addDoc(collection(db, 'teams'), {
      name: teamName,
      description,
      members,
      createdAt: new Date()
    });

    showMessage('Team created successfully!');
    form.reset();
    membersListPreview.innerHTML = '';
    loadTeams(); // refresh team list
  } catch (err) {
    showMessage('Error creating team: ' + err.message);
  }
});

// ✅ Load and display teams
async function loadTeams() {
  teamContainer.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'teams'));

  snapshot.forEach((docSnap) => {
    const team = docSnap.data();
    const teamCard = document.createElement('div');
    teamCard.classList.add('team-card');

    teamCard.innerHTML = `
      <h3>${team.name}</h3>
      <p>${team.description}</p>
      <button class="view-details-btn" data-id="${docSnap.id}">View Details</button>
    `;

    teamContainer.appendChild(teamCard);
  });
}

// ✅ Handle team modal (view/delete)
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('view-details-btn')) {
    const teamId = e.target.dataset.id;
    const teamDoc = doc(db, 'teams', teamId);
    const teamData = (await getDocs(collection(db, 'teams'))).docs.find(d => d.id === teamId)?.data();

    if (!teamData) {
      showMessage("Team not found.");
      return;
    }

    const teamInfo = document.getElementById('team-info');
    teamInfo.innerHTML = `
      <h4>${teamData.name}</h4>
      <p>${teamData.description}</p>
      <ul>${teamData.members.map(m => `<li>${m.name} - ${m.role}</li>`).join('')}</ul>
    `;

    document.getElementById('team-details-modal').style.display = 'flex';
    document.getElementById('delete-team-btn').setAttribute('data-id', teamId);
  }

  // Close team modal
  if (e.target.classList.contains('close')) {
    document.getElementById('team-details-modal').style.display = 'none';
  }

  // Delete team
  if (e.target.id === 'delete-team-btn') {
    const id = e.target.getAttribute('data-id');
    await deleteDoc(doc(db, 'teams', id));
    document.getElementById('team-details-modal').style.display = 'none';
    showMessage('Team deleted.');
    loadTeams();
  }
});

// ✅ Initial load
loadTeams();
