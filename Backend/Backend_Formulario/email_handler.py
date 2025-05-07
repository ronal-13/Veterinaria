import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuración del servidor SMTP
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_SENDER = "ronalasencio13@gmail.com"
EMAIL_PASSWORD = "uxkw aqan ovkw evqo"
EMAIL_RECEIVER = "ronalasencio13@gmail.com"

def send_email(first_name, last_name, email, phone, message):
    try:
        subject = "📩 Nueva consulta desde el formulario web"
        body = f"""
🚀 ¡Has recibido un nuevo mensaje!

🧑 Nombre: {first_name} {last_name}
📧 Email: {email}
📞 Teléfono: {phone}
✍️ Mensaje:
{message}

Revisa y responde cuanto antes.
        """

        msg = MIMEMultipart()
        msg["From"] = EMAIL_SENDER
        msg["To"] = EMAIL_RECEIVER
        msg["Subject"] = subject
        msg["X-Priority"] = "1"

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_SENDER, EMAIL_RECEIVER, msg.as_string())
        server.quit()

        print("✅ Correo enviado correctamente.")
    except Exception as e:
        print(f"❌ Error al enviar el correo: {e}")
