// Asumiendo que tienes un formulario con los siguientes IDs:
const form = document.getElementById("contactForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Evita que se recargue la página

  // Captura los datos del formulario
  const formData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    message: document.getElementById("message").value,
  };

  try {
    const response = await fetch("https://base-de-datos-9f4z.onrender.com/submit-form", {  // api render del formulario
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      alert("✅ Tu mensaje fue enviado con éxito.");
      form.reset(); // Limpia el formulario
    } else {
      alert("⚠️ Error: " + result.error);
    }
  } catch (error) {
    alert("✅ Tu mensaje fue enviado con éxito.");
    console.error(error);
  }
});
