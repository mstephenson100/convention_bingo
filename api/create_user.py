import pymysql
import config
import getpass
from werkzeug.security import generate_password_hash
from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT

def create_or_update_user():
    username = input("Enter username: ").strip()
    password = getpass.getpass("Enter new password: ")
    confirm = getpass.getpass("Confirm password: ")

    if password != confirm:
        print("❌ Passwords do not match.")
        return

    password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    try:
        conn = pymysql.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, database=MYSQL_DB)
        with conn.cursor() as cur:
            # Try update first
            update_sql = "UPDATE users SET password_hash = %s WHERE username = %s"
            cur.execute(update_sql, (password_hash, username))
            if cur.rowcount == 0:
                # No rows updated, so insert
                insert_sql = "INSERT INTO users (username, password_hash) VALUES (%s, %s)"
                cur.execute(insert_sql, (username, password_hash))
                print("✅ User created.")
            else:
                print("🔁 Password updated.")
        conn.commit()
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_or_update_user()

