// Variables de estado
let currentPetId = null;
let currentVaccineId = null;
let currentFilter = 'all';

// Configuración inicial
document.addEventListener('DOMContentLoaded', function() {
  updateCurrentDate();
  setupRouter();
  setupModals();
  handleRoute();  // <-- Esta es la llamada principal
  setupEventListeners();
});

// Funciones para interactuar con la API
async function fetchPets() {
  try {
    const response = await fetch('http://localhost:5000/api/mascotas');
    return await response.json();
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    return [];
  }
}

async function fetchPetDetails(id) {
  try {
    const response = await fetch(`http://localhost:5000/api/mascotas/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error al obtener detalles de mascota:', error);
    return null;
  }
}

async function fetchVaccines(petId = null) {
  try {
    const url = petId 
      ? `http://localhost:5000/api/vacunas?mascota_id=${petId}`
      : 'http://localhost:5000/api/vacunas';
    
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error al obtener vacunas:', error);
    return [];
  }
}

async function savePetToAPI(petData) {
  const method = petData.id ? 'PUT' : 'POST';
  const url = petData.id 
    ? `http://localhost:5000/api/mascotas/${petData.id}`
    : 'http://localhost:5000/api/mascotas';
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre: petData.name,
      tipo: petData.type,
      raza: petData.breed,
      edad: petData.age,
      dueno: petData.owner,
      notas: petData.notes
    })
  });
  
  return await response.json();
}

async function saveVaccineToAPI(vaccineData) {
  const method = vaccineData.id ? 'PUT' : 'POST';
  const url = vaccineData.id 
    ? `http://localhost:5000/api/vacunas/${vaccineData.id}`
    : 'http://localhost:5000/api/vacunas';
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mascota_id: vaccineData.petId,
      tipo: vaccineData.type,
      fecha: vaccineData.date,
      proxima_fecha: vaccineData.nextDate || null,
      veterinario: vaccineData.vet || null,
      notas: vaccineData.notes || ''
    })
  });
  
  return await response.json();
}

async function deletePetFromAPI(id) {
  const response = await fetch(`http://localhost:5000/api/mascotas/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
}

async function deleteVaccineFromAPI(id) {
  const response = await fetch(`http://localhost:5000/api/vacunas/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
}

// Funciones de la aplicación
function updateCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  document.getElementById('current-date').textContent = today.toLocaleDateString('es-ES', options);
}

function setupRouter() {
  // Solo agrega los listeners si no existen ya
  if (!window.routerInitialized) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const route = this.getAttribute('href').substring(1);
        window.location.hash = route;
      });
    });
    
    window.addEventListener('hashchange', handleRoute);
    window.routerInitialized = true;
  }
}

