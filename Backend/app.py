from flask import Flask, request, jsonify, send_from_directory
import sqlite3
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Esto permite las peticiones desde tu frontend

# Función para crear la estructura de la base de datos
def crear_base_datos():
    conn = sqlite3.connect('gestion_mascotas.db')
    cursor = conn.cursor()
    
    # Tabla de mascotas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS mascotas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        tipo TEXT NOT NULL,
        raza TEXT,
        edad INTEGER,
        dueno TEXT,
        notas TEXT
    )
    ''')
    
    # Tabla de vacunas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS vacunas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mascota_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        fecha TEXT NOT NULL,
        proxima_fecha TEXT,
        veterinario TEXT,
        notas TEXT,
        FOREIGN KEY (mascota_id) REFERENCES mascotas (id)
    )
    ''')
    
    # Insertar datos de ejemplo si las tablas están vacías
    cursor.execute('SELECT COUNT(*) FROM mascotas')
    if cursor.fetchone()[0] == 0:
        # Mascotas de ejemplo
        mascotas = [
            ('Firulais', 'dog', 'Labrador', 3, 'Juan Pérez', ''),
            ('Michi', 'cat', 'Siamés', 2, 'María Gómez', ''),
            ('Piolín', 'bird', 'Canario', 1, 'Carlos Ruiz', '')
        ]
        
        cursor.executemany('''
        INSERT INTO mascotas (nombre, tipo, raza, edad, dueno, notas)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', mascotas)
        
        # Vacunas de ejemplo
        vacunas = [
            (1, 'rabia', '2023-03-15', '2024-03-15', 'Dr. Martínez', 'La mascota presentó leve decaimiento después de la aplicación.'),
            (2, 'triple', '2023-02-10', '2024-02-10', 'Dra. López', '')
        ]
        
        cursor.executemany('''
        INSERT INTO vacunas (mascota_id, tipo, fecha, proxima_fecha, veterinario, notas)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', vacunas)
    
    conn.commit()
    conn.close()

# Conexión a la base de datos
def get_db_connection():
    conn = sqlite3.connect('gestion_mascotas.db')
    conn.row_factory = sqlite3.Row
    return conn

# Operaciones CRUD para mascotas
@app.route('/api/mascotas', methods=['GET'])
def obtener_mascotas():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM mascotas')
    mascotas = cursor.fetchall()
    
    conn.close()
    return jsonify([dict(m) for m in mascotas])

@app.route('/api/mascotas/<int:id>', methods=['GET'])
def obtener_mascota(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM mascotas WHERE id = ?', (id,))
    mascota = cursor.fetchone()
    
    conn.close()
    return jsonify(dict(mascota)) if mascota else ('', 404)

@app.route('/api/mascotas', methods=['POST'])
def crear_mascota():
    datos = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO mascotas (nombre, tipo, raza, edad, dueno, notas)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (datos['nombre'], datos['tipo'], datos['raza'], datos['edad'], datos['dueno'], datos['notas']))
    
    id_mascota = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': id_mascota}), 201

@app.route('/api/mascotas/<int:id>', methods=['PUT'])
def actualizar_mascota(id):
    datos = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    UPDATE mascotas
    SET nombre = ?, tipo = ?, raza = ?, edad = ?, dueno = ?, notas = ?
    WHERE id = ?
    ''', (datos['nombre'], datos['tipo'], datos['raza'], datos['edad'], datos['dueno'], datos['notas'], id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'mensaje': 'Mascota actualizada correctamente'})

@app.route('/api/mascotas/<int:id>', methods=['DELETE'])
def eliminar_mascota(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Primero eliminamos las vacunas asociadas
    cursor.execute('DELETE FROM vacunas WHERE mascota_id = ?', (id,))
    
    # Luego eliminamos la mascota
    cursor.execute('DELETE FROM mascotas WHERE id = ?', (id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'mensaje': 'Mascota eliminada correctamente'})

# Operaciones CRUD para vacunas
@app.route('/api/vacunas', methods=['GET'])
def obtener_vacunas():
    mascota_id = request.args.get('mascota_id')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if mascota_id:
        cursor.execute('''
        SELECT v.*, m.nombre as mascota_nombre 
        FROM vacunas v
        JOIN mascotas m ON v.mascota_id = m.id
        WHERE v.mascota_id = ?
        ''', (mascota_id,))
    else:
        cursor.execute('''
        SELECT v.*, m.nombre as mascota_nombre 
        FROM vacunas v
        JOIN mascotas m ON v.mascota_id = m.id
        ''')
    
    vacunas = cursor.fetchall()
    
    conn.close()
    return jsonify([dict(v) for v in vacunas])

@app.route('/api/vacunas/<int:id>', methods=['GET'])
def obtener_vacuna(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT v.*, m.nombre as mascota_nombre 
    FROM vacunas v
    JOIN mascotas m ON v.mascota_id = m.id
    WHERE v.id = ?
    ''', (id,))
    
    vacuna = cursor.fetchone()
    
    conn.close()
    return jsonify(dict(vacuna)) if vacuna else ('', 404)

@app.route('/api/vacunas', methods=['POST'])
def crear_vacuna():
    datos = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO vacunas (mascota_id, tipo, fecha, proxima_fecha, veterinario, notas)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (datos['mascota_id'], datos['tipo'], datos['fecha'], datos.get('proxima_fecha'), datos.get('veterinario'), datos.get('notas')))
    
    id_vacuna = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': id_vacuna}), 201

@app.route('/api/vacunas/<int:id>', methods=['PUT'])
def actualizar_vacuna(id):
    datos = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    UPDATE vacunas
    SET mascota_id = ?, tipo = ?, fecha = ?, proxima_fecha = ?, veterinario = ?, notas = ?
    WHERE id = ?
    ''', (datos['mascota_id'], datos['tipo'], datos['fecha'], datos.get('proxima_fecha'), datos.get('veterinario'), datos.get('notas'), id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'mensaje': 'Vacuna actualizada correctamente'})

@app.route('/api/vacunas/<int:id>', methods=['DELETE'])
def eliminar_vacuna(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM vacunas WHERE id = ?', (id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'mensaje': 'Vacuna eliminada correctamente'})

if __name__ == '__main__':
    crear_base_datos()
    app.run(debug=True)