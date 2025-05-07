from flask import Flask, request, jsonify
import sqlite3
from email_handler import send_email
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/submit-form', methods=['POST'])
def submit_form():
    try:
        data = request.json
        print("📨 Datos recibidos:", data)

        first_name = data.get("firstName", "").strip()
        last_name = data.get("lastName", "").strip()
        email = data.get("email", "").strip()
        phone = data.get("phone", "").strip()
        message = data.get("message", "").strip()

        if not all([first_name, last_name, email, phone, message]):
            return jsonify({"success": False, "error": "Todos los campos son obligatorios"}), 400

        with sqlite3.connect("database.db") as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO contact_messages (first_name, last_name, email, phone, message)
                VALUES (?, ?, ?, ?, ?)
            """, (first_name, last_name, email, phone, message))
            conn.commit()

        send_email(first_name, last_name, email, phone, message)

        print("✅ Formulario procesado con éxito.")
        return jsonify({"success": True, "message": "Formulario enviado correctamente"}), 201

    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "Este correo ya fue registrado"}), 400
    except Exception as e:
        print(f"❌ Error interno: {e}")
        return jsonify({"success": False, "error": "Error del servidor"}), 500

if __name__ == '__main__':
    from os import environ
    port = int(environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