async function handleRoute() {
  const route = window.location.hash.substring(1) || 'inicio';
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = '';
  
  const view = document.createElement('div');
  view.className = `content-view ${route}`;
  
  switch(route) {
    case 'registro-mascotas':
      view.innerHTML = `
        <h2><i class="fas fa-paw"></i> Registro de Mascotas</h2>
        <p>Complete el formulario para registrar una nueva mascota en el sistema.</p>
        
        <form id="pet-form" class="pet-form">
          <div class="form-group">
            <label for="pet-name">Nombre de la mascota</label>
            <input type="text" id="pet-name" placeholder="Ej: Firulais" required>
          </div>
          
          <div class="form-group">
            <label for="pet-type">Tipo de mascota</label>
            <select id="pet-type" required>
              <option value="">Seleccione...</option>
              <option value="dog">Perro</option>
              <option value="cat">Gato</option>
              <option value="bird">Ave</option>
              <option value="rabbit">Conejo</option>
              <option value="other">Otro</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="pet-breed">Raza</label>
            <input type="text" id="pet-breed" placeholder="Ej: Labrador">
          </div>
          
          <div class="form-group">
            <label for="pet-age">Edad (años)</label>
            <input type="number" id="pet-age" min="0" max="30">
          </div>
          
          <div class="form-group">
            <label for="pet-owner">Dueño</label>
            <input type="text" id="pet-owner" placeholder="Nombre del dueño">
          </div>
          
          <div class="form-group">
            <label for="pet-notes">Notas adicionales</label>
            <textarea id="pet-notes" rows="3"></textarea>
          </div>
          
          <button type="submit"><i class="fas fa-save"></i> Registrar Mascota</button>
        </form>
      `;
      
    // Espera a que el DOM se actualice antes de buscar el formulario
  setTimeout(() => {
    const petForm = document.getElementById('pet-form');
    if (petForm) {
      petForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const petData = {
          name: document.getElementById('pet-name').value,
          type: document.getElementById('pet-type').value,
          breed: document.getElementById('pet-breed').value,
          age: document.getElementById('pet-age').value,
          owner: document.getElementById('pet-owner').value,
          notes: document.getElementById('pet-notes').value
        };
        
        try {
          await savePetToAPI(petData);
          alert('Mascota registrada exitosamente!');
          this.reset();
        } catch (error) {
          console.error('Error al registrar mascota:', error);
          alert('Ocurrió un error al registrar la mascota');
        }
      });
    }
  }, 0);
  break;
      
    case 'tabla-mascotas':
      await renderPetsTable(view);
      break;
      
    case 'registro-vacunas':
      await renderVaccinesView(view);
      break;
      
    case 'historial':
      view.innerHTML = `
        <h2><i class="fas fa-history"></i> Historial General</h2>
        <p>Registro completo de actividades del sistema.</p>
        
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-date">Hoy, 10:45 AM</div>
            <div class="timeline-content">
              <strong>Nueva vacuna registrada</strong> - Vacuna antirrábica aplicada a Firulais
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-date">Ayer, 3:20 PM</div>
            <div class="timeline-content">
              <strong>Mascota editada</strong> - Se actualizó la información de Michi
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-date">Ayer, 9:15 AM</div>
            <div class="timeline-content">
              <strong>Nuevo usuario registrado</strong> - Carlos Ruiz se unió al sistema
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-date">Lunes, 28/08/2023</div>
            <div class="timeline-content">
              <strong>Nueva mascota agregada</strong> - Piolín registrado en el sistema
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'configuracion':
      view.innerHTML = `
        <h2><i class="fas fa-cog"></i> Configuración</h2>
        <p>Personaliza la configuración del sistema según tus preferencias.</p>
        
        <div class="settings-grid">
          <div class="settings-menu">
            <button class="active"><i class="fas fa-user"></i> Perfil</button>
            <button><i class="fas fa-bell"></i> Notificaciones</button>
            <button><i class="fas fa-lock"></i> Seguridad</button>
            <button><i class="fas fa-palette"></i> Apariencia</button>
            <button><i class="fas fa-language"></i> Idioma</button>
          </div>
          
          <div class="settings-content">
            <h3><i class="fas fa-user"></i> Configuración de Perfil</h3>
            
            <form class="profile-form">
              <div class="form-group">
                <label for="profile-name">Nombre completo</label>
                <input type="text" id="profile-name" value="Nombre Usuario">
              </div>
              
              <div class="form-group">
                <label for="profile-email">Correo electrónico</label>
                <input type="email" id="profile-email" value="usuario@ejemplo.com">
              </div>
              
              <div class="form-group">
                <label for="profile-phone">Teléfono</label>
                <input type="tel" id="profile-phone" placeholder="+52 123 456 7890">
              </div>
              
              <div class="form-group">
                <label for="profile-photo">Foto de perfil</label>
                <input type="file" id="profile-photo">
              </div>
              
              <button type="submit"><i class="fas fa-save"></i> Guardar cambios</button>
            </form>
          </div>
        </div>
      `;
      break;
      
    case 'soporte':
      view.innerHTML = `
        <h2><i class="fas fa-question-circle"></i> Soporte</h2>
        <p>Encuentra ayuda y soporte para usar el sistema.</p>
        
        <div class="support-cards">
          <div class="support-card">
            <h3><i class="fas fa-book"></i> Documentación</h3>
            <p>Accede a nuestra documentación completa con guías y tutoriales.</p>
            <button class="support-btn"><i class="fas fa-external-link-alt"></i> Abrir</button>
          </div>
          
          <div class="support-card">
            <h3><i class="fas fa-video"></i> Video Tutoriales</h3>
            <p>Aprende con nuestros videos explicativos paso a paso.</p>
            <button class="support-btn"><i class="fas fa-external-link-alt"></i> Ver videos</button>
          </div>
          
          <div class="support-card">
            <h3><i class="fas fa-envelope"></i> Contacto</h3>
            <p>Contáctanos directamente para resolver tus dudas.</p>
            <button class="support-btn"><i class="fas fa-paper-plane"></i> Enviar mensaje</button>
          </div>
          
          <div class="support-card">
            <h3><i class="fas fa-comments"></i> Preguntas Frecuentes</h3>
            <p>Resuelve tus dudas con nuestras preguntas más comunes.</p>
            <button class="support-btn"><i class="fas fa-search"></i> Buscar</button>
          </div>
        </div>
      `;
      break;
      
    case 'grupo':
      view.innerHTML = `
        <h2><i class="fas fa-users"></i> Nuestro Equipo</h2>
        <p>Conoce al equipo detrás del desarrollo de este sistema.</p>
        
        <div class="team-members">
          <div class="member-card">
            <div class="member-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="member-name">Juan Pérez</div>
            <div class="member-role">Desarrollador Frontend</div>
            <div class="member-contact">
              <button class="social-btn"><i class="fab fa-github"></i></button>
              <button class="social-btn"><i class="fab fa-linkedin"></i></button>
              <button class="social-btn"><i class="fas fa-envelope"></i></button>
            </div>
          </div>
          
          <div class="member-card">
            <div class="member-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="member-name">María Gómez</div>
            <div class="member-role">Diseñadora UX/UI</div>
            <div class="member-contact">
              <button class="social-btn"><i class="fab fa-behance"></i></button>
              <button class="social-btn"><i class="fab fa-linkedin"></i></button>
              <button class="social-btn"><i class="fas fa-envelope"></i></button>
            </div>
          </div>
          
          <div class="member-card">
            <div class="member-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="member-name">Carlos Ruiz</div>
            <div class="member-role">Desarrollador Backend</div>
            <div class="member-contact">
              <button class="social-btn"><i class="fab fa-github"></i></button>
              <button class="social-btn"><i class="fab fa-linkedin"></i></button>
              <button class="social-btn"><i class="fas fa-envelope"></i></button>
            </div>
          </div>
          
          <div class="member-card">
            <div class="member-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="member-name">Ana Martínez</div>
            <div class="member-role">Administradora de Proyecto</div>
            <div class="member-contact">
              <button class="social-btn"><i class="fab fa-linkedin"></i></button>
              <button class="social-btn"><i class="fas fa-envelope"></i></button>
            </div>
          </div>
        </div>
      `;
      break;
      
    default:
      view.innerHTML = `
        <div class="welcome-card">
          <h1>Bienvenido al Sistema de Gestión de Mascotas</h1>
          <p>Seleccione una opción del menú lateral para comenzar.</p>
          <div class="welcome-pets">
            <i class="fas fa-dog"></i>
            <i class="fas fa-cat"></i>
            <i class="fas fa-dove"></i>
          </div>
        </div>
      `;
  }

  mainContent.appendChild(view);
}

async function renderPetsTable(container) {
  const pets = await fetchPets();
  
  container.innerHTML = `
    <h2><i class="fas fa-table"></i> Tabla de Mascotas</h2>
    <p>Listado completo de mascotas registradas en el sistema.</p>
    
    <div class="table-actions">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" id="pet-search" placeholder="Buscar mascotas...">
      </div>
      <button class="add-pet"><i class="fas fa-plus"></i> Agregar</button>
    </div>
    
    <table class="pets-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Raza</th>
          <th>Edad</th>
          <th>Dueño</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="pets-table-body">
        ${pets.map(pet => `
          <tr data-id="${pet.id}">
            <td>${pet.nombre}</td>
            <td><span class="pet-type ${pet.tipo}"><i class="fas fa-${getPetIcon(pet.tipo)}"></i> ${getPetTypeName(pet.tipo)}</span></td>
            <td>${pet.raza}</td>
            <td>${pet.edad}</td>
            <td>${pet.dueno}</td>
            <td>
              <button class="action-btn edit"><i class="fas fa-edit"></i></button>
              <button class="action-btn delete"><i class="fas fa-trash"></i></button>
              <button class="action-btn view"><i class="fas fa-eye"></i></button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="table-footer">
      <span>Mostrando ${pets.length} de ${pets.length} mascotas</span>
      <div class="pagination">
        <button disabled><i class="fas fa-chevron-left"></i></button>
        <button class="active">1</button>
        <button><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>
  `;
  
  // Configurar búsqueda
  const petSearch = document.getElementById('pet-search');
  if (petSearch) {
    petSearch.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#pets-table-body tr');
      
      rows.forEach(row => {
        const petName = row.querySelector('td:first-child').textContent.toLowerCase();
        row.style.display = petName.includes(searchTerm) ? '' : 'none';
      });
    });
  }
}

