# # import sqlite3

# # # connect to your database
# # conn = sqlite3.connect("hospital1.db")
# # cursor = conn.cursor()

# # # get all tables
# # cursor.execute("show tables;")
# # tables = cursor.fetchall()

# # print("Tables in database:")
# # for table in tables:
# #     print(table[0])
# #     cursor.execute("SELECT * FROM table WHERE type='table';")

# # # conn.close()
# import sqlite3

# conn = sqlite3.connect("hospital1.db")
# cursor = conn.cursor()

# # choose table name
# table_name = "members"  # Change this to the table you want to query
# # cursor.execute("PRAGMA table_info(bills);")
# # # 
# # # fetch all rows
# # # cursor.execute(f"PRAGMA table_info({table_name});")
# cursor.execute(f"SELECT * FROM {table_name};")
# rows = cursor.fetchall()

# print(f"Data from {table_name} table:")
# for row in rows:  
#     print(row)

# conn.close()
import sqlite3

# Connect to database (or create if not exists)
conn = sqlite3.connect("hospital1.db")
c = conn.cursor()

# Fetch all rows from a table
c.execute("SELECT * FROM appointments")
c.execute("PRAGMA table_info(prescriptions);")
print("doctors")
c.execute("PRAGMA table_info(doctors);")
print(c.fetchall())
print("members")
c.execute("PRAGMA table_info(members);")
print(c.fetchall())
print("front_office")
c.execute("PRAGMA table_info(front_office);")
print(c.fetchall())
print("appointments")
c.execute("PRAGMA table_info(appointments);")
print(c.fetchall())
print("slots")
c.execute("PRAGMA table_info(slots);")
print(c.fetchall())
print("medical_records")
c.execute("PRAGMA table_info(medical_records);")
print(c.fetchall())
print("prescriptions")
c.execute("PRAGMA table_info(prescriptions);")
print(c.fetchall())
print("bills")
c.execute("PRAGMA table_info(bills);")
print(c.fetchall())
print("checkins")
c.execute("PRAGMA table_info(checkins);")
print(c.fetchall())
print("user_types")
c.execute("PRAGMA table_info(user_types);")
print(c.fetchall())
print("families")
c.execute("PRAGMA table_info(families);")
print(c.fetchall())
print("admins")
c.execute("PRAGMA table_info(admins);")
print(c.fetchall())



rows = c.fetchall()

# Print rows
for row in rows:
    print(row)

# Close connection
conn.close()


# # # conn.close()
# # # import sqlite3

# # # conn = sqlite3.connect("hospital1.db")
# # # cursor = conn.cursor()

# # # cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
# # # tables = cursor.fetchall()

# # # print("Tables in the database:")
# # # for table in tables:
# # #     print(table[0])

# # # conn.close()

# # # import sqlite3

# # # conn = sqlite3.connect("hospital1.db")
# # # cursor = conn.cursor()

# # # table_name = "members"  # Change this to the table you want to inspect

# # # # Fetch structure of table
# # # cursor.execute(f"PRAGMA table_info({table_name});")
# # # columns = cursor.fetchall()

# # # print(f"Structure of {table_name} table:")
# # # print("CID | Name | Type | NotNull | Default | PrimaryKey")
# # # for col in columns:
# # #     print(col)

# # # conn.close()



# import sqlite3

# conn = sqlite3.connect("hospital1.db")
# cursor = conn.cursor()

# # Add a new column to 'members' table
# cursor.execute("ALTER TABLE bills ADD COLUMN payment_date DATETIME;;")

# conn.commit()
# conn.close()

# # # print("Column 'password_hash' added successfully!")
# # # import sqlite3
# # # import hashlib  # to hash passwords securely

# # # # # Connect to the database
# # # conn = sqlite3.connect("hospital1.db")
# # # cursor = conn.cursor()

# # # # Example: passwords for each member (replace with actual passwords)
# # # passwords = {
# # #     'DOC001': 'alice123',
# # #     'DOC002': 'bob123',
# # #     'DOC003': 'carol123',
# # #     'DOC022': 'rajini123'
# # # }

# # # # Update each member with a hashed password
# # # for member_code, password in passwords.items():
# # #     password_hash = hashlib.sha256(password.encode()).hexdigest()  # hash the password
# # #     cursor.execute(
# # #         "UPDATE doctors SET password_hash = ? WHERE id = ?",
# # #         (password_hash, member_code)
# # #     )

# # # # Commit changes and close
# # # conn.commit()
# # # conn.close()

# # # print("Passwords updated successfully!")



# import sqlite3

# conn = sqlite3.connect("hospital1.db")
# cursor = conn.cursor()

# cursor.execute("PRAGMA table_info(medical_records);")
# columns = cursor.fetchall()

# for col in columns:
#     print(col)

# conn.close()










# # import sqlite3
# # import hashlib

# # conn = sqlite3.connect("hospital1.db")
# # cursor = conn.cursor()

# # # Example passwords for doctors
# # passwords = {
# #     'OFC111': 'radha123',
# #     'OFC112': 'mary123',
# #     'OFC113': 'priya123'
# # }

# # for family_id, password in passwords.items():
# #     password_hash = hashlib.sha256(password.encode()).hexdigest()
# #     cursor.execute(
# #         "UPDATE front_office SET password_hash = ? WHERE family_id = ?",
# #         (password_hash, family_id)
# #     )

# # conn.commit()
# # conn.close()

# # print("front_office passwords updated successfully!")



# # import sqlite3

# # conn = sqlite3.connect('hospital1.db')
# # cursor = conn.cursor()

# # cursor.execute("""
# # DELETE FROM members
# # WHERE created_date = 'CURRENT_TIMESTAMP'
# # """)

# # conn.commit()
# # conn.close()
# # print("Rows deleted successfully.")
# import sqlite3

# # Connect to your SQLite database
# conn = sqlite3.connect('hospital1.db')
# cursor = conn.cursor()

# # Replace 'your_table_name' with the actual table name
# table_name = 'bills'

# # 1️⃣ Get table schema (CREATE TABLE statement)
# print("=== Table Schema ===")

# cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';")
# schema = cursor.fetchone()
# if schema:
#     print(schema[0])
# else:
#     print(f"Table '{table_name}' not found.")

# # 2️⃣ Get de





# import sqlite3

# conn = sqlite3.connect("hospital1.db")
# cursor = conn.cursor()

# # Add a new column to 'members' table
# cursor.execute("ALTER TABLE bills ADD COLUMN payment_date DATETIME;")

# conn.commit()
# conn.close()
# print("Column 'payment_date' added successfully!")