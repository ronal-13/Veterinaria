document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevenir envío del formulario
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");
  
    // Credenciales válidas
    const validUser = "pepe13";
    const validPass = "12345678";
  
    if (username === validUser && password === validPass) {
      // Redirigir al menú si es correcto
      window.location.href = "menu.html";
    } else {
      // Mostrar mensaje de error
      errorMessage.textContent = "⚠️ Usuario o contraseña incorrectos.";
    }
  });

  // Funciones para el modal de logout
  function confirmLogout() {
    document.getElementById('logoutModal').style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('logoutModal').style.display = 'none';
  }

  function logout() {
    closeModal();
    // Redirigir al login
    window.location.href = "../gestion/Login.html"; // Redirige al login
  }
  