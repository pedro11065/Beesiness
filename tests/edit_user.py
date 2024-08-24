import psycopg2 #PostGreSQL library

from ..src.model.database.json_db import json_db_read #import a function from json_db_read

#create a user using user_info as parameter, all user data are temporarily in it
#Maybe, with this file its possible to resume 3 files in only one, just using another parameter
#to choose what will happen.

def create_user(usuario_data, usuario_db_tarefa): 
    db_login = json_db_read()
    # Connection details
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    # Create a cursor
    cur = conn.cursor()

    if usuario_db_tarefa == "0": #Create User
        # Insert some data into an existing table                                                               fullname            email           password          birthday
        cur.execute("INSERT INTO db_usuarios (fullname, email, password, birthday) VALUES (%s, %s, %s, %s)", (f'"{usuario_data[0]}", "{usuario_data[1]}", "{usuario_data[2]}", "{usuario_data[3]}"'))
        # Execute SQL code in db

    elif usuario_db_tarefa == "1": #Delete User
        cur.execute("DELETE FROM db_usuarios WHERE email = %s", (f'{usuario_data[1]}',))

    else: #Search user
        cur.execute("SELECT id, nomecompleto, email, senha, datadenascimento FROM db_usuarios")
        db_data = cur.fetchall() #Return order = id, fullname, email, password, birthday

        conn.commit()
        cur.close()
        conn.close()
        return db_data

    # Commit the changes, Notify the server that it is over
    conn.commit() 

    # Close the cursor and connection
    cur.close()
    conn.close()
