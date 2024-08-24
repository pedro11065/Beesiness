import psycopg2

conn = psycopg2.connect(
    host="",
    database="beesiness",
    user="postgres",
    password=""
)
# Create a cursor
cur = conn.cursor()

# Insert some data into an existing table
cur.execute("CREATE TABLE db_users (id int primary key, fullname varchar(255), email varchar(255) unique, password varchar(25), birthday varchar(10));")

# Commit the changes
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()
