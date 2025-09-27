# import sqlite3

# # connect to your database
# conn = sqlite3.connect("hospital1.db")
# cursor = conn.cursor()

# # get all tables
# cursor.execute("show tables;")
# tables = cursor.fetchall()

# print("Tables in database:")
# for table in tables:
#     print(table[0])
#     cursor.execute("SELECT * FROM table WHERE type='table';")

# conn.close()
import sqlite3

conn = sqlite3.connect("hospital1.db")
cursor = conn.cursor()

# choose table name
table_name = "families"  # Change this to the table you want to query

# fetch all rows
# cursor.execute(f"PRAGMA table_info({table_name});")
cursor.execute(f"SELECT * FROM {table_name};")
rows = cursor.fetchall()

print(f"Data from {table_name} table:")
for row in rows:  
    print(row)

conn.close()
import sqlite3

# Connect to database (or create if not exists)
conn = sqlite3.connect("hospital1.db")
c = conn.cursor()

# Fetch all rows from a table
# cursor.execute("SELECT * FROM appointments")
# cursor.execute("PRAGMA table_info(prescriptions);")
# print("doctors")
# c.execute("PRAGMA table_info(doctors);")
# print(c.fetchall())
# print("members")
# c.execute("PRAGMA table_info(members);")
# print(c.fetchall())
# print
# c.execute("PRAGMA table_info(front_office);")
# print(c.fetchall())
# print("appointments")
# c.execute("PRAGMA table_info(appointments);")
# print(c.fetchall())
# print("slots")
# c.execute("PRAGMA table_info(slots);")
# print(c.fetchall())
# print("medical_records")
# c.execute("PRAGMA table_info(medical_records);")
# print(c.fetchall())
# print("prescriptions")
# c.execute("PRAGMA table_info(prescriptions);")
# print(c.fetchall())
# print("bills")
# c.execute("PRAGMA table_info(bills);")
# print(c.fetchall())
# print("checkins")
# c.execute("PRAGMA table_info(checkins);")
# print(c.fetchall())
# print("user_types")
# c.execute("PRAGMA table_info(user_types);")
# print(c.fetchall())
# print("families")
# c.execute("PRAGMA table_info(families);")
# print(c.fetchall())
# print("admins")
# c.execute("PRAGMA table_info(admins);")
# print(c.fetchall())



# rows = cursor.fetchall()

# # Print rows
# for row in rows:
#     print(row)

# Close connection
conn.close()


# conn.close()
# import sqlite3

# conn = sqlite3.connect("hospital1.db")
# cursor = conn.cursor()

# cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
# tables = cursor.fetchall()

# print("Tables in the database:")
# for table in tables:
#     print(table[0])

# conn.close()