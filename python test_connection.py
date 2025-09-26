import psycopg2
from urllib.parse import quote

# Database credentials
username = "postgres"
password = "#kou22A11tch@70"
host = "localhost"
port = "5432"
database = "posinvent"

# Encode special characters in the password
encoded_password = quote(password)

# Build the connection string
connection_url = f"postgresql://{username}:{encoded_password}@{host}:{port}/{database}"

try:
    conn = psycopg2.connect(connection_url)
    print("✅ Connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")