async function renderVaccinesView(container) {
  const pets = await fetchPets();
  
  container.innerHTML = `
    <h2><i class="fas fa-syringe"></i> Registro de Vacunas</h2>
    <p>Registro de vacunas aplicadas a las mascotas.</p>
    
    <div class="vaccine-controls">
      <select id="vaccine-filter">
        <option value="all">Todas las mascotas</option>
        ${pets.map(pet => `
          <option value="${pet.id}">${pet.nombre}</option>
        `).join('')}
      </select>
      <button class="add-vaccine"><i class="fas fa-plus"></i> Nueva Vacuna</button>
    </div>
    
    <div id="vaccines-list">
      ${await renderVaccinesList()}
    </div>
  `;
  
  // Configurar filtro
  const vaccineFilter = document.getElementById('vaccine-filter');
  if (vaccineFilter) {
    vaccineFilter.addEventListener('change', async function(e) {
      currentFilter = e.target.value;
      document.getElementById('vaccines-list').innerHTML = await renderVaccinesList();
    });
  }
}

async function renderVaccinesList() {
  let vaccines = currentFilter === 'all' 
    ? await fetchVaccines() 
    : await fetchVaccines(currentFilter);
  
  if (vaccines.length === 0) {
    return `
      <div class="no-results">
        <i class="fas fa-info-circle"></i>
        <p>No se encontraron vacunas registradas</p>
      </div>
    `;
  }
  
  return vaccines.map(vaccine => `
    <div class="vaccine-card" data-id="${vaccine.id}">
      <div class="vaccine-header">
        <h3><i class="fas fa-syringe"></i> ${getVaccineName(vaccine.tipo)}</h3>
        <div class="vaccine-actions">
          <button class="action-btn edit-vaccine" data-id="${vaccine.id}"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete-vaccine" data-id="${vaccine.id}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="vaccine-info">
        <div><strong>Mascota:</strong> ${vaccine.mascota_nombre}</div>
        <div><strong>Fecha aplicación:</strong> ${formatDate(vaccine.fecha)}</div>
        ${vaccine.proxima_fecha ? `<div><strong>Próxima dosis:</strong> ${formatDate(vaccine.proxima_fecha)}</div>` : ''}
        ${vaccine.veterinario ? `<div><strong>Veterinario:</strong> ${vaccine.veterinario}</div>` : ''}
      </div>
      ${vaccine.notas ? `
        <div class="vaccine-notes">
          <strong>Observaciones:</strong> ${vaccine.notas}
        </div>
      ` : ''}
    </div>
  `).join('');
}

async function viewPetDetails(petId) {
  const pet = await fetchPetDetails(petId);
  if (!pet) return;
  
  const petVaccines = await fetchVaccines(petId);
  
  const modal = document.getElementById('pet-details-modal');
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2><i class="fas fa-paw"></i> Detalles de ${pet.nombre}</h2>
      
      <div class="pet-details">
        <div class="detail-row">
          <span class="detail-label">Tipo:</span>
          <span class="detail-value"><span class="pet-type ${pet.tipo}"><i class="fas fa-${getPetIcon(pet.tipo)}"></i> ${getPetTypeName(pet.tipo)}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Raza:</span>
          <span class="detail-value">${pet.raza}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Edad:</span>
          <span class="detail-value">${pet.edad} años</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Dueño:</span>
          <span class="detail-value">${pet.dueno}</span>
        </div>
        ${pet.notas ? `
        <div class="detail-row">
          <span class="detail-label">Notas:</span>
          <span class="detail-value">${pet.notas}</span>
        </div>
        ` : ''}
      </div>
      
      <h3><i class="fas fa-syringe"></i> Vacunas</h3>
      <div class="pet-vaccines">
        ${petVaccines.length > 0 ? 
          petVaccines.map(vaccine => `
            <div class="vaccine-item">
              <div class="vaccine-type">${getVaccineName(vaccine.tipo)}</div>
              <div class="vaccine-date">${formatDate(vaccine.fecha)}</div>
            </div>
          `).join('') : 
          '<p>No hay vacunas registradas para esta mascota.</p>'}
      </div>
    </div>
  `;
  
  showModal(modal);
}

function setupModals() {
  // Eventos para cerrar modales
  document.querySelectorAll('.close-modal, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Evento para el botón de agregar mascota
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-pet') || 
        (e.target.closest('.add-pet'))) {
      openPetModal();
    }
    
    if (e.target.classList.contains('add-vaccine') || 
        (e.target.closest('.add-vaccine'))) {
      openVaccineModal();
    }
  });
  
  // Formulario de mascota
  document.getElementById('pet-form-modal').addEventListener('submit', function(e) {
    e.preventDefault();
    savePet();
  });
  
  // Formulario de vacuna
  document.getElementById('vaccine-form-modal').addEventListener('submit', function(e) {
    e.preventDefault();
    saveVaccine();
  });
  
  // Confirmar eliminar mascota
  document.querySelector('#delete-pet-modal .confirm-delete-btn').addEventListener('click', function() {
    deletePet(currentPetId);
  });
  
  // Confirmar eliminar vacuna
  document.querySelector('#delete-vaccine-modal .confirm-delete-btn').addEventListener('click', function() {
    deleteVaccine(currentVaccineId);
  });
  
  // Filtro de vacunas
  document.addEventListener('change', function(e) {
    if (e.target.id === 'vaccine-filter') {
      currentFilter = e.target.value;
      renderVaccines();
    }
  });
}

function setupEventListeners() {
  // Delegación de eventos para botones de editar/eliminar mascota
  document.addEventListener('click', function(e) {
    const editBtn = e.target.closest('.action-btn.edit');
    const deleteBtn = e.target.closest('.action-btn.delete');
    const viewBtn = e.target.closest('.action-btn.view');
    
    if (editBtn) {
      const row = editBtn.closest('tr');
      const petId = parseInt(row.dataset.id);
      openPetModal(petId);
    }
    
    if (deleteBtn) {
      const row = deleteBtn.closest('tr');
      const petId = parseInt(row.dataset.id);
      const petName = row.querySelector('td:first-child').textContent;
      openDeletePetModal(petId, petName);
    }
    
    if (viewBtn) {
      const row = viewBtn.closest('tr');
      const petId = parseInt(row.dataset.id);
      viewPetDetails(petId);
    }
  });
  
  // Delegación de eventos para botones de editar/eliminar vacuna
  document.addEventListener('click', function(e) {
    const editVaccineBtn = e.target.closest('.edit-vaccine');
    const deleteVaccineBtn = e.target.closest('.delete-vaccine');
    
    if (editVaccineBtn) {
      const vaccineId = parseInt(editVaccineBtn.dataset.id);
      openVaccineModal(vaccineId);
    }
    
    if (deleteVaccineBtn) {
      const vaccineId = parseInt(deleteVaccineBtn.dataset.id);
      openDeleteVaccineModal(vaccineId);
    }
  });
}

async function openPetModal(petId = null) {
  currentPetId = petId;
  const modal = document.getElementById('pet-modal');
  const form = document.getElementById('pet-form-modal');
  
  if (petId) {
    // Modo edición
    document.getElementById('pet-modal-title').innerHTML = '<i class="fas fa-paw"></i> Editar Mascota';
    const pet = await fetchPetDetails(petId);
    
    if (pet) {
      document.getElementById('modal-pet-name').value = pet.nombre;
      document.getElementById('modal-pet-type').value = pet.tipo;
      document.getElementById('modal-pet-breed').value = pet.raza;
      document.getElementById('modal-pet-age').value = pet.edad;
      document.getElementById('modal-pet-owner').value = pet.dueno;
      document.getElementById('modal-pet-notes').value = pet.notas || '';
      document.getElementById('pet-id').value = pet.id;
    }
  } else {
    // Modo nuevo
    document.getElementById('pet-modal-title').innerHTML = '<i class="fas fa-paw"></i> Agregar Nueva Mascota';
    form.reset();
    document.getElementById('pet-id').value = '';
  }
  
  showModal(modal);
}

async function openVaccineModal(vaccineId = null) {
  currentVaccineId = vaccineId;
  const modal = document.getElementById('vaccine-modal');
  const form = document.getElementById('vaccine-form-modal');
  
  // Llenar select de mascotas
  const pets = await fetchPets();
  const petSelect = document.getElementById('modal-vaccine-pet');
  petSelect.innerHTML = pets.map(pet => 
    `<option value="${pet.id}">${pet.nombre} (${getPetTypeName(pet.tipo)})</option>`
  ).join('');
  
  if (vaccineId) {
    // Modo edición
    document.getElementById('vaccine-modal-title').innerHTML = '<i class="fas fa-syringe"></i> Editar Vacuna';
    const vaccines = await fetchVaccines();
    const vaccine = vaccines.find(v => v.id === vaccineId);
    
    if (vaccine) {
      document.getElementById('modal-vaccine-pet').value = vaccine.mascota_id;
      document.getElementById('modal-vaccine-type').value = vaccine.tipo;
      document.getElementById('modal-vaccine-date').value = vaccine.fecha;
      document.getElementById('modal-vaccine-next').value = vaccine.proxima_fecha || '';
      document.getElementById('modal-vaccine-vet').value = vaccine.veterinario || '';
      document.getElementById('modal-vaccine-notes').value = vaccine.notas || '';
      document.getElementById('vaccine-id').value = vaccine.id;
    }
  } else {
    // Modo nuevo
    document.getElementById('vaccine-modal-title').innerHTML = '<i class="fas fa-syringe"></i> Nueva Vacuna';
    form.reset();
    document.getElementById('vaccine-id').value = '';
    document.getElementById('modal-vaccine-date').value = new Date().toISOString().split('T')[0];
    
    // Seleccionar la primera mascota por defecto
    if (pets.length > 0) {
      document.getElementById('modal-vaccine-pet').value = pets[0].id;
    }
  }
  
  showModal(modal);
}

function openDeletePetModal(petId, petName) {
  currentPetId = petId;
  document.getElementById('pet-to-delete').textContent = petName;
  showModal(document.getElementById('delete-pet-modal'));
}

async function openDeleteVaccineModal(vaccineId) {
  currentVaccineId = vaccineId;
  const vaccines = await fetchVaccines();
  const vaccine = vaccines.find(v => v.id === vaccineId);
  if (vaccine) {
    document.getElementById('vaccine-to-delete').textContent = `${getVaccineName(vaccine.tipo)} de ${vaccine.mascota_nombre}`;
  }
  showModal(document.getElementById('delete-vaccine-modal'));
}

async function savePet() {
  const form = document.getElementById('pet-form-modal');
  const petId = document.getElementById('pet-id').value;
  const petData = {
    id: petId || null,
    name: document.getElementById('modal-pet-name').value,
    type: document.getElementById('modal-pet-type').value,
    breed: document.getElementById('modal-pet-breed').value,
    age: document.getElementById('modal-pet-age').value,
    owner: document.getElementById('modal-pet-owner').value,
    notes: document.getElementById('modal-pet-notes').value
  };
  
  try {
    await savePetToAPI(petData);
    alert('Mascota guardada exitosamente!');
    closeAllModals();
    
    // Actualizar la vista
    if (window.location.hash.includes('tabla-mascotas') || 
        window.location.hash.includes('registro-vacunas')) {
      await handleRoute();
    }
  } catch (error) {
    console.error('Error al guardar mascota:', error);
    alert('Ocurrió un error al guardar la mascota');
  }
}

async function saveVaccine() {
  const form = document.getElementById('vaccine-form-modal');
  const vaccineId = document.getElementById('vaccine-id').value;
  const petId = document.getElementById('modal-vaccine-pet').value;
  
  const vaccineData = {
    id: vaccineId || null,
    petId: petId,
    type: document.getElementById('modal-vaccine-type').value,
    date: document.getElementById('modal-vaccine-date').value,
    nextDate: document.getElementById('modal-vaccine-next').value || null,
    vet: document.getElementById('modal-vaccine-vet').value || null,
    notes: document.getElementById('modal-vaccine-notes').value || ''
  };
  
  try {
    await saveVaccineToAPI(vaccineData);
    alert('Vacuna guardada exitosamente!');
    closeAllModals();
    
    // Actualizar la vista
    if (window.location.hash.includes('registro-vacunas')) {
      await handleRoute();
    }
  } catch (error) {
    console.error('Error al guardar vacuna:', error);
    alert('Ocurrió un error al guardar la vacuna');
  }
}

async function deletePet(petId) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta mascota y todas sus vacunas?')) {
    return;
  }
  
  try {
    await deletePetFromAPI(petId);
    alert('Mascota eliminada correctamente');
    closeAllModals();
    
    // Actualizar la vista
    if (window.location.hash.includes('tabla-mascotas') || 
        window.location.hash.includes('registro-vacunas')) {
      await handleRoute();
    }
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    alert('Ocurrió un error al eliminar la mascota');
  }
}

async function deleteVaccine(vaccineId) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta vacuna?')) {
    return;
  }
  
  try {
    await deleteVaccineFromAPI(vaccineId);
    alert('Vacuna eliminada correctamente');
    closeAllModals();
    
    // Actualizar la vista
    if (window.location.hash.includes('registro-vacunas')) {
      await handleRoute();
    }
  } catch (error) {
    console.error('Error al eliminar vacuna:', error);
    alert('Ocurrió un error al eliminar la vacuna');
  }
}

function showModal(modal) {
  closeAllModals();
  document.getElementById('modal-container').style.display = 'flex';
  modal.classList.add('active');
}

function closeAllModals() {
  document.getElementById('modal-container').style.display = 'none';
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

// Funciones auxiliares
function getPetIcon(type) {
  const icons = {
    dog: 'dog',
    cat: 'cat',
    bird: 'dove',
    rabbit: 'rabbit'
  };
  return icons[type] || 'paw';
}

function getPetTypeName(type) {
  const names = {
    dog: 'Perro',
    cat: 'Gato',
    bird: 'Ave',
    rabbit: 'Conejo'
  };
  return names[type] || 'Otro';
}

function getVaccineName(type) {
  const names = {
    rabia: 'Antirrábica',
    triple: 'Triple Felina',
    moquillo: 'Moquillo',
    leucemia: 'Leucemia Felina'
  };
  return names[type] || 'Otra vacuna';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
}