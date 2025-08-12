import os
import random
import uuid
import jwt
from datetime import datetime, timedelta

import pymysql
from pymysql.cursors import DictCursor
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
from flask_cors import CORS
from functools import wraps
from config import UPLOAD_FOLDER, AVATAR_FOLDER, ALLOWED_EXTENSIONS, MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT, SECRET_KEY

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['AVATAR_FOLDER'] = AVATAR_FOLDER
app.config['SECRET_KEY'] = SECRET_KEY
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def log(msg):
    print(f"[{datetime.now().isoformat()}] {msg}")


def get_db_connection():
    return pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        charset="utf8mb4",
        cursorclass=DictCursor
    )


def require_token(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = None

        # Look for token in Authorization header
        if 'Authorization' in request.headers:
            bearer = request.headers['Authorization']
            if bearer.startswith("Bearer "):
                token = bearer.split(" ")[1]

        if not token:
            return jsonify({"error": "Missing token"}), 401

        try:
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            request.user_id = decoded['user_id']  # Optionally store user_id on request
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return func(*args, **kwargs)
    return wrapper


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT id, username, password_hash, locked FROM users WHERE username = %s", (username,))
            user = cur.fetchone()
    except Exception as e:
        return jsonify({'error': f'Database error: {e}'}), 500
    finally:
        conn.close()

    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    if user.get('locked'):
        return jsonify({'error': 'Account is locked'}), 403

    if not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.utcnow() + timedelta(days=365 * 10)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token})


@app.route("/api/users")
@require_token
def get_users():
    con = get_db_connection()
    try:
        cur = con.cursor(pymysql.cursors.DictCursor)
        cur.execute("SELECT id, username, avatar FROM users")
        rows = cur.fetchall()
        users = [
            {"id": row["id"], "username": row["username"], "avatar": row["avatar"]}
            for row in rows
        ]
        return jsonify(users)
    finally:
        cur.close()
        con.close()


@app.route("/api/boxes")
@require_token
def get_all_boxes():
    con = get_db_connection()
    try:
        cur = con.cursor()
        cur.execute("SELECT id, label FROM bingo_boxes")
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        con.close()


@app.route("/api/card/<int:user_id>", methods=["GET"])
@require_token
def get_user_card(user_id):
    con = get_db_connection()
    try:
        cur = con.cursor()
        cur.execute("""
            SELECT `row`, `col`, bb.label, ubc.image_path
            FROM user_bingo_cards ubc
            JOIN bingo_boxes bb ON ubc.box_id = bb.id
            WHERE ubc.user_id = %s
        """, (user_id,))
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        con.close()


@app.route("/api/card/<int:user_id>", methods=["POST"])
@require_token
def generate_user_card(user_id):
    con = get_db_connection()
    try:
        cur = con.cursor()

        # Prevent card generation if locked
        cur.execute("SELECT locked FROM users WHERE id = %s", (user_id,))
        result = cur.fetchone()
        if result and result.get("locked"):
            return jsonify({"error": "Card is locked"}), 403

        # Get 25 random box IDs
        cur.execute("SELECT id FROM bingo_boxes ORDER BY RAND() LIMIT 25")
        box_ids = [row["id"] for row in cur.fetchall()]

        # Clear previous card
        cur.execute("DELETE FROM user_bingo_cards WHERE user_id = %s", (user_id,))

        # Insert new card
        for idx, box_id in enumerate(box_ids):
            row, col = divmod(idx, 5)
            cur.execute("""
                INSERT INTO user_bingo_cards (user_id, `row`, `col`, box_id)
                VALUES (%s, %s, %s, %s)
            """, (user_id, row, col, box_id))

        con.commit()
        return jsonify({"status": "card_generated"})
    finally:
        cur.close()
        con.close()


@app.route("/api/card/<int:user_id>/<int:row>/<int:col>/upload", methods=["POST"])
@require_token
def upload_square_image(user_id, row, col):
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    original_filename = secure_filename(file.filename)
    ext = original_filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(save_path)

    # Store path relative to root (excluding www-data)
    rel_path = f"uploads/{unique_filename}"

    con = get_db_connection()
    try:
        cur = con.cursor()
        cur.execute("""
            UPDATE user_bingo_cards
            SET image_path = %s
            WHERE user_id = %s AND `row` = %s AND `col` = %s
        """, (rel_path, user_id, row, col))
        con.commit()
        return jsonify({"status": "image_uploaded", "path": rel_path})
    finally:
        cur.close()
        con.close()


@app.route("/api/card/<int:user_id>/lock", methods=["POST"])
@require_token
def lock_user_card(user_id):
    con = get_db_connection()
    with con:
        with con.cursor() as cur:
            cur.execute("UPDATE users SET locked = 1 WHERE id = %s", (user_id,))
        con.commit()
    return jsonify({"success": True})


@app.route("/api/card/<int:user_id>/unlock", methods=["POST"])
@require_token
def unlock_user_card(user_id):
    con = get_db_connection()
    try:
        cur = con.cursor()
        cur.execute("UPDATE users SET locked = 0 WHERE id = %s", (user_id,))
        con.commit()
        return jsonify({"status": "unlocked"})
    finally:
        cur.close()
        con.close()


@app.route('/api/card/<int:user_id>/lock-status')
@require_token
def card_lock_status(user_id):
    con = get_db_connection()
    cur = con.cursor()
    cur.execute("SELECT locked FROM users WHERE id = %s", (user_id,))
    row = cur.fetchone()
    cur.close()
    con.close()

    locked = bool(row['locked']) if row else False
    return jsonify({'locked': locked})


@app.route('/api/users/<int:user_id>/upload-avatar', methods=['POST'])
@require_token
def upload_avatar(user_id):
    file = request.files['image']
    filename = secure_filename(file.filename)
    save_path = os.path.join(app.config['AVATAR_FOLDER'], filename)
    file.save(save_path)

    con = get_db_connection()
    try:
        with con.cursor() as cur:
            cur.execute(
                "UPDATE users SET avatar = %s WHERE id = %s",
                (f"avatars/{filename}", user_id)
            )
        con.commit()
    finally:
        con.close()

    return jsonify({"avatar": f"avatars/{filename}"})


@app.route("/uploads/<filename>")
@require_token
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    from flask import url_for
    app.testing = True
    with app.test_request_context():
        print("\nRegistered routes:")
        for rule in app.url_map.iter_rules():
            print(rule)
    app.run(debug=True, host='0.0.0.0', port=5500)
