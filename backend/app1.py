from datetime import datetime, timedelta
from enum import member
import hashlib
from flask import Flask, flash, json, jsonify, request, redirect, url_for, render_template, session
import sqlite3
import random
import os
import logging
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import time


from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Add these imports near the other flask imports
from flask_cors import CORS
from flask import send_from_directory  # if you want to serve React build in production


app.secret_key = 'super_secret_key'  # Change this in production
DATABASE = 'hospital1.db'
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE}'
DATABASE = r'C:\Users\ADMIN\Documents\Truvisory\SMB (3)\SMB\backend\hospital1.db'

# ✅ Session + CORS configuration for React localhost
# app.config['SESSION_COOKIE_DOMAIN'] = None
# app.config['SESSION_COOKIE_SAMESITE'] = 'None'
# app.config['SESSION_COOKIE_SECURE'] = False  # (set True only if using HTTPS)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE}'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Allow react dev server (http://localhost:3000) to talk with cookies
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Optional: helpful debug headers for development (keeps preflight happy)
@app.after_request
def add_cors_headers(response):
    # Only tune for development. In production restrict origins more strictly.
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response


def generate_slots_for_doctor(doctor_id, days):
    print("calling generate_slots_for_doctor")
    from datetime import datetime, timedelta

    slots = []
    start_date = datetime.now().date()

    for i in range(days):
        current_date = start_date + timedelta(days=i)
        day_of_week = current_date.weekday()  # 0=Mon, 6=Sun

        if day_of_week < 5:  # Weekdays
            hours = list(range(10, 13)) + list(range(14, 18))
        else:  # Weekends
            hours = list(range(10, 13))

        for hour in hours:
            for minute in [0, 30]:
                slot_time = datetime.combine(current_date, datetime.min.time()).replace(
                    hour=hour, minute=minute, second=0
                )
                slots.append(Slot(
                    doctor_id=doctor_id,
                    slot_time=slot_time.strftime("%Y-%m-%d %H:%M:%S"),
                    booked=0
                ))

    db.session.add_all(slots)
    db.session.commit()
    print(f"✅ Inserted {len(slots)} slots for doctor {doctor_id}")


def generate_slots_for_doctor_for_admin(doctor_id, days, conn=None):
    print("calling generate_slots_for_doctor")
    from datetime import datetime, timedelta

    slots = []
    start_date = datetime.now().date()

    for i in range(days):
        current_date = start_date + timedelta(days=i)
        day_of_week = current_date.weekday()  # 0=Mon, 6=Sun

        if day_of_week < 5:  # Weekdays
            hours = list(range(10, 13)) + list(range(14, 18))
        else:  # Weekends
            hours = list(range(10, 13))

        for hour in hours:
            for minute in [0, 30]:
                slot_time = datetime.combine(current_date, datetime.min.time()).replace(
                    hour=hour, minute=minute, second=0
                )
                slots.append((
                    doctor_id,
                    slot_time.strftime("%Y-%m-%d %H:%M:%S"),
                    0
                ))

    # Use the existing connection if provided, otherwise create new
    if conn:
        c = conn.cursor()
        c.executemany('INSERT INTO slots (doctor_id, slot_time, booked) VALUES (?, ?, ?)', slots)
        conn.commit()
    else:
        # Fallback to SQLAlchemy if no connection provided
        from app1 import db
        for slot_data in slots:
            slot = Slot(doctor_id=slot_data[0], slot_time=slot_data[1], booked=slot_data[2])
            db.session.add(slot)
        db.session.commit()
    
    print(f"✅ Inserted {len(slots)} slots for doctor {doctor_id}")
# imports (add to top of your file)
import os
import smtplib
from email.mime.text import MIMEText
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash
from flask import current_app, request, url_for

# config helpers
SECRET_KEY = os.getenv('SECRET_KEY') 
MAIL_SERVER = os.getenv('MAIL_SERVER')
MAIL_PORT = int(os.getenv('MAIL_PORT') or 587)
MAIL_USERNAME = os.getenv('MAIL_USERNAME')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() in ('true', '1', 'yes')
MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False').lower() in ('true', '1', 'yes')
MAIL_FROM = os.getenv('MAIL_FROM') or MAIL_USERNAME
FRONTEND_URL = os.getenv('FRONTEND_URL')  # optional: preferred for reset links

# token serializer
def get_serializer():
    key = SECRET_KEY or current_app.config.get('SECRET_KEY')
    return URLSafeTimedSerializer(key)

# email sending helper (simple using smtplib)
def send_email(to_email: str, subject: str, body: str):
    print("coming into sned email")
    if not MAIL_SERVER or not MAIL_USERNAME or not MAIL_PASSWORD:
        raise RuntimeError("Mail server not configured. Please set MAIL_SERVER, MAIL_USERNAME, MAIL_PASSWORD.")
    msg = MIMEText(body, "html")
    msg['Subject'] = subject
    msg['From'] = MAIL_FROM
    msg['To'] = to_email

    # choose SSL or TLS
    if MAIL_USE_SSL:
        server = smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT)
    else:
        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
    try:
        server.ehlo()
        if MAIL_USE_TLS and not MAIL_USE_SSL:
            server.starttls()
            server.ehlo()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, [to_email], msg.as_string())
    finally:
        server.quit()

# generate password reset token
def generate_reset_token(email):
    s = get_serializer()
    return s.dumps({'email': email})

# verify token, returns email
def verify_reset_token(token, max_age_seconds=3600):
    s = get_serializer()
    try:
        data = s.loads(token, max_age=max_age_seconds)
        return data.get('email')
    except SignatureExpired:
        raise
    except BadSignature:
        raise



from flask import make_response

# Add these imports at the top
import hashlib
from werkzeug.security import generate_password_hash, check_password_hash
@app.route('/api/available_slots', methods=['GET'])
def api_available_slots():
    print("=== /api/available_slots GET endpoint called ===")

    doctor_id = request.args.get('doctor_id')
    date = request.args.get('date')

    print(f"🔍 Request parameters - Doctor: {doctor_id}, Date: {date}")

    # --- Validate inputs ---
    if not doctor_id or not date:
        error_msg = 'Doctor ID and date are required'
        print(f"❌ Missing parameters: {error_msg}")
        return jsonify({'error': error_msg}), 400

    try:
        # Validate date format
        target_date = datetime.strptime(date, '%Y-%m-%d').date()
        current_datetime = datetime.now()
        current_date = current_datetime.date()
        current_time = current_datetime.time()

        print(f"📅 Current date: {current_date}, Target date: {target_date}")
        print(f"⏰ Current time: {current_time}")

        conn = get_db()
        c = conn.cursor()

        # --- Verify doctor exists ---
        c.execute('SELECT id, name, specialty FROM doctors WHERE id = ?', (doctor_id,))
        doctor = c.fetchone()
        if not doctor:
            conn.close()
            error_msg = f"Doctor with ID {doctor_id} not found"
            print(f"❌ {error_msg}")
            return jsonify({'error': error_msg}), 404

        print(f"👨‍⚕️ Doctor found: {doctor['name']} ({doctor['specialty']})")

        # --- Fetch available (unbooked) slots ---
        c.execute('''
            SELECT s.id, s.slot_time, d.name AS doctor_name, d.specialty
            FROM slots s
            JOIN doctors d ON s.doctor_id = d.id
            WHERE s.doctor_id = ?
            AND STRFTIME('%Y-%m-%d', s.slot_time) = ?
            AND s.id NOT IN (
                SELECT slot_id FROM appointments WHERE status IN ('Scheduled', 'Confirmed')
            )
            AND s.booked = 0
            ORDER BY s.slot_time
        ''', (doctor_id, date))

        available_slots = c.fetchall()
        print("Available_slots",available_slots)
        print(f"🟢 Found {len(available_slots)} unbooked slots for doctor {doctor_id} on {date}")

        formatted_slots = []
        for slot in available_slots:
            slot = dict(slot)
            slot_time = slot['slot_time']

            try:
                # Handle both formats
                if slot_time.count(':') == 2:
                    dt = datetime.strptime(slot_time.strip(), '%Y-%m-%d %H:%M:%S')
                elif slot_time.count(':') == 1:
                    dt = datetime.strptime(slot_time.strip(), '%Y-%m-%d %H:%M')
                else:
                    print(f"⚠️ Unexpected format: {slot_time}")
                    continue

                slot_datetime = dt
                slot_date = slot_datetime.date()
                slot_time_only = slot_datetime.time()

                # Filter out past slots for current day
                if slot_date == current_date and slot_time_only <= current_time:
                    print(f"⏰ Skipping past slot: {slot_time} (current time: {current_time})")
                    continue

                formatted_slots.append({
                    'id': slot['id'],
                    'slot_time': slot_time,
                    'display': dt.strftime('%H:%M'),
                    'date': dt.strftime('%Y-%m-%d'),
                    'time': dt.strftime('%H:%M'),
                    'doctor_name': slot['doctor_name'],
                    'specialty': slot['specialty'],
                    'formatted_display': f"{dt.strftime('%H:%M')} - Dr. {slot['doctor_name']}"
                })
            except Exception as e:
                print(f"⚠️ Error formatting slot {slot_time}: {e}")

        conn.close()

        # --- If no slots found ---
        if len(formatted_slots) == 0:
            print(f"🚫 No available slots found for {date} (Doctor ID: {doctor_id})")
        else:
            print(f"📤 Returning {len(formatted_slots)} available slots")

        return jsonify(formatted_slots)

    except ValueError as ve:
        print(f"❌ Invalid date format: {ve}")
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    except Exception as e:
        print(f"❌ ERROR in available slots API: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to load available slots'}), 500

@app.route('/api/upload_medical_record', methods=['POST'])
def upload_medical_record():
    try:
        print("=== UPLOAD MEDICAL RECORD DEBUG ===")
        print(f"Session data: {dict(session)}")
        print(f"User type: {session.get('user_type')}")
        print(f"User ID: {session.get('family_id')}")
        print(f"family_id ID: {session['family_id']}")
        
        if session.get('user_type') not in ['patient', 'admin']:
            print("❌ Unauthorized: Only patients or admins can upload medical records")
            return jsonify({'error': 'Unauthorized - Only patients or admins can upload medical records'}), 401


        family_id = session.get('family_id')  # This is the family_id from session
        if not family_id:
            print("❌ Unauthorized: No family ID in session")
            return jsonify({'error': 'User not logged in'}), 401

        # Get form data
        member_id = request.form.get('member_id')
        record_type = request.form.get('record_type')
        record_date = request.form.get('record_date')
        description = request.form.get('description')
        file = request.files.get('record_file')

        print(f"Form data - member_id: {member_id}, record_type: {record_type}, record_date: {record_date}")
        print(f"File received: {file.filename if file else 'No file'}")

        if not member_id or not record_type or not record_date:
            print("❌ Missing required fields")
            return jsonify({'error': 'Missing required fields: member_id, record_type, and record_date are required'}), 400

        # Verify that the member_id belongs to the patient's family
        conn = get_db()
        c = conn.cursor()
        # Verify member belongs to family (only if patient)
        if session.get('user_type') == 'patient':
            c.execute('''SELECT m.id FROM members m 
                        WHERE m.id = ? AND m.family_id = ?''', 
                    (member_id, family_id))
            member_check = c.fetchone()
            if not member_check:
                print(f"❌ Invalid family member: {member_id} for family: {family_id}")
                conn.close()
                return jsonify({'error': 'Invalid family member'}), 400
            print("✅ Family member validation passed (patient)")
        else:
            # Admins can upload for any member
            c.execute('SELECT id FROM members WHERE id = ?', (member_id,))
            member_check = c.fetchone()
            if not member_check:
                print(f"❌ Invalid member_id: {member_id}")
                conn.close()
                return jsonify({'error': 'Invalid member_id'}), 400
            print("✅ Member validation passed (admin)")


        # Handle file upload
        file_path = None
        if file and file.filename != '':
            # Validate file type
            allowed_extensions = {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'}
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
            
            if file_extension not in allowed_extensions:
                conn.close()
                return jsonify({'error': f'File type not allowed. Allowed types: {", ".join(allowed_extensions)}'}), 400

            # Create uploads directory if it doesn't exist
            upload_dir = 'uploads'
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            
            # Generate unique filename
            unique_filename = f"medical_record_{member_id}_{int(time.time())}_{filename}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Save the file
            file.save(file_path)
            print(f"✅ File saved: {file_path}")

        # Insert into database
        c.execute('''INSERT INTO medical_records 
                     (member_id, record_type, record_date, description, file_path) 
                     VALUES (?, ?, ?, ?, ?)''',
                  (member_id, record_type, record_date, description, file_path))
        conn.commit()
        
        record_id = c.lastrowid
        conn.close()

        print(f"✅ Medical record uploaded successfully with ID: {record_id}")
        return jsonify({
            'success': True, 
            'message': 'Medical record uploaded successfully',
            'record_id': record_id
        })

    except Exception as e:
        print(f"❌ Error uploading medical record: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500
from flask import send_file
import sqlite3

# Route to view medical record file
@app.route('/api/view_medical_record/<int:record_id>')
def view_medical_record(record_id):
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get the file path from the database
        c.execute('''SELECT file_path FROM medical_records WHERE id = ?''', (record_id,))
        record = c.fetchone()
        
        if not record or not record['file_path']:
            return jsonify({'error': 'File not found'}), 404
        
        file_path = record['file_path']
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found on server'}), 404
        
        # Send the file
        return send_file(file_path, as_attachment=False)
        
    except Exception as e:
        logger.error(f"Error viewing medical record: {e}")
        return jsonify({'error': 'Failed to retrieve file'}), 500
    
# Get all medical records for front office
# Get all medical records for front office - FIXED VERSION
# Get all medical records for front office - USING SQLITE CONNECTION
# Get all medical records for front office - COMPLETE DATA VERSION
@app.route('/api/All_medical_records', methods=['GET'])
def get_all_medical_records():
    print("inside the get all front office medical records")
    try:
        user_id = session.get('family_id')
        user_type = session.get('user_type')
        print(user_id, user_type)
        
        if not user_id or user_type != 'front_office':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        conn = get_db()
        c = conn.cursor()
        
        # Get ALL medical records with COMPLETE information
        c.execute('''
            SELECT 
                mr.id,
                mr.record_type,
                mr.record_date,
                mr.description,
                mr.file_path,
                mr.uploaded_date,
                mr.member_id,
                m.first_name,
                m.last_name,
                m.phone,
                m.email,
                m.age,
                m.gender,
                d.name as doctor_name,
                d.specialty as doctor_specialty,
                p.prescription_date,
                p.medication
            FROM medical_records mr
            LEFT JOIN members m ON mr.member_id = m.id
            LEFT JOIN prescriptions p ON p.member_id = m.id
            LEFT JOIN doctors d ON p.doctor_id = d.id
            ORDER BY mr.record_date DESC, mr.id DESC
        ''')
        
        records = c.fetchall()
        print(f"Found {len(records)} raw records")
        
        # Convert to list of dictionaries with ALL data
        medical_records = []
        for record in records:
            record_dict = dict(record)
            print(f"RAW RECORD DATA: {record_dict}")  # Debug print
            
            # Build patient name properly
            first_name = record_dict.get('first_name', '')
            last_name = record_dict.get('last_name', '')
            patient_name = f"{first_name} {last_name}".strip()
            if not patient_name:
                patient_name = "Unknown Patient"
            
            # Build patient ID
            patient_id = record_dict.get('member_id') or record_dict.get('patient_id')
            patient_id_formatted = f"P{patient_id:03d}" if patient_id else 'N/A'
            
            # Build doctor info
            doctor_name = record_dict.get('doctor_name', '')
            doctor_specialty = record_dict.get('doctor_specialty', '')
            doctor_display = f"Dr. {doctor_name}" if doctor_name else "Dr. Unknown"
            if doctor_specialty:
                doctor_display += f" ({doctor_specialty})"
            
            # Build diagnosis/description
            description = record_dict.get('description', '')
            diagnosis = description if description else 'No diagnosis provided'
            
            # Build complete record
            formatted_record = {
                'id': record_dict['id'],
                'patientName': patient_name,
                'patientId': patient_id_formatted,
                'recordType': record_dict.get('record_type', 'General Record'),
                'doctor': doctor_display,
                'date': record_dict.get('record_date') or record_dict.get('uploaded_date') or 'No date',
                'diagnosis': diagnosis,
                'priority': 'medium',
                'status': 'active',
                'notes': description or 'No notes available',
                'attachments': [],
                
                # Additional data for modal
                'patientDetails': {
                    'firstName': first_name,
                    'lastName': last_name,
                    'phone': record_dict.get('phone', 'N/A'),
                    'email': record_dict.get('email', 'N/A'),
                    'age': record_dict.get('age', 'N/A'),
                    'gender': record_dict.get('gender', 'N/A')
                },
                'medicalDetails': {
                    'recordType': record_dict.get('record_type', 'General Record'),
                    'recordDate': record_dict.get('record_date', 'No date'),
                    'uploadedDate': record_dict.get('uploaded_date', 'No date'),
                    'description': description,
                    'doctor': doctor_display,
                    'medication': record_dict.get('medication', 'None'),
                    'prescriptionDate': record_dict.get('prescription_date', 'No date')
                }
            }
            
            # Handle file attachments
            if record_dict.get('file_path'):
                file_name = os.path.basename(record_dict['file_path'])
                formatted_record['attachments'].append(file_name)
            
            medical_records.append(formatted_record)
            print(f"✅ Processed record: {formatted_record['patientName']} (ID: {formatted_record['patientId']})")
        
        conn.close()
        
        return jsonify({
            'success': True,
            'medical_records': medical_records,
            'total_records': len(medical_records),
            'message': f'Successfully fetched {len(medical_records)} medical records'
        })
        
    except Exception as e:
        print(f"❌ Error fetching medical records: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Failed to fetch medical records'}), 500
    
# Get all prescriptions for front office
# Get all prescriptions for front office
@app.route('/api/All_prescriptions', methods=['GET'])
def get_all_prescriptions():
    print("inside the get all front office prescriptions")
    try:
        user_id = session.get('family_id')
        user_type = session.get('user_type')
        print(user_id, user_type)
        
        if not user_id or user_type != 'front_office':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Get all prescriptions with patient and doctor information using SQLAlchemy
        from sqlalchemy import text
        
        query = text('''
            SELECT 
                p.id,
                p.prescription_date,
                p.medication,
                p.dosage,
                p.frequency,
                p.duration,
                p.instructions,
                p.notes,
                m.first_name || ' ' || m.last_name as patient_name,
                m.id as patient_id,
                d.name as doctor_name,
                'active' as status
            FROM prescriptions p
            JOIN members m ON p.member_id = m.id
            JOIN doctors d ON p.doctor_id = d.id
            ORDER BY p.prescription_date DESC
        ''')
        
        print("Executing prescriptions query...")
        # Use db.session.execute() for SQLAlchemy
        prescriptions_data = db.session.execute(query).fetchall()
        print(f"Found {len(prescriptions_data)} prescriptions")
        
        # Convert to frontend format
        prescriptions = []
        for prescription in prescriptions_data:
            # print(f"Processing prescription: {dict(prescription)}")
            
            # Parse medications
            medications = []
            if prescription.medication:
                # Split by comma if multiple medications are stored in one field
                med_list = prescription.medication.split(',') if ',' in prescription.medication else [prescription.medication]
                
                for med in med_list:
                    medications.append({
                        'name': med.strip(),
                        'dosage': prescription.dosage or 'As directed',
                        'frequency': prescription.frequency or 'Once daily',
                        'duration': prescription.duration or '7 days',
                        'instructions': prescription.instructions or 'Take as prescribed'
                    })
            else:
                # Add a default medication if none exists
                medications.append({
                    'name': 'Unknown Medication',
                    'dosage': prescription.dosage or 'As directed',
                    'frequency': prescription.frequency or 'Once daily',
                    'duration': prescription.duration or '7 days',
                    'instructions': prescription.instructions or 'Take as prescribed'
                })
            
            prescriptions.append({
                'id': prescription.id,
                'patientName': prescription.patient_name or 'Unknown Patient',
                'patientId': f"P{prescription.patient_id:03d}",
                'doctor': f"Dr. {prescription.doctor_name}" if prescription.doctor_name else "Dr. Unknown",
                'datePrescribed': prescription.prescription_date,
                'medications': medications,
                'status': prescription.status,
                'refills': 0,  # You can add this to your database if needed
                'pharmacy': 'City Pharmacy',  # Default pharmacy
                'notes': prescription.notes or 'Complete the course as directed'
            })
        
        return jsonify({
            'success': True,
            'prescriptions': prescriptions
        })
        
    except Exception as e:
        print(f"Error fetching prescriptions: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Failed to fetch prescriptions'}), 500

@app.route('/logout', methods=['GET'])
def logout():
    session.clear()  # Clear all session data
    return jsonify({'message': 'Logout successful'}), 200

    


# Route to delete medical record
@app.route('/api/delete_medical_record/<int:record_id>', methods=['DELETE'])
def delete_medical_record(record_id):
    try:
        conn = get_db()
        c = conn.cursor()
        
        # First get the file path to delete the physical file
        c.execute('''SELECT file_path FROM medical_records WHERE id = ?''', (record_id,))
        record = c.fetchone()
        
        if record and record['file_path']:
            file_path = record['file_path']
            # Delete the physical file if it exists
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Delete the record from database
        c.execute('''DELETE FROM medical_records WHERE id = ?''', (record_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Medical record deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting medical record: {e}")
        return jsonify({'error': 'Failed to delete medical record'}), 500



@app.route('/api/admin_dashboard', methods=['GET'])
def admin_dashboard():
    try:
        conn = get_db()
        conn.row_factory = sqlite3.Row  # So we can access columns by name
        c = conn.cursor()

        tables = [
            'admins',
            'doctors',
            'members',
            'appointments',
            'slots',
            'bills',
            'medical_records',
            'prescriptions',
            'checkins',
            'families',
            'user_types'
        ]

        data = {}

        for table in tables:
            rows = c.execute(f"SELECT * FROM {table}").fetchall()
            # Convert each row to dict
            data[table] = [dict(row) for row in rows]

        return jsonify(data)

    except Exception as e:
        print("Error in admin_dashboard:", e)
        return jsonify({'error': str(e)}), 500

from flask import Flask, jsonify, session

# Add this flag to control behavior: default False -> send reset link
SEND_PLAIN_PASSWORD_IN_EMAIL = True  # CHANGE TO True only for testing, not production

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    conn = None
    try:
        conn = get_db()
        c = conn.cursor()

        # Basic required fields
        first_name = data.get('first_name', '').strip()
        last_name  = data.get('last_name', '').strip()
        phone      = data.get('phone', '').strip()
        email      = data.get('email', '').strip()
        password   = data.get('password', '').strip()

        if not first_name or not last_name or not phone:
            return jsonify({'success': False, 'error': 'first_name, last_name and phone are required'}), 400

        # Check duplicate email (if provided)
        if email:
            c.execute('SELECT id FROM members WHERE email = ?', (email,))
            if c.fetchone():
                conn.close()
                return jsonify({'success': False, 'error': 'Email already exists'}), 400

        # Create a family id
        uid = generate_unique_id()

        # Get 'patient' user_type id (fallback to 1)
        c.execute('SELECT id FROM user_types WHERE type_name = "patient"')
        row = c.fetchone()
        user_type_id = row['id'] if row else 1

        # Insert family and member
        c.execute('INSERT INTO families (id, user_type) VALUES (?, ?)', (uid, user_type_id))

        middle_name = data.get('middle_name', '')
        age = int(data.get('age') or 0)
        gender = data.get('gender', '')
        aadhar = data.get('aadhar', '')
        address = data.get('address', '')
        prev_problem = data.get('prev_problem', '')
        curr_problem = data.get('curr_problem', '')

        # Hash password if provided
        password_hash = generate_password_hash(password) if password else None

        c.execute('''INSERT INTO members
            (family_id, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (uid, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem, password_hash)
        )
        member_id = c.lastrowid
        conn.commit()

        # Save session
        session['family_id'] = uid
        session['user_type'] = 'patient'
        session['member_id'] = member_id

        # ---------- Email logic ----------
        if email:
            try:
                print(email)
                if SEND_PLAIN_PASSWORD_IN_EMAIL and password:
                    print("getting inside")
                    # Warning: this emails plaintext password — insecure
                    subject = "Your account details"
                    body = f"""
                        <p>Hi {first_name},</p>
                        <p>Your account has been created.</p>
                        <ul>
                          <li><strong>Username / Email:</strong> {email}</li>
                          <li><strong>Password:</strong> {password}</li>
                        </ul>
                        <p>Please change your password after first login.</p>
                    """
                    send_email(email, subject, body)
                else:
                    # Preferred: send password reset link so they create a password securely
                    token = generate_reset_token(email)
                    # build reset url - prefer FRONTEND_URL if set, else use request.host_url
                    base = FRONTEND_URL or (request.host_url.rstrip('/'))
                    reset_path = f"/reset-password?token={token}"  # adapt to your frontend route
                    reset_url = f"{base}{reset_path}"

                    subject = "Set your password"
                    body = f"""
                        <p>Hi {first_name},</p>
                        <p>Welcome — your account was created successfully. To set your password, click the link below (valid for 1 hour):</p>
                        <p><a href="{reset_url}">Set your password</a></p>
                        <p>If you didn't request this, ignore this email.</p>
                    """
                    send_email(email, subject, body)
            except Exception as mail_exc:
                # Log mail failure but don't break registration
                current_app.logger.exception("Failed to send registration email: %s", mail_exc)

        return jsonify({'success': True, 'message': 'Registration successful', 'family_id': uid})

    except Exception as e:
        if conn:
            conn.rollback()
        current_app.logger.exception("Registration error")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        if conn:
            conn.close()



@app.route('/api/front_office_register', methods=['POST'])
def api_front_office_register():
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    conn = None
    try:
        conn = get_db()
        c = conn.cursor()

        # Basic required fields
        first_name = data.get('first_name', '').strip()
        last_name  = data.get('last_name', '').strip()
        phone      = data.get('phone', '').strip()
        email      = data.get('email', '').strip()

        if not first_name or not last_name or not phone:
            return jsonify({'success': False, 'error': 'first_name, last_name and phone are required'}), 400

        # Check duplicate phone
        c.execute('SELECT id FROM members WHERE phone = ?', (phone,))
        if c.fetchone():
            return jsonify({'success': False, 'error': 'Phone number already exists'}), 400

        # Check duplicate email (if provided)
        if email:
            c.execute('SELECT id FROM members WHERE email = ?', (email,))
            if c.fetchone():
                return jsonify({'success': False, 'error': 'Email already exists'}), 400

        # Create a new family id for this patient
        uid = generate_unique_id()

        # Get 'patient' user_type id
        c.execute('SELECT id FROM user_types WHERE type_name = "patient"')
        row = c.fetchone()
        user_type_id = row['id'] if row else 1

        # Insert new family
        c.execute('INSERT INTO families (id, user_type) VALUES (?, ?)', (uid, user_type_id))

        # Prepare other fields
        middle_name = data.get('middle_name', '').strip()
        age = data.get('age')
        age = int(age) if age and age.strip() else None
        gender = data.get('gender', '').strip()
        aadhar = data.get('aadhar', '').strip()
        address = data.get('address', '').strip()
        prev_problem = data.get('prev_problem', '').strip()
        curr_problem = data.get('curr_problem', '').strip()

        # Insert member (no password for front office registrations)
        c.execute('''INSERT INTO members
            (family_id, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem, created_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))''',
            (uid, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem)
        )
        
        conn.commit()

        return jsonify({
            'success': True, 
            'message': 'Patient registered successfully',
            'family_id': uid,
            'patient_name': f"{first_name} {last_name}"
        })

    except Exception as e:
        if conn:
            conn.rollback()
        import traceback
        print(f"Error in front_office_register: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# Update the login endpoint to support both UID and email/password
from flask import request, jsonify, session
import sqlite3
import hashlib
from werkzeug.security import check_password_hash
from werkzeug.security import check_password_hash, generate_password_hash

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier')
    password = data.get('password')
    family_id = data.get('family_id')
    print(f"Login attempt with identifier={identifier}, family_id={family_id}")
    conn = get_db()
    c = conn.cursor()

    # Temporary hardcoded credentials for testing - USING ACTUAL CREDENTIALS
    TEMP_CREDENTIALS = {
        'admin@familycareconnect.com': {'password': 'admin123', 'user_type': 'admin', 'id': 'ADMIN001'},
        'alice.smith@hospital.com': {'password': 'alice123', 'user_type': 'doctor', 'id': 'DOC001'},
        'radha.kumar@hospital.com': {'password': 'radha123', 'user_type': 'front_office', 'id': 'OFC111'}
    }

    # Check temporary credentials first
    if identifier in TEMP_CREDENTIALS:
        temp_user = TEMP_CREDENTIALS[identifier]
        if password == temp_user['password']:
            session['user_type'] = temp_user['user_type']
            session['family_id'] = temp_user['id']
            print(session['user_type'])
            print(session['family_id'])
            conn.close()
            print(f"Temporary login successful as {temp_user['user_type']}")
            return jsonify({
                'success': True, 
                'user_type': temp_user['user_type'], 
                'message': f'Login successful as {temp_user["user_type"]} (temporary credentials)'
            })

    if family_id:  # Family ID login (for members)
        c.execute('SELECT * FROM members WHERE family_id = ?', (family_id,))
        user = c.fetchone()
        if user:
            session['user_type'] = 'patient'
            session['family_id'] = family_id
            conn.close()
            return jsonify({'success': True, 'user_type': 'patient', 'message': 'Login successful with Family ID'})

    elif identifier and password:  # Email/password login
        # Check admins
        c.execute('SELECT * FROM admins WHERE email = ?', (identifier,))
        admin = c.fetchone()
        if admin:
            stored_hash = admin[3]  # password_hash is at index 3
            # FIX: Use check_password_hash instead of sha256
            if check_password_hash(stored_hash, password):
                session['user_type'] = 'admin'
                session['family_id'] = admin[1]  # id is at index 0
                conn.close()
                return jsonify({'success': True, 'user_type': 'admin', 'message': 'Login successful as admin'})

        # Check doctors
        c.execute('SELECT * FROM doctors WHERE email = ?', (identifier,))
        doctor = c.fetchone()
        if doctor:
            stored_hash = doctor[6]  # password_hash is at index 6
            # FIX: Use check_password_hash instead of sha256
            if check_password_hash(stored_hash, password):
                session['user_type'] = 'doctor'
                session['family_id'] = doctor[1]  # id is at index 0
                print(doctor[1])
                conn.close()
                print(session['user_type'],session['family_id'])
                return jsonify({'success': True, 'user_type': 'doctor', 'message': 'Login successful as doctor'})

        # Check front office
        c.execute('SELECT * FROM front_office WHERE email = ?', (identifier,))
        front_office = c.fetchone()
        if front_office:
            stored_hash = front_office[6]  # password_hash is at index 6
            # FIX: Use check_password_hash instead of sha256
            if check_password_hash(stored_hash, password):
                session['user_type'] = 'front_office'
                session['family_id'] = front_office[1]  # id is at index 0
                conn.close()
                return jsonify({'success': True, 'user_type': 'front_office', 'message': 'Login successful as front office'})

        # Check members (patients)
        c.execute('SELECT * FROM members WHERE email = ?', (identifier,))
        patient = c.fetchone()
        if patient:
            print(patient)
            stored_hash = patient[14]  # password_hash is at index 14
            # FIX: Use check_password_hash for patients too
            if check_password_hash(stored_hash, password):
                print("hiiiiiiiii")
                session['user_type'] = 'patient'
                session['family_id'] = patient[1]  # family_id is at index 1
                conn.close()
                print(session['user_type'],session['family_id'])
                return jsonify({'success': True, 'user_type': 'patient', 'message': 'Login successful as patient'})

    conn.close()
    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401


@app.route('/api/admin/front_office_data', methods=['GET'])
def api_admin_get_frontoffice_data():
    if 'family_id' not in session or session.get('user_type') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    print("hello")
    try:
        uid =session['family_id']
        print(uid)
        if not uid:
            return jsonify({'error': 'family_id parameter is required'}), 400

        conn = get_db()
        c = conn.cursor()

        # # Get patient profile
        # c.execute('SELECT * FROM members WHERE family_id = ?', (uid,))
        # profile = dict(c.fetchone() or {})

        # Get family members
        c.execute('SELECT * FROM front_office')
        FrontOffice = [dict(row) for row in c.fetchall()]
        print("Family members fetched:", FrontOffice)

        conn.close()

        return jsonify({
            "success": True,
            "FrontOffice": FrontOffice,})
    except Exception as e:
        print("Error fetching family members:", str(e))
        return jsonify({'error': str(e)}), 500



@app.route('/api/patient_dashboard', methods=['GET'])
def api_patient_dashboard():
    if 'family_id' not in session or session.get('user_type') != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()

        # Get patient profile
        c.execute('SELECT * FROM members WHERE family_id = ? LIMIT 1', (uid,))
        profile = dict(c.fetchone() or {})

        # Get family members
        c.execute('SELECT * FROM members WHERE family_id = ?', (uid,))
        family_members = [dict(row) for row in c.fetchall()]

        # Get appointments (handling old/new schema)
        try:
            c.execute('''SELECT a.id, m.first_name, m.last_name, d.name as doctor_name, 
                                s.slot_time, a.status
                         FROM appointments a 
                         JOIN slots s ON a.slot_id = s.id 
                         JOIN doctors d ON s.doctor_id = d.id 
                         JOIN members m ON a.member_id = m.id 
                         WHERE m.family_id = ?
                         ORDER BY s.slot_time''', (uid,))
        except sqlite3.OperationalError:
            c.execute('''SELECT a.id, m.first_name, m.last_name, d.name as doctor_name, 
                                s.slot_time, 'Scheduled' as status
                         FROM appointments a 
                         JOIN slots s ON a.slot_id = s.id 
                         JOIN doctors d ON s.doctor_id = d.id 
                         JOIN members m ON a.member_id = m.id 
                         WHERE m.family_id = ?
                         ORDER BY s.slot_time''', (uid,))
        appointments = [dict(row) for row in c.fetchall()]

        # Get medical records
        c.execute('''SELECT mr.*, m.first_name, m.last_name 
                     FROM medical_records mr
                     JOIN members m ON mr.member_id = m.id
                     WHERE m.family_id = ?
                     ORDER BY mr.record_date DESC''', (uid,))
        medical_records = [dict(row) for row in c.fetchall()]

        # Get prescriptions
        try:
            c.execute('''SELECT p.*, m.first_name, m.last_name, d.name as doctor_name
                         FROM prescriptions p
                         JOIN members m ON p.member_id = m.id
                         JOIN doctors d ON p.doctor_id = d.id
                         WHERE m.family_id = ?
                         ORDER BY p.prescription_date DESC''', (uid,))
            prescriptions = [dict(row) for row in c.fetchall()]
        except Exception as e:
            logger.error(f"Error fetching prescriptions: {e}")
            prescriptions = []

        # Get bills
        c.execute('''SELECT b.*, m.first_name, m.last_name
                     FROM bills b
                     JOIN members m ON b.member_id = m.id
                     WHERE m.family_id = ?
                     ORDER BY b.bill_date DESC''', (uid,))
        bills = [dict(row) for row in c.fetchall()]

        conn.close()

        return jsonify({
            "success": True,
            "profile": profile,
            "family_members": family_members,
            "appointments": appointments,
            "medical_records": medical_records,
            "prescriptions": prescriptions,
            "bills": bills
        })

    except Exception as e:
        logger.error(f"Error in patient dashboard: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/getpatientdata', methods=['GET'])
def api_admin_get_patient_data():
    if 'family_id' not in session or session.get('user_type') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    print("hello")
    try:
        uid =session['family_id']
        print(uid)
        if not uid:
            return jsonify({'error': 'family_id parameter is required'}), 400

        conn = get_db()
        c = conn.cursor()

        # # Get patient profile
        # c.execute('SELECT * FROM members WHERE family_id = ?', (uid,))
        # profile = dict(c.fetchone() or {})

        # Get family members
        c.execute('SELECT * FROM members')
        family_members = [dict(row) for row in c.fetchall()]
        print("Family members fetched:", family_members)

        conn.close()

        return jsonify({
            "success": True,
            "family_members": family_members,})
    except Exception as e:
        print("Error fetching family members:", str(e))
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/getdoctordata', methods=['GET'])
def api_admin_get_doctor_data():
    if 'family_id' not in session or session.get('user_type') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    print("hello")
    try:
        uid =session['family_id']
        print(uid)
        if not uid:
            return jsonify({'error': 'family_id parameter is required'}), 400

        conn = get_db()
        c = conn.cursor()

        # # Get patient profile
        # c.execute('SELECT * FROM members WHERE family_id = ?', (uid,))
        # profile = dict(c.fetchone() or {})

        # Get family members
        c.execute('SELECT * FROM Doctors')
        Doctors = [dict(row) for row in c.fetchall()]
        print("Family members fetched:", Doctors)

        conn.close()

        return jsonify({
            "success": True,
            "Doctors": Doctors,})
    except Exception as e:
        print("Error fetching family members:", str(e))
        return jsonify({'error': str(e)}), 500


# Get appointments for admin
@app.route('/api/admin/appointments')
def get_admin_appointments():
    try:
        print("=== GET ADMIN APPOINTMENTS DEBUG ===")
        
        # Check if user is admin
        if session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 401

        conn = get_db()
        c = conn.cursor()
        
        # Get appointments with patient and doctor details
        c.execute('''
            SELECT 
                a.id,
                a.member_id,
                m.first_name as patient_first_name,
                m.last_name as patient_last_name,
                s.doctor_id,
                d.name as doctor_name,
                s.slot_time,
                a.status
            FROM appointments a
            LEFT JOIN members m ON a.member_id = m.id
            LEFT JOIN slots s ON a.slot_id = s.id
            LEFT JOIN doctors d ON s.doctor_id = d.id
            ORDER BY a.id DESC
        ''')
        
        appointments = c.fetchall()
        conn.close()

        # Transform the data
        appointments_list = []
        for apt in appointments:
            appointment_data = {
                'id': apt['id'],
                'patient_id': apt['member_id'],
                'patient_first_name': apt['patient_first_name'],
                'patient_last_name': apt['patient_last_name'],
                'patient_name': f"{apt['patient_first_name']} {apt['patient_last_name']}",
                'doctor_id': apt['doctor_id'],
                'doctor_name': apt['doctor_name'],
                'slot_time': apt['slot_time'],
                'date': apt['slot_time'].split(' ')[0] if apt['slot_time'] else '',
                'time': apt['slot_time'].split(' ')[1] if apt['slot_time'] and ' ' in apt['slot_time'] else '',
                'status': apt['status']
            }
            appointments_list.append(appointment_data)

        print(f"✅ Found {len(appointments_list)} appointments")
        return jsonify({
            'success': True,
            'appointments': appointments_list
        })

    except Exception as e:
        print(f"❌ Error fetching admin appointments: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/api/admin/slots')
def get_admin_slots():
    try:
        print("=== GET ADMIN SLOTS DEBUG ===")
        
        # Check if user is admin
        if session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 401

        conn = get_db()
        c = conn.cursor()
        
        # Get slots with doctor details
        c.execute('''
            SELECT 
                s.id,
                s.doctor_id,
                d.name as doctor_name,
                s.slot_time,
                s.booked
            FROM slots s
            LEFT JOIN doctors d ON s.doctor_id = d.id
            ORDER BY s.slot_time DESC
        ''')
        
        slots = c.fetchall()
        conn.close()

        # Transform the data
        slots_list = []
        for slot in slots:
            slot_data = {
                'id': slot['id'],
                'doctor_id': slot['doctor_id'],
                'doctor_name': slot['doctor_name'],
                'slot_time': slot['slot_time'],
                'date': slot['slot_time'].split(' ')[0] if slot['slot_time'] else '',
                'start_time': slot['slot_time'].split(' ')[1] if slot['slot_time'] and ' ' in slot['slot_time'] else '',
                'end_time': '',  # You might want to calculate this based on your slot duration
                'is_available': not bool(slot['booked'])
            }
            slots_list.append(slot_data)

        print(f"✅ Found {len(slots_list)} slots")
        return jsonify({
            'success': True,
            'slots': slots_list
        })

    except Exception as e:
        print(f"❌ Error fetching admin slots: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# Medical Records Routes for Admin - GET only
@app.route('/api/admin/medical_records')
def get_admin_medical_records():
    try:
        print("=== GET ADMIN MEDICAL RECORDS DEBUG ===")
        
        # Check if user is admin
        if session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 401

        conn = get_db()
        c = conn.cursor()
        
        # Get medical records with patient details
        c.execute('''
            SELECT 
                mr.id,
                mr.member_id as patient_id,
                m.first_name as patient_first_name,
                m.last_name as patient_last_name,
                mr.record_type,
                mr.record_date,
                mr.description,
                mr.file_path,
                mr.uploaded_date
            FROM medical_records mr
            LEFT JOIN members m ON mr.member_id = m.id
            ORDER BY mr.record_date DESC
        ''')
        
        medical_records = c.fetchall()
        conn.close()

        # Transform the data
        records_list = []
        for record in medical_records:
            record_data = {
                'id': record['id'],
                'patient_id': record['patient_id'],
                'patient_name': f"{record['patient_first_name']} {record['patient_last_name']}",
                'record_type': record['record_type'],
                'date': record['record_date'],
                'description': record['description'],
                'file_path': record['file_path'],
                'uploaded_date': record['uploaded_date']
            }
            records_list.append(record_data)

        print(f"✅ Found {len(records_list)} medical records")
        return jsonify({
            'success': True,
            'medical_records': records_list
        })

    except Exception as e:
        print(f"❌ Error fetching admin medical records: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/admin/prescriptions')
def get_admin_prescriptions():
    try:
        print("=== GET ADMIN PRESCRIPTIONS DEBUG ===")
        
        # Check if user is admin
        if session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 401

        conn = get_db()
        c = conn.cursor()
        
        # Get prescriptions with patient and doctor details
        c.execute('''
            SELECT 
                p.id,
                p.member_id as patient_id,
                m.first_name as patient_first_name,
                m.last_name as patient_last_name,
                p.doctor_id,
                d.name as doctor_name,
                p.prescription_date,
                p.medication,
                p.dosage,
                p.instructions,
                p.frequency,
                p.duration,
                p.notes
            FROM prescriptions p
            LEFT JOIN members m ON p.member_id = m.id
            LEFT JOIN doctors d ON p.doctor_id = d.id
            ORDER BY p.prescription_date DESC
        ''')
        
        prescriptions = c.fetchall()
        conn.close()

        # Transform the data
        prescriptions_list = []
        for prescription in prescriptions:
            prescription_data = {
                'id': prescription['id'],
                'patient_id': prescription['patient_id'],
                'patient_name': f"{prescription['patient_first_name']} {prescription['patient_last_name']}",
                'doctor_id': prescription['doctor_id'],
                'doctor_name': prescription['doctor_name'],
                'date': prescription['prescription_date'],
                'medication': prescription['medication'],
                'dosage': prescription['dosage'],
                'instructions': prescription['instructions'],
                'frequency': prescription['frequency'],
                'duration': prescription['duration'],
                'notes': prescription['notes']
            }
            prescriptions_list.append(prescription_data)

        print(f"✅ Found {len(prescriptions_list)} prescriptions")
        return jsonify({
            'success': True,
            'prescriptions': prescriptions_list
        })

    except Exception as e:
        print(f"❌ Error fetching admin prescriptions: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Add appointment (admin)
@app.route('/api/admin/appointments/add', methods=['POST'])
def add_admin_appointment():
    try:
        print("=== ADD ADMIN APPOINTMENT DEBUG ===")
        
        # Check if user is admin
        if session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 401

        data = request.get_json()
        print(f"Received data: {data}")

        member_id = data.get('patient_id')
        doctor_id = data.get('doctor_id')
        date = data.get('date')
        time = data.get('time')
        status = data.get('status', 'scheduled')
        reason = data.get('reason', '')

        if not all([member_id, doctor_id, date, time]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Create slot_time by combining date and time
        slot_time = f"{date} {time}"

        conn = get_db()
        c = conn.cursor()

        # First, create a slot for this appointment
        c.execute('''
            INSERT INTO slots (doctor_id, slot_time, booked)
            VALUES (?, ?, ?)
        ''', (doctor_id, slot_time, 1))

        slot_id = c.lastrowid

        # Then create the appointment
        c.execute('''
            INSERT INTO appointments (member_id, slot_id, status)
            VALUES (?, ?, ?)
        ''', (member_id, slot_id, status))

        conn.commit()
        conn.close()

        print(f"✅ Appointment created successfully with ID: {c.lastrowid}")
        return jsonify({
            'success': True,
            'message': 'Appointment created successfully',
            'appointment_id': c.lastrowid
        })

    except Exception as e:
        print(f"❌ Error creating admin appointment: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Update appointment (admin)
@app.route('/api/admin/appointments/<int:appointment_id>', methods=['PUT'])
def update_admin_appointment(appointment_id):
    try:
        print(f"=== UPDATE ADMIN APPOINTMENT {appointment_id} DEBUG ===")
        
        # Check if user is admin
        if session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 401

        data = request.get_json()
        print(f"Received data: {data}")

        status = data.get('status')
        reason = data.get('reason')

        conn = get_db()
        c = conn.cursor()

        # Update appointment
        c.execute('''
            UPDATE appointments 
            SET status = ?, 
                updated_date = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (status, appointment_id))

        conn.commit()
        conn.close()

        print(f"✅ Appointment {appointment_id} updated successfully")
        return jsonify({
            'success': True,
            'message': 'Appointment updated successfully'
        })

    except Exception as e:
        print(f"❌ Error updating admin appointment: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Delete appointment (admin)
@app.route('/api/admin/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_admin_appointment(appointment_id):
    try:
        print(f"=== DELETE ADMIN APPOINTMENT {appointment_id} DEBUG ===")
        
        # Check if user is admin
        if session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 401

        conn = get_db()
        c = conn.cursor()

        # First get the slot_id to delete the slot as well
        c.execute('SELECT slot_id FROM appointments WHERE id = ?', (appointment_id,))
        appointment = c.fetchone()
        
        if not appointment:
            conn.close()
            return jsonify({'error': 'Appointment not found'}), 404

        # Delete the appointment
        c.execute('DELETE FROM appointments WHERE id = ?', (appointment_id,))
        
        # Delete the associated slot
        c.execute('DELETE FROM slots WHERE id = ?', (appointment['slot_id'],))

        conn.commit()
        conn.close()

        print(f"✅ Appointment {appointment_id} deleted successfully")
        return jsonify({
            'success': True,
            'message': 'Appointment deleted successfully'
        })

    except Exception as e:
        print(f"❌ Error deleting admin appointment: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Add slot (admin)
@app.route('/api/admin/slots/add', methods=['POST'])
def add_admin_slot():
    try:
        print("=== ADD ADMIN SLOT DEBUG ===")
        
        # Check if user is admin
        if session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 401

        data = request.get_json()
        print(f"Received data: {data}")

        doctor_id = data.get('doctor_id')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        is_available = data.get('is_available', True)
        max_patients = data.get('max_patients', 1)

        if not all([doctor_id, date, start_time]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Create slot_time by combining date and start_time
        slot_time = f"{date} {start_time}"

        conn = get_db()
        c = conn.cursor()

        # Check if slot already exists
        c.execute('''
            SELECT id FROM slots 
            WHERE doctor_id = ? AND slot_time = ?
        ''', (doctor_id, slot_time))
        
        existing_slot = c.fetchone()
        if existing_slot:
            conn.close()
            return jsonify({'error': 'Slot already exists for this doctor and time'}), 400

        # Insert new slot
        c.execute('''
            INSERT INTO slots (doctor_id, slot_time, booked)
            VALUES (?, ?, ?)
        ''', (doctor_id, slot_time, 0 if is_available else 1))

        conn.commit()
        conn.close()

        print(f"✅ Slot created successfully with ID: {c.lastrowid}")
        return jsonify({
            'success': True,
            'message': 'Slot created successfully',
            'slot_id': c.lastrowid
        })

    except Exception as e:
        print(f"❌ Error creating admin slot: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Update slot (admin)
@app.route('/api/admin/slots/<int:slot_id>', methods=['PUT'])
def update_admin_slot(slot_id):
    try:
        print(f"=== UPDATE ADMIN SLOT {slot_id} DEBUG ===")
        
        # Check if user is admin
        if session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 401

        data = request.get_json()
        print(f"Received data: {data}")

        is_available = data.get('is_available', True)

        conn = get_db()
        c = conn.cursor()

        # Update slot availability
        c.execute('''
            UPDATE slots 
            SET booked = ?
            WHERE id = ?
        ''', (0 if is_available else 1, slot_id))

        conn.commit()
        conn.close()

        print(f"✅ Slot {slot_id} updated successfully")
        return jsonify({
            'success': True,
            'message': 'Slot updated successfully'
        })

    except Exception as e:
        print(f"❌ Error updating admin slot: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Delete slot (admin)
@app.route('/api/admin/slots/<int:slot_id>', methods=['DELETE'])
def delete_admin_slot(slot_id):
    try:
        print(f"=== DELETE ADMIN SLOT {slot_id} DEBUG ===")
        
        # Check if user is admin
        if session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 401

        conn = get_db()
        c = conn.cursor()

        # Check if slot has any appointments
        c.execute('SELECT id FROM appointments WHERE slot_id = ?', (slot_id,))
        appointments = c.fetchall()
        
        if appointments:
            conn.close()
            return jsonify({'error': 'Cannot delete slot with existing appointments'}), 400

        # Delete the slot
        c.execute('DELETE FROM slots WHERE id = ?', (slot_id,))

        conn.commit()
        conn.close()

        print(f"✅ Slot {slot_id} deleted successfully")
        return jsonify({
            'success': True,
            'message': 'Slot deleted successfully'
        })

    except Exception as e:
        print(f"❌ Error deleting admin slot: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500



@app.route('/api/admin/patients/<int:patient_id>', methods=['PUT'])
def admin_update_patient(patient_id):
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        data = request.get_json()
        logger.info(f"Updating patient {patient_id} with data: {data}")
        
        conn = get_db()
        c = conn.cursor()
        
        # Update patient information
        c.execute('''
            UPDATE members SET 
                first_name = ?, 
                last_name = ?, 
                middle_name = ?, 
                age = ?, 
                gender = ?, 
                email = ?, 
                phone = ?, 
                address = ?, 
                aadhar = ?, 
                prev_problem = ?, 
                curr_problem = ?,
                created_date = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            data.get('first_name'),
            data.get('last_name'), 
            data.get('middle_name'),
            data.get('age'),
            data.get('gender'),
            data.get('email'),
            data.get('phone'),
            data.get('address'),
            data.get('aadhar'),
            data.get('prev_problem'),
            data.get('curr_problem'),
            patient_id
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Patient {patient_id} updated successfully")
        return jsonify({'success': True, 'message': 'Patient updated successfully'})
    
    except Exception as e:
        logger.error(f"Admin update patient error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    

@app.route('/api/admin/patients/delete/<int:patient_id>', methods=['DELETE'])
def admin_delete_patient(patient_id):
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # First, get the family_id for this patient
        c.execute('SELECT family_id FROM members WHERE id = ?', (patient_id,))
        member = c.fetchone()
        
        if member:
            family_id = member['family_id']
            
            # Delete all related records first (to maintain referential integrity)
            # Delete appointments for this patient
            c.execute('DELETE FROM appointments WHERE member_id = ?', (patient_id,))
            
            # Delete medical records for this patient
            c.execute('DELETE FROM medical_records WHERE member_id = ?', (patient_id,))
            
            # Delete prescriptions for this patient
            c.execute('DELETE FROM prescriptions WHERE member_id = ?', (patient_id,))
            
            # Delete bills for this patient
            c.execute('DELETE FROM bills WHERE member_id = ?', (patient_id,))
            
            # Delete the patient from members table
            c.execute('DELETE FROM members WHERE id = ?', (patient_id,))
            
            # Check if there are any other members in this family
            c.execute('SELECT COUNT(*) as count FROM members WHERE family_id = ?', (family_id,))
            remaining_members = c.fetchone()['count']
            
            # If no more members in this family, delete the family too
            if remaining_members == 0:
                c.execute('DELETE FROM families WHERE id = ?', (family_id,))
            
            conn.commit()
            conn.close()
            
            return jsonify({'success': True, 'message': 'Patient deleted successfully'})
        else:
            conn.close()
            return jsonify({'success': False, 'error': 'Patient not found'})
    
    except Exception as e:
        logger.error(f"Admin delete patient error: {e}")
        return jsonify({'success': False, 'error': str(e)})
import uuid
import secrets
import string
from werkzeug.security import generate_password_hash

@app.route('/api/admin/patients/add', methods=['POST'])
def admin_add_patient():
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        data = request.get_json()
        logger.info(f"Creating new patient with data: {data}")
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} is required'}), 400
        
        conn = get_db()
        c = conn.cursor()
        
        # Generate a unique family_id
        family_id = str(uuid.uuid4())[:8].upper()
        
        # Generate a random password (8 characters: letters + digits)
        alphabet = string.ascii_letters + string.digits
        random_password = ''.join(secrets.choice(alphabet) for i in range(8))
        
        # Generate password hash
        password_hash = generate_password_hash(random_password)
        
        # Create a new family
        c.execute('INSERT INTO families (id, user_type) VALUES (?, ?)', (family_id, 1))
        
        # Create the patient member with password hash
        c.execute('''
            INSERT INTO members (
                family_id, first_name, last_name, middle_name, age, gender, 
                email, phone, address, aadhar, prev_problem, curr_problem,
                created_date, password_hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        ''', (
            family_id,
            data.get('first_name'),
            data.get('last_name'), 
            data.get('middle_name', ''),
            data.get('age'),
            data.get('gender', ''),
            data.get('email'),
            data.get('phone'),
            data.get('address', ''),
            data.get('aadhar', ''),
            data.get('prev_problem', ''),
            data.get('curr_problem', ''),
            password_hash  # Add the password hash
        ))
        
        patient_id = c.lastrowid
        
        conn.commit()
        conn.close()
        
        logger.info(f"Patient created successfully with ID: {patient_id}, family_id: {family_id}")
        return jsonify({
            'success': True, 
            'message': 'Patient created successfully', 
            'patient_id': patient_id,
            'family_id': family_id,
            'generated_password': random_password  # Return the generated password
        })
    
    except Exception as e:
        logger.error(f"Admin add patient error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    

# Unified add route for all user types including appointments and slots
# Unified add route for all user types including appointments and slots
@app.route('/api/admin/users/add', methods=['POST'])
def admin_add_user():
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        data = request.get_json()
        user_type = data.get('user_type')  # 'patient', 'doctor', 'frontoffice', 'appointment', 'slot'
        logger.info(f"Creating new {user_type} with data: {data}")
        
        conn = get_db()
        c = conn.cursor()
        
        if user_type in ['patient', 'doctor', 'frontoffice']:
            # Generate a unique family_id
            family_id = str(uuid.uuid4())[:8].upper()
            
            # Generate a random password
            alphabet = string.ascii_letters + string.digits
            random_password = ''.join(secrets.choice(alphabet) for i in range(8))
            password_hash = generate_password_hash(random_password)
            
            # Map user types to database user_type values
            user_type_map = {
                'patient': 1,
                'doctor': 2, 
                'frontoffice': 3
            }
            
            # Create a new family with the correct user_type
            db_user_type = user_type_map.get(user_type, 1)
            c.execute('INSERT INTO families (id, user_type) VALUES (?, ?)', (family_id, db_user_type))
            
            user_id = None
            user_email = None
            user_name = None
            
            if user_type == 'patient':
                # Validate required fields for patient
                required_fields = ['first_name', 'last_name', 'email', 'phone']
                for field in required_fields:
                    if not data.get(field):
                        return jsonify({'success': False, 'error': f'{field} is required'}), 400
                
                user_email = data.get('email')
                user_name = f"{data.get('first_name')} {data.get('last_name')}"
                
                # Create patient in members table
                c.execute('''
                    INSERT INTO members (
                        family_id, first_name, last_name, middle_name, age, gender, 
                        email, phone, address, aadhar, prev_problem, curr_problem,
                        created_date, password_hash
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
                ''', (
                    family_id,
                    data.get('first_name'),
                    data.get('last_name'), 
                    data.get('middle_name', ''),
                    data.get('age'),
                    data.get('gender', ''),
                    user_email,
                    data.get('phone'),
                    data.get('address', ''),
                    data.get('aadhar', ''),
                    data.get('prev_problem', ''),
                    data.get('curr_problem', ''),
                    password_hash
                ))
                user_id = c.lastrowid
                
            elif user_type == 'doctor':
                # Validate required fields for doctor
                required_fields = ['name', 'specialty', 'email', 'phone']
                for field in required_fields:
                    if not data.get(field):
                        return jsonify({'success': False, 'error': f'{field} is required'}), 400
                
                user_email = data.get('email')
                user_name = data.get('name')
                
                # Create doctor in doctors table
                c.execute('''
                    INSERT INTO doctors (
                        family_id, name, specialty, email, phone, password_hash
                    ) VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    family_id,
                    user_name,
                    data.get('specialty'),
                    user_email,
                    data.get('phone'),
                    password_hash
                ))
                user_id = c.lastrowid
                generate_slots_for_doctor_for_admin(doctor_id=user_id,days=7,conn=conn)
                
            elif user_type == 'frontoffice':
                # Validate required fields for front office
                required_fields = ['first_name', 'last_name', 'email', 'phone']
                for field in required_fields:
                    if not data.get(field):
                        return jsonify({'success': False, 'error': f'{field} is required'}), 400
                
                user_email = data.get('email')
                user_name = f"{data.get('first_name')} {data.get('last_name')}"
                
                # Create front office in front_office table
                c.execute('''
                    INSERT INTO front_office (
                        family_id, first_name, last_name, email, phone, password_hash
                    ) VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    family_id,
                    data.get('first_name'),
                    data.get('last_name'),
                    user_email,
                    data.get('phone'),
                    password_hash,
                ))
                user_id = c.lastrowid
            
            conn.commit()
            conn.close()
            
            # Send email with credentials if email was provided
            if user_email:
                print("coming inside the ail ready for sending")
                try:
                    send_admin_created_credentials(user_email, user_name, user_type, user_email, random_password)
                except Exception as email_error:
                    # Log the email error but don't fail the user creation
                    logger.error(f"Failed to send email to {user_email}: {email_error}")
            
            logger.info(f"{user_type.capitalize()} created successfully with ID: {user_id}, family_id: {family_id}")
            return jsonify({
                'success': True, 
                'message': f'{user_type.capitalize()} created successfully', 
                'user_id': user_id,
                'family_id': family_id,
                'generated_password': random_password
            })
        
        elif user_type == 'appointment':
            # Validate required fields for appointment
            required_fields = ['patient_id', 'doctor_id', 'date', 'time']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Create slot_time by combining date and time
            slot_time = f"{data.get('date')} {data.get('time')}"
            status = data.get('status', 'Scheduled')
            
            # Check if patient exists
            c.execute('SELECT id FROM members WHERE id = ?', (data.get('patient_id'),))
            patient = c.fetchone()
            if not patient:
                conn.close()
                return jsonify({'success': False, 'error': 'Patient not found'}), 400
            
            # Check if doctor exists
            c.execute('SELECT id FROM doctors WHERE id = ?', (data.get('doctor_id'),))
            doctor = c.fetchone()
            if not doctor:
                conn.close()
                return jsonify({'success': False, 'error': 'Doctor not found'}), 400
            
            # Check if slot already exists for this doctor and time
            c.execute('SELECT id FROM slots WHERE doctor_id = ? AND slot_time = ?', 
                     (data.get('doctor_id'), slot_time))
            existing_slot = c.fetchone()
            
            slot_id = None
            if existing_slot:
                # Use existing slot
                slot_id = existing_slot['id']
                # Check if slot is already booked
                c.execute('SELECT booked FROM slots WHERE id = ?', (slot_id,))
                slot_info = c.fetchone()
                if slot_info and slot_info['booked']:
                    conn.close()
                    return jsonify({'success': False, 'error': 'Slot is already booked'}), 400
                # Mark slot as booked
                c.execute('UPDATE slots SET booked = 1 WHERE id = ?', (slot_id,))
            else:
                # Create new slot
                c.execute('INSERT INTO slots (doctor_id, slot_time, booked) VALUES (?, ?, ?)', 
                         (data.get('doctor_id'), slot_time, 1))
                slot_id = c.lastrowid
            
            # Create the appointment
            c.execute('INSERT INTO appointments (member_id, slot_id, status) VALUES (?, ?, ?)', 
                     (data.get('patient_id'), slot_id, status))
            appointment_id = c.lastrowid
            
            conn.commit()
            conn.close()
            
            logger.info(f"Appointment created successfully with ID: {appointment_id}")
            return jsonify({
                'success': True, 
                'message': 'Appointment created successfully', 
                'appointment_id': appointment_id
            })
        
        elif user_type == 'slot':
            # Validate required fields for slot
            required_fields = ['doctor_id', 'date', 'start_time']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Create slot_time by combining date and start_time
            slot_time = f"{data.get('date')} {data.get('start_time')}"
            is_available = data.get('is_available', True)
            
            # Check if doctor exists
            c.execute('SELECT id FROM doctors WHERE id = ?', (data.get('doctor_id'),))
            doctor = c.fetchone()
            if not doctor:
                conn.close()
                return jsonify({'success': False, 'error': 'Doctor not found'}), 400
            
            # Check if slot already exists
            c.execute('SELECT id FROM slots WHERE doctor_id = ? AND slot_time = ?', 
                     (data.get('doctor_id'), slot_time))
            existing_slot = c.fetchone()
            
            if existing_slot:
                conn.close()
                return jsonify({'success': False, 'error': 'Slot already exists for this doctor and time'}), 400
            
            # Insert new slot
            c.execute('INSERT INTO slots (doctor_id, slot_time, booked) VALUES (?, ?, ?)', 
                     (data.get('doctor_id'), slot_time, 0 if is_available else 1))
            slot_id = c.lastrowid
            
            conn.commit()
            conn.close()
            
            logger.info(f"Slot created successfully with ID: {slot_id}")
            return jsonify({
                'success': True, 
                'message': 'Slot created successfully', 
                'slot_id': slot_id
            })

        # Add this to your existing admin_add_user function
        elif user_type == 'medical_record':
            # Validate required fields for medical record
            required_fields = ['patient_id', 'record_type', 'record_date', 'description']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Check if patient exists
            c.execute('SELECT id FROM members WHERE id = ?', (data.get('patient_id'),))
            patient = c.fetchone()
            if not patient:
                conn.close()
                return jsonify({'success': False, 'error': 'Patient not found'}), 400
            
            # Insert medical record
            c.execute('''
                INSERT INTO medical_records (
                    member_id, record_type, record_date, description, file_path
                ) VALUES (?, ?, ?, ?, ?)
            ''', (
                data.get('patient_id'),
                data.get('record_type'),
                data.get('record_date'),
                data.get('description'),
                data.get('file_path', '')
            ))
            
            record_id = c.lastrowid
            conn.commit()
            conn.close()
            
            logger.info(f"Medical record created successfully with ID: {record_id}")
            return jsonify({
                'success': True, 
                'message': 'Medical record created successfully', 
                'record_id': record_id
            })
        elif user_type == 'prescription':
            # Validate required fields for prescription
            required_fields = ['patient_id', 'doctor_id', 'prescription_date', 'medication']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Check if patient exists
            c.execute('SELECT id FROM members WHERE id = ?', (data.get('patient_id'),))
            patient = c.fetchone()
            if not patient:
                conn.close()
                return jsonify({'success': False, 'error': 'Patient not found'}), 400
            
            # Check if doctor exists
            c.execute('SELECT id FROM doctors WHERE id = ?', (data.get('doctor_id'),))
            doctor = c.fetchone()
            if not doctor:
                conn.close()
                return jsonify({'success': False, 'error': 'Doctor not found'}), 400
            
            # Insert prescription
            c.execute('''
                INSERT INTO prescriptions (
                    member_id, doctor_id, prescription_date, medication, 
                    dosage, instructions, frequency, duration, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('patient_id'),
                data.get('doctor_id'),
                data.get('prescription_date'),
                data.get('medication'),
                data.get('dosage', ''),
                data.get('instructions', ''),
                data.get('frequency', ''),
                data.get('duration', ''),
                data.get('notes', '')
            ))
            
            prescription_id = c.lastrowid
            conn.commit()
            conn.close()
            
            logger.info(f"Prescription created successfully with ID: {prescription_id}")
            return jsonify({
                'success': True, 
                'message': 'Prescription created successfully', 
                'prescription_id': prescription_id
            })
        

        elif user_type == 'bill':
            # Validate required fields for bill
            required_fields = ['patient_id', 'bill_date', 'amount']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Check if patient exists
            c.execute('SELECT id FROM members WHERE id = ?', (data.get('patient_id'),))
            patient = c.fetchone()
            if not patient:
                conn.close()
                return jsonify({'success': False, 'error': 'Patient not found'}), 400
            
            # Insert bill
            c.execute('''
                INSERT INTO bills (
                    member_id, bill_date, amount, status, description
                ) VALUES (?, ?, ?, ?, ?)
            ''', (
                data.get('patient_id'),
                data.get('bill_date'),
                data.get('amount'),
                data.get('status', 'Pending'),
                data.get('description', '')
            ))
            
            bill_id = c.lastrowid
            conn.commit()
            conn.close()
            
            logger.info(f"Bill created successfully with ID: {bill_id}")
            return jsonify({
                'success': True, 
                'message': 'Bill created successfully', 
                'bill_id': bill_id
            })

        else:
            return jsonify({'success': False, 'error': 'Invalid user type'}), 400
    
    except Exception as e:
        logger.error(f"Admin add {user_type} error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Unified update route for all user types including appointments and slots
# Unified update route for all user types including appointments and slots
# Unified update route for all user types including appointments and slots
@app.route('/api/admin/users/<user_type>/<int:user_id>', methods=['PUT'])
def admin_update_user(user_type, user_id):
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        data = request.get_json()
        logger.info(f"Updating {user_type} {user_id} with data: {data}")
        
        conn = get_db()
        c = conn.cursor()
        
        if user_type == 'patients':
            # Update patient in members table
            c.execute('''
                UPDATE members SET 
                    first_name = ?, last_name = ?, middle_name = ?, age = ?, 
                    gender = ?, email = ?, phone = ?, address = ?, aadhar = ?, 
                    prev_problem = ?, curr_problem = ?
                WHERE id = ?
            ''', (
                data.get('first_name'), data.get('last_name'), data.get('middle_name'),
                data.get('age'), data.get('gender'), data.get('email'), data.get('phone'),
                data.get('address'), data.get('aadhar'), data.get('prev_problem'),
                data.get('curr_problem'), user_id
            ))
            
        elif user_type == 'doctors':
            # Update doctor in doctors table
            c.execute('''
                UPDATE doctors SET 
                    name = ?, specialty = ?, email = ?, phone = ?
                WHERE id = ?
            ''', (
                data.get('name'), data.get('specialty'), data.get('email'),
                data.get('phone'), user_id
            ))
            
        elif user_type == 'frontoffice':
            # Update front office in front_office table
            c.execute('''
                UPDATE front_office SET 
                    first_name = ?, last_name = ?, email = ?, phone = ?
                WHERE id = ?
            ''', (
                data.get('first_name'), data.get('last_name'), data.get('email'),
                data.get('phone'), user_id
            ))
        
        elif user_type == 'appointment':
            # Validate required fields for appointment
            required_fields = ['patient_id', 'doctor_id', 'date', 'time', 'status']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Check if appointment exists
            c.execute('SELECT id, slot_id FROM appointments WHERE id = ?', (user_id,))
            appointment = c.fetchone()
            
            if not appointment:
                conn.close()
                return jsonify({'success': False, 'error': 'Appointment not found'}), 404
            
            # Create new slot_time by combining date and time
            new_slot_time = f"{data.get('date')} {data.get('time')}"
            
            # Check if patient exists
            c.execute('SELECT id FROM members WHERE id = ?', (data.get('patient_id'),))
            patient = c.fetchone()
            if not patient:
                conn.close()
                return jsonify({'success': False, 'error': 'Patient not found'}), 400
            
            # Check if doctor exists
            c.execute('SELECT id FROM doctors WHERE id = ?', (data.get('doctor_id'),))
            doctor = c.fetchone()
            if not doctor:
                conn.close()
                return jsonify({'success': False, 'error': 'Doctor not found'}), 400
            
            # Get the current slot_id
            current_slot_id = appointment['slot_id']
            
            # Check if we need to update the slot (if doctor or time changed)
            c.execute('SELECT doctor_id, slot_time FROM slots WHERE id = ?', (current_slot_id,))
            current_slot = c.fetchone()
            
            if (current_slot['doctor_id'] != data.get('doctor_id') or 
                current_slot['slot_time'] != new_slot_time):
                
                # Free up the old slot
                c.execute('UPDATE slots SET booked = 0 WHERE id = ?', (current_slot_id,))
                
                # Check if new slot already exists for this doctor and time
                c.execute('SELECT id FROM slots WHERE doctor_id = ? AND slot_time = ?', 
                         (data.get('doctor_id'), new_slot_time))
                existing_slot = c.fetchone()
                
                new_slot_id = None
                if existing_slot:
                    # Use existing slot
                    new_slot_id = existing_slot['id']
                    # Check if slot is already booked
                    c.execute('SELECT booked FROM slots WHERE id = ?', (new_slot_id,))
                    slot_info = c.fetchone()
                    if slot_info and slot_info['booked']:
                        conn.close()
                        return jsonify({'success': False, 'error': 'Slot is already booked'}), 400
                    # Mark slot as booked
                    c.execute('UPDATE slots SET booked = 1 WHERE id = ?', (new_slot_id,))
                else:
                    # Create new slot
                    c.execute('INSERT INTO slots (doctor_id, slot_time, booked) VALUES (?, ?, ?)', 
                             (data.get('doctor_id'), new_slot_time, 1))
                    new_slot_id = c.lastrowid
                
                # Update appointment with new slot_id
                c.execute('UPDATE appointments SET member_id = ?, slot_id = ?, status = ? WHERE id = ?', 
                         (data.get('patient_id'), new_slot_id, data.get('status'), user_id))
            else:
                # Only update patient and status (same doctor and time)
                c.execute('UPDATE appointments SET member_id = ?, status = ? WHERE id = ?', 
                         (data.get('patient_id'), data.get('status'), user_id))
        
        elif user_type == 'slot':
            # Update slot availability
            is_available = data.get('is_available', True)
            
            # Check if slot exists
            c.execute('SELECT id FROM slots WHERE id = ?', (user_id,))
            slot = c.fetchone()
            
            if not slot:
                conn.close()
                return jsonify({'success': False, 'error': 'Slot not found'}), 404
            
            # Update slot - only update booked status (remove max_patients)
            c.execute('UPDATE slots SET booked = ? WHERE id = ?', 
                    (0 if is_available else 1, user_id))
        
        elif user_type == 'medical_record':
            print(f"🔄 Updating medical record {user_id} with data: {data}")
            
            # Validate required fields for medical record
            required_fields = ['patient_id', 'record_type', 'record_date', 'description']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Check if medical record exists
            c.execute('SELECT id FROM medical_records WHERE id = ?', (user_id,))
            record = c.fetchone()
            if not record:
                conn.close()
                return jsonify({'success': False, 'error': 'Medical record not found'}), 404
            
            # Check if patient exists
            c.execute('SELECT id FROM members WHERE id = ?', (data.get('patient_id'),))
            patient = c.fetchone()
            if not patient:
                conn.close()
                return jsonify({'success': False, 'error': 'Patient not found'}), 400
            
            # Update medical record
            c.execute('''
                UPDATE medical_records SET 
                    member_id = ?, record_type = ?, record_date = ?, description = ?, file_path = ?
                WHERE id = ?
            ''', (
                data.get('patient_id'),
                data.get('record_type'),
                data.get('record_date'),
                data.get('description'),
                data.get('file_path', ''),
                user_id
            ))
            
            conn.commit()
            conn.close()
            
            logger.info(f"Medical record {user_id} updated successfully")
            return jsonify({'success': True, 'message': 'Medical record updated successfully'})
        
        elif user_type == 'prescription':
            print(f"🔄 Updating prescription {user_id} with data: {data}")
            
            # Validate required fields for prescription
            required_fields = ['patient_id', 'doctor_id', 'prescription_date', 'medication']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Check if prescription exists
            c.execute('SELECT id FROM prescriptions WHERE id = ?', (user_id,))
            prescription = c.fetchone()
            if not prescription:
                conn.close()
                return jsonify({'success': False, 'error': 'Prescription not found'}), 404
            
            # Check if patient exists
            c.execute('SELECT id FROM members WHERE id = ?', (data.get('patient_id'),))
            patient = c.fetchone()
            if not patient:
                conn.close()
                return jsonify({'success': False, 'error': 'Patient not found'}), 400
            
            # Check if doctor exists
            c.execute('SELECT id FROM doctors WHERE id = ?', (data.get('doctor_id'),))
            doctor = c.fetchone()
            if not doctor:
                conn.close()
                return jsonify({'success': False, 'error': 'Doctor not found'}), 400
            
            # Update prescription
            c.execute('''
                UPDATE prescriptions SET 
                    member_id = ?, doctor_id = ?, prescription_date = ?, medication = ?, 
                    dosage = ?, instructions = ?, frequency = ?, duration = ?, notes = ?
                WHERE id = ?
            ''', (
                data.get('patient_id'),
                data.get('doctor_id'),
                data.get('prescription_date'),
                data.get('medication'),
                data.get('dosage', ''),
                data.get('instructions', ''),
                data.get('frequency', ''),
                data.get('duration', ''),
                data.get('notes', ''),
                user_id
            ))
            
            conn.commit()
            conn.close()
            
            logger.info(f"Prescription {user_id} updated successfully")
            return jsonify({'success': True, 'message': 'Prescription updated successfully'})
        
        elif user_type == 'bills':
            # Validate required fields for bill
            required_fields = ['patient_id', 'bill_date', 'amount', 'status']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Check if bill exists
            c.execute('SELECT id FROM bills WHERE id = ?', (user_id,))
            bill = c.fetchone()
            if not bill:
                conn.close()
                return jsonify({'success': False, 'error': 'Bill not found'}), 404
            
            # Check if patient exists
            c.execute('SELECT id FROM members WHERE id = ?', (data.get('patient_id'),))
            patient = c.fetchone()
            if not patient:
                conn.close()
                return jsonify({'success': False, 'error': 'Patient not found'}), 400
            
            # Update bill
            c.execute('''
                UPDATE bills SET 
                    member_id = ?, bill_date = ?, amount = ?, status = ?, description = ?
                WHERE id = ?
            ''', (
                data.get('patient_id'),
                data.get('bill_date'),
                data.get('amount'),
                data.get('status'),
                data.get('description', ''),
                user_id
            ))


        else:
            return jsonify({'success': False, 'error': 'Invalid user type'}), 400
        
        conn.commit()
        conn.close()
        
        logger.info(f"{user_type.capitalize()} {user_id} updated successfully")
        return jsonify({'success': True, 'message': f'{user_type.capitalize()} updated successfully'})
    
    except Exception as e:
        logger.error(f"Admin update {user_type} error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Unified delete route for all user types including appointments and slots
# Unified delete route for all user types including appointments and slots
@app.route('/api/admin/users/<user_type>/<int:user_id>', methods=['DELETE'])
def admin_delete_user(user_type, user_id):
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        if user_type == 'patients':
            # Get family_id for this patient
            c.execute('SELECT family_id FROM members WHERE id = ?', (user_id,))
            member = c.fetchone()
            
            if member:
                family_id = member['family_id']
                
                # Delete related records
                c.execute('DELETE FROM appointments WHERE member_id = ?', (user_id,))
                c.execute('DELETE FROM medical_records WHERE member_id = ?', (user_id,))
                c.execute('DELETE FROM prescriptions WHERE member_id = ?', (user_id,))
                c.execute('DELETE FROM bills WHERE member_id = ?', (user_id,))
                c.execute('DELETE FROM members WHERE id = ?', (user_id,))
                
                # Check if family has other members
                c.execute('SELECT COUNT(*) as count FROM members WHERE family_id = ?', (family_id,))
                remaining_members = c.fetchone()['count']
                
                if remaining_members == 0:
                    c.execute('DELETE FROM families WHERE id = ?', (family_id,))
                    
        elif user_type == 'doctors':
            # Get family_id for this doctor
            c.execute('SELECT family_id FROM doctors WHERE id = ?', (user_id,))
            doctor = c.fetchone()
            
            if doctor:
                family_id = doctor['family_id']
                
                # Delete related records
                c.execute('DELETE FROM slots WHERE doctor_id = ?', (user_id,))
                c.execute('DELETE FROM prescriptions WHERE doctor_id = ?', (user_id,))
                c.execute('DELETE FROM doctors WHERE id = ?', (user_id,))
                c.execute('DELETE FROM families WHERE id = ?', (family_id,))
                
        elif user_type == 'frontoffice':
            # Get family_id for this front office staff
            c.execute('SELECT family_id FROM front_office WHERE id = ?', (user_id,))
            front_office = c.fetchone()
            
            if front_office:
                family_id = front_office['family_id']
                c.execute('DELETE FROM front_office WHERE id = ?', (user_id,))
                c.execute('DELETE FROM families WHERE id = ?', (family_id,))
        
        elif user_type == 'appointment':
            print("coming inside the appointments in delete function")
            # Get slot_id for this appointment
            c.execute('SELECT slot_id FROM appointments WHERE id = ?', (user_id,))
            appointment = c.fetchone()
            
            if appointment:
                # Delete the appointment
                c.execute('DELETE FROM appointments WHERE id = ?', (user_id,))
                
                # Update the slot to available (booked = 0)
                c.execute('UPDATE slots SET booked = 0 WHERE id = ?', (appointment['slot_id'],))
                print("deleted sucessfully")
        
        elif user_type == 'slots':
            # Check if slot has any appointments
            c.execute('SELECT id FROM appointments WHERE slot_id = ?', (user_id,))
            appointments = c.fetchall()
            
            if appointments:
                conn.close()
                return jsonify({'success': False, 'error': 'Cannot delete slot with existing appointments'}), 400
            
            # Delete the slot
            c.execute('DELETE FROM slots WHERE id = ?', (user_id,))
        
        elif user_type == 'medical_record':
            print(f"🔄 Deleting medical record {user_id}")
            
            # Check if medical record exists
            c.execute('SELECT id FROM medical_records WHERE id = ?', (user_id,))
            record = c.fetchone()
            
            if not record:
                conn.close()
                return jsonify({'success': False, 'error': 'Medical record not found'}), 404
            
            # Delete medical record
            c.execute('DELETE FROM medical_records WHERE id = ?', (user_id,))
            
            conn.commit()
            conn.close()
            
            logger.info(f"Medical record {user_id} deleted successfully")
            return jsonify({'success': True, 'message': 'Medical record deleted successfully'})
        
        elif user_type == 'prescription':
            print(f"🔄 Deleting prescription {user_id}")
            
            # Check if prescription exists
            c.execute('SELECT id FROM prescriptions WHERE id = ?', (user_id,))
            prescription = c.fetchone()
            
            if not prescription:
                conn.close()
                return jsonify({'success': False, 'error': 'Prescription not found'}), 404
            
            # Delete prescription
            c.execute('DELETE FROM prescriptions WHERE id = ?', (user_id,))
            
            conn.commit()
            conn.close()
            
            logger.info(f"Prescription {user_id} deleted successfully")
            return jsonify({'success': True, 'message': 'Prescription deleted successfully'})
        
        elif user_type == 'bills':
            # Check if bill exists
            c.execute('SELECT id FROM bills WHERE id = ?', (user_id,))
            bill = c.fetchone()
            
            if not bill:
                conn.close()
                return jsonify({'success': False, 'error': 'Bill not found'}), 404
            
            # Delete bill
            c.execute('DELETE FROM bills WHERE id = ?', (user_id,))
                
        else:
            return jsonify({'success': False, 'error': 'Invalid user type'}), 400
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': f'{user_type.capitalize()} deleted successfully'})
    
    except Exception as e:
        logger.error(f"Admin delete {user_type} error: {e}")
        return jsonify({'success': False, 'error': str(e)})


@app.route('/admin/doctor/delete/<int:doctor_id>', methods=['POST'])
def admin_delete_doctor(doctor_id):
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get doctor family_id
        c.execute('SELECT family_id FROM doctors WHERE id = ?', (doctor_id,))
        doctor = c.fetchone()
        
        if doctor:
            # Delete doctor and related records
            c.execute('DELETE FROM slots WHERE doctor_id = ?', (doctor_id,))
            c.execute('DELETE FROM doctors WHERE id = ?', (doctor_id,))
            c.execute('DELETE FROM families WHERE id = ?', (doctor['family_id'],))
            
            conn.commit()
        
        conn.close()
        return jsonify({'success': True})
    
    except Exception as e:
        logger.error(f"Admin delete doctor error: {e}")
        return jsonify({'success': False, 'error': str(e)})

# Correct imports (note the capitalization)
from email.mime.text import MIMEText

from email.mime.multipart import MIMEMultipart

def send_admin_created_credentials(recipient_email, name, user_type, username, password):
    """Send email with login credentials for admin-created users"""
    
    user_type_display = {
        'patient': 'Patient',
        'doctor': 'Doctor', 
        'frontoffice': 'Staff Member'
    }.get(user_type, 'User')
    
    # Create message
    subject = f"Your {user_type_display} Account Has Been Created"
    
    # HTML email content
    html = f"""
    <html>
        <body>
            <h2>Welcome to Our Healthcare System, {name}!</h2>
            <p>Your {user_type_display.lower()} account has been created by the administrator.</p>
            <p>Here are your login details:</p>
            <table style="border-collapse: collapse; width: 100%; max-width: 500px; margin: 20px 0;">
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold; width: 40%;">Username/Email:</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{username}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Password:</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{password}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Account Type:</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{user_type_display}</td>
                </tr>
            </table>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <strong>⚠️ Security Notice:</strong> 
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>This is a system-generated password</li>
                    <li>Please change your password after first login</li>
                    <li>Keep your login credentials secure and confidential</li>
                </ul>
            </div>
            
            <p>You can access the system at: <a href="{request.host_url}login">{request.host_url}login</a></p>
            
            <p>If you have any questions or need assistance, please contact the system administrator.</p>
            
            <br>
            <p>Best regards,<br>Healthcare System Administration</p>
        </body>
    </html>
    """
    
    # Plain text version
    text = f"""
    Welcome to Our Healthcare System, {name}!

    Your {user_type_display.lower()} account has been created by the administrator.

    Here are your login details:
    Username/Email: {username}
    Password: {password}
    Account Type: {user_type_display}

    Security Notice:
    - This is a system-generated password
    - Please change your password after first login  
    - Keep your login credentials secure and confidential

    You can access the system at: {request.host_url}login

    If you have any questions or need assistance, please contact the system administrator.

    Best regards,
    Healthcare System Administration
    """
    
    # Create message container
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = MAIL_FROM
    msg['To'] = recipient_email
    
    # Attach both HTML and plain text versions
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    
    msg.attach(part1)
    msg.attach(part2)
    
    # Send email
    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.send_message(msg)
    
    logger.info(f"Credentials email sent to {recipient_email} for {user_type_display} account")


@app.route('/api/doctor_dashboard')
def api_doctor_dashboard():
    print(session.get('user_type'),session.get('family_id'))
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        print("Unauthorized access attempt")
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        uid = session['family_id']
        print(f"Fetching doctor dashboard for family_id={uid}")

        conn = get_db()
        c = conn.cursor()
        
        # Get doctor details
        c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
        doctor = c.fetchone()
        print("Doctor fetched:", doctor)

        if not doctor:
            print("Doctor not found in DB")
            return jsonify({'error': 'Doctor not found'}), 404

        from datetime import datetime
        today = datetime.now().strftime('%Y-%m-%d')
        print("Today's date:", today)
        
        # Stats
        c.execute('''SELECT COUNT(*) as total_appointments 
                     FROM appointments a 
                     JOIN slots s ON a.slot_id = s.id 
                     WHERE s.doctor_id = ?''', (doctor['id'],))
        total_appointments = c.fetchone()['total_appointments']
        print("Total appointments:", total_appointments)

        c.execute('''SELECT COUNT(*) as patients_today 
                     FROM appointments a 
                     JOIN slots s ON a.slot_id = s.id 
                     WHERE s.doctor_id = ? AND date(s.slot_time) = ?''', (doctor['id'], today))
        patients_today = c.fetchone()['patients_today']
        print("Patients today:", patients_today)

        c.execute('''SELECT COUNT(*) as prescriptions_issued 
                     FROM prescriptions p 
                     WHERE p.doctor_id = ? AND date(p.created_date) = ?''', (doctor['id'], today))
        prescriptions_issued = c.fetchone()['prescriptions_issued']
        print("Prescriptions issued today:", prescriptions_issued)

        # Today's appointments
        c.execute('''SELECT a.id as id, m.id as patient_id, m.first_name || ' ' || m.last_name as patient_name, 
                            s.slot_time, a.status
                     FROM appointments a
                     JOIN slots s ON a.slot_id = s.id
                     JOIN members m ON a.member_id = m.id
                     WHERE s.doctor_id = ? AND date(s.slot_time) = ?
                     ORDER BY s.slot_time''', (doctor['id'], today))
        upcoming_appointments = [{
            'id': row['id'],
            'patient_id': row['patient_id'],
            'patient_name': row['patient_name'],
            'date': row['slot_time'].split(' ')[0],
            'time': row['slot_time'].split(' ')[1],
            'status': row['status']
        } for row in c.fetchall()]
        print("Upcoming appointments:", upcoming_appointments)

        # Recent medical records
        c.execute('''SELECT r.id, m.id as patient_id, m.first_name || ' ' || m.last_name as patient_name,
                            r.record_type, r.record_date, r.description
                     FROM medical_records r
                     JOIN members m ON r.member_id = m.id
                     WHERE r.member_id = ?
                     ORDER BY r.record_date DESC
                     LIMIT 5''', (doctor['id'],))
        recent_records = [dict(row) for row in c.fetchall()]
        print("Recent medical records:", recent_records)

        conn.close()

        response = {
            'profile': {'name': doctor['name']},
            'stats': {
                'total_appointments': total_appointments,
                'patients_today': patients_today,
                'prescriptions_issued': prescriptions_issued
            },
            'upcoming_appointments': upcoming_appointments,
            'recent_records': recent_records
        }

        print("Final response:", response)
        return jsonify(response)

    except Exception as e:
        print("Error in /api/doctor_dashboard:", str(e))
        return jsonify({'error': str(e)}), 500


@app.route('/api/front_office_dashboard', methods=['GET'])
def api_front_office_dashboard():
    print("inside the frontoffice dashboard")
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'error': 'Unauthorized'}), 401
    print(session.get('family_id'))
    print(session.get('user_type'))
    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()

        # Front office details
        c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
        front_office = c.fetchone()
        if not front_office:
            return jsonify({'error': 'Front office staff not found'}), 404

        from datetime import datetime
        target_date = datetime.now().strftime('%Y-%m-%d')

        # Dashboard stats
        c.execute('''SELECT COUNT(*) as scheduled_today
                     FROM appointments a 
                     JOIN slots s ON a.slot_id = s.id 
                     WHERE date(s.slot_time) = ?''', (target_date,))
        scheduled_today = c.fetchone()['scheduled_today']

        pending_checkins = scheduled_today
        total_patients_today = scheduled_today
        todays_collections = 2450.00 if scheduled_today > 0 else 0
        pending_payments = 1250.00 if scheduled_today > 0 else 0
        insurance_claims = 5 if scheduled_today > 0 else 0

        # Appointments
        c.execute('''SELECT a.id as appointment_id, m.first_name, m.last_name, 
                            d.name as doctor_name, s.slot_time, a.status
                     FROM appointments a 
                     JOIN slots s ON a.slot_id = s.id 
                     JOIN doctors d ON s.doctor_id = d.id 
                     JOIN members m ON a.member_id = m.id 
                     WHERE date(s.slot_time) = ?
                     ORDER BY s.slot_time''', (target_date,))
        today_appointments = []
        for app in c.fetchall():
            slot_time = app['slot_time']
            try:
                dt = datetime.strptime(slot_time, '%Y-%m-%d %H:%M:%S')
                formatted_date = dt.strftime('%Y-%m-%d')  # Extract date
                formatted_time = dt.strftime('%H:%M')     # Extract time
            except:
                formatted_date = slot_time[:10]  # Fallback to first 10 chars if parsing fails
                formatted_time = slot_time

            status = app['status']
            status_color = {
                'Scheduled': 'warning',
                'Checked In': 'info',
                'Completed': 'success',
                'Cancelled': 'danger'
            }.get(status, 'secondary')

            today_appointments.append({
                'id': app['appointment_id'],
                'patient_name': f"{app['first_name']} {app['last_name']}",
                'doctor': app['doctor_name'],
                'date': formatted_date,  # Add date field
                'time': formatted_time,
                'status': status,
                'status_color': status_color
            })

        # Recent registrations
        c.execute('''SELECT first_name, last_name, phone, created_date
                     FROM members 
                     ORDER BY created_date DESC
                     LIMIT 5''')
        recent_registrations = []
        for patient in c.fetchall():
            recent_registrations.append({
                'name': f"{patient['first_name']} {patient['last_name']}",
                'phone': patient['phone'],
                'registration_date': patient['created_date'][:10] if patient['created_date'] else 'N/A',
                'status': 'Active'
            })
            

        conn.close()
        front_office_dict = dict(front_office) if front_office else {}
        response_data = {
            'front_office': front_office_dict,
            'scheduled_today': scheduled_today,
            'pending_checkins': pending_checkins,
            'total_patients_today': total_patients_today,
            'todays_collections': todays_collections,
            'pending_payments': pending_payments,
            'insurance_claims': insurance_claims,
            'today_appointments': today_appointments,
            'recent_registrations': recent_registrations
        }

        print("Front Office Dashboard Response:\n", json.dumps(response_data, indent=4))

        return jsonify(response_data)

    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500
@app.route('/api/add_family_member', methods=['POST'])
def api_add_family_member():
    # Check if user is logged in and is a patient
    if 'family_id' not in session or session.get('user_type') != 'patient':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    conn = None
    try:
        uid = session['family_id']

        # Get fields from JSON
        first_name = data.get('first_name', '').strip()
        middle_name = data.get('middle_name', '').strip()
        last_name = data.get('last_name', '').strip()
        age = int(data.get('age', 0))
        gender = data.get('gender', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        aadhar = data.get('aadhar', '').strip()
        address = data.get('address', '').strip()
        prev_problem = data.get('prev_problem', '').strip()
        curr_problem = data.get('curr_problem', '').strip()

        # Basic validation
        if not first_name or not last_name or not phone:
            return jsonify({'success': False, 'error': 'first_name, last_name, phone are required'}), 400

        conn = get_db()
        c = conn.cursor()

        # Check if email already exists
        if email:
            c.execute('SELECT id FROM members WHERE email = ?', (email,))
            if c.fetchone():
                return jsonify({'success': False, 'error': 'Email already exists'}), 400

        # Insert into members table
        c.execute('''INSERT INTO members
                     (family_id, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (uid, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem))
        member_id = c.lastrowid
        conn.commit()

        return jsonify({'success': True, 'message': 'Family member added successfully', 'member_id': member_id})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

    finally:
        if conn:
            conn.close()



# GET route to fetch family member details
@app.route('/api/family_member/<int:member_id>', methods=['GET'])
def api_get_family_member(member_id):
    print(f"=== GET /api/family_member/{member_id} called ===")
    
    if 'family_id' not in session or session.get('user_type') != 'patient':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    conn = None
    try:
        conn = get_db()
        c = conn.cursor()

        # Get member details
        c.execute('''SELECT id, first_name, middle_name, last_name, age, gender, 
                            phone, email, aadhar, address, prev_problem, curr_problem
                     FROM members 
                     WHERE id = ? AND family_id = ?''', 
                  (member_id, session['family_id']))
        
        member = c.fetchone()
        
        if not member:
            return jsonify({'success': False, 'error': 'Family member not found'}), 404

        return jsonify({
            'success': True,
            'member': dict(member)
        })

    except Exception as e:
        print(f"❌ Error in GET family member: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# POST route to update family member
@app.route('/api/edit_family_member/<int:member_id>', methods=['POST'])
def api_edit_family_member(member_id):
    print(f"=== POST /api/edit_family_member/{member_id} called ===")
    
    if 'family_id' not in session or session.get('user_type') != 'patient':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    data = request.get_json()
    print(f"📦 Received data: {data}")
    
    conn = None
    try:
        conn = get_db()
        c = conn.cursor()

        # Get fields from JSON
        first_name = data.get('first_name', '').strip()
        middle_name = data.get('middle_name', '').strip()
        last_name = data.get('last_name', '').strip()
        age = data.get('age', '')
        gender = data.get('gender', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        aadhar = data.get('aadhar', '').strip()
        address = data.get('address', '').strip()
        prev_problem = data.get('prev_problem', '').strip()
        curr_problem = data.get('curr_problem', '').strip()

        # Validate required fields
        if not first_name or not last_name or not phone:
            return jsonify({'success': False, 'error': 'First name, last name, and phone are required'}), 400

        # Convert age to integer safely
        try:
            age = int(age) if age else 0
        except ValueError:
            return jsonify({'success': False, 'error': 'Age must be a valid number'}), 400

        # Check if email already exists for another member
        c.execute('SELECT id FROM members WHERE email = ? AND id != ? AND family_id = ?', 
                  (email, member_id, session['family_id']))
        if c.fetchone():
            return jsonify({'success': False, 'error': 'Email already exists'}), 400

        # Update member
        c.execute('''UPDATE members 
                     SET first_name=?, middle_name=?, last_name=?, age=?, gender=?, 
                         phone=?, email=?, aadhar=?, address=?, prev_problem=?, curr_problem=?
                     WHERE id=? AND family_id=?''',
                  (first_name, middle_name, last_name, age, gender, phone, email, 
                   aadhar, address, prev_problem, curr_problem, member_id, session['family_id']))
        conn.commit()

        return jsonify({'success': True, 'message': 'Family member updated successfully'})

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"❌ Error in POST edit family member: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/delete_family_member/<int:member_id>', methods=['DELETE'])
def api_delete_family_member(member_id):
    if 'family_id' not in session or session.get('user_type') != 'patient':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    conn = None
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('DELETE FROM members WHERE id=? AND family_id=?', (member_id, session['family_id']))
        conn.commit()
        return jsonify({'success': True, 'message': 'Family member deleted successfully'})
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/book_appointment', methods=['GET', 'POST'])
def api_book_appointment():
    # generate_slots_for_doctor(doctor_id=3,days=7)
    if 'family_id' not in session or session.get('user_type') != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        print("=== /api/book_appointment GET endpoint called ===")
        print(f"Session data: family_id={session.get('family_id')}, user_type={session.get('user_type')}")
        
        try:
            uid = session['family_id']
            print(f"✅ Authorized - Family ID: {uid}")
            conn = get_db()
            c = conn.cursor()

            # Get family members for the current family
            print("📋 Fetching family members...")
            c.execute('SELECT id, first_name, last_name FROM members WHERE family_id = ?', (uid,))
            members = [dict(row) for row in c.fetchall()]
            print(f"👥 Family members found: {len(members)}")

            # Get available doctors
            print("🩺 Fetching doctors...")
            c.execute("SELECT id, name, specialty FROM doctors")
            doctors = [dict(row) for row in c.fetchall()]
            print(f"👨‍⚕️ Doctors found: {len(doctors)}")

            # Get available slots - ONLY FUTURE SLOTS that are NOT booked
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            print(f"⏰ Current time: {current_time}")
            print("📅 Fetching available slots (future + not booked)...")
            
            # Get slots that are in future AND not booked (using both methods for safety)
            c.execute('''SELECT s.id, s.slot_time, d.name as doctor_name, d.specialty, d.id as doctor_id
                         FROM slots s 
                         JOIN doctors d ON s.doctor_id = d.id 
                         WHERE s.slot_time > ? 
                         AND s.booked = 0
                         AND s.id NOT IN (
                             SELECT slot_id FROM appointments WHERE status IN ('Scheduled', 'Confirmed')
                         )
                         ORDER BY s.slot_time, d.name''', (current_time,))
            
            available_slots = c.fetchall()
            print(f"🎯 Available slots found: {len(available_slots)}")
            
            slots = []
            for i, row in enumerate(available_slots):
                slot = dict(row)
                print(f"   Slot {i+1} raw: {slot}")
                
                # Format the slot_time for frontend display
                slot_time = slot['slot_time']
                try:
                    # Try different time formats
                    if ':' in slot_time and slot_time.count(':') == 2:
                        dt = datetime.strptime(slot_time, '%Y-%m-%d %H:%M:%S')
                    elif ':' in slot_time and slot_time.count(':') == 1:
                        dt = datetime.strptime(slot_time, '%Y-%m-%d %H:%M')
                    else:
                        print(f"   ⚠️ Unknown time format: {slot_time}")
                        continue  # Skip invalid formats
                    
                    # Only include slots that are in the future
                    if dt <= datetime.now():
                        print(f"   ⏰ Skipping past slot: {slot_time}")
                        continue
                    
                    slot['date'] = dt.strftime('%Y-%m-%d')
                    slot['time'] = dt.strftime('%H:%M')
                    slot['display'] = f"{dt.strftime('%Y-%m-%d %H:%M')} - Dr. {slot['doctor_name']} ({slot['specialty']})"
                    slot['formatted_time'] = dt.strftime('%H:%M')
                    print(f"   ✅ Available slot: {slot['display']}")
                    
                    slots.append(slot)
                    
                except Exception as e:
                    print(f"   ❌ Error formatting slot time {slot_time}: {e}")
                    continue  # Skip this slot

            conn.close()

            # Prepare final response
            response_data = {
                'success': True,
                'members': members,
                'doctors': doctors,
                'slots': slots,
                'debug': {
                    'current_time': current_time,
                    'slots_found': len(slots)
                }
            }

            print(f"\n📦 FINAL: Found {len(slots)} available future slots")
            print("✅ Sending response to frontend...")
            return jsonify(response_data)

        except Exception as e:
            print(f"❌ ERROR in book appointment data API: {str(e)}")
            import traceback
            print(f"🔍 Full traceback:\n{traceback.format_exc()}")
            return jsonify({'error': 'Failed to load appointment data'}), 500
    elif request.method == 'POST':
        print("=== /api/book_appointment POST endpoint called ===")
        print(f"Session data: family_id={session.get('family_id')}, user_type={session.get('user_type')}")
        
        data = request.get_json() or {}
        print(f"📨 Received booking data: {data}")
        
        conn = None
        try:
            uid = session['family_id']
            member_id = data.get('member_id')
            doctor_id = data.get('doctor_id')
            slot_id = data.get('slot_id')
            appointment_id = data.get('appointment_id')  # optional for reschedule

            print(f"📝 Booking details - Member: {member_id}, Doctor: {doctor_id}, Slot: {slot_id}, Reschedule: {appointment_id}")

            # Validate required fields
            if not member_id or not doctor_id or not slot_id:
                error_msg = 'member_id, doctor_id, and slot_id are required'
                print(f"❌ Validation failed: {error_msg}")
                return jsonify({'success': False, 'error': error_msg}), 400

            conn = get_db()
            c = conn.cursor()

            # Verify slot exists
            c.execute('SELECT doctor_id, slot_time FROM slots WHERE id = ?', (slot_id,))
            slot = c.fetchone()
            if not slot:
                error_msg = 'Selected slot not found'
                print(f"❌ Slot not found: {error_msg}")
                return jsonify({'success': False, 'error': error_msg}), 400

            print(f"✅ Slot found: {slot['slot_time']} for doctor {slot['doctor_id']}")

            # Check if slot is in the future
            slot_time_str = slot['slot_time']
            try:
                # Handle both time formats
                if ':' in slot_time_str and slot_time_str.count(':') == 2:
                    slot_time = datetime.strptime(slot_time_str, '%Y-%m-%d %H:%M:%S')
                elif ':' in slot_time_str and slot_time_str.count(':') == 1:
                    slot_time = datetime.strptime(slot_time_str, '%Y-%m-%d %H:%M')
                else:
                    error_msg = f'Invalid slot time format: {slot_time_str}'
                    print(f"❌ {error_msg}")
                    return jsonify({'success': False, 'error': error_msg}), 400
            except ValueError as e:
                error_msg = f'Invalid slot time format: {slot_time_str}'
                print(f"❌ {error_msg}: {e}")
                return jsonify({'success': False, 'error': error_msg}), 400

            if slot_time <= datetime.now():
                error_msg = 'Cannot book past time slots'
                print(f"❌ Past slot: {error_msg}")
                return jsonify({'success': False, 'error': error_msg}), 400

            # Check if slot belongs to selected doctor
            if str(slot['doctor_id']) != str(doctor_id):
                error_msg = 'Selected slot does not belong to this doctor'
                print(f"❌ Doctor mismatch: {error_msg}")
                return jsonify({'success': False, 'error': error_msg}), 400

            # Check for existing bookings (exclude current appointment if rescheduling)
            if appointment_id:
                c.execute('SELECT id FROM appointments WHERE slot_id = ? AND status = "Scheduled" AND id != ?', (slot_id, appointment_id))
            else:
                c.execute('SELECT id FROM appointments WHERE slot_id = ? AND status = "Scheduled"', (slot_id,))
            
            existing_booking = c.fetchone()
            if existing_booking:
                error_msg = 'Selected slot is already booked'
                print(f"❌ Slot already booked: {error_msg}")
                return jsonify({'success': False, 'error': error_msg}), 400

            # Verify member belongs to the family
            c.execute('SELECT id FROM members WHERE id = ? AND family_id = ?', (member_id, uid))
            member = c.fetchone()
            if not member:
                error_msg = 'Family member not found or does not belong to your family'
                print(f"❌ Member validation failed: {error_msg}")
                return jsonify({'success': False, 'error': error_msg}), 400

            # Insert or update appointment
            if appointment_id:
                print(f"🔄 Rescheduling appointment {appointment_id} to slot {slot_id}")
                c.execute('UPDATE appointments SET slot_id = ?, status = "Scheduled" WHERE id = ?', (slot_id, appointment_id))
                if c.rowcount == 0:
                    error_msg = 'Failed to reschedule appointment'
                    print(f"❌ Reschedule failed: {error_msg}")
                    return jsonify({'success': False, 'error': error_msg}), 400
                action = "rescheduled"
                new_appointment_id = appointment_id
            else:
                print(f"🆕 Creating new appointment for member {member_id} with slot {slot_id}")
                c.execute('INSERT INTO appointments (member_id, slot_id, status) VALUES (?, ?, "Scheduled")', (member_id, slot_id))
                new_appointment_id = c.lastrowid
                action = "booked"

            # MARK THE SLOT AS BOOKED
            print(f"🔒 Marking slot {slot_id} as booked")
            c.execute('UPDATE slots SET booked = 1 WHERE id = ?', (slot_id,))
            if c.rowcount == 0:
                print(f"⚠️ Could not mark slot {slot_id} as booked")

            # Generate bill for the appointment
            try:
                # Get doctor's consultation fee
                c.execute('SELECT consultation_fee FROM doctors WHERE id = ?', (doctor_id,))
                doctor = c.fetchone()
                consultation_fee = doctor['consultation_fee'] if doctor and doctor['consultation_fee'] else 500  # default fee
                
                # Create bill
                bill_description = f"Consultation fee - Dr. {data.get('doctor_name', 'Unknown')}"
                c.execute('INSERT INTO bills (appointment_id, amount, status, description, bill_date) VALUES (?, ?, "Pending", ?, DATE("now"))',
                         (new_appointment_id, consultation_fee, bill_description))
                print(f"💰 Bill created for appointment: ₹{consultation_fee}")
            except Exception as bill_error:
                print(f"⚠️ Could not create bill: {bill_error}")

            conn.commit()
            print(f"✅ Appointment successfully {action}, ID: {new_appointment_id}")

            conn.close()
            return jsonify({
                'success': True, 
                'message': f'Appointment {action} successfully',
                'appointment_id': new_appointment_id
            })

        except Exception as e:
            print(f"❌ ERROR in book appointment POST API: {str(e)}")
            import traceback
            print(f"🔍 Full traceback:\n{traceback.format_exc()}")
            if conn:
                conn.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500
        finally:
            if conn:
                conn.close()


@app.route('/api/view_appointment/<int:appointment_id>', methods=['GET'])
def api_view_appointment(appointment_id):
    if 'family_id' not in session or session.get('user_type') not in ['patient', 'doctor', 'front_office']:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('''SELECT 
            a.id,
            a.status, 
            s.slot_time, 
            d.name as doctor_name, 
            d.specialty, 
            m.first_name, 
            m.last_name, 
            m.age, 
            m.gender, 
            m.phone, 
            m.email
            FROM appointments a
            JOIN slots s ON a.slot_id = s.id
            JOIN doctors d ON s.doctor_id = d.id
            JOIN members m ON a.member_id = m.id
            WHERE a.id = ? AND (m.family_id = ? OR d.id IN (SELECT id FROM doctors WHERE family_id = ?))''',
                  (appointment_id, session['family_id'], session['family_id']))
        appointment = c.fetchone()
        conn.close()
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        return jsonify(dict(appointment))
    except Exception as e:
        logger.error(f"Error in api_view_appointment: {e}")
        return jsonify({'error': 'Failed to view appointment'}), 500
    

@app.route('/api/reschedule_appointment/<int:appointment_id>', methods=['GET'])
def api_reschedule_appointment(appointment_id):
    print(f"=== /api/reschedule_appointment/{appointment_id} GET endpoint called ===")
    
    if 'family_id' not in session or session.get('user_type') != 'patient':
        print("❌ UNAUTHORIZED: No family_id in session or user is not a patient")
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        uid = session['family_id']
        print(f"✅ Authorized - Family ID: {uid}, Appointment ID: {appointment_id}")
        
        conn = get_db()
        c = conn.cursor()
        
        # Get current appointment details
        c.execute('''SELECT a.id, a.member_id, a.slot_id, m.first_name, m.last_name,
                    d.name as doctor_name, d.id as doctor_id, s.slot_time, d.specialty
                    FROM appointments a 
                    JOIN slots s ON a.slot_id = s.id 
                    JOIN doctors d ON s.doctor_id = d.id 
                    JOIN members m ON a.member_id = m.id 
                    WHERE a.id = ? AND m.family_id = ? AND a.status = "Scheduled"''', 
                 (appointment_id, uid))
        
        appointment = c.fetchone()
        
        if not appointment:
            print("❌ Appointment not found or cannot be rescheduled")
            conn.close()
            return jsonify({'error': 'Appointment not found or cannot be rescheduled'}), 404

        print(f"✅ Found appointment: {appointment}")

        # Format the slot time
        slot_datetime = datetime.strptime(appointment['slot_time'], '%Y-%m-%d %H:%M:%S')
        slot_date = slot_datetime.strftime('%Y-%m-%d')
        slot_time = slot_datetime.strftime('%H:%M')

        response_data = {
            "success": True,
            "appointment": {
                "appointment_id": appointment['id'],
                "member_id": appointment['member_id'],
                "doctor_id": appointment['doctor_id'],
                "slot_date": slot_date,
                "slot_time": slot_time,
                "current_slot_id": appointment['slot_id'],
                "patient_name": f"{appointment['first_name']} {appointment['last_name']}",
                "doctor_name": appointment['doctor_name'],
                "specialty": appointment['specialty']
            }
        }

        print(f"✅ Sending reschedule data: {response_data}")
        conn.close()
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ ERROR in reschedule appointment API: {str(e)}")
        import traceback
        print(f"🔍 Full traceback:\n{traceback.format_exc()}")
        return jsonify({'error': 'Failed to load appointment details'}), 500
    
@app.route('/api/cancel_appointment/<int:appointment_id>', methods=['DELETE'])
def api_cancel_appointment(appointment_id):
    if 'family_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get the appointment and its slot
        c.execute('''SELECT a.id, a.slot_id, a.status, s.doctor_id 
                    FROM appointments a 
                    JOIN slots s ON a.slot_id = s.id 
                    WHERE a.id = ?''', (appointment_id,))
        appointment = c.fetchone()
        
        if not appointment:
            return jsonify({'success': False, 'error': 'Appointment not found'}), 404
        
        # Update appointment status to Cancelled
        c.execute('UPDATE appointments SET status = "Cancelled" WHERE id = ?', (appointment_id,))
        
        # Free up the slot by setting booked to 0
        c.execute('UPDATE slots SET booked = 0 WHERE id = ?', (appointment['slot_id'],))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Appointment cancelled successfully'})
        
    except Exception as e:
        logger.error(f"Error cancelling appointment: {e}")
        return jsonify({'success': False, 'error': 'Failed to cancel appointment'}), 500


# ==========================
# Doctor APIs
# ==========================

@app.route('/api/doctor_patients', methods=['GET'])
def api_doctor_patients():
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()

        # Get doctor
        c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
        doctor = dict(c.fetchone() or {})

        # Get patients with last visit
        c.execute('''SELECT m.*, MAX(s.slot_time) as last_visit
                     FROM members m
                     JOIN appointments a ON m.id = a.member_id
                     JOIN slots s ON a.slot_id = s.id
                     WHERE s.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
                     GROUP BY m.id
                     ORDER BY last_visit DESC''', (uid,))
        patients = [dict(row) for row in c.fetchall()]

        conn.close()
        return jsonify({'doctor': doctor, 'patients': patients})

    except Exception as e:
        logger.error(f"Error in doctor patients API: {e}")
        return jsonify({'error': 'Failed to load patients'}), 500


@app.route('/api/doctor_schedule', methods=['GET'])
def api_doctor_schedule():
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()

        # Get doctor
        c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
        doctor = dict(c.fetchone() or {})

        # Get schedule
        c.execute('''SELECT s.*, 
                            CASE WHEN a.id IS NULL THEN 'Available' ELSE 'Booked' END as status,
                            m.first_name, m.last_name
                     FROM slots s
                     LEFT JOIN appointments a ON s.id = a.slot_id
                     LEFT JOIN members m ON a.member_id = m.id
                     WHERE s.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
                     ORDER BY s.slot_time''', (uid,))
        schedule = [dict(row) for row in c.fetchall()]

        conn.close()
        return jsonify({'doctor': doctor, 'schedule': schedule})

    except Exception as e:
        logger.error(f"Error in doctor schedule API: {e}")
        return jsonify({'error': 'Failed to load schedule'}), 500

@app.route('/api/doctor_appointments', methods=['GET'])
def api_doctor_appointments():
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()

        # Get doctor
        c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
        doctor = dict(c.fetchone() or {})

        # Get appointments - ADD patient_id to the SELECT
        c.execute('''SELECT a.id, m.id as patient_id, m.first_name, m.last_name, m.phone, m.email, 
                            s.slot_time, a.status
                     FROM appointments a 
                     JOIN slots s ON a.slot_id = s.id 
                     JOIN members m ON a.member_id = m.id 
                     WHERE s.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
                     ORDER BY s.slot_time DESC''', (uid,))
        
        appointments = []
        for row in c.fetchall():
            appointment = dict(row)
            # Format the slot_time for frontend
            slot_time = appointment['slot_time']
            try:
                dt = datetime.strptime(slot_time, '%Y-%m-%d %H:%M:%S')
                appointment['slot_time'] = dt.strftime('%Y-%m-%d')
                appointment['time'] = dt.strftime('%H:%M')
            except:
                appointment['slot_time'] = slot_time
                appointment['time'] = 'N/A'
            appointments.append(appointment)

        conn.close()
        return jsonify({'doctor': doctor, 'appointments': appointments})

    except Exception as e:
        logger.error(f"Error in doctor appointments API: {e}")
        return jsonify({'error': 'Failed to load appointments'}), 500


@app.route('/api/doctor_prescriptions', methods=['GET', 'POST'])
def api_doctor_prescriptions():
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()

        # Get doctor
        c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
        doctor = dict(c.fetchone() or {})

        if request.method == 'POST':
            data = request.json
            member_id = data.get('member_id')
            medication = data.get('medication')
            dosage = data.get('dosage')
            frequency = data.get('frequency', '')
            duration = data.get('duration', '')
            instructions = data.get('instructions', '')
            notes = data.get('notes', '')

            from datetime import datetime
            prescription_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            c.execute('''INSERT INTO prescriptions 
                         (member_id, doctor_id, prescription_date, medication, dosage, 
                          frequency, duration, instructions, notes)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                      (member_id, doctor['id'], prescription_date, medication, dosage, 
                       frequency, duration, instructions, notes))
            conn.commit()

            conn.close()
            return jsonify({'success': True, 'message': 'Prescription added successfully'})

        # GET request → fetch prescriptions
        c.execute('''SELECT p.*, m.first_name, m.last_name, d.name as doctor_name
                     FROM prescriptions p
                     JOIN members m ON p.member_id = m.id
                     JOIN doctors d ON p.doctor_id = d.id
                     WHERE p.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
                     ORDER BY p.prescription_date DESC''', (uid,))
        prescriptions = [dict(row) for row in c.fetchall()]

        # Patients for dropdown
        c.execute('''SELECT DISTINCT m.id, m.first_name, m.last_name
                     FROM members m
                     JOIN appointments a ON m.id = a.member_id
                     JOIN slots s ON a.slot_id = s.id
                     WHERE s.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
                     ORDER BY m.first_name''', (uid,))
        patients = [dict(row) for row in c.fetchall()]

        conn.close()
        return jsonify({'doctor': doctor, 'prescriptions': prescriptions, 'patients': patients})

    except Exception as e:
        logger.error(f"Error in doctor prescriptions API: {e}")
        return jsonify({'error': 'Failed to load prescriptions'}), 500


# ==========================
# Patient APIs
# ==========================
# Update the /api/upload_medical_record route (or wherever the upload happens; based on your snippet, it's in /api/patient/medical_records POST)
@app.route('/api/patient/medical_records', methods=['GET', 'POST'])
def api_patient_medical_records():
    if 'family_id' not in session or session.get('user_type') != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        conn = get_db()
        c = conn.cursor()

        if request.method == 'POST':
            data = request.form if request.form else request.json
            member_id = data.get('member_id')
            record_type = data.get('record_type')
            record_date = data.get('record_date')
            description = data.get('description')
            file = request.files.get('record_file') if 'record_file' in request.files else None  # Note: Changed from 'file' to 'record_file' to match your frontend formData

            if not member_id or not record_type or not record_date:
                return jsonify({'error': 'Missing required fields'}), 400

            file_name = None
            file_mimetype = None
            file_data = None

            if file and file.filename != '':
                file_name = secure_filename(file.filename)
                file_mimetype = file.mimetype  # Use mimetype for content-type
                file_data = file.read()  # Read binary content

            c.execute('''INSERT INTO medical_records 
                         (member_id, record_type, record_date, description, file_name, file_mimetype, file_data, uploaded_date) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)''',
                      (member_id, record_type, record_date, description, file_name, file_mimetype, file_data))
            conn.commit()

            conn.close()
            return jsonify({'success': True, 'message': 'Medical record uploaded successfully'})

        # GET remains the same (fetch family members for upload form)
        family_id = session['family_id']
        c.execute('''SELECT id, first_name, last_name 
                     FROM family_members 
                     WHERE family_id = ?''', (family_id,))
        family_members = [dict(row) for row in c.fetchall()]

        conn.close()
        return jsonify({'family_members': family_members})

    except Exception as e:
        logger.error(f"Error in patient medical records API: {e}")
        return jsonify({'error': 'Failed to process request'}), 500
    
@app.route('/api/doctor_medical_records', methods=['GET'])
def api_doctor_medical_records():
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()
        
        # Get doctor details
        c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
        doctor = dict(c.fetchone() or {})
        
        # Get medical records of patients who visited this dotcor
        c.execute('''SELECT mr.*, m.first_name, m.last_name 
                     FROM medical_records mr
                     JOIN members m ON mr.member_id = m.id
                     WHERE m.id IN (
                         SELECT DISTINCT a.member_id 
                         FROM appointments a 
                         JOIN slots s ON a.slot_id = s.id 
                         WHERE s.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
                     )
                     ORDER BY mr.record_date DESC''', (uid,))
        
        medical_records = [dict(row) for row in c.fetchall()]
        
        conn.close()
        
        return jsonify({
            'doctor': doctor,
            'medical_records': medical_records,  # Make sure this key exists
            'current_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    
    except Exception as e:
        logger.error(f"Error in doctor medical records API: {e}")
        return jsonify({'error': 'Failed to load medical records'}), 500
        logger.error(f"Error in doctor medical records API: {e}")
        return jsonify({'error': 'Failed to load medical records'}), 500
from flask import request, session, redirect, render_template
from datetime import datetime
import traceback

# -------------------------
# Doctor - View Patient by ID
@app.route('/api/doctor_view_patient/<int:patient_id>', methods=['GET'])
def api_doctor_view_patient(patient_id):  # CORRECT - add the parameter
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get patient details by patient_id
        c.execute('''SELECT * FROM members WHERE id = ?''', (patient_id,))
        patient = c.fetchone()
        
        if not patient:
            conn.close()
            return jsonify({'error': 'Patient not found'}), 404
        
        conn.close()
        return jsonify(dict(patient))
        
    except Exception as e:
        logger.error(f"Error in doctor view patient API: {e}")
        return jsonify({'error': 'Failed to load patient details'}), 500
# -------------------------
# Doctor - View Today's Appointment
# -------------------------
@app.route('/api/doctor_patient_full_details/<int:patient_id>', methods=['GET'])
def api_doctor_patient_full_details(patient_id):
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        conn = get_db()
        c = conn.cursor()

        # Get doctor details
        c.execute('SELECT id FROM doctors WHERE family_id = ?', (session['family_id'],))
        doctor = c.fetchone()
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        
        doctor_id = doctor['id']

        # Get patient basic information
        c.execute('''SELECT * FROM members WHERE id = ?''', (patient_id,))
        patient = dict(c.fetchone() or {})
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404

        # Get medical history
        c.execute('''SELECT record_type, record_date, description, file_path
                     FROM medical_records 
                     WHERE member_id = ? 
                     ORDER BY record_date DESC LIMIT 10''', (patient_id,))
        medical_history = [dict(row) for row in c.fetchall()]

        # Get previous appointments with this doctor - EXCLUDE CANCELLED ONES
        c.execute('''SELECT a.id, s.slot_time, a.status
                     FROM appointments a
                     JOIN slots s ON a.slot_id = s.id
                     WHERE a.member_id = ? AND s.doctor_id = ? AND a.status != 'Cancelled'
                     ORDER BY s.slot_time DESC LIMIT 5''', (patient_id, doctor_id))
        previous_appointments = [dict(row) for row in c.fetchall()]

        # Get prescriptions
        c.execute('''SELECT prescription_date, medication, dosage, frequency, 
                            duration, instructions, notes, d.name as doctor_name
                     FROM prescriptions p
                     JOIN doctors d ON p.doctor_id = d.id
                     WHERE p.member_id = ? AND p.doctor_id = ?
                     ORDER BY p.prescription_date DESC LIMIT 10''', (patient_id, doctor_id))
        prescriptions = [dict(row) for row in c.fetchall()]

        # Get current appointment if any - EXCLUDE CANCELLED ONES
        c.execute('''SELECT a.id as appointment_id, s.slot_time, d.name as doctor_name, 
                            d.specialty, a.status
                     FROM appointments a
                     JOIN slots s ON a.slot_id = s.id
                     JOIN doctors d ON s.doctor_id = d.id
                     WHERE a.member_id = ? AND s.doctor_id = ? 
                     AND a.status != 'Cancelled'
                     AND date(s.slot_time) = date('now')
                     ORDER BY s.slot_time DESC LIMIT 1''', (patient_id, doctor_id))
        current_appointment = dict(c.fetchone() or {})

        conn.close()

        return jsonify({
            'success': True,
            'patient': patient,
            'medical_history': medical_history,
            'previous_appointments': previous_appointments,
            'prescriptions': prescriptions,
            'current_appointment': current_appointment,
            'doctor': {'id': doctor_id}
        })

    except Exception as e:
        logger.error(f"Error in doctor patient full details API: {e}")
        return jsonify({'error': 'Failed to load patient details'}), 500
    
# -------------------------
# Doctor - Add Prescriptions (3 Variants)
# -------------------------
@app.route('/doctor_add_prescription', methods=['POST'])
def doctor_add_prescription():
    """Add prescription from patient view page"""
    return handle_add_prescription(redirect_type="patient")


@app.route('/doctor_add_prescription_dashboard', methods=['POST'])
def doctor_add_prescription_dashboard():
    """Add prescription from dashboard view"""
    return handle_add_prescription(redirect_type="dashboard")


@app.route('/doctor_add_prescription_patients', methods=['POST'])
def doctor_add_prescription_patients():
    """Add prescription from patients list"""
    return handle_add_prescription(redirect_type="patients")


# -------------------------
# Helper for Adding Prescription
# -------------------------
def handle_add_prescription(redirect_type="dashboard"):
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return redirect('/')

    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()

        c.execute('SELECT id FROM doctors WHERE family_id = ?', (uid,))
        doctor = c.fetchone()
        if not doctor:
            conn.close()
            return redirect('/doctor_dashboard?error=Doctor not found')

        # Extract form data
        member_id = request.form['member_id']
        medication = request.form['medication']
        dosage = request.form['dosage']
        frequency = request.form.get('frequency', '')
        duration = request.form.get('duration', '')
        instructions = request.form.get('instructions', '')
        notes = request.form.get('notes', '')
        appointment_id = request.form.get('appointment_id', '')

        prescription_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Insert prescription
        c.execute('''INSERT INTO prescriptions 
                     (member_id, doctor_id, prescription_date, medication, dosage, 
                      frequency, duration, instructions, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (member_id, doctor['id'], prescription_date, medication, dosage,
                   frequency, duration, instructions, notes))
        conn.commit()
        conn.close()

        # Redirect logic
        if redirect_type == "patient" and appointment_id:
            return redirect(f'/doctor/view_patient/{appointment_id}?success=Prescription added successfully')
        elif redirect_type == "patients":
            return redirect('/doctor/patients?success=Prescription added successfully')
        else:
            return redirect('/doctor_dashboard?success=Prescription added successfully')

    except Exception as e:
        logger.error(f"Error adding prescription: {e}")
        logger.error(traceback.format_exc())
        return redirect('/doctor_dashboard?error=Failed to add prescription')


from datetime import datetime

@app.route('/api/front_office_checkins', methods=['GET'])
def api_front_office_checkins():
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    conn = None
    try:
        conn = get_db()
        c = conn.cursor()

        today = datetime.now().strftime('%Y-%m-%d')

        # Fetch today's appointments with required fields for the frontend table
        c.execute('''
            SELECT 
                a.id,
                m.first_name || ' ' || m.last_name AS patient_name,
                m.phone,
                d.name AS doctor_name,
                strftime('%H:%M', s.slot_time) AS time,
                COALESCE(a.status, 'Scheduled') AS status  -- Fallback to 'Scheduled' if status is NULL
            FROM appointments a
            JOIN slots s ON a.slot_id = s.id
            JOIN doctors d ON s.doctor_id = d.id
            JOIN members m ON a.member_id = m.id
            WHERE date(s.slot_time) = ?
            ORDER BY s.slot_time ASC
        ''', (today,))

        checkins = [dict(row) for row in c.fetchall()]

        return jsonify({'success': True, 'checkins': checkins})

    except Exception as e:
        logger.error(f"Error in api_front_office_checkins: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to fetch check-ins'}), 500

    finally:
        if conn:
            conn.close()

@app.route('/api/front_office/checkin_appointment/<int:appointment_id>', methods=['POST'])
def front_office_checkin_appointment(appointment_id):
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Update appointment status to Checked In
        c.execute('UPDATE appointments SET status = "Checked In" WHERE id = ?', (appointment_id,))
        if c.rowcount == 0:
            conn.close()
            return jsonify({'success': False, 'error': 'Appointment not found or already checked in'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Patient checked in successfully'})
    
    except Exception as e:
        logger.error(f"Error checking in appointment: {e}")
        if conn:
            conn.rollback()
        return jsonify({'success': False, 'error': 'Failed to check in patient'}), 500


@app.route('/api/front_office/checkout_appointment/<int:appointment_id>', methods=['POST'])
def api_checkout_appointment(appointment_id):
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    conn = None
    try:
        conn = get_db()
        c = conn.cursor()

        # Update appointment status to 'Completed'
        c.execute(
            'UPDATE appointments SET status = ? WHERE id = ? AND status = ?',
            ('Completed', appointment_id, 'Checked In')
        )
        conn.commit()

        if c.rowcount == 0:
            return jsonify({'success': False, 'error': 'Appointment not found or already completed'}), 400

        return jsonify({'success': True})

    except Exception as e:
        logger.error(f"Error in api_checkout_appointment: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to check out patient'}), 500

    finally:
        if conn:
            conn.close()

@app.route('/api/front_office/pay_bill/<int:bill_id>', methods=['POST'])
def mark_bill_as_paid(bill_id):
    try:
        print(f"=== MARK BILL AS PAID DEBUG ===")
        print(f"Session data: {dict(session)}")
        print(f"User type: {session.get('user_type')}")
        print(f"Bill ID: {bill_id}")
        
        # Check if user is front office
        if session.get('user_type') != 'front_office':
            print("❌ Unauthorized: User is not front office")
            return jsonify({'error': 'Unauthorized - Front office access required'}), 401

        conn = get_db()
        c = conn.cursor()
        
        # Check if bill exists
        c.execute('''SELECT * FROM bills WHERE id = ?''', (bill_id,))
        bill = c.fetchone()
        
        if not bill:
            conn.close()
            return jsonify({'error': 'Bill not found'}), 404
        
        # Update bill status to Paid and set payment date
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        c.execute('''UPDATE bills SET status = "Paid", payment_date = ? WHERE id = ?''', 
                  (current_time, bill_id))
        conn.commit()
        conn.close()

        print(f"✅ Bill {bill_id} marked as paid successfully")
        return jsonify({
            'success': True, 
            'message': 'Bill marked as paid successfully',
            'bill_id': bill_id
        })

    except Exception as e:
        print(f"❌ Error marking bill as paid: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500
# @app.route('/api/front_office/checkout_appointment/<int:appointment_id>', methods=['POST'])
# def front_office_checkout_appointment(appointment_id):
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
#     try:
#         conn = get_db()
#         c = conn.cursor()
        
#         # Update appointment status to Completed
#         c.execute('UPDATE appointments SET status = "Completed" WHERE id = ?', (appointment_id,))
#         if c.rowcount == 0:
#             conn.close()
#             return jsonify({'success': False, 'error': 'Appointment not found or already completed'}), 404
        
#         conn.commit()
#         conn.close()
        
#         return jsonify({'success': True, 'message': 'Patient checked out successfully'})
    
#     except Exception as e:
#         logger.error(f"Error checking out appointment: {e}")
#         if conn:
#             conn.rollback()
#         return jsonify({'success': False, 'error': 'Failed to check out patient'}), 500



@app.route('/front_office/reschedule_appointment', methods=['POST'])
def front_office_reschedule_appointment():
    """Handle rescheduling from modal form"""
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        appointment_id = request.form['appointment_id']
        new_slot_id = request.form['slot_id']
        
        conn = get_db()
        c = conn.cursor()
        
        # Get current appointment details
        c.execute('SELECT slot_id FROM appointments WHERE id = ?', (appointment_id,))
        current_appointment = c.fetchone()
        
        if not current_appointment:
            conn.close()
            return jsonify({'success': False, 'error': 'Appointment not found'}), 404
        
        # Free up the old slot
        c.execute('UPDATE slots SET booked = 0 WHERE id = ?', (current_appointment['slot_id'],))
        
        # Book the new slot
        c.execute('UPDATE slots SET booked = 1 WHERE id = ?', (new_slot_id,))
        
        # Update the appointment with the new slot
        c.execute('UPDATE appointments SET slot_id = ? WHERE id = ?', (new_slot_id, appointment_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Appointment rescheduled successfully'})
    
    except Exception as e:
        logger.error(f"Error rescheduling appointment: {e}")
        if conn:
            conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/front_office_view_patient/<int:patient_id>', methods=['GET'])
def front_office_view_patient(patient_id):
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get front office details (optional, for context)
        c.execute('SELECT * FROM front_office WHERE family_id = ?', (session['family_id'],))
        front_office = dict(c.fetchone() or {})
        
        # Get patient details
        c.execute('''SELECT 
            m.id as patient_id,
            m.first_name, 
            m.middle_name,
            m.last_name, 
            m.age, 
            m.gender, 
            m.phone, 
            m.email,
            m.aadhar,
            m.address,
            m.prev_problem,
            m.curr_problem,
            m.created_date as registration_date
            FROM members m
            WHERE m.id = ?''', (patient_id,))
        
        patient = dict(c.fetchone() or {})
        
        if not patient:
            conn.close()
            return jsonify({'success': False, 'error': 'Patient not found'}), 404
        
        # Create a mock appointment object for compatibility
        appointment_data = {
            'patient_id': patient['patient_id'],
            'first_name': patient['first_name'],
            'middle_name': patient['middle_name'],
            'last_name': patient['last_name'],
            'age': patient['age'],
            'gender': patient['gender'],
            'phone': patient['phone'],
            'email': patient['email'],
            'aadhar': patient['aadhar'],
            'address': patient['address'],
            'prev_problem': patient['prev_problem'],
            'curr_problem': patient['curr_problem'],
            'registration_date': patient['registration_date'],
            'doctor_name': 'Multiple Doctors',
            'specialty': 'Various Specialties',
            'slot_time': 'Multiple appointments',
            'status': 'Patient Record View'
        }
        
        # Get patient's medical history
        c.execute('''SELECT record_type, record_date, description, file_path
                    FROM medical_records 
                    WHERE member_id = ? 
                    ORDER BY record_date DESC LIMIT 10''', 
                 (patient_id,))
        medical_history = [dict(row) for row in c.fetchall()]
        
        # Get patient's appointments
        c.execute('''SELECT a.id, d.name as doctor_name, s.slot_time, a.status
                    FROM appointments a
                    JOIN slots s ON a.slot_id = s.id
                    JOIN doctors d ON s.doctor_id = d.id
                    WHERE a.member_id = ?
                    ORDER BY s.slot_time DESC LIMIT 10''',
                 (patient_id,))
        previous_appointments = [dict(row) for row in c.fetchall()]
        
        # Get patient's prescriptions
        try:
            c.execute('''SELECT prescription_date, medication, dosage, frequency, duration, 
                        instructions, notes, d.name as doctor_name
                        FROM prescriptions p
                        JOIN doctors d ON p.doctor_id = d.id
                        WHERE p.member_id = ?
                        ORDER BY p.prescription_date DESC LIMIT 10''',
                     (patient_id,))
            prescriptions = [dict(row) for row in c.fetchall()]
        except Exception as e:
            logger.error(f"Error fetching prescriptions: {e}")
            prescriptions = []
        
        conn.close()
        
        return jsonify({
            'success': True,
            'front_office': front_office,
            'patient': appointment_data,
            'medical_history': medical_history,
            'previous_appointments': previous_appointments,
            'prescriptions': prescriptions
        })
    
    except Exception as e:
        logger.error(f"Error in front_office_view_patient route: {e}")
        if conn:
            conn.rollback()
        return jsonify({'success': False, 'error': 'Failed to load patient details'}), 500



@app.route('/api/front_office_appointments', methods=['GET', 'POST'])
def api_front_office_appointments():
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()
        
        # Get front office details
        c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
        front_office = dict(c.fetchone() or {})
        
        if request.method == 'POST':
            data = request.get_json()
            member_id = data.get('member_id')
            doctor_id = data.get('doctor_id')
            slot_id = data.get('slot_id')
            
            if not member_id or not doctor_id or not slot_id:
                return jsonify({'success': False, 'error': 'member_id, doctor_id, and slot_id are required'}), 400
            
            # Verify slot is available
            c.execute('SELECT booked, doctor_id FROM slots WHERE id = ?', (slot_id,))
            slot = c.fetchone()
            
            if not slot:
                return jsonify({'success': False, 'error': 'Selected slot not found'}), 400
            
            if slot['booked'] == 1:
                return jsonify({'success': False, 'error': 'Selected slot is no longer available'}), 400
            
            if str(slot['doctor_id']) != str(doctor_id):
                return jsonify({'success': False, 'error': 'Selected slot does not belong to this doctor'}), 400
            
            # Book the appointment
            c.execute('UPDATE slots SET booked = 1 WHERE id = ?', (slot_id,))
            c.execute('INSERT INTO appointments (member_id, slot_id, status) VALUES (?, ?, "Scheduled")', (member_id, slot_id))
            conn.commit()
            
            return jsonify({'success': True, 'message': 'Appointment booked successfully'})
        
        # GET request - get all appointments
        c.execute('''SELECT a.id, m.first_name, m.last_name, d.name as doctor_name, 
                            s.slot_time, a.status
                    FROM appointments a 
                    JOIN slots s ON a.slot_id = s.id 
                    JOIN doctors d ON s.doctor_id = d.id 
                    JOIN members m ON a.member_id = m.id 
                    ORDER BY s.slot_time DESC''')
        
        appointments = [dict(row) for row in c.fetchall()]
        
        # Get members for dropdown
        c.execute('SELECT id, first_name, last_name FROM members ORDER BY first_name')
        members = [dict(row) for row in c.fetchall()]
        
        # Get doctors for dropdown
        c.execute('SELECT id, name FROM doctors ORDER BY name')
        doctors = [dict(row) for row in c.fetchall()]
        
        # Get available slots
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        c.execute('''SELECT s.id, s.slot_time, d.name as doctor_name, d.id as doctor_id
                    FROM slots s 
                    JOIN doctors d ON s.doctor_id = d.id 
                    WHERE s.slot_time > ? AND s.booked = 0
                    ORDER BY s.slot_time''', (current_time,))
        
        slots = [dict(row) for row in c.fetchall()]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'front_office': front_office,
            'appointments': appointments,
            'members': members,
            'doctors': doctors,
            'slots': slots
        })
        
    except Exception as e:
        logger.error(f"Error in front office appointments API: {e}")
        return jsonify({'success': False, 'error': 'Failed to process request'}), 500


@app.route('/api/front_office_patient', methods=['GET'])
def api_front_office_patients():
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()
        
        # Get front office details
        c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
        front_office = dict(c.fetchone() or {})
        
        # Get all patients
        c.execute('''SELECT m.*, f.id as family_id, 
                    (SELECT COUNT(*) FROM appointments a WHERE a.member_id = m.id) as appointment_count,
                    (SELECT COUNT(*) FROM medical_records mr WHERE mr.member_id = m.id) as record_count
                    FROM members m
                    JOIN families f ON m.family_id = f.id
                    ORDER BY m.first_name''')
        
        patients = [dict(row) for row in c.fetchall()]
        conn.close()
        print(patients)
        return jsonify({
            'success': True,
            'front_office': front_office,
            'patients': patients
        })
        
    except Exception as e:
        logger.error(f"Error in front office patients API: {e}")
        return jsonify({'success': False, 'error': 'Failed to load patients'}), 500
@app.route('/api/front_office_payments', methods=['GET'])
def api_front_office_payments():
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        uid = session['family_id']
        print("Session:", session)
        conn = get_db()
        c = conn.cursor()
        
        # Get front office details
        c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
        front_office = dict(c.fetchone() or {})
        
        # Get all bills with member details
        c.execute('''SELECT b.*, m.first_name, m.last_name
                    FROM bills b
                    LEFT JOIN members m ON b.member_id = m.id
                    ORDER BY b.bill_date DESC''')
        bills_raw = c.fetchall()
        print("Raw bills data:", bills_raw)
        bills = [dict(row) for row in bills_raw]
        print("Bills fetched:", bills)
        
        # Get all members (no family_id filter)
        c.execute('SELECT m.* FROM members m')
        members_raw = c.fetchall()
        print("Raw members data:", members_raw)
        members = [dict(row) for row in members_raw]
        print("Members fetched:", members)
        
        conn.close()
        
        return jsonify({
            'success': True,
            'front_office': front_office,
            'bills': bills,
            'members': members
        })
        
    except Exception as e:
        logger.error(f"Error in front office payments API: {e}")
        return jsonify({'success': False, 'error': 'Failed to load payments'}), 500

@app.route('/api/front_office_reports', methods=['GET'])
def api_front_office_reports():
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()
        
        # Get front office details
        c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
        front_office = dict(c.fetchone() or {})
        
        # Get report data
        from datetime import datetime, timedelta
        today = datetime.now().strftime('%Y-%m-%d')
        last_week = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        
        # Daily appointments
        c.execute('''SELECT COUNT(*) as count 
                    FROM appointments a 
                    JOIN slots s ON a.slot_id = s.id 
                    WHERE date(s.slot_time) = ?''', (today,))
        daily_appointments = c.fetchone()['count']
        
        # Weekly appointments
        c.execute('''SELECT COUNT(*) as count 
                    FROM appointments a 
                    JOIN slots s ON a.slot_id = s.id 
                    WHERE date(s.slot_time) BETWEEN ? AND ?''', (last_week, today))
        weekly_appointments = c.fetchone()['count']
        
        # Daily revenue
        c.execute('''SELECT COALESCE(SUM(amount), 0) as total 
                    FROM bills 
                    WHERE date(bill_date) = ? AND status = "Paid"''', (today,))
        daily_revenue = c.fetchone()['total'] or 0
        
        # Weekly revenue
        c.execute('''SELECT COALESCE(SUM(amount), 0) as total 
                    FROM bills 
                    WHERE date(bill_date) BETWEEN ? AND ? AND status = "Paid"''', (last_week, today))
        weekly_revenue = c.fetchone()['total'] or 0
        
        # New patients this week
        c.execute('''SELECT COUNT(*) as count 
                    FROM members 
                    WHERE date(created_date) BETWEEN ? AND ?''', (last_week, today))
        new_patients = c.fetchone()['count']
        
        # Top doctors by appointments
        c.execute('''SELECT d.name, COUNT(a.id) as appointment_count
                    FROM appointments a
                    JOIN slots s ON a.slot_id = s.id
                    JOIN doctors d ON s.doctor_id = d.id
                    WHERE date(s.slot_time) BETWEEN ? AND ?
                    GROUP BY d.id, d.name
                    ORDER BY appointment_count DESC
                    LIMIT 5''', (last_week, today))
        top_doctors = [dict(row) for row in c.fetchall()]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'front_office': front_office,
            'stats': {
                'daily_appointments': daily_appointments,
                'weekly_appointments': weekly_appointments,
                'daily_revenue': float(daily_revenue),
                'weekly_revenue': float(weekly_revenue),
                'new_patients': new_patients
            },
            'top_doctors': top_doctors,
            'report_period': {
                'start_date': last_week,
                'end_date': today
            }
        })
        
    except Exception as e:
        logger.error(f"Error in front office reports API: {e}")
        return jsonify({'success': False, 'error': 'Failed to load reports'}), 500
    
@app.route('/api/front_office/create_bill', methods=['POST'])
def api_create_bill():
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        member_id = data.get('member_id')
        amount = data.get('amount')
        description = data.get('description')
        
        if not member_id or not amount:
            return jsonify({'success': False, 'error': 'member_id and amount are required'}), 400
        
        conn = get_db()
        c = conn.cursor()
        
        # Create bill
        from datetime import datetime
        bill_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        c.execute('''INSERT INTO bills (member_id, amount, description, bill_date, status)
                    VALUES (?, ?, ?, ?, "Pending")''',
                  (member_id, amount, description, bill_date))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Bill created successfully'})
        
    except Exception as e:
        logger.error(f"Error creating bill: {e}")
        return jsonify({'success': False, 'error': 'Failed to create bill'}), 500
from datetime import datetime
import uuid
from datetime import datetime
import uuid
from datetime import datetime
import uuid

@app.route('/api/initiate_payment/<int:bill_id>', methods=['POST'])
def api_initiate_payment(bill_id):
    if 'family_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Check if bill exists and is pending
        c.execute('SELECT * FROM bills WHERE id = ? AND status = ?', (bill_id, 'Pending'))
        bill = c.fetchone()
        
        if not bill:
            return jsonify({'success': False, 'error': 'Bill not found or already paid'}), 404
        
        # Generate payment ID
        payment_id = str(uuid.uuid4())
        
        # In a real application, you would integrate with a payment gateway here
        # For demo purposes, we'll simulate payment initiation
        
        conn.close()
        
        return jsonify({
            'success': True,
            'payment_id': payment_id,
            'message': 'Payment initiated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error initiating payment: {e}")
        return jsonify({'success': False, 'error': 'Failed to initiate payment'}), 500

@app.route('/api/verify_payment/<payment_id>', methods=['POST'])
def api_verify_payment(payment_id):
    if 'family_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get the bill ID from request data
        data = request.get_json()
        bill_id = data.get('bill_id')
        
        if not bill_id:
            return jsonify({'success': False, 'error': 'Bill ID required'}), 400
        
        # For demo purposes, we'll simulate successful payment 90% of the time
        # In real application, verify with actual payment gateway
        import random
        payment_successful = random.random() < 0.9  # 90% success rate
        
        if payment_successful:
            # Update bill status to paid
            c.execute('UPDATE bills SET status = ?, payment_date = ? WHERE id = ?', 
                     ('Paid', datetime.now(), bill_id))
            
            conn.commit()
            conn.close()
            
            return jsonify({
                'success': True,
                'message': 'Payment verified and completed successfully'
            })
        else:
            # Simulate payment failure
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Payment failed. Please check your card details and try again.'
            })
        
    except Exception as e:
        logger.error(f"Error verifying payment: {e}")
        return jsonify({'success': False, 'error': 'Failed to verify payment'}), 500

@app.route('/api/pay_bill/<int:bill_id>', methods=['POST'])
def api_pay_bill(bill_id):
    if 'family_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Update bill status to paid
        c.execute('UPDATE bills SET status = ?, payment_date = ? WHERE id = ?', 
                 ('Paid', datetime.now(), bill_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Bill paid successfully'
        })
        
    except Exception as e:
        logger.error(f"Error paying bill: {e}")
        return jsonify({'success': False, 'error': 'Failed to pay bill'}), 500
# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = "admin_login"
# -------------------- Admin User Model --------------------
class AdminUser(UserMixin, db.Model):
    __tablename__ = 'admins'  # Use your existing admins table
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def check_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest() == self.password_hash

@login_manager.user_loader
def load_user(admin_id):
    return db.session.get(AdminUser, int(admin_id))

# -------------------- Flask-Admin Secure Views --------------------
# class SecureModelView(ModelView):
#     def is_accessible(self):
#         return current_user.is_authenticated

#     def inaccessible_callback(self, name, **kwargs):
#         return redirect(url_for('admin_login'))
# class SecureModelView(ModelView):
#     def is_accessible(self):
#         return True 

# Temporary fix - allow access and force data refresh
class SecureModelView(ModelView):
    def is_accessible(self):
        # Check if user has admin session from React login
        is_admin = session.get('user_type') == 'admin'
        print(f"🔐 Admin access check: user_type={session.get('user_type')}, is_accessible={is_admin}")
        return is_admin

    def inaccessible_callback(self, name, **kwargs):
        print("🚫 Access denied to Flask-Admin, redirecting to React login")
        # Redirect to React login page
        return redirect('http://localhost:3000/login?message=Please login as admin')

    # Force fresh data on every request
    def get_query(self):
        print("🔄 Fetching fresh data for Flask-Admin")
        return super().get_query()

    def get_count_query(self):
        print("🔄 Fetching fresh count for Flask-Admin")
        return super().get_count_query()






@app.route('/api/admin/check_session')
def check_admin_session():
    """Debug route to check admin session state"""
    return jsonify({
        'session_user_type': session.get('user_type'),
        'session_family_id': session.get('family_id'),
        'session_admin_id': session.get('admin_id'),
        'is_admin': session.get('user_type') == 'admin',
        'all_session_keys': list(session.keys())
    })
from flask_admin.contrib.sqla import ModelView
from flask import flash
from sqlalchemy.exc import IntegrityError
class DoctorAdminView(SecureModelView):
    def after_model_change(self, form, model, is_created):
        if is_created:
            # 1. Generate a family_id if missing
            if not model.family_id:
                model.family_id = generate_unique_id()

            # 2. Add family row via ORM
            new_family = Family(id=model.family_id, user_type=2)
            db.session.add(new_family)
            db.session.flush()   # ensures Doctor.id is available

            print(f"✅ Doctor created with ID={model.id}, Family={model.family_id}")

            # 3. Now generate slots
            generate_slots_for_doctor(model.id, days=30)



    # def after_model_change(self, form, model, is_created):
    #     if is_created:
    #         generate_slots_for_doctor(model.id, days=30)


# Reusable ModelView that links to families
from sqlalchemy import text

class FamilyLinkedModelView(SecureModelView):
    def __init__(self, model, session, **kwargs):
        self.user_type = kwargs.pop("user_type", None)  # 1=Patient, 2=Doctor, 3=FrontOffice
        super().__init__(model, session, **kwargs)

    def after_model_change(self, form, model, is_created):
        if is_created:
            print(f">>> New record created in {model.__tablename__}, user_type={self.user_type}")

            # 1. Generate a family_id if missing
            if not getattr(model, "family_id", None):
                if self.user_type == 2:
                    prefix = "DOC"
                elif self.user_type == 3:
                    prefix = "OFC"
                elif self.user_type == 1:
                    prefix = "PAT"
                else:
                    prefix = "USR"

                # Get last family_id with this prefix
                last_fam = db.session.execute(
                    text("SELECT id FROM families WHERE id LIKE :pfx ORDER BY id DESC LIMIT 1"),
                    {"pfx": f"{prefix}%"}
                ).fetchone()

                if last_fam:
                    num = int("".join(filter(str.isdigit, last_fam[0]))) + 1
                else:
                    num = 1

                model.family_id = f"{prefix}{str(num).zfill(3)}"
                print(">>> Generated family_id:", model.family_id)

                db.session.commit()

            # 2. Insert into families table
            new_family = Family(id=model.family_id, user_type=self.user_type)
            db.session.add(new_family)
            db.session.commit()
            print(f">>> Inserted into families: {model.family_id}, type={self.user_type}")

            # 3. If doctor → generate slots
            if self.user_type == 2:
                print(f">>> Generating slots for doctor {model.id}")
                generate_slots_for_doctor(model.id, days=30)




# -------------------- Attach Flask-Admin --------------------
# admin = Admin(app, name="Hospital Admin Panel", template_mode="bootstrap4")
# admin = Admin(
#     app,
#     name="Hospital Admin Panel",
#     template_mode="bootstrap4"   # use default master.html
# )
from flask_admin import helpers as admin_helpers

admin = Admin(app, name='Hospital Admin Panel', template_mode='bootstrap3')




@app.context_processor
def override_admin_css():
    return dict(
        admin_base_template='admin/master.html',
        admin_view=admin.index_view,
        h=admin_helpers,
        get_url=url_for,
        config=app.config
    )

@app.after_request
def add_header(response):
    # Add custom CSS
    if response.content_type.startswith('text/html'):
        if b"</head>" in response.data:
            response.data = response.data.replace(
                b"</head>",
                b'<link rel="stylesheet" href="/static/custom_admin.css"></head>'
            )
    return response

# Add database models (tables) for management
# NOTE: These mirror your existing SQLite tables
# Define models for Flask-Admin (mirrors your existing tables)
# ----------------- SQLAlchemy Models for Admin -----------------

# ----------------- SQLAlchemy Models -----------------

class Doctor(db.Model):
    __tablename__ = "doctors"
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String, nullable=True)   # optional
    name = db.Column(db.String, nullable=False)
    specialty = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=False)


class Member(db.Model):
    __tablename__ = "members"
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String, nullable=True)
    first_name = db.Column(db.String, nullable=False)
    middle_name = db.Column(db.String, nullable=True)
    last_name = db.Column(db.String, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    aadhar = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    prev_problem = db.Column(db.String, nullable=False)
    curr_problem = db.Column(db.String, nullable=False)
    created_date = db.Column(db.String, nullable=True, default="CURRENT_TIMESTAMP")


class FrontOffice(db.Model):
    __tablename__ = "front_office"
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String, nullable=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=False)


class Appointment(db.Model):
    __tablename__ = "appointments"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, nullable=True)
    slot_id = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String, default="Scheduled")


class Slot(db.Model):
    __tablename__ = "slots"
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, nullable=True)
    slot_time = db.Column(db.String, nullable=False)
    booked = db.Column(db.Integer, default=0)



class MedicalRecord(db.Model):
    __tablename__ = "medical_records"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, nullable=True)
    record_type = db.Column(db.String, nullable=False)
    record_date = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    file_path = db.Column(db.String, nullable=True)
    uploaded_date = db.Column(db.String, default="CURRENT_TIMESTAMP")


class Prescription(db.Model):
    __tablename__ = "prescriptions"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, nullable=True)
    doctor_id = db.Column(db.Integer, nullable=True)
    prescription_date = db.Column(db.String, nullable=False)
    medication = db.Column(db.String, nullable=False)
    dosage = db.Column(db.String, nullable=True)
    instructions = db.Column(db.String, nullable=True)
    created_date = db.Column(db.String, default="CURRENT_TIMESTAMP")
    frequency = db.Column(db.String, default="")
    duration = db.Column(db.String, default="")
    notes = db.Column(db.String, default="")


class Bill(db.Model):
    __tablename__ = "bills"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, nullable=True)
    bill_date = db.Column(db.String, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String, default="Pending")
    description = db.Column(db.String, nullable=True)
    created_date = db.Column(db.String, default="CURRENT_TIMESTAMP")


class Checkin(db.Model):
    __tablename__ = "checkins"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, nullable=True)
    checkin_time = db.Column(db.String, nullable=False)
    checkout_time = db.Column(db.String, nullable=True)
    status = db.Column(db.String, default="Checked In")
    created_date = db.Column(db.String, default="CURRENT_TIMESTAMP")


class UserType(db.Model):
    __tablename__ = "user_types"
    id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String, nullable=False)


class Family(db.Model):
    __tablename__ = "families"
    id = db.Column(db.String, primary_key=True)
    user_type = db.Column(db.Integer, nullable=False, default=1)


# class AdminUser(db.Model):
#     __tablename__ = "admins"
#     id = db.Column(db.Integer, primary_key=True)
#     family_id = db.Column(db.String, nullable=True)
#     username = db.Column(db.String, nullable=False)
#     password_hash = db.Column(db.String, nullable=False)
#     first_name = db.Column(db.String, nullable=False)
#     last_name = db.Column(db.String, nullable=False)
#     email = db.Column(db.String, nullable=False)
#     created_date = db.Column(db.String, default="CURRENT_TIMESTAMP")


# class AdminUser(db.Model):
#     __tablename__ = "admins"
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String)
#     password_hash = db.Column(db.String)

# create Admin after db
# admin = Admin(app, name="Hospital Admin", template_mode="bootstrap4")
class DoctorAdminView(SecureModelView):
    def on_model_change(self, form, model, is_created):
        if is_created:
            if not model.family_id:
                model.family_id = generate_unique_id()
            
            # Insert into families via ORM
            new_family = Family(id=model.family_id, user_type=2)
            db.session.add(new_family)
            db.session.flush()   # ensures doctor.id is available

            # Now generate slots
            generate_slots_for_doctor(model.id, days=30)




class StaffAdminView(SecureModelView):
    def on_model_change(self, form, model, is_created):
        if is_created:
            conn = get_db()
            c = conn.cursor()
            c.execute('SELECT id FROM user_types WHERE type_name = "front_office"')
            user_type_id = c.fetchone()['id']

            if not model.family_id:
                model.family_id = generate_unique_id()

            c.execute('INSERT OR IGNORE INTO families (id, user_type) VALUES (?, ?)',
                     (model.family_id, user_type_id))
            conn.commit()
            conn.close()



# Custom view for Members with access control and refresh
class MemberAdminView(ModelView):
    column_list = ('id', 'family_id', 'first_name', 'middle_name', 'last_name', 'age', 'gender', 'phone', 'email', 'aadhar', 'address')
    column_searchable_list = ('first_name', 'last_name', 'email')
    column_filters = ('family_id', 'gender')

    def is_accessible(self):
        return session.get('user_type') == 'admin'

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))  # Adjust to your login route

    def get_query(self):
    # Return the base query without load_only optimization
        return super(MemberAdminView, self).get_query()

# def after_model_change(self, model, is_created):
#     db.session.expire_all()  # Refresh session after changes
# register models
# admin.add_view(SecureModelView(Member, db.session, name="Members"))
# admin.add_view(SecureModelView(Doctor, db.session, name="Doctors"))
# admin.add_view(SecureModelView(FrontOffice, db.session, name="Front Office"))
admin.add_view(SecureModelView(Appointment, db.session, name="Appointments"))
admin.add_view(SecureModelView(Slot, db.session, name="Slots"))
admin.add_view(SecureModelView(MedicalRecord, db.session, name="Medical Records"))
admin.add_view(SecureModelView(Prescription, db.session, name="Prescriptions"))
admin.add_view(SecureModelView(Bill, db.session, name="Bills"))
admin.add_view(SecureModelView(Checkin, db.session, name="Check-ins"))
admin.add_view(SecureModelView(UserType, db.session, name="User Types"))
admin.add_view(SecureModelView(Family, db.session, name="Families"))
admin.add_view(SecureModelView(AdminUser, db.session, name="Admin Users"))
admin.add_view(DoctorAdminView(Doctor, db.session, name="Doctors"))
admin.add_view(StaffAdminView(FrontOffice, db.session, name="Front Office"))
admin.add_view(MemberAdminView(Member, db.session, name="Members"))

@app.after_request
def add_header(response):
    """Disable caching for Flask-Admin pages"""
    if '/admin/' in request.path:
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response


# admin.add_view(FamilyLinkedModelView(Member, db.session, name="Members", endpoint="members_admin"))
# admin.add_view(FamilyLinkedModelView(Doctor, db.session, name="Doctors", endpoint="doctors_admin"))
# admin.add_view(FamilyLinkedModelView(FrontOffice, db.session, name="Front Office", endpoint="frontoffice_admin"))

# Doctors → user_type = 2
# replace Members, Doctors, FrontOffice with FamilyLinkedModelView
# admin.add_view(FamilyLinkedModelView(Member, db.session, 
#                                      name="Members", 
#                                      endpoint="members_admin", 
#                                      ))

# admin.add_view(FamilyLinkedModelView(Doctor, db.session, 
#                                      name="Doctors", 
#                                      endpoint="doctors_admin", 
#                                    ))

# admin.add_view(FamilyLinkedModelView(FrontOffice, db.session, 
#                                      name="Front Office", 
#                                      endpoint="frontoffice_admin", 
# ))
print("Admin views registered:", admin._views)

# -------------------- Admin Login Routes --------------------
@app.route("/adminpanel/login", methods=["GET", "POST"])
def admin_login_panel():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        user = AdminUser.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect("/admin")  # Flask-Admin dashboard
        else:
            return render_template("admin/admin_login.html", error="Invalid credentials")
    return render_template("admin/admin_login.html")

@app.route("/adminpanel/logout")
@login_required
def admin_logout_panel():
    logout_user()
    return redirect(url_for("admin_login_panel"))

# Add this to your update_database_schema() function
def update_database_schema():
    """Update existing database with new schema changes"""
    try:
        conn = get_db()
        c = conn.cursor()
    
        
        # Check if prescriptions table has frequency column
        c.execute("PRAGMA table_info(prescriptions)")
        columns = [column['name'] for column in c.fetchall()]
        
        if 'frequency' not in columns:
            logger.info("Adding frequency column to prescriptions table...")
            c.execute('ALTER TABLE prescriptions ADD COLUMN frequency TEXT DEFAULT ""')
        
        if 'duration' not in columns:
            logger.info("Adding duration column to prescriptions table...")
            c.execute('ALTER TABLE prescriptions ADD COLUMN duration TEXT DEFAULT ""')
            
        if 'notes' not in columns:
            logger.info("Adding notes column to prescriptions table...")
            c.execute('ALTER TABLE prescriptions ADD COLUMN notes TEXT DEFAULT ""')
        
        conn.commit()
        conn.close()
        logger.info("Database schema updated successfully.")
        
    except Exception as e:
        logger.error(f"Database schema update error: {e}")
        # Check if appointments table has status column
        c.execute("PRAGMA table_info(appointments)")
        columns = [column['name'] for column in c.fetchall()]
        
        if 'status' not in columns:
            logger.info("Adding status column to appointments table...")
            c.execute('ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT "Scheduled"')
        
        # Check if slots table has booked column
        c.execute("PRAGMA table_info(slots)")
        columns = [column['name'] for column in c.fetchall()]
        
        if 'booked' not in columns:
            logger.info("Adding booked column to slots table...")
            c.execute('ALTER TABLE slots ADD COLUMN booked INTEGER DEFAULT 0')
        
        conn.commit()
        conn.close()
        logger.info("Database schema updated successfully.")
        
    except Exception as e:
        logger.error(f"Database schema update error: {e}")
# from sqlalchemy import event
# from sqlalchemy.orm import Session

# @event.listens_for(db.session, 'after_commit')
# def refresh_session(session):
#     session.expire_all()  # Expire all objects to force reload on next access
# # Create upload directory if it doesn't exist
# if not os.path.exists(app.config['UPLOAD_FOLDER']):
#     os.makedirs(app.config['UPLOAD_FOLDER'])
def get_db():
    try:
        conn = sqlite3.connect(DATABASE)
        conn.row_factory = sqlite3.Row  # For dict-like rows
        
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection error: {e}")
        raise

def check_table_exists(cursor, table_name):
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        return cursor.fetchone() is not None
    except sqlite3.Error as e:
        logger.error(f"Error checking table {table_name}: {e}")
        return False

# @app.route('/api/admin_dashboard' , methods=['GET'])
# def admin_dashboard():
#     conn = get_db()
#     c = conn.cursor()
#     data = {
#         'total_patients': c.execute('SELECT COUNT(*) FROM members').fetchone()[0],
#         'total_doctors': c.execute('SELECT COUNT(*) FROM doctors').fetchone()[0],
#         'today_appointments': c.execute('SELECT COUNT(*) FROM appointments WHERE date = DATE("now")').fetchone()[0],
#         'total_revenue': c.execute('SELECT SUM(amount) FROM bills').fetchone()[0] or 0,
#         'weekly_appointments': [
#             {'day': row['day'], 'count': row['count']}
#             for row in c.execute('SELECT strftime("%w", date) as day, COUNT(*) as count FROM appointments GROUP BY day')
#         ],
#     }
#     return jsonify(data)

# @app.route('/api/admin/members', methods=['GET'])
# def admin_members():
#     if session.get('user_type') != 'admin':
#         return jsonify({'error': 'Unauthorized'}), 401
#     members = Member.query.all()
#     return jsonify({'success': True, 'members': [m.__dict__ for m in members]})
def init_db():
    try:
        conn = get_db()
        c = conn.cursor()
        # Ensure user_types table exists and contains all required types
        
        # List of required tables
        required_tables = ['user_types', 'families', 'members', 'doctors', 'slots', 'appointments', 'front_office', 'medical_records', 'prescriptions', 'bills', 'checkins','admins']

        # Check if all required tables exist
        tables_exist = all(check_table_exists(c, table) for table in required_tables)

        if not tables_exist:
            logger.info("Initializing database schema...")
            
            # Drop existing tables if they exist (for clean setup)
            c.execute('DROP TABLE IF EXISTS appointments')
            c.execute('DROP TABLE IF EXISTS slots')
            c.execute('DROP TABLE IF EXISTS members')
            c.execute('DROP TABLE IF EXISTS doctors')
            c.execute('DROP TABLE IF EXISTS front_office')
            c.execute('DROP TABLE IF EXISTS families')
            c.execute('DROP TABLE IF EXISTS user_types')
            c.execute('DROP TABLE IF EXISTS medical_records')
            c.execute('DROP TABLE IF EXISTS prescriptions')
            c.execute('DROP TABLE IF EXISTS bills')
            c.execute('DROP TABLE IF EXISTS checkins')
            c.execute('DROP TABLE IF EXISTS admins')
            # Create user_types table
            c.execute('''CREATE TABLE IF NOT EXISTS user_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type_name TEXT NOT NULL UNIQUE
            )''')
            
            # Insert user types
            user_types = [('patient',), ('doctor',), ('front_office',)]
            c.executemany('INSERT OR IGNORE INTO user_types (type_name) VALUES (?)', user_types)
            
            # Create families table with user_type
            c.execute('''CREATE TABLE IF NOT EXISTS families (
                id TEXT PRIMARY KEY,
                user_type INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY(user_type) REFERENCES user_types(id)
            )''')
            
            # Create front_office table
            c.execute('''CREATE TABLE IF NOT EXISTS front_office (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                family_id TEXT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                FOREIGN KEY(family_id) REFERENCES families(id)
            )''')
            
            # Create doctors table with login credentials
            c.execute('''CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                family_id TEXT,
                name TEXT NOT NULL,
                specialty TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                FOREIGN KEY(family_id) REFERENCES families(id)
            )''')
            
            # Create members table (for patients)
            c.execute('''CREATE TABLE IF NOT EXISTS members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                family_id TEXT,
                first_name TEXT NOT NULL,
                middle_name TEXT,
                last_name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                aadhar TEXT NOT NULL,
                address TEXT NOT NULL,
                prev_problem TEXT NOT NULL,
                curr_problem TEXT NOT NULL,
                created_date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(family_id) REFERENCES families(id)
            )''')
            
            # Create slots table
            c.execute('''CREATE TABLE IF NOT EXISTS slots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doctor_id INTEGER,
                slot_time TEXT NOT NULL,
                booked INTEGER DEFAULT 0,
                FOREIGN KEY(doctor_id) REFERENCES doctors(id)
            )''')
            
            # Create appointments table
            c.execute('''CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                member_id INTEGER,
                slot_id INTEGER,
                FOREIGN KEY(member_id) REFERENCES members(id),
                FOREIGN KEY(slot_id) REFERENCES slots(id)
            )''')
            # Modify the CREATE TABLE statement in your database initialization code
# (assuming this is in your Flask app's init_db or similar function)
            c.execute('''CREATE TABLE IF NOT EXISTS medical_records (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        member_id INTEGER,
                        record_type TEXT NOT NULL,
                        record_date TEXT NOT NULL,
                        description TEXT,
                        file_name TEXT,
                        file_mimetype TEXT,
                        file_data BLOB,
                        uploaded_date TEXT DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(member_id) REFERENCES family_members(id)
                    )''')
            # Medical Records table
            # c.execute('''CREATE TABLE IF NOT EXISTS medical_records (
            #     id INTEGER PRIMARY KEY AUTOINCREMENT,
            #     member_id INTEGER,
            #     record_type TEXT NOT NULL,
            #     record_date TEXT NOT NULL,
            #     description TEXT,
            #     file_path TEXT,
            #     uploaded_date TEXT DEFAULT CURRENT_TIMESTAMP,
            #     FOREIGN KEY(member_id) REFERENCES members(id)
            # )''')
            
            # Prescriptions table
            # c.execute('''CREATE TABLE IF NOT EXISTS prescriptions (
            #     id INTEGER PRIMARY KEY AUTOINCREMENT,
            #     member_id INTEGER,
            #     doctor_id INTEGER,
            #     prescription_date TEXT NOT NULL,
            #     medication TEXT NOT NULL,
            #     dosage TEXT,
            #     instructions TEXT,
            #     created_date TEXT DEFAULT CURRENT_TIMESTAMP,
            #     FOREIGN KEY(member_id) REFERENCES members(id),
            #     FOREIGN KEY(doctor_id) REFERENCES doctors(id)
            # )''')
            c.execute('''CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            doctor_id INTEGER,
            appointment_id INTEGER,
            prescription_date TEXT NOT NULL,
            medication TEXT NOT NULL,
            dosage TEXT NOT NULL,
            frequency TEXT,
            duration TEXT,
            instructions TEXT,
            notes TEXT,
            created_date TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(member_id) REFERENCES members(id),
            FOREIGN KEY(doctor_id) REFERENCES doctors(id),
            FOREIGN KEY(appointment_id) REFERENCES appointments(id)
        )''')
            # Bills table
            c.execute('''CREATE TABLE IF NOT EXISTS bills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                member_id INTEGER,
                bill_date TEXT NOT NULL,
                amount REAL NOT NULL,
                status TEXT DEFAULT 'Pending',
                description TEXT,
                created_date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(member_id) REFERENCES members(id)
            )''')
            
            # Check-ins table
            c.execute('''CREATE TABLE IF NOT EXISTS checkins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                member_id INTEGER,
                checkin_time TEXT NOT NULL,
                checkout_time TEXT,
                status TEXT DEFAULT 'Checked In',
                created_date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(member_id) REFERENCES members(id)
            )''')
            c.execute('''CREATE TABLE IF NOT EXISTS user_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_name TEXT NOT NULL UNIQUE
            )''')
            user_types = [('patient',), ('doctor',), ('front_office',), ('admin',)]
            c.executemany('INSERT OR IGNORE INTO user_types (type_name) VALUES (?)', user_types)

            # Now safely query for admin type id
            c.execute('SELECT id FROM user_types WHERE type_name = "admin"')
            admin_row = c.fetchone()
            if admin_row:
                admin_type_id = admin_row['id']
                c.execute('INSERT OR IGNORE INTO families (id, user_type) VALUES (?, ?)', ('ADMIN001', admin_type_id))

            # Create admin table
            c.execute('''CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                family_id TEXT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                created_date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(family_id) REFERENCES families(id)
            )''')

            import hashlib
            password_hash = hashlib.sha256('admin123'.encode()).hexdigest()
            print(password_hash)
            c.execute('INSERT OR IGNORE INTO admins (family_id, username, password_hash, first_name, last_name, email) VALUES (?, ?, ?, ?, ?, ?)',
                    ('ADMIN001', 'admin', password_hash, 'System', 'Administrator', 'admin@familycareconnect.com'))
            
            # Insert sample doctors with their own family IDs
            doctors = [
                ('DOC001', 'Dr. Alice Smith', 'General Medicine', 'alice.smith@hospital.com', '1234567890'),
                ('DOC002', 'Dr. Bob Jones', 'Cardiology', 'bob.jones@hospital.com', '1234567891'),
                ('DOC003', 'Dr. Carol Brown', 'Pediatrics', 'carol.brown@hospital.com', '1234567892')
            ]
            
            # Insert front office staff with their family IDs
            front_office_staff = [
                ('OFC111', 'Radha', 'Kumar', 'radha.kumar@hospital.com', '9876543210'),
                ('OFC112', 'Mary', 'Thomas', 'mary.thomas@hospital.com', '9876543211'),
                ('OFC113', 'Priya', 'Sharma', 'priya.sharma@hospital.com', '9876543212')
            ]
            
            # First insert the doctor families
            for doctor_id, name, specialty, email, phone in doctors:
                c.execute('SELECT id FROM user_types WHERE type_name = "doctor"')
                doctor_type_id = c.fetchone()['id']
                c.execute('INSERT INTO families (id, user_type) VALUES (?, ?)', (doctor_id, doctor_type_id))
            
            # Insert the front office families
            for office_id, first_name, last_name, email, phone in front_office_staff:
                c.execute('SELECT id FROM user_types WHERE type_name = "front_office"')
                front_office_type_id = c.fetchone()['id']
                c.execute('INSERT INTO families (id, user_type) VALUES (?, ?)', (office_id, front_office_type_id))
            
            # Then insert the doctor records
            c.executemany('INSERT INTO doctors (family_id, name, specialty, email, phone) VALUES (?, ?, ?, ?, ?)', doctors)
            
            # Insert the front office records
            c.executemany('INSERT INTO front_office (family_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)', 
                          [(id, first, last, email, phone) for id, first, last, email, phone in front_office_staff])

            # Generate slots for the next 60 days
            from datetime import datetime, timedelta
            slots = []
            start_date = datetime.now().replace(year=2025, month=8, day=21)  # Starting from August 21, 2025
            
            for i in range(60):  # Generate for 60 days
                current_date = start_date + timedelta(days=i)
                day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
                
                # Determine time slots based on weekday/weekend
                if day_of_week < 5:  # Weekday (Monday to Friday)
                    # 10am to 1pm (before lunch)
                    for hour in range(10, 13):
                        for minute in [0, 30]:
                            slot_time = current_date.strftime('%Y-%m-%d') + f' {hour:02d}:{minute:02d}:00'
                            slots.append((1, slot_time))  # Doctor 1
                            slots.append((2, slot_time))  # Doctor 2
                            slots.append((3, slot_time))  # Doctor 3
                    
                    # 2pm to 6pm (after lunch)
                    for hour in range(14, 18):
                        for minute in [0, 30]:
                            slot_time = current_date.strftime('%Y-%m-%d') + f' {hour:02d}:{minute:02d}:00'
                            slots.append((1, slot_time))  # Doctor 1
                            slots.append((2, slot_time))  # Doctor 2
                            slots.append((3, slot_time))  # Doctor 3
                else:  # Weekend (Saturday and Sunday)
                    # 10am to 1pm only
                    for hour in range(10, 13):
                        for minute in [0, 30]:
                            slot_time = current_date.strftime('%Y-%m-%d') + f' {hour:02d}:{minute:02d}:00'
                            slots.append((1, slot_time))  # Doctor 1
                            slots.append((2, slot_time))  # Doctor 2
                            slots.append((3, slot_time))  # Doctor 3
            
            # Insert all slots
            c.executemany('INSERT OR IGNORE INTO slots (doctor_id, slot_time) VALUES (?, ?)', slots)

            conn.commit()
            logger.info("Database schema initialized successfully.")
        else:
            logger.info("Database schema already exists.")
        conn.close()
    except sqlite3.Error as e:
        logger.error(f"Database initialization error: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {e}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()


@app.route('/admin/debug')
def admin_debug():
    """Debug route to check admin user creation"""
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Check if admin table exists
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'")
        admin_table_exists = c.fetchone() is not None
        
        # Check if admin user exists
        c.execute('SELECT * FROM admins WHERE username = "admin"')
        admin_user = c.fetchone()
        
        # Check password hash for 'admin123'
        password_hash = hashlib.sha256('admin123'.encode()).hexdigest()
        
        conn.close()
        
        return jsonify({
            'admin_table_exists': admin_table_exists,
            'admin_user': dict(admin_user) if admin_user else None,
            'expected_password_hash': password_hash,
            'stored_password_hash': admin_user['password_hash'] if admin_user else None,
            'password_match': admin_user and admin_user['password_hash'] == password_hash
        })
        
    except Exception as e:
        return jsonify({'error': str(e)})

def generate_unique_id():
    conn = get_db()
    c = conn.cursor()
    try:
        while True:
            uid = str(random.randint(100000000000, 999999999999))
            c.execute('SELECT id FROM families WHERE id = ?', (uid,))
            if not c.fetchone():
                return uid
    except sqlite3.Error as e:
        logger.error(f"Error generating unique ID: {e}")
        raise
    finally:
        conn.close()

# Initialize database when the app starts
with app.app_context():
    db.create_all()
    init_db()
    update_database_schema()
app.run(debug=True)
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        try:
            conn = get_db()
            c = conn.cursor()
            
            # Check admin credentials
            c.execute('SELECT * FROM admins WHERE username = ?', (username,))
            admin = c.fetchone()
            
            if admin:
                # Verify password using the same hashing method
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                if password_hash == admin['password_hash']:
                    session['admin_id'] = admin['id']
                    session['family_id'] = admin['family_id']
                    session['user_type'] = 'admin'
                    session['admin_name'] = f"{admin['first_name']} {admin['last_name']}"
                    
                    conn.close()
                    return redirect('/admin/')
            
            conn.close()
            return render_template('admin/admin_login.html', error='Invalid credentials')
                
        except Exception as e:
            logger.error(f"Admin login error: {e}")
            return render_template('admin/admin_login.html', error='Login failed')
    
    return render_template('admin/admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_id', None)
    session.pop('family_id', None)
    session.pop('user_type', None)
    session.pop('admin_name', None)
    return redirect('/admin/login')

@app.route('/admin/debug/members')
def admin_debug_members():
    if session.get('user_type') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get all members directly from database
        c.execute('SELECT * FROM members')
        members = [dict(row) for row in c.fetchall()]
        
        # Get count
        c.execute('SELECT COUNT(*) as count FROM members')
        count = c.fetchone()['count']
        
        conn.close()
        
        return jsonify({
            'total_members': count,
            'members': members,
            'source': 'Direct database query'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/dashboard')
def admin_dashboard():
    # if 'user_type' not in session or session.get('user_type') != 'admin':
    #     return redirect('/admin/login')
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get statistics
        c.execute('SELECT COUNT(*) as count FROM members')
        total_patients = c.fetchone()['count']
        
        c.execute('SELECT COUNT(*) as count FROM doctors')
        total_doctors = c.fetchone()['count']
        
        c.execute('SELECT COUNT(*) as count FROM front_office')
        total_staff = c.fetchone()['count']
        
        c.execute('SELECT COUNT(*) as count FROM appointments')
        total_appointments = c.fetchone()['count']
        
        # Get recent activities
        c.execute('''
            SELECT 'patient' as type, first_name, last_name, created_date as date 
            FROM members 
            ORDER BY created_date DESC LIMIT 5
        ''')
        recent_patients = c.fetchall()
        
        c.execute('''
            SELECT 'appointment' as type, m.first_name, m.last_name, s.slot_time as date
            FROM appointments a
            JOIN members m ON a.member_id = m.id
            JOIN slots s ON a.slot_id = s.id
            ORDER BY s.slot_time DESC LIMIT 5
        ''')
        recent_appointments = c.fetchall()
        
        conn.close()
        
        return render_template('admin/admin_dashboard.html', 
                              total_patients=total_patients,
                              total_doctors=total_doctors,
                              total_staff=total_staff,
                              total_appointments=total_appointments,
                              recent_activities=recent_patients + recent_appointments)
    
    except Exception as e:
        logger.error(f"Admin dashboard error: {e}")
        return render_template('admin/admin_dashboard.html', error='Failed to load dashboard')


# Patient Management
@app.route('/admin/patients')
def admin_patients():
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return redirect('/admin/login')
    
    try:

        conn = get_db()
        c = conn.cursor()
        
        c.execute('''
            SELECT m.*, f.id as family_id 
            FROM members m 
            JOIN families f ON m.family_id = f.id
            ORDER BY m.created_date DESC
        ''')
        patients = c.fetchall()
        
        conn.close()
        return render_template('admin/admin_patients.html', patients=patients)
    
    except Exception as e:
        logger.error(f"Admin patients error: {e}")
        return render_template('admin/admin_patients.html', error='Failed to load patients')




@app.route('/admin/patient/delete/<int:patient_id>', methods=['POST'])
def admin_delete_patient(patient_id):
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Delete patient and related records
        c.execute('DELETE FROM appointments WHERE member_id = ?', (patient_id,))
        c.execute('DELETE FROM medical_records WHERE member_id = ?', (patient_id,))
        c.execute('DELETE FROM prescriptions WHERE member_id = ?', (patient_id,))
        c.execute('DELETE FROM bills WHERE member_id = ?', (patient_id,))
        c.execute('DELETE FROM members WHERE id = ?', (patient_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    
    except Exception as e:
        logger.error(f"Admin delete patient error: {e}")
        return jsonify({'success': False, 'error': str(e)})

# Doctor Management
@app.route('/admin/doctors')
def admin_doctors():
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return redirect('/admin/login')
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        c.execute('SELECT * FROM doctors ORDER BY name')
        doctors = c.fetchall()
        
        conn.close()
        return render_template('admin/admin_doctors.html', doctors=doctors)
    
    except Exception as e:
        logger.error(f"Admin doctors error: {e}")
        return render_template('admin/admin_doctors.html', error='Failed to load doctors')
    
@app.route('/admin/doctor/add', methods=['GET', 'POST'])
def admin_add_doctor():
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return redirect('/admin/login')
    
    if request.method == 'POST':
        try:
            name = request.form['name']
            specialty = request.form['specialty']
            email = request.form['email']
            phone = request.form['phone']
            
            # Generate unique doctor ID
            doctor_id = generate_unique_id()
            
            conn = get_db()
            c = conn.cursor()
            
            # Get doctor user_type_id
            c.execute('SELECT id FROM user_types WHERE type_name = "doctor"')
            user_type_id = c.fetchone()['id']
            
            # Insert into families table
            c.execute('INSERT INTO families (id, user_type) VALUES (?, ?)', (doctor_id, user_type_id))
            
            # Insert into doctors table
            c.execute('INSERT INTO doctors (family_id, name, specialty, email, phone) VALUES (?, ?, ?, ?, ?)',
                     (doctor_id, name, specialty, email, phone))
            
            # Get the auto-incremented doctor primary key
            new_doctor_id = c.lastrowid
            conn.commit()
            conn.close()

            # ✅ Generate slots for this doctor (30 days by default)
            generate_slots_for_doctor(new_doctor_id, days=30)

            return redirect('/admin/doctors?success=Doctor added successfully')
            
        except Exception as e:
            logger.error(f"Admin add doctor error: {e}")
            return render_template('admin/admin_add_doctor.html', error=f"Failed to add doctor: {str(e)}")
    
    return render_template('admin/admin_add_doctor.html')



# Front Office Staff Management
@app.route('/admin/staff')
def admin_staff():
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return redirect('/admin/login')
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        c.execute('SELECT * FROM front_office ORDER BY first_name, last_name')
        staff = c.fetchall()
        
        conn.close()
        return render_template('admin/admin_staff.html', staff=staff)
    
    except Exception as e:
        logger.error(f"Admin staff error: {e}")
        return render_template('admin/admin_staff.html', error='Failed to load staff')

@app.route('/admin/staff/add', methods=['GET', 'POST'])
def admin_add_staff():
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return redirect('/admin/login')
    
    if request.method == 'POST':
        try:
            first_name = request.form['first_name']
            last_name = request.form['last_name']
            email = request.form['email']
            phone = request.form['phone']
            
            # Generate unique staff ID
            staff_id = generate_unique_id()
            
            conn = get_db()
            c = conn.cursor()
            
            # Get front_office user_type_id
            c.execute('SELECT id FROM user_types WHERE type_name = "front_office"')
            user_type_id = c.fetchone()['id']
            
            # Insert into families table
            c.execute('INSERT INTO families (id, user_type) VALUES (?, ?)', (staff_id, user_type_id))
            
            # Insert into front_office table
            c.execute('INSERT INTO front_office (family_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)',
                     (staff_id, first_name, last_name, email, phone))
            
            conn.commit()
            conn.close()
            
            return redirect('/admin/staff?success=Staff added successfully')
        
        except Exception as e:
            logger.error(f"Admin add staff error: {e}")
            return render_template('admin/admin_add_staff.html', error=f"Failed to add staff: {str(e)}")
    
    return render_template('admin/admin_add_staff.html')

@app.route('/admin/staff/delete/<int:staff_id>', methods=['POST'])
def admin_delete_staff(staff_id):
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get staff family_id
        c.execute('SELECT family_id FROM front_office WHERE id = ?', (staff_id,))
        staff = c.fetchone()
        
        if staff:
            # Delete staff and related records
            c.execute('DELETE FROM front_office WHERE id = ?', (staff_id,))
            c.execute('DELETE FROM families WHERE id = ?', (staff['family_id'],))
            
            conn.commit()
        
        conn.close()
        return jsonify({'success': True})
    
    except Exception as e:
        logger.error(f"Admin delete staff error: {e}")
        return jsonify({'success': False, 'error': str(e)})

# Appointment Management
@app.route('/admin/appointments')
def admin_appointments():
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return redirect('/admin/login')
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        c.execute('''
            SELECT a.id, m.first_name, m.last_name as patient_name, 
                   d.name as doctor_name, s.slot_time, a.status
            FROM appointments a
            JOIN members m ON a.member_id = m.id
            JOIN slots s ON a.slot_id = s.id
            JOIN doctors d ON s.doctor_id = d.id
            ORDER BY s.slot_time DESC
        ''')
        appointments = c.fetchall()
        
        conn.close()
        return render_template('admin/admin_appointments.html', appointments=appointments)
    
    except Exception as e:
        logger.error(f"Admin appointments error: {e}")
        return render_template('admin/admin_appointments.html', error='Failed to load appointments')

@app.route('/admin/appointment/delete/<int:appointment_id>', methods=['POST'])
def admin_delete_appointment(appointment_id):
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get slot_id from appointment
        c.execute('SELECT slot_id FROM appointments WHERE id = ?', (appointment_id,))
        appointment = c.fetchone()
        
        if appointment:
            # Free up the slot
            c.execute('UPDATE slots SET booked = 0 WHERE id = ?', (appointment['slot_id'],))
            
            # Delete the appointment
            c.execute('DELETE FROM appointments WHERE id = ?', (appointment_id,))
            
            conn.commit()
        
        conn.close()
        return jsonify({'success': True})
    
    except Exception as e:
        logger.error(f"Admin delete appointment error: {e}")
        return jsonify({'success': False, 'error': str(e)})




@app.route('/')
def home():
    return render_template('home.html')
# @app.route('/register', methods=['GET', 'POST'])
# def register():
#     # Only allow patient registration
#     if request.method == 'POST':
#         try:
#             # Patient-specific fields only
#             first_name = request.form['first_name']
#             last_name = request.form['last_name']
#             phone = request.form['phone']
#             email = request.form['email']
#             age = int(request.form.get('age', 0))
#             gender = request.form.get('gender', '')
#             aadhar = request.form.get('aadhar', '')
#             address = request.form.get('address', '')
#             prev_problem = request.form.get('prev_problem', '')
#             curr_problem = request.form.get('curr_problem', '')
            
#             # Check if email already exists
#             conn = get_db()
#             c = conn.cursor()
#             c.execute('SELECT * FROM members WHERE email = ?', (email,))
#             if c.fetchone():
#                 conn.close()
#                 return render_template('register.html', error='Email already exists. Please use a different email.')
            
#             # Generate unique ID and save
#             uid = generate_unique_id()
            
#             # Get patient user_type_id
#             c.execute('SELECT id FROM user_types WHERE type_name = "patient"')
#             user_type_id = c.fetchone()['id']
            
#             # Insert into families table with user_type
#             c.execute('INSERT INTO families (id, user_type) VALUES (?, ?)', (uid, user_type_id))
            
#             middle_name = request.form.get('middle_name', '')
#             c.execute('''INSERT INTO members (family_id, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem)
#                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
#                       (uid, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem))
            
#             conn.commit()
#             conn.close()

#             # Redirect to login page instead of dashboard
#             return redirect('/login?message=Registration successful. Your Family ID is: ' + uid)
#         except Exception as e:
#             logger.error(f"Error in register route: {e}")
#             return render_template('register.html', error=f"Registration failed: {str(e)}")
    
#     return render_template('register.html')
# @app.route('/add_family_member', methods=['GET', 'POST'])
# def add_family_member():
#     if 'family_id' not in session or session.get('user_type') != 'patient':
#         return redirect('/')
    
#     if request.method == 'POST':
#         try:
#             uid = session['family_id']
#             first_name = request.form['first_name']
#             middle_name = request.form.get('middle_name', '')
#             last_name = request.form['last_name']
#             age = int(request.form['age'])
#             gender = request.form['gender']
#             phone = request.form['phone']
#             email = request.form['email']
#             aadhar = request.form['aadhar']
#             address = request.form['address']
#             prev_problem = request.form['prev_problem']
#             curr_problem = request.form['curr_problem']

#             # Check if email already exists
#             conn = get_db()
#             c = conn.cursor()
#             c.execute('SELECT * FROM members WHERE email = ?', (email,))
#             if c.fetchone():
#                 conn.close()
#                 return render_template('add_family_member.html', error='Email already exists. Please use a different email.')
            
#             c.execute('''INSERT INTO members (family_id, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem)
#                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
#                       (uid, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem))
#             conn.commit()
#             conn.close()
#             return redirect('/patient_dashboard#family')
#         except Exception as e:
#             logger.error(f"Error in add_family_member route: {e}")
#             return render_template('add_member.html', error=f"Failed to add family member: {str(e)}")
    
#     return render_template('add_member.html')
# @app.route('/edit_family_member/<int:member_id>', methods=['GET', 'POST'])
# def edit_family_member(member_id):
#     if 'family_id' not in session or session.get('user_type') != 'patient':
#         return redirect('/')
    
#     try:
#         conn = get_db()
#         c = conn.cursor()
        
#         if request.method == 'POST':
#             first_name = request.form['first_name']
#             middle_name = request.form.get('middle_name', '')
#             last_name = request.form['last_name']
#             age = int(request.form['age'])
#             gender = request.form['gender']
#             phone = request.form['phone']
#             email = request.form['email']
#             aadhar = request.form['aadhar']
#             address = request.form['address']
#             prev_problem = request.form['prev_problem']
#             curr_problem = request.form['curr_problem']
            
#             # Check if email already exists for another member
#             c.execute('SELECT * FROM members WHERE email = ? AND id != ? AND family_id = ?', 
#                      (email, member_id, session['family_id']))
#             if c.fetchone():
#                 conn.close()
#                 return render_template('edit_family_member.html', error='Email already exists. Please use a different email.')
            
#             c.execute('''UPDATE members 
#                         SET first_name=?, middle_name=?, last_name=?, age=?, gender=?, phone=?, email=?, aadhar=?, address=?, prev_problem=?, curr_problem=?
#                         WHERE id=? AND family_id=?''',
#                       (first_name, middle_name, last_name, age, gender, phone, email, aadhar, address, prev_problem, curr_problem, member_id, session['family_id']))
#             conn.commit()
#             conn.close()
#             return redirect('/patient_dashboard#family?success=Family member updated successfully')
        
#         # GET request - load member data
#         c.execute('SELECT * FROM members WHERE id=? AND family_id=?', (member_id, session['family_id']))
#         member = c.fetchone()
#         conn.close()
        
#         if not member:
#             return redirect('/patient_dashboard#family?error=Family member not found')
            
#         return render_template('edit_family_member.html', member=member)
#     except Exception as e:
#         logger.error(f"Error in edit_family_member route: {e}")
#         return redirect('/patient_dashboard#family?error=Failed to edit family member')

# @app.route('/delete_family_member/<int:member_id>')
# def delete_family_member(member_id):
#     if 'family_id' not in session or session.get('user_type') != 'patient':
#         return redirect('/')
    
#     try:
#         conn = get_db()
#         c = conn.cursor()
#         c.execute('DELETE FROM members WHERE id=? AND family_id=?', (member_id, session['family_id']))
#         conn.commit()
#         conn.close()
#     except Exception as e: 
#         logger.error(f"Error in delete_family_member route: {e}")
    
#     return redirect('/patient_dashboard#family')

# @app.route('/book_appointment', methods=['GET', 'POST'])
# def book_appointment():
#     if 'family_id' not in session or session.get('user_type') != 'patient':
#         return redirect('/')

#     try:
#         conn = get_db()
#         c = conn.cursor()

#         # Fetch family members
#         c.execute("""SELECT id, first_name || ' ' || COALESCE(middle_name, '') || ' ' || last_name AS name 
#                      FROM members WHERE family_id = ?""", (session['family_id'],))
#         members = c.fetchall()

#         # Fetch doctors
#         c.execute("SELECT id, name, specialty FROM doctors")
#         doctors = c.fetchall()

#         # Check if this is a reschedule request
#         appointment_id = request.args.get('appointment_id')
#         member_id = request.args.get('member_id')
#         doctor_id = request.args.get('doctor_id')
#         date = request.args.get('date')
        
#         # Get current appointment details if rescheduling
#         current_appointment = None
#         if appointment_id:
#             c.execute('''SELECT a.id, a.member_id, a.slot_id, a.status, s.slot_time, s.doctor_id
#                         FROM appointments a 
#                         JOIN slots s ON a.slot_id = s.id 
#                         WHERE a.id = ?''', (appointment_id,))
#             current_appointment = c.fetchone()

#         if request.method == 'POST':
#             member_id = request.form['member_id']
#             doctor_id = request.form['doctor_id']
#             date = request.form['date']
#             slot_id = request.form['slot_id']
#             appointment_id = request.form.get('appointment_id')

#             # Verify slot exists
#             c.execute('SELECT doctor_id, slot_time FROM slots WHERE id = ?', (slot_id,))
#             slot = c.fetchone()
            
#             if not slot:
#                 conn.close()
#                 return render_template('book_appointment.html', 
#                                       members=members, 
#                                       doctors=doctors,
#                                       member_id=member_id,
#                                       doctor_id=doctor_id,
#                                       date=date,
#                                       appointment_id=appointment_id,
#                                       current_appointment=current_appointment,
#                                       error="Selected slot not found.")
            
#             # Check if slot is in the future
#             slot_time = datetime.strptime(slot['slot_time'], '%Y-%m-%d %H:%M:%S')
#             current_time = datetime.now()
#             if slot_time <= current_time:
#                 conn.close()
#                 return render_template('book_appointment.html', 
#                                       members=members, 
#                                       doctors=doctors,
#                                       member_id=member_id,
#                                       doctor_id=doctor_id,
#                                       date=date,
#                                       appointment_id=appointment_id,
#                                       current_appointment=current_appointment,
#                                       error="Cannot book past time slots.")
            
#             # Check if slot belongs to the selected doctor
#             if str(slot['doctor_id']) != doctor_id:
#                 conn.close()
#                 return render_template('book_appointment.html', 
#                                       members=members, 
#                                       doctors=doctors,
#                                       member_id=member_id,
#                                       doctor_id=doctor_id,
#                                       date=date,
#                                       appointment_id=appointment_id,
#                                       current_appointment=current_appointment,
#                                       error="Selected slot does not belong to this doctor.")
            
#             # Check for existing bookings (exclude current appointment if rescheduling)
#             c.execute('''SELECT id FROM appointments 
#                         WHERE slot_id = ? AND status = "Scheduled" 
#                         AND (? IS NULL OR id != ?)''', (slot_id, appointment_id, appointment_id))
#             existing_appointment = c.fetchone()
#             if existing_appointment:
#                 conn.close()
#                 return render_template('book_appointment.html', 
#                                       members=members, 
#                                       doctors=doctors,
#                                       member_id=member_id,
#                                       doctor_id=doctor_id,
#                                       date=date,
#                                       appointment_id=appointment_id,
#                                       current_appointment=current_appointment,
#                                       error="Selected slot is already booked by another patient.")
            
#             # Handle rescheduling or new booking
#             if appointment_id and current_appointment:
#                 logger.debug(f"Rescheduling appointment {appointment_id} to slot {slot_id}")
#                 c.execute('UPDATE appointments SET slot_id = ?, status = "Scheduled" WHERE id = ?', 
#                          (slot_id, appointment_id))
#                 if c.rowcount == 0:
#                     logger.error(f"Failed to update appointment {appointment_id}")
#                     conn.close()
#                     return render_template('book_appointment.html', 
#                                           members=members, 
#                                           doctors=doctors,
#                                           member_id=member_id,
#                                           doctor_id=doctor_id,
#                                           date=date,
#                                           appointment_id=appointment_id,
#                                           current_appointment=current_appointment,
#                                           error="Failed to reschedule appointment.")
#             else:
#                 c.execute('INSERT INTO appointments (member_id, slot_id, status) VALUES (?, ?, "Scheduled")', 
#                          (member_id, slot_id))
            
#             conn.commit()
#             conn.close()
            
#             return redirect(url_for('patient_dashboard') + '#appointments?success=Appointment booked successfully')

#         return render_template('book_appointment.html', 
#                               members=members, 
#                               doctors=doctors,
#                               member_id=member_id,
#                               doctor_id=doctor_id,
#                               date=date,
#                               appointment_id=appointment_id,
#                               current_appointment=current_appointment)

#     except Exception as e:
#         logger.error(f"Error in book_appointment route: {e}")
#         return render_template('book_appointment.html', 
#                               members=members, 
#                               doctors=doctors,
#                               error=f"Failed to load appointment page: {str(e)}")
# # Dashboard data helper functions
def get_patient_dashboard_data(family_id):
    """Get data for patient dashboard"""
    conn = get_db()
    c = conn.cursor()
    
    # Get patient name
    c.execute("SELECT first_name, last_name FROM members WHERE family_id = ? LIMIT 1", (family_id,))
    member = c.fetchone()
    patient_name = f"{member['first_name']} {member['last_name']}" if member else "Patient"
    
    # Get counts
    c.execute("SELECT COUNT(*) as count FROM members WHERE family_id = ?", (family_id,))
    family_members_count = c.fetchone()['count']
    
    c.execute('''SELECT COUNT(*) as count FROM appointments a 
                 JOIN slots s ON a.slot_id = s.id 
                 WHERE s.slot_time > datetime('now') 
                 AND a.member_id IN (SELECT id FROM members WHERE family_id = ?)''', (family_id,))
    upcoming_appointments_count = c.fetchone()['count']
    
    # Get last visit date
    c.execute('''SELECT MAX(s.slot_time) as last_visit FROM appointments a 
                 JOIN slots s ON a.slot_id = s.id 
                 WHERE a.member_id IN (SELECT id FROM members WHERE family_id = ?)''', (family_id,))
    last_visit_result = c.fetchone()
    last_visit_date = last_visit_result['last_visit'][:10] if last_visit_result and last_visit_result['last_visit'] else "Never"
    
    # Get upcoming appointments
    c.execute('''SELECT d.name as doctor_name, d.specialty, s.slot_time 
                 FROM appointments a 
                 JOIN slots s ON a.slot_id = s.id 
                 JOIN doctors d ON s.doctor_id = d.id 
                 WHERE s.slot_time > datetime('now') 
                 AND a.member_id IN (SELECT id FROM members WHERE family_id = ?)
                 ORDER BY s.slot_time LIMIT 5''', (family_id,))
    upcoming_appointments = [dict(row) for row in c.fetchall()]
    
    # Generate sample health data (in a real app, this would come from a database)
    blood_pressure_last_checked = (datetime.now() - timedelta(days=2)).strftime('%b %d, %Y')
    blood_sugar_last_checked = (datetime.now() - timedelta(days=4)).strftime('%b %d, %Y')
    weight_last_recorded = (datetime.now() - timedelta(days=1)).strftime('%b %d, %Y')
    weight = f"{random.randint(65, 85)}"
    
    # Sample medical records (in a real app, this would come from a database)
    medical_records = []
    medical_records_count = 0
    
    conn.close()
    
    return {
        'patient_name': patient_name,
        'family_members_count': family_members_count,
        'upcoming_appointments_count': upcoming_appointments_count,
        'last_visit_date': last_visit_date,
        'medical_records_count': medical_records_count,
        'upcoming_appointments': upcoming_appointments,
        'blood_pressure_last_checked': blood_pressure_last_checked,
        'blood_sugar_last_checked': blood_sugar_last_checked,
        'weight_last_recorded': weight_last_recorded,
        'weight': weight,
        'medical_records': medical_records
    }

def get_doctor_dashboard_data(doctor_id):
    """Get data for doctor dashboard"""
    conn = get_db()
    c = conn.cursor()
    
    # Get doctor details
    c.execute("SELECT * FROM doctors WHERE family_id = ?", (doctor_id,))
    doctor = c.fetchone()
    
    # Get today's date in the right format
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Get appointment counts
    c.execute('''SELECT COUNT(*) as count FROM appointments a 
                 JOIN slots s ON a.slot_id = s.id 
                 WHERE date(s.slot_time) = ? AND s.doctor_id = ?''', 
              (today, doctor['id']))
    total_patients_today = c.fetchone()['count']
    
    # For demo purposes, we'll generate some sample data
    completed_appointments_today = random.randint(0, total_patients_today)
    pending_appointments_today = total_patients_today - completed_appointments_today
    cancelled_appointments_today = random.randint(0, 2)
    
    # Get today's appointments
    c.execute('''SELECT m.first_name || ' ' || m.last_name as patient_name, 
                 s.slot_time as time, 'Hypertension' as condition,
                 CASE WHEN RANDOM() % 2 = 0 THEN 'Scheduled' ELSE 'Completed' END as status,
                 CASE WHEN status = 'Scheduled' THEN 'warning' ELSE 'success' END as status_color
                 FROM appointments a 
                 JOIN slots s ON a.slot_id = s.id 
                 JOIN members m ON a.member_id = m.id 
                 WHERE date(s.slot_time) = ? AND s.doctor_id = ?
                 ORDER BY s.slot_time''', 
              (today, doctor['id']))
    todays_appointments = [dict(row) for row in c.fetchall()]
    
    # Get recent patients
    c.execute('''SELECT m.first_name || ' ' || m.last_name as name, 
                 MAX(s.slot_time) as last_visit, 'Hypertension' as condition
                 FROM appointments a 
                 JOIN slots s ON a.slot_id = s.id 
                 JOIN members m ON a.member_id = m.id 
                 WHERE s.doctor_id = ?
                 GROUP BY m.id
                 ORDER BY last_visit DESC LIMIT 5''', 
              (doctor['id'],))
    recent_patients = [dict(row) for row in c.fetchall()]
    
    conn.close()
    
    return {
        'doctor': doctor,
        'total_patients_today': total_patients_today,
        'completed_appointments_today': completed_appointments_today,
        'pending_appointments_today': pending_appointments_today,
        'cancelled_appointments_today': cancelled_appointments_today,
        'todays_appointments': todays_appointments,
        'recent_patients': recent_patients
    }

def get_front_office_dashboard_data(family_id):
    """Get data for front office dashboard"""
    conn = get_db()
    c = conn.cursor()
    
    # Get front office details
    c.execute('SELECT * FROM front_office WHERE family_id = ?', (family_id,))
    front_office = c.fetchone()
    
    # Get today's date
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Get appointment counts
    c.execute('''SELECT COUNT(*) as count FROM appointments a 
                 JOIN slots s ON a.slot_id = s.id 
                 WHERE date(s.slot_time) = ?''', (today,))
    scheduled_today = c.fetchone()['count']
    
    # For demo purposes, we'll generate some sample data
    pending_checkins = random.randint(0, scheduled_today)
    total_patients_today = scheduled_today
    todays_collections = random.randint(1000, 5000)
    pending_payments = random.randint(500, 2000)
    insurance_claims = random.randint(5, 20)
    
    # Get today's appointments
    c.execute('''SELECT m.first_name || ' ' || m.last_name as patient_name, 
                 d.name as doctor, s.slot_time as time,
                 CASE WHEN RANDOM() % 3 = 0 THEN 'Scheduled' 
                      WHEN RANDOM() % 3 = 1 THEN 'Checked In' 
                      ELSE 'Completed' END as status,
                 CASE WHEN status = 'Scheduled' THEN 'warning' 
                      WHEN status = 'Checked In' THEN 'info' 
                      ELSE 'success' END as status_color
                 FROM appointments a 
                 JOIN slots s ON a.slot_id = s.id 
                 JOIN members m ON a.member_id = m.id 
                 JOIN doctors d ON s.doctor_id = d.id 
                 WHERE date(s.slot_time) = ?
                 ORDER BY s.slot_time''', (today,))
    todays_appointments = [dict(row) for row in c.fetchall()]
    
    # Get recent registrations
    c.execute('''SELECT first_name || ' ' || last_name as name, 
                 phone, date(created_at) as registration_date, 'Active' as status
                 FROM members 
                 ORDER BY created_at DESC LIMIT 5''')
    recent_registrations = [dict(row) for row in c.fetchall()]
    
    conn.close()
    
    return {
        'front_office': front_office,
        'scheduled_today': scheduled_today,
        'pending_checkins': pending_checkins,
        'total_patients_today': total_patients_today,
        'todays_collections': todays_collections,
        'pending_payments': pending_payments,
        'insurance_claims': insurance_claims,
        'todays_appointments': todays_appointments,
        'recent_registrations': recent_registrations
    }
@app.route('/dashboard')
def dashboard():
    if 'family_id' not in session or 'user_type' not in session:
        return redirect('/')
    
    user_type = session['user_type']
    
    if user_type == 'patient':
        return redirect('/patient_dashboard')
    elif user_type == 'doctor':
        return redirect('/doctor_dashboard')
    elif user_type == 'front_office':
        return redirect('/front_office_dashboard')
    else:
        return redirect('/')
# @app.route('/patient_dashboard')
# def patient_dashboard():
#     if 'family_id' not in session or session.get('user_type') != 'patient':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get patient profile
#         c.execute('SELECT * FROM members WHERE family_id = ? LIMIT 1', (uid,))
#         profile = c.fetchone()
        
#         if not profile:
#             conn.close()
#             return render_template('patient_dashboard.html', 
#                                  error='No patient profile found. Please contact administrator.')
        
#         # Get family members
#         c.execute('SELECT * FROM members WHERE family_id = ?', (uid,))
#         family_members = c.fetchall()
        
#         # Get appointments - UPDATED to handle both old and new schema
#         try:
#             # Try the new query with status column
#             c.execute('''SELECT a.id, m.first_name, m.last_name, d.name as doctor_name, s.slot_time, a.status
#                         FROM appointments a 
#                         JOIN slots s ON a.slot_id = s.id 
#                         JOIN doctors d ON s.doctor_id = d.id 
#                         JOIN members m ON a.member_id = m.id 
#                         WHERE m.family_id = ?
#                         ORDER BY s.slot_time''', (uid,))
#         except sqlite3.OperationalError:
#             # Fallback to old query if status column doesn't exist
#             c.execute('''SELECT a.id, m.first_name, m.last_name, d.name as doctor_name, s.slot_time, 'Scheduled' as status
#                         FROM appointments a 
#                         JOIN slots s ON a.slot_id = s.id 
#                         JOIN doctors d ON s.doctor_id = d.id 
#                         JOIN members m ON a.member_id = m.id 
#                         WHERE m.family_id = ?
#                         ORDER BY s.slot_time''', (uid,))
        
#         appointments = c.fetchall()
        
#         # Get medical records
#         c.execute('''SELECT mr.*, m.first_name, m.last_name 
#                     FROM medical_records mr
#                     JOIN members m ON mr.member_id = m.id
#                     WHERE m.family_id = ?
#                     ORDER BY mr.record_date DESC''', (uid,))
#         medical_records = c.fetchall()
        
#         # Get prescriptions with frequency and duration
#         try:
#             c.execute('''SELECT p.*, m.first_name, m.last_name, d.name as doctor_name
#                         FROM prescriptions p
#                         JOIN members m ON p.member_id = m.id
#                         JOIN doctors d ON p.doctor_id = d.id
#                         WHERE m.family_id = ?
#                         ORDER BY p.prescription_date DESC''', (uid,))
#             prescriptions = c.fetchall()
#         except Exception as e:
#             logger.error(f"Error fetching prescriptions: {e}")
#             prescriptions = []
        
#         # Get bills
#         c.execute('''SELECT b.*, m.first_name, m.last_name 
#                     FROM bills b
#                     JOIN members m ON b.member_id = m.id
#                     WHERE m.family_id = ?
#                     ORDER BY b.bill_date DESC''', (uid,))
#         bills = c.fetchall()
        
#         conn.close()
        
#         return render_template('patient_dashboard.html', 
#                               profile=profile,
#                               family_members=family_members,
#                               appointments=appointments,
#                               medical_records=medical_records,
#                               prescriptions=prescriptions,
#                               bills=bills)
#     except Exception as e:
#         logger.error(f"Error in patient dashboard: {e}")
#         return render_template('patient_dashboard.html', error=f"Failed to load dashboard: {str(e)}")


# @app.route('/doctor_dashboard')
# def doctor_dashboard():
#     if 'family_id' not in session or session.get('user_type') != 'doctor':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get doctor details
#         c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
#         doctor = c.fetchone()
        
#         if not doctor:
#             conn.close()
#             return render_template('doctor_dashboard.html', error="Doctor not found")
        
#         # Get today's date
#         from datetime import datetime
#         today = datetime.now().strftime('%Y-%m-%d')
#         print(f"Today's date: {today}")
#         print(f"Doctor ID: {doctor['id']}")
        
#         # Debug: Check if we have any slots for today
#         c.execute('''SELECT COUNT(*) as slot_count FROM slots 
#                     WHERE doctor_id = ? AND date(slot_time) = ?''', 
#                  (doctor['id'], today))
#         today_slots = c.fetchone()['slot_count']
#         print(f"Slots available today: {today_slots}")
        
#         # Debug: Check if we have any appointments for today
#         c.execute('''SELECT COUNT(*) as appt_count FROM appointments a
#                     JOIN slots s ON a.slot_id = s.id
#                     WHERE s.doctor_id = ? AND date(s.slot_time) = ?''', 
#                  (doctor['id'], today))
#         today_appt_count = c.fetchone()['appt_count']
#         print(f"Appointments today: {today_appt_count}")
        
#         # Get dashboard stats
#         c.execute('''SELECT COUNT(*) as total_patients_today
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     WHERE s.doctor_id = ? AND date(s.slot_time) = ?''', 
#                  (doctor['id'], today))
#         total_patients_today = c.fetchone()['total_patients_today']
        
#         c.execute('''SELECT COUNT(*) as completed_today
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     WHERE s.doctor_id = ? AND date(s.slot_time) = ? AND a.status = "Completed"''', 
#                  (doctor['id'], today))
#         completed_today = c.fetchone()['completed_today']
        
#         c.execute('''SELECT COUNT(*) as pending_today
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     WHERE s.doctor_id = ? AND date(s.slot_time) = ? AND a.status = "Scheduled"''', 
#                  (doctor['id'], today))
#         pending_today = c.fetchone()['pending_today']
        
#         c.execute('''SELECT COUNT(*) as cancelled_today
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     WHERE s.doctor_id = ? AND date(s.slot_time) = ? AND a.status = "Cancelled"''', 
#                  (doctor['id'], today))
#         cancelled_today = c.fetchone()['cancelled_today']
        
#         # Get today's appointments
#         c.execute('''SELECT a.id as appointment_id, m.id as patient_id, m.first_name, m.last_name, 
#                     m.phone, m.email, s.slot_time, a.status
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     JOIN members m ON a.member_id = m.id 
#                     WHERE s.doctor_id = ? AND date(s.slot_time) = ?
#                     ORDER BY s.slot_time''', (doctor['id'], today))
        
#         today_appointments = []
#         for app in c.fetchall():
#             slot_time = app['slot_time']
#             try:
#                 dt = datetime.strptime(slot_time, '%Y-%m-%d %H:%M:%S')
#                 formatted_time = dt.strftime('%H:%M')
#             except:
#                 formatted_time = slot_time
            
#             # Determine status color based on appointment status
#             status = app['status']
#             if status == 'Scheduled':
#                 status_color = 'warning'
#             elif status == 'Checked In':
#                 status_color = 'info'
#             elif status == 'Completed':
#                 status_color = 'success'
#             elif status == 'Cancelled':
#                 status_color = 'danger'
#             else:
#                 status_color = 'secondary'
            
#             today_appointments.append({
#                 'id': app['appointment_id'],
#                 'patient_id': app['patient_id'],
#                 'patient_name': f"{app['first_name']} {app['last_name']}",
#                 'phone': app['phone'],
#                 'email': app['email'],
#                 'slot_time': formatted_time,
#                 'status': status,
#                 'status_color': status_color
#             })
        
#         print(f"Today appointments found: {len(today_appointments)}")
        
#         # Get recent patients
#         c.execute('''SELECT DISTINCT m.id as patient_id, m.first_name, m.last_name, m.phone, m.email, MAX(s.slot_time) as last_visit
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     JOIN members m ON a.member_id = m.id 
#                     WHERE s.doctor_id = ?
#                     GROUP BY m.id
#                     ORDER BY last_visit DESC
#                     LIMIT 5''', (doctor['id'],))

#         recent_patients = []
#         for patient in c.fetchall():
#             recent_patients.append({
#                 'patient_id': patient['patient_id'],
#                 'patient_name': f"{patient['first_name']} {patient['last_name']}",
#                 'phone': patient['phone'],
#                 'email': patient['email'],
#                 'last_visit': patient['last_visit']
#             })
        
#         conn.close()
        
#         return render_template('doctor_dashboard.html', 
#                               doctor=doctor,
#                               total_patients_today=total_patients_today,
#                               completed_today=completed_today,
#                               pending_today=pending_today,
#                               cancelled_today=cancelled_today,
#                               today_appointments=today_appointments,
#                               recent_patients=recent_patients)
#     except Exception as e:
#         logger.error(f"Error in doctor dashboard: {e}")
#         import traceback
#         logger.error(traceback.format_exc())
#         return render_template('doctor_dashboard.html', error=f"Failed to load dashboard: {str(e)}", doctor=None)
@app.route('/doctor/view_patient/<int:appointment_id>')
def doctor_view_patient(appointment_id):
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return redirect('/')
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # First, let's check if the doctor exists
        c.execute('SELECT id FROM doctors WHERE family_id = ?', (session['family_id'],))
        doctor = c.fetchone()
        
        if not doctor:
            conn.close()
            return redirect('/doctor/appointments?error=Doctor not found')
        
        doctor_id = doctor['id']
        
        # Get appointment details with patient and doctor information
        # Using a simpler query first to debug
        c.execute('''SELECT 
            a.id as appointment_id,
            a.status, 
            s.slot_time, 
            d.name as doctor_name, 
            d.specialty, 
            m.id as patient_id,
            m.first_name, 
            m.middle_name,
            m.last_name, 
            m.age, 
            m.gender, 
            m.phone, 
            m.email,
            m.aadhar,
            m.address,
            m.prev_problem,
            m.curr_problem,
            m.created_date as registration_date
            FROM appointments a
            JOIN slots s ON a.slot_id = s.id
            JOIN doctors d ON s.doctor_id = d.id
            JOIN members m ON a.member_id = m.id
            WHERE a.id = ? AND d.id = ?''', (appointment_id, doctor_id))
        
        appointment = c.fetchone()
        
        if not appointment:
            conn.close()
            return redirect('/doctor/appointments?error=Appointment not found')
        
        # Get patient's medical history
        c.execute('''SELECT record_type, record_date, description, file_path
                    FROM medical_records 
                    WHERE member_id = ? 
                    ORDER BY record_date DESC LIMIT 10''', 
                 (appointment['patient_id'],))
        medical_history = c.fetchall()
        
        # Get patient's previous appointments with this doctor
        c.execute('''SELECT a.id, s.slot_time, a.status
                    FROM appointments a
                    JOIN slots s ON a.slot_id = s.id
                    WHERE a.member_id = ? AND s.doctor_id = ? AND a.id != ?
                    ORDER BY s.slot_time DESC LIMIT 5''',
                 (appointment['patient_id'], doctor_id, appointment_id))
        previous_appointments = c.fetchall()
        
        # Get patient's prescriptions from this doctor with frequency and duration
        try:
            c.execute('''SELECT prescription_date, medication, dosage, frequency, duration, 
                        instructions, notes, d.name as doctor_name
                        FROM prescriptions p
                        JOIN doctors d ON p.doctor_id = d.id
                        WHERE p.member_id = ? AND p.doctor_id = ?
                        ORDER BY p.prescription_date DESC LIMIT 5''',
                     (appointment['patient_id'], doctor_id))
            prescriptions = c.fetchall()
        except Exception as e:
            logger.error(f"Error fetching prescriptions: {e}")
            prescriptions = []
        
        conn.close()
        
        # Also pass doctor info to the template for the navbar
        doctor_info = {'name': appointment['doctor_name']}
        
        return render_template('doctor_view_patient.html', 
                              appointment=dict(appointment),
                              medical_history=medical_history,
                              previous_appointments=previous_appointments,
                              prescriptions=prescriptions,
                              doctor=doctor_info)
        
    except Exception as e:
        logger.error(f"Error in doctor_view_patient route: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return redirect('/doctor/appointments?error=Failed to load patient details')




# @app.route('/front_office_dashboard')
# def front_office_dashboard():
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get front office details
#         c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
#         front_office = c.fetchone()
        
#         if not front_office:
#             conn.close()
#             return render_template('front_office_dashboard.html', front_office=None, error="Front office staff not found")
        
#         # Use today's date instead of hardcoded date
#         from datetime import datetime
#         target_date = datetime.now().strftime('%Y-%m-%d')
        
#         # Rest of your code remains the same...
#         # Get dashboard stats for the target date
#         c.execute('''SELECT COUNT(*) as scheduled_today
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     WHERE date(s.slot_time) = ?''', (target_date,))
#         scheduled_today = c.fetchone()['scheduled_today']
        
#         # For demo purposes, we'll generate some sample data
#         pending_checkins = scheduled_today  # All scheduled appointments are pending check-in
#         total_patients_today = scheduled_today
#         todays_collections = 2450.00 if scheduled_today > 0 else 0
#         pending_payments = 1250.00 if scheduled_today > 0 else 0
#         insurance_claims = 5 if scheduled_today > 0 else 0
        
#         # Get appointments for the target date
#         c.execute('''SELECT a.id as appointment_id, m.first_name, m.last_name, 
#                     d.name as doctor_name, s.slot_time, a.status
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     JOIN doctors d ON s.doctor_id = d.id 
#                     JOIN members m ON a.member_id = m.id 
#                     WHERE date(s.slot_time) = ?
#                     ORDER BY s.slot_time''', (target_date,))
        
#         # Rest of your code...
        
#         today_appointments = []
#         for app in c.fetchall():
#             slot_time = app['slot_time']
#             try:
#                 from datetime import datetime
#                 dt = datetime.strptime(slot_time, '%Y-%m-%d %H:%M:%S')
#                 formatted_time = dt.strftime('%H:%M')
#             except:
#                 formatted_time = slot_time
            
#             # Determine status color based on appointment status
#             status = app['status']
#             if status == 'Scheduled':
#                 status_color = 'warning'
#             elif status == 'Checked In':
#                 status_color = 'info'
#             elif status == 'Completed':
#                 status_color = 'success'
#             elif status == 'Cancelled':
#                 status_color = 'danger'
#             else:
#                 status_color = 'secondary'
            
#             today_appointments.append({
#                 'id': app['appointment_id'],
#                 'patient_name': f"{app['first_name']} {app['last_name']}",
#                 'doctor': app['doctor_name'],
#                 'time': formatted_time,
#                 'status': status,
#                 'status_color': status_color
#             })
        
#         # Get recent registrations
#         c.execute('''SELECT first_name, last_name, phone, created_date
#                     FROM members 
#                     ORDER BY created_date DESC
#                     LIMIT 5''')
        
#         recent_registrations = []
#         for patient in c.fetchall():
#             recent_registrations.append({
#                 'name': f"{patient['first_name']} {patient['last_name']}",
#                 'phone': patient['phone'],
#                 'registration_date': patient['created_date'][:10] if patient['created_date'] else 'N/A',
#                 'status': 'Active'
#             })
        
#         conn.close()
        
#         return render_template('front_office_dashboard.html', 
#                               front_office=front_office,
#                               scheduled_today=scheduled_today,
#                               pending_checkins=pending_checkins,
#                               total_patients_today=total_patients_today,
#                               todays_collections=todays_collections,
#                               pending_payments=pending_payments,
#                               insurance_claims=insurance_claims,
#                               today_appointments=today_appointments,
#                               recent_registrations=recent_registrations)
#     except Exception as e:
        logger.error(f"Error in front office dashboard: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return render_template('front_office_dashboard.html', front_office=None, error=f"Failed to load dashboard: {str(e)}")
# @app.route('/front_office/checkin_appointment/<int:appointment_id>', methods=['POST'])
# def front_office_checkin_appointment(appointment_id):
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return redirect('/')
    
#     try:
#         conn = get_db()
#         c = conn.cursor()
        
#         # Update appointment status to Checked In
#         c.execute('UPDATE appointments SET status = "Checked In" WHERE id = ?', (appointment_id,))
#         conn.commit()
#         conn.close()
        
#         return redirect('/front_office_dashboard?success=Patient checked in successfully')
#     except Exception as e:
#         logger.error(f"Error checking in appointment: {e}")
#         return redirect('/front_office_dashboard?error=Failed to check in patient')

# @app.route('/front_office/checkout_appointment/<int:appointment_id>', methods=['POST'])
# def front_office_checkout_appointment(appointment_id):
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return redirect('/')
    
#     try:
#         conn = get_db()
#         c = conn.cursor()
        
#         # Update appointment status to Completed
#         c.execute('UPDATE appointments SET status = "Completed" WHERE id = ?', (appointment_id,))
#         conn.commit()
#         conn.close()
        
#         return redirect('/front_office_dashboard?success=Patient checked out successfully')
#     except Exception as e:
#         logger.error(f"Error checking out appointment: {e}")
#         return redirect('/front_office_dashboard?error=Failed to check out patient')        
# @app.route('/front_office/reschedule_appointment', methods=['POST'])
# def front_office_reschedule_appointment():
#     """Handle rescheduling from modal form"""
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return jsonify({'success': False, 'error': 'Unauthorized'})
    
#     try:
#         appointment_id = request.form['appointment_id']
#         new_slot_id = request.form['slot_id']
        
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get current appointment details
#         c.execute('SELECT slot_id FROM appointments WHERE id = ?', (appointment_id,))
#         current_appointment = c.fetchone()
        
#         if not current_appointment:
#             conn.close()
#             return jsonify({'success': False, 'error': 'Appointment not found'})
        
#         # Free up the old slot
#         c.execute('UPDATE slots SET booked = 0 WHERE id = ?', (current_appointment['slot_id'],))
        
#         # Book the new slot
#         c.execute('UPDATE slots SET booked = 1 WHERE id = ?', (new_slot_id,))
        
#         # Update the appointment with the new slot
#         c.execute('UPDATE appointments SET slot_id = ? WHERE id = ?', (new_slot_id, appointment_id))
        
#         conn.commit()
#         conn.close()
        
#         return jsonify({'success': True, 'message': 'Appointment rescheduled successfully'})
        
#     except Exception as e:
#         logger.error(f"Error rescheduling appointment: {e}")
#         return jsonify({'success': False, 'error': str(e)})

# @app.route('/front_office/view_patient/<int:patient_id>')
# def front_office_view_patient(patient_id):
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return redirect('/')
    
#     try:
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get front office details for the navbar
#         c.execute('SELECT * FROM front_office WHERE family_id = ?', (session['family_id'],))
#         front_office = c.fetchone()
        
#         # Get patient details
#         c.execute('''SELECT 
#             m.id as patient_id,
#             m.first_name, 
#             m.middle_name,
#             m.last_name, 
#             m.age, 
#             m.gender, 
#             m.phone, 
#             m.email,
#             m.aadhar,
#             m.address,
#             m.prev_problem,
#             m.curr_problem,
#             m.created_date as registration_date
#             FROM members m
#             WHERE m.id = ?''', (patient_id,))
        
#         patient = c.fetchone()
        
#         if not patient:
#             conn.close()
#             return redirect('/front_office/patients?error=Patient not found')
        
#         # Create a mock appointment object for template compatibility
#         appointment_data = {
#             'patient_id': patient['patient_id'],
#             'first_name': patient['first_name'],
#             'middle_name': patient['middle_name'],
#             'last_name': patient['last_name'],
#             'age': patient['age'],
#             'gender': patient['gender'],
#             'phone': patient['phone'],
#             'email': patient['email'],
#             'aadhar': patient['aadhar'],
#             'address': patient['address'],
#             'prev_problem': patient['prev_problem'],
#             'curr_problem': patient['curr_problem'],
#             'registration_date': patient['registration_date'],
#             'doctor_name': 'Multiple Doctors',
#             'specialty': 'Various Specialties',
#             'slot_time': 'Multiple appointments',
#             'status': 'Patient Record View'
#         }
        
#         # Get patient's medical history
#         c.execute('''SELECT record_type, record_date, description, file_path
#                     FROM medical_records 
#                     WHERE member_id = ? 
#                     ORDER BY record_date DESC LIMIT 10''', 
#                  (patient_id,))
#         medical_history = c.fetchall()
        
#         # Get patient's appointments
#         c.execute('''SELECT a.id, d.name as doctor_name, s.slot_time, a.status
#                     FROM appointments a
#                     JOIN slots s ON a.slot_id = s.id
#                     JOIN doctors d ON s.doctor_id = d.id
#                     WHERE a.member_id = ?
#                     ORDER BY s.slot_time DESC LIMIT 10''',
#                  (patient_id,))
#         previous_appointments = c.fetchall()
        
#         # Get patient's prescriptions
#         try:
#             c.execute('''SELECT prescription_date, medication, dosage, frequency, duration, 
#                         instructions, notes, d.name as doctor_name
#                         FROM prescriptions p
#                         JOIN doctors d ON p.doctor_id = d.id
#                         WHERE p.member_id = ?
#                         ORDER BY p.prescription_date DESC LIMIT 10''',
#                      (patient_id,))
#             prescriptions = c.fetchall()
#         except Exception as e:
#             logger.error(f"Error fetching prescriptions: {e}")
#             prescriptions = []
        
#         conn.close()
        
#         return render_template('front_office_view_patient.html', 
#                               front_office=front_office,
#                               appointment=appointment_data,
#                               medical_history=medical_history,
#                               previous_appointments=previous_appointments,
#                               prescriptions=prescriptions,
#                               is_patient_view=True)
        
#     except Exception as e:
#         logger.error(f"Error in front_office_view_patient route: {e}")
#         return redirect('/front_office/patients?error=Failed to load patient details')



@app.route('/front_office/update_patient/<int:patient_id>', methods=['POST'])
def front_office_update_patient(patient_id):
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return redirect('/')
    
    try:
        # Get form data
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        age = int(request.form['age'])
        gender = request.form['gender']
        phone = request.form['phone']
        email = request.form['email']
        aadhar = request.form['aadhar']
        address = request.form['address']
        prev_problem = request.form.get('prev_problem', '')
        curr_problem = request.form.get('curr_problem', '')
        
        conn = get_db()
        c = conn.cursor()
        
        # Check if email already exists for another patient
        c.execute('SELECT * FROM members WHERE email = ? AND id != ?', (email, patient_id))
        if c.fetchone():
            conn.close()
            return redirect('/front_office/patients?error=Email already exists for another patient')
        
        # Update patient record
        c.execute('''UPDATE members 
                    SET first_name=?, last_name=?, age=?, gender=?, phone=?, email=?, 
                        aadhar=?, address=?, prev_problem=?, curr_problem=?
                    WHERE id=?''',
                  (first_name, last_name, age, gender, phone, email, aadhar, address, 
                   prev_problem, curr_problem, patient_id))
        
        conn.commit()
        conn.close()
        
        return redirect('/front_office/patients?success=Patient information updated successfully')
    
    except Exception as e:
        logger.error(f"Error updating patient: {e}")
        return redirect('/front_office/patients?error=Failed to update patient information')



@app.route('/front_office/view_appointment/<int:appointment_id>')
def front_office_view_appointment(appointment_id):
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return redirect('/')
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Fetch appointment details with patient and doctor information
        c.execute('''SELECT 
            a.id as appointment_id,
            a.status, 
            s.slot_time, 
            d.name as doctor_name, 
            d.specialty, 
            d.email as doctor_email,
            d.phone as doctor_phone,
            m.id as patient_id,
            m.first_name, 
            m.middle_name,
            m.last_name, 
            m.age, 
            m.gender, 
            m.phone, 
            m.email,
            m.aadhar,
            m.address,
            m.prev_problem,
            m.curr_problem,
            m.created_date as registration_date,
            f.id as family_id
            FROM appointments a
            JOIN slots s ON a.slot_id = s.id
            JOIN doctors d ON s.doctor_id = d.id
            JOIN members m ON a.member_id = m.id
            JOIN families f ON m.family_id = f.id
            WHERE a.id = ?''', (appointment_id,))
        
        appointment = c.fetchone()
        
        if not appointment:
            conn.close()
            return redirect('/front_office/appointments?error=Appointment not found')
        
        # Get patient's medical history
        c.execute('''SELECT record_type, record_date, description 
                    FROM medical_records 
                    WHERE member_id = ? 
                    ORDER BY record_date DESC LIMIT 5''', 
                 (appointment['patient_id'],))
        medical_history = c.fetchall()
        
        # Get patient's previous appointments
        c.execute('''SELECT a.id, d.name as doctor_name, s.slot_time, a.status
                    FROM appointments a
                    JOIN slots s ON a.slot_id = s.id
                    JOIN doctors d ON s.doctor_id = d.id
                    WHERE a.member_id = ? AND a.id != ?
                    ORDER BY s.slot_time DESC LIMIT 5''',
                 (appointment['patient_id'], appointment_id))
        previous_appointments = c.fetchall()
        
        conn.close()
        
        return render_template('front_office_view_appointment.html', 
                              appointment=dict(appointment),
                              medical_history=medical_history,
                              previous_appointments=previous_appointments)
        
    except Exception as e:
        logger.error(f"Error in front_office_view_appointment route: {e}")
        return redirect('/front_office/appointments?error=Failed to load appointment details')


@app.route('/front_office/cancel_appointment/<int:appointment_id>', methods=['POST'])
def front_office_cancel_appointment(appointment_id):
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get appointment details to free up the slot
        c.execute('SELECT slot_id FROM appointments WHERE id = ?', (appointment_id,))
        appointment = c.fetchone()
        
        if appointment:
            # Free up the slot
            c.execute('UPDATE slots SET booked = 0 WHERE id = ?', (appointment['slot_id'],))
            
            # Update appointment status to "Cancelled"
            c.execute('UPDATE appointments SET status = "Cancelled" WHERE id = ?', (appointment_id,))
            
            conn.commit()
        
        conn.close()
        return jsonify({'success': True, 'message': 'Appointment cancelled successfully'})
    
    except Exception as e:
        logger.error(f"Error cancelling appointment: {e}")
        return jsonify({'success': False, 'error': str(e)})



# @app.route('/front_office/view_patient_from_appointment/<int:appointment_id>')
# def front_office_view_patient_from_appointment(appointment_id):
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return redirect('/')
    
#     try:
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get appointment details with patient information
#         c.execute('''SELECT 
#             a.id as appointment_id,
#             a.status, 
#             s.slot_time, 
#             d.name as doctor_name, 
#             d.specialty, 
#             m.id as patient_id,
#             m.first_name, 
#             m.middle_name,
#             m.last_name, 
#             m.age, 
#             m.gender, 
#             m.phone, 
#             m.email,
#             m.aadhar,
#             m.address,
#             m.prev_problem,
#             m.curr_problem,
#             m.created_date as registration_date
#             FROM appointments a
#             JOIN slots s ON a.slot_id = s.id
#             JOIN doctors d ON s.doctor_id = d.id
#             JOIN members m ON a.member_id = m.id
#             WHERE a.id = ?''', (appointment_id,))
        
#         appointment = c.fetchone()
        
#         if not appointment:
#             conn.close()
#             return redirect('/front_office/appointments?error=Appointment not found')
        
#         # Get patient's medical history
#         c.execute('''SELECT record_type, record_date, description, file_path
#                     FROM medical_records 
#                     WHERE member_id = ? 
#                     ORDER BY record_date DESC LIMIT 10''', 
#                  (appointment['patient_id'],))
#         medical_history = c.fetchall()
        
#         # Get patient's previous appointments
#         c.execute('''SELECT a.id, d.name as doctor_name, s.slot_time, a.status
#                     FROM appointments a
#                     JOIN slots s ON a.slot_id = s.id
#                     JOIN doctors d ON s.doctor_id = d.id
#                     WHERE a.member_id = ?
#                     ORDER BY s.slot_time DESC LIMIT 5''',
#                  (appointment['patient_id'],))
#         previous_appointments = c.fetchall()
        
#         # Get patient's prescriptions
#         try:
#             c.execute('''SELECT prescription_date, medication, dosage, frequency, duration, 
#                         instructions, notes, d.name as doctor_name
#                         FROM prescriptions p
#                         JOIN doctors d ON p.doctor_id = d.id
#                         WHERE p.member_id = ?
#                         ORDER BY p.prescription_date DESC LIMIT 5''',
#                      (appointment['patient_id'],))
#             prescriptions = c.fetchall()
#         except Exception as e:
#             logger.error(f"Error fetching prescriptions: {e}")
#             prescriptions = []
        
#         # Get front office details for the navbar
#         c.execute('SELECT * FROM front_office WHERE family_id = ?', (session['family_id'],))
#         front_office = c.fetchone()
        
#         conn.close()
        
#         return render_template('front_office_view_patient.html', 
#                               appointment=dict(appointment),
#                               medical_history=medical_history,
#                               previous_appointments=previous_appointments,
#                               prescriptions=prescriptions,
#                               front_office=front_office)
        
#     except Exception as e:
#         logger.error(f"Error in front_office_view_patient_from_appointment route: {e}")
#         return redirect('/front_office/appointments?error=Failed to load patient details')




# @app.route('/doctor/patients')
# def doctor_patients():
#     if 'family_id' not in session or session.get('user_type') != 'doctor':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get doctor details
#         c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
#         doctor = c.fetchone()
        
#         # Get all patients who have appointments with this doctor
#         c.execute('''SELECT DISTINCT m.*, MAX(s.slot_time) as last_visit
#                     FROM members m
#                     JOIN appointments a ON m.id = a.member_id
#                     JOIN slots s ON a.slot_id = s.id
#                     WHERE s.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
#                     GROUP BY m.id
#                     ORDER BY last_visit DESC''', (uid,))
        
#         patients = c.fetchall()
#         conn.close()
        
#         return render_template('doctor_patients.html', doctor=doctor, patients=patients)
#     except Exception as e:
#         logger.error(f"Error in doctor patients route: {e}")
#         return render_template('doctor_patients.html', error=f"Failed to load patients: {str(e)}")

# @app.route('/doctor/schedule')
# def doctor_schedule():
#     if 'family_id' not in session or session.get('user_type') != 'doctor':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get doctor details
#         c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
#         doctor = c.fetchone()
        
#         # Get doctor's schedule (slots)
#         c.execute('''SELECT s.*, 
#                     CASE WHEN a.id IS NULL THEN 'Available' ELSE 'Booked' END as status,
#                     m.first_name, m.last_name
#                     FROM slots s
#                     LEFT JOIN appointments a ON s.id = a.slot_id
#                     LEFT JOIN members m ON a.member_id = m.id
#                     WHERE s.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
#                     ORDER BY s.slot_time''', (uid,))
        
#         schedule = c.fetchall()
#         conn.close()
        
#         return render_template('doctor_schedule.html', doctor=doctor, schedule=schedule)
#     except Exception as e:
#         logger.error(f"Error in doctor schedule route: {e}")
#         return render_template('doctor_schedule.html', error=f"Failed to load schedule: {str(e)}")

# @app.route('/doctor/appointments')
# def doctor_appointments():
#     if 'family_id' not in session or session.get('user_type') != 'doctor':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get doctor details
#         c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
#         doctor = c.fetchone()
        
#         # Get doctor's appointments
#         c.execute('''SELECT a.id, m.first_name, m.last_name, m.phone, m.email, 
#                     s.slot_time, s.booked as status
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     JOIN members m ON a.member_id = m.id 
#                     WHERE s.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
#                     ORDER BY s.slot_time DESC''', (uid,))
        
#         appointments = c.fetchall()
#         conn.close()
        
#         return render_template('doctor_appointments.html', doctor=doctor, appointments=appointments)
#     except Exception as e:
#         logger.error(f"Error in doctor appointments route: {e}")
#         return render_template('doctor_appointments.html', error=f"Failed to load appointments: {str(e)}")
# @app.route('/doctor/prescriptions', methods=['GET', 'POST'])
# def doctor_prescriptions():
#     if 'family_id' not in session or session.get('user_type') != 'doctor':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get doctor details
#         c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
#         doctor = c.fetchone()
        
#         if request.method == 'POST':
#             # Add new prescription
#             member_id = request.form['member_id']
#             medication = request.form['medication']
#             dosage = request.form['dosage']
#             frequency = request.form.get('frequency', '')
#             duration = request.form.get('duration', '')
#             instructions = request.form.get('instructions', '')
#             notes = request.form.get('notes', '')
            
#             from datetime import datetime
#             prescription_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
#             c.execute('''INSERT INTO prescriptions (member_id, doctor_id, prescription_date, medication, dosage, 
#                         frequency, duration, instructions, notes)
#                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
#                       (member_id, doctor['id'], prescription_date, medication, dosage, 
#                        frequency, duration, instructions, notes))
#             conn.commit()
            
#             return redirect('/doctor/prescriptions?success=Prescription added successfully')
        
#         # Get all prescriptions by this doctor with frequency and duration
#         try:
#             c.execute('''SELECT p.*, m.first_name, m.last_name, d.name as doctor_name
#                         FROM prescriptions p
#                         JOIN members m ON p.member_id = m.id
#                         JOIN doctors d ON p.doctor_id = d.id
#                         WHERE p.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
#                         ORDER BY p.prescription_date DESC''', (uid,))
#             prescriptions = c.fetchall()
#         except Exception as e:
#             logger.error(f"Error fetching prescriptions: {e}")
#             prescriptions = []
        
#         # Get patients for dropdown
#         c.execute('''SELECT DISTINCT m.id, m.first_name, m.last_name
#                     FROM members m
#                     JOIN appointments a ON m.id = a.member_id
#                     JOIN slots s ON a.slot_id = s.id
#                     WHERE s.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
#                     ORDER BY m.first_name''', (uid,))
        
#         patients = c.fetchall()
        
#         # Get patient_id from query parameter if provided
#         selected_patient_id = request.args.get('patient_id')
        
#         conn.close()
        
#         return render_template('doctor_prescriptions.html', 
#                               doctor=doctor, 
#                               prescriptions=prescriptions, 
#                               patients=patients,
#                               selected_patient_id=selected_patient_id)
#     except Exception as e:
#         logger.error(f"Error in doctor prescriptions route: {e}")
#         return render_template('doctor_prescriptions.html', error=f"Failed to load prescriptions: {str(e)}")
# @app.route('/patient_medical_records', methods=['GET', 'POST'])
# def patient_medical_records():
#     if 'family_id' not in session or session.get('user_type') != 'patient':
#         return redirect('/')

#     try:
#         conn = get_db()
#         c = conn.cursor()

#         if request.method == 'POST':
#             member_id = request.form['member_id']
#             record_type = request.form['record_type']
#             record_date = request.form['record_date']
#             description = request.form['description']
#             file = request.files['file']

#             # Ensure upload directory exists
#             upload_dir = app.config['UPLOAD_FOLDER']
#             if not os.path.exists(upload_dir):
#                 os.makedirs(upload_dir)

#             if file and file.filename != '':
#                 # Generate a unique filename to prevent collisions
#                 filename = secure_filename(file.filename)
#                 unique_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
#                 file_path = os.path.join(upload_dir, unique_filename)
#                 file.save(file_path)
                
#                 # Store relative path for web access
#                 web_file_path = f"uploads/{unique_filename}"
#             else:
#                 web_file_path = None

#             c.execute('INSERT INTO medical_records (member_id, record_type, record_date, description, file_path, uploaded_date) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
#                      (member_id, record_type, record_date, description, web_file_path))
#             conn.commit()
#             flash('Medical record uploaded successfully!', 'success')
#             return redirect('/patient_dashboard#medical')

#         # GET request - show form with family members
#         family_id = session['family_id']
#         c.execute('''
#             SELECT id, first_name, last_name 
#             FROM family_members 
#             WHERE family_id = ?
#         ''', (family_id,))
#         family_members = c.fetchall()
        
#         conn.close()
#         return render_template('patient_medical_records.html', family_members=family_members)

#     except Exception as e:
#         logger.error(f"Error in patient medical records route: {e}")
#         flash(f"Failed to process request: {str(e)}", 'error')
#         return redirect('/patient_dashboard#medical')

# @app.route('/front_office/checkins', methods=['GET', 'POST'])
# def front_office_checkins():
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get front office details
#         c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
#         front_office = c.fetchone()
        
#         if request.method == 'POST':
#             # Process check-in or check-out
#             member_id = request.form['member_id']
#             action = request.form['action']
            
#             from datetime import datetime
#             current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
#             if action == 'checkin':
#                 c.execute('INSERT INTO checkins (member_id, checkin_time) VALUES (?, ?)', 
#                           (member_id, current_time))
#                 conn.commit()
#                 return redirect('/front_office/checkins?success=Check-in recorded successfully')
#             elif action == 'checkout':
#                 c.execute('UPDATE checkins SET checkout_time = ?, status = "Checked Out" WHERE member_id = ? AND checkout_time IS NULL', 
#                           (current_time, member_id))
#                 conn.commit()
#                 return redirect('/front_office/checkins?success=Check-out recorded successfully')
        
#         # Get today's check-ins - use current date
#         from datetime import datetime
#         today = datetime.now().strftime('%Y-%m-%d')
        
#         c.execute('''SELECT c.*, m.first_name, m.last_name
#                     FROM checkins c
#                     JOIN members m ON c.member_id = m.id
#                     WHERE date(c.checkin_time) = ?
#                     ORDER BY c.checkin_time DESC''', (today,))
        
#         checkins = c.fetchall()
        
#         # Get all members for dropdown
#         c.execute('SELECT id, first_name, last_name FROM members ORDER BY first_name')
#         members = c.fetchall()
#         conn.close()
        
#         return render_template('front_office_checkins.html', front_office=front_office, checkins=checkins, members=members)
#     except Exception as e:
#         logger.error(f"Error in front office checkins route: {e}")
#         return render_template('front_office_checkins.html', error=f"Failed to load check-ins: {str(e)}")
# @app.route('/front_office/appointments', methods=['GET', 'POST'])
# def front_office_appointments():
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get front office details
#         c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
#         front_office = c.fetchone()
        
#         if request.method == 'POST':
#             # Book appointment from front office
#             member_id = request.form['member_id']
#             doctor_id = request.form['doctor_id']
#             date = request.form['date']
#             slot_id = request.form['slot_id']
            
#             # Verify slot is available
#             c.execute('SELECT booked FROM slots WHERE id = ?', (slot_id,))
#             slot = c.fetchone()
            
#             if slot and slot['booked'] == 0:
#                 c.execute('UPDATE slots SET booked = 1 WHERE id = ?', (slot_id,))
#                 c.execute('INSERT INTO appointments (member_id, slot_id) VALUES (?, ?)', (member_id, slot_id))
#                 conn.commit()
#                 return redirect('/front_office/appointments?success=Appointment booked successfully')
#             else:
#                 return render_template('front_office_appointments.html', error="Selected slot is no longer available")
        
#         # Get all appointments
#         c.execute('''SELECT a.id, m.first_name, m.last_name, d.name as doctor_name, s.slot_time, s.booked as status
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     JOIN doctors d ON s.doctor_id = d.id 
#                     JOIN members m ON a.member_id = m.id 
#                     ORDER BY s.slot_time DESC''')
        
#         appointments = c.fetchall()
        
#         # Get members for dropdown
#         c.execute('SELECT id, first_name, last_name FROM members ORDER BY first_name')
#         members = c.fetchall()
        
#         # Get doctors for dropdown
#         c.execute('SELECT id, name FROM doctors ORDER BY name')
#         doctors = c.fetchall()
#         conn.close()
        
#         return render_template('front_office_appointments.html', front_office=front_office, appointments=appointments, members=members, doctors=doctors)
#     except Exception as e:
#         logger.error(f"Error in front office appointments route: {e}")
#         return render_template('front_office_appointments.html', error=f"Failed to load appointments: {str(e)}")

# @app.route('/front_office/patients')
# def front_office_patients():
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get front office details
#         c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
#         front_office = c.fetchone()
        
#         # Get all patients
#         c.execute('''SELECT m.*, f.id as family_id, 
#                     (SELECT COUNT(*) FROM appointments a WHERE a.member_id = m.id) as appointment_count,
#                     (SELECT COUNT(*) FROM medical_records mr WHERE mr.member_id = m.id) as record_count
#                     FROM members m
#                     JOIN families f ON m.family_id = f.id
#                     ORDER BY m.first_name''')
        
#         patients = c.fetchall()
#         conn.close()
        
#         return render_template('front_office_patients.html', front_office=front_office, patients=patients)
#     except Exception as e:
#         logger.error(f"Error in front office patients route: {e}")
#         return render_template('front_office_patients.html', error=f"Failed to load patients: {str(e)}")

# @app.route('/front_office/payments')
# def front_office_payments():
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get front office details
#         c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
#         front_office = c.fetchone()
        
#         # Get all bills
#         c.execute('''SELECT b.*, m.first_name, m.last_name
#                     FROM bills b
#                     JOIN members m ON b.member_id = m.id
#                     ORDER BY b.bill_date DESC''')
        
#         bills = c.fetchall()
#         conn.close()
        
#         return render_template('front_office_payments.html', front_office=front_office, bills=bills)
#     except Exception as e:
#         logger.error(f"Error in front office payments route: {e}")
#         return render_template('front_office_payments.html', error=f"Failed to load payments: {str(e)}")

# @app.route('/front_office/reports')
# def front_office_reports():
#     if 'family_id' not in session or session.get('user_type') != 'front_office':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get front office details
#         c.execute('SELECT * FROM front_office WHERE family_id = ?', (uid,))
#         front_office = c.fetchone()
        
#         # Get report data
#         from datetime import datetime, timedelta
#         today = datetime.now().strftime('%Y-%m-%d')
#         last_week = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        
#         # Daily appointments
#         c.execute('''SELECT COUNT(*) as count 
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     WHERE date(s.slot_time) = ?''', (today,))
#         daily_appointments = c.fetchone()['count']
        
#         # Weekly appointments
#         c.execute('''SELECT COUNT(*) as count 
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     WHERE date(s.slot_time) BETWEEN ? AND ?''', (last_week, today))
#         weekly_appointments = c.fetchone()['count']
        
#         # Daily revenue
#         c.execute('''SELECT COALESCE(SUM(amount), 0) as total 
#                     FROM bills 
#                     WHERE date(bill_date) = ? AND status = "Paid"''', (today,))
#         daily_revenue = c.fetchone()['total']
        
#         # Weekly revenue
#         c.execute('''SELECT COALESCE(SUM(amount), 0) as total 
#                     FROM bills 
#                     WHERE date(bill_date) BETWEEN ? AND ? AND status = "Paid"''', (last_week, today))
#         weekly_revenue = c.fetchone()['total']
        
#         # New patients this week
#         c.execute('''SELECT COUNT(*) as count 
#                     FROM members 
#                     WHERE date(created_date) BETWEEN ? AND ?''', (last_week, today))
#         new_patients = c.fetchone()['count']
        
#         conn.close()
        
#         return render_template('front_office_reports.html', 
#                               front_office=front_office,
#                               daily_appointments=daily_appointments,
#                               weekly_appointments=weekly_appointments,
#                               daily_revenue=daily_revenue,
#                               weekly_revenue=weekly_revenue,
#                               new_patients=new_patients)
#     except Exception as e:
        logger.error(f"Error in front office reports route: {e}")
        return render_template('front_office_reports.html', error=f"Failed to load reports: {str(e)}")
# @app.route('/login', methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         try:
#             uid = request.form['family_id']
#             # Check if this is an admin login
#             if uid.startswith('ADMIN'):
#                 return redirect('/admin/login')

#             conn = get_db()
#             c = conn.cursor()
#             # Check if family ID exists and get user type
#             c.execute('''SELECT f.id, ut.type_name 
#                       FROM families f 
#                       JOIN user_types ut ON f.user_type = ut.id 
#                       WHERE f.id = ?''', (uid,))
#             result = c.fetchone()
            
#             if result:
#                 session['family_id'] = uid
#                 session['user_type'] = result['type_name']
                
#                 # For patients, also check if they have a member record
#                 if result['type_name'] == 'patient':
#                     c.execute('SELECT * FROM members WHERE family_id = ?', (uid,))
#                     member = c.fetchone()
#                     if not member:
#                         conn.close()
#                         session.clear()
#                         return render_template('login.html', error='No patient record found for this Family ID')
                
#                 # Redirect to appropriate dashboard
#                 if result['type_name'] == 'patient':
#                     return redirect('/patient_dashboard')
#                 elif result['type_name'] == 'doctor':
#                     return redirect('/doctor_dashboard')
#                 elif result['type_name'] == 'front_office':
#                     return redirect('/front_office_dashboard')
#             else:
#                 return render_template('login.html', error='Invalid Family ID')
#             conn.close()
#         except Exception as e:
#             logger.error(f"Error in login route: {e}")
#             return render_template('login.html', error=f"Login failed: {str(e)}")
    
#     # Show success message if redirected from registration
#     message = request.args.get('message', '')
#     return render_template('login.html', message=message)
# In your main Flask app file (app.py or similar)

import traceback

@app.route('/view_appointment/<int:appointment_id>')
def view_appointment(appointment_id):
    if 'family_id' not in session or session.get('user_type') not in ['patient', 'doctor', 'front_office']:
        return redirect('/')

    try:
        conn = get_db()
        c = conn.cursor()
        
        # Fetch appointment details with patient and doctor information
        c.execute('''SELECT 
            a.status, 
            s.slot_time, 
            d.name as doctor_name, 
            d.specialty, 
            m.first_name, 
            m.last_name, 
            m.age, 
            m.gender, 
            m.phone, 
            m.email
            FROM appointments a
            JOIN slots s ON a.slot_id = s.id
            JOIN doctors d ON s.doctor_id = d.id
            JOIN members m ON a.member_id = m.id
            WHERE a.id = ? AND (m.family_id = ? OR d.id IN (SELECT id FROM doctors WHERE family_id = ?))''',
                  (appointment_id, session['family_id'], session['family_id']))
        appointment = c.fetchone()
        
        if not appointment:
            conn.close()
            return redirect('/patient_dashboard#appointments?error=Appointment not found')
        
        # Convert row to dict for template
        appointment = dict(appointment)
        logger.debug(f"Appointment data: {appointment}")
        conn.close()
        return render_template('view_appointment.html', appointment=appointment)

    except Exception as e:
        logger.error(f"Error in view_appointment route: {e}")
        return redirect('/patient_dashboard#appointments?error=Failed to view appointment')
    
@app.route('/reschedule_appointment/<int:appointment_id>')
def reschedule_appointment(appointment_id):
    if 'family_id' not in session or session.get('user_type') != 'patient':
        return redirect('/')
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get current appointment details
        c.execute('''SELECT a.id, a.member_id, a.slot_id, m.first_name, m.last_name,
                    d.name as doctor_name, d.id as doctor_id, s.slot_time
                    FROM appointments a 
                    JOIN slots s ON a.slot_id = s.id 
                    JOIN doctors d ON s.doctor_id = d.id 
                    JOIN members m ON a.member_id = m.id 
                    WHERE a.id = ? AND m.family_id = ? AND a.status = "Scheduled"''', 
                 (appointment_id, session['family_id']))
        
        appointment = c.fetchone()
        
        if not appointment:
            conn.close()
            return redirect('/patient_dashboard#appointments?error=Appointment not found or cannot be rescheduled')
        
        # Extract date from the current slot
        from datetime import datetime
        slot_datetime = datetime.strptime(appointment['slot_time'], '%Y-%m-%d %H:%M:%S')
        slot_date = slot_datetime.strftime('%Y-%m-%d')
        
        conn.close()
        
        # Redirect to book appointment page with pre-filled data
        return redirect(url_for('book_appointment', 
                              member_id=appointment['member_id'],
                              doctor_id=appointment['doctor_id'],
                              date=slot_date,
                              appointment_id=appointment_id))
        
    except Exception as e:
        logger.error(f"Error redirecting to reschedule: {e}")
        return redirect('/patient_dashboard#appointments?error=Failed to reschedule appointment')
    
@app.route('/cancel_appointment/<int:appointment_id>')
def cancel_appointment(appointment_id):
    if 'family_id' not in session:
        return redirect('/')
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get appointment details to free up the slot
        c.execute('''SELECT a.slot_id, m.family_id
                    FROM appointments a 
                    JOIN members m ON a.member_id = m.id 
                    WHERE a.id = ? AND m.family_id = ?''', (appointment_id, session['family_id']))
        
        appointment = c.fetchone()
        
        if not appointment:
            conn.close()
            return redirect('/patient_dashboard#appointments?error=Appointment not found')
        
        # Free up the slot
        c.execute('UPDATE slots SET booked = 0 WHERE id = ?', (appointment['slot_id'],))
        
        # Delete the appointment
        c.execute('DELETE FROM appointments WHERE id = ?', (appointment_id,))
        
        conn.commit()
        conn.close()
        return redirect('/patient_dashboard#appointments?success=Appointment cancelled successfully')
    except Exception as e:
        logger.error(f"Error cancelling appointment: {e}")
        return redirect('/patient_dashboard#appointments?error=Failed to cancel appointment')
       
from flask import session, jsonify


# Add these routes to your app.py
@app.route('/doctor/medical_records')
def doctor_medical_records():
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return redirect('/')
    
    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()
        
        # Get doctor details
        c.execute('SELECT * FROM doctors WHERE family_id = ?', (uid,))
        doctor = c.fetchone()
        
        # Get medical records for all patients who have appointments with this doctor
        c.execute('''SELECT mr.*, m.first_name, m.last_name 
                    FROM medical_records mr
                    JOIN members m ON mr.member_id = m.id
                    WHERE m.id IN (
                        SELECT DISTINCT a.member_id 
                        FROM appointments a 
                        JOIN slots s ON a.slot_id = s.id 
                        WHERE s.doctor_id = (SELECT id FROM doctors WHERE family_id = ?)
                    )
                    ORDER BY mr.record_date DESC''', (uid,))
        
        medical_records = c.fetchall()
        
        conn.close()
        
        return render_template('doctor_medical_records.html', 
                              doctor=doctor,
                              medical_records=medical_records,
                              current_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    except Exception as e:
        logger.error(f"Error in doctor medical records route: {e}")
        return render_template('doctor_medical_records.html', error=f"Failed to load medical records: {str(e)}")
import os


# Updated upload route to store files in uploads directory

    
@app.route('/create_bill', methods=['POST'])
def create_bill():
    if 'family_id' not in session or session.get('user_type') != 'front_office':
        return redirect('/')
    
    try:
        member_id = request.form['member_id']
        amount = float(request.form['amount'])
        description = request.form['description']
        
        from datetime import datetime
        bill_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        conn = get_db()
        c = conn.cursor()
        c.execute('''INSERT INTO bills (member_id, bill_date, amount, description)
                    VALUES (?, ?, ?, ?)''',
                  (member_id, bill_date, amount, description))
        conn.commit()
        conn.close()
        
        return redirect('/front_office/payments?success=Bill created successfully')
    except Exception as e:
        logger.error(f"Error creating bill: {e}")
        return redirect('/front_office/payments?error=Failed to create bill')
    
@app.route('/pay_bill/<int:bill_id>')
def pay_bill(bill_id):
    if 'family_id' not in session:
        return redirect('/')
    
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('UPDATE bills SET status = "Paid" WHERE id = ?', (bill_id,))
        conn.commit()
        conn.close()
        
        if session.get('user_type') == 'patient':
            return redirect('/patient_dashboard#billing?success=Bill paid successfully')
        else:
            return redirect('/front_office/payments?success=Bill marked as paid')
    except Exception as e:
        logger.error(f"Error paying bill: {e}")
        if session.get('user_type') == 'patient':
            return redirect('/patient_dashboard#billing?error=Failed to pay bill')
        else:
            return redirect('/front_office/payments?error=Failed to update bill status')

@app.route('/update_appointment_status/<int:appointment_id>/<status>')
def update_appointment_status(appointment_id, status):
    if 'family_id' not in session:
        return redirect('/')
    
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Get slot ID from appointment
        c.execute('SELECT slot_id FROM appointments WHERE id = ?', (appointment_id,))
        appointment = c.fetchone()
        
        if appointment:
            # Update slot status
            c.execute('UPDATE slots SET booked = ? WHERE id = ?', (status, appointment['slot_id']))
            conn.commit()
        
        conn.close()
        
        if session.get('user_type') == 'doctor':
            return redirect('/doctor/appointments?success=Appointment status updated')
        else:
            return redirect('/front_office/appointments?success=Appointment status updated')
    except Exception as e:
        logger.error(f"Error updating appointment status: {e}")
        if session.get('user_type') == 'doctor':
            return redirect('/doctor/appointments?error=Failed to update appointment status')
        else:
            return redirect('/front_office/appointments?error=Failed to update appointment status')


@app.route('/check_db_structure')
def check_db_structure():
    """Check if database has the correct structure"""
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Check appointments table
        c.execute("PRAGMA table_info(appointments)")
        appointments_columns = c.fetchall()
        
        # Check slots table
        c.execute("PRAGMA table_info(slots)")
        slots_columns = c.fetchall()
        
        conn.close()
        
        return f"""
        <h1>Database Structure Check</h1>
        <h2>Appointments Table Columns</h2>
        <pre>{json.dumps([dict(col) for col in appointments_columns], indent=2)}</pre>
        
        <h2>Slots Table Columns</h2>
        <pre>{json.dumps([dict(col) for col in slots_columns], indent=2)}</pre>
        """
    except Exception as e:
        return f"Error checking database structure: {str(e)}"
    

# Add these updated routes to your app.py file

# @app.route('/doctor/view_patient_by_id/<int:patient_id>')
# def doctor_view_patient_by_id(patient_id):
#     """View patient details by patient ID (for patient list view)"""
#     if 'family_id' not in session or session.get('user_type') != 'doctor':
#         return redirect('/')
    
#     try:
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get doctor details
#         c.execute('SELECT id FROM doctors WHERE family_id = ?', (session['family_id'],))
#         doctor = c.fetchone()
        
#         if not doctor:
#             conn.close()
#             return redirect('/doctor/patients?error=Doctor not found')
        
#         doctor_id = doctor['id']
        
#         # Get patient details
#         c.execute('''SELECT 
#             m.id as patient_id,
#             m.first_name, 
#             m.middle_name,
#             m.last_name, 
#             m.age, 
#             m.gender, 
#             m.phone, 
#             m.email,
#             m.aadhar,
#             m.address,
#             m.prev_problem,
#             m.curr_problem,
#             m.created_date as registration_date
#             FROM members m
#             WHERE m.id = ?''', (patient_id,))
        
#         patient = c.fetchone()
        
#         if not patient:
#             conn.close()
#             return redirect('/doctor/patients?error=Patient not found')
        
#         # Check if this patient has had appointments with this doctor
#         c.execute('''SELECT COUNT(*) as count
#                     FROM appointments a 
#                     JOIN slots s ON a.slot_id = s.id 
#                     WHERE a.member_id = ? AND s.doctor_id = ?''', (patient_id, doctor_id))
        
#         has_appointments = c.fetchone()['count'] > 0
        
#         if not has_appointments:
#             conn.close()
#             return redirect('/doctor/patients?error=No appointments found with this patient')
        
#         # Get patient's medical history
#         c.execute('''SELECT record_type, record_date, description, file_path
#                     FROM medical_records 
#                     WHERE member_id = ? 
#                     ORDER BY record_date DESC LIMIT 10''', 
#                  (patient_id,))
#         medical_history = c.fetchall()
        
#         # Get patient's previous appointments with this doctor
#         c.execute('''SELECT a.id, s.slot_time, a.status
#                     FROM appointments a
#                     JOIN slots s ON a.slot_id = s.id
#                     WHERE a.member_id = ? AND s.doctor_id = ?
#                     ORDER BY s.slot_time DESC LIMIT 5''',
#                  (patient_id, doctor_id))
#         previous_appointments = c.fetchall()
        
#         # Get patient's prescriptions from this doctor with frequency and duration
#         try:
#             c.execute('''SELECT prescription_date, medication, dosage, frequency, duration, 
#                         instructions, notes, d.name as doctor_name
#                         FROM prescriptions p
#                         JOIN doctors d ON p.doctor_id = d.id
#                         WHERE p.member_id = ? AND p.doctor_id = ?
#                         ORDER BY p.prescription_date DESC LIMIT 5''',
#                      (patient_id, doctor_id))
#             prescriptions = c.fetchall()
#         except Exception as e:
#             logger.error(f"Error fetching prescriptions: {e}")
#             prescriptions = []
        
#         # Get doctor info for the template
#         c.execute('SELECT name, specialty FROM doctors WHERE id = ?', (doctor_id,))
#         doctor_info = c.fetchone()
        
#         conn.close()
        
#         # Create a fake appointment object for template compatibility
#         appointment_data = {
#             'patient_id': patient['patient_id'],
#             'first_name': patient['first_name'],
#             'middle_name': patient['middle_name'],
#             'last_name': patient['last_name'],
#             'age': patient['age'],
#             'gender': patient['gender'],
#             'phone': patient['phone'],
#             'email': patient['email'],
#             'aadhar': patient['aadhar'],
#             'address': patient['address'],
#             'prev_problem': patient['prev_problem'],
#             'curr_problem': patient['curr_problem'],
#             'registration_date': patient['registration_date'],
#             'doctor_name': doctor_info['name'] if doctor_info else 'Unknown',
#             'specialty': doctor_info['specialty'] if doctor_info else 'Unknown',
#             'slot_time': 'Multiple appointments',
#             'status': 'Patient Record View'
#         }
        
#         return render_template('doctor_view_patient.html', 
#                               appointment=appointment_data,
#                               medical_history=medical_history,
#                               previous_appointments=previous_appointments,
#                               prescriptions=prescriptions,
#                               doctor=doctor_info,
#                               is_patient_view=True)  # Flag to indicate this is patient view
        
#     except Exception as e:
#         logger.error(f"Error in doctor_view_patient_by_id route: {e}")
#         import traceback
#         logger.error(traceback.format_exc())
#         return redirect('/doctor/patients?error=Failed to load patient details')
# @app.route('/doctor/view_today_appointment/<int:appointment_id>')
# def doctor_view_today_appointment(appointment_id):
#     """View patient details from today's appointments using appointment ID"""
#     if 'family_id' not in session or session.get('user_type') != 'doctor':
#         return redirect('/')
    
#     try:
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get doctor details
#         c.execute('SELECT id FROM doctors WHERE family_id = ?', (session['family_id'],))
#         doctor = c.fetchone()
        
#         if not doctor:
#             conn.close()
#             return redirect('/doctor_dashboard?error=Doctor not found')
        
#         doctor_id = doctor['id']
        
#         # Get today's date
#         from datetime import datetime
#         today = datetime.now().strftime('%Y-%m-%d')
        
#         # Get today's appointment
#         c.execute('''SELECT 
#             a.id as appointment_id,
#             a.status, 
#             s.slot_time, 
#             d.name as doctor_name, 
#             d.specialty, 
#             m.id as patient_id,
#             m.first_name, 
#             m.middle_name,
#             m.last_name, 
#             m.age, 
#             m.gender, 
#             m.phone, 
#             m.email,
#             m.aadhar,
#             m.address,
#             m.prev_problem,
#             m.curr_problem,
#             m.created_date as registration_date
#             FROM appointments a
#             JOIN slots s ON a.slot_id = s.id
#             JOIN doctors d ON s.doctor_id = d.id
#             JOIN members m ON a.member_id = m.id
#             WHERE a.id = ? AND d.id = ? AND date(s.slot_time) = ?''', 
#                  (appointment_id, doctor_id, today))
        
#         appointment = c.fetchone()
        
#         if not appointment:
#             conn.close()
#             return redirect('/doctor_dashboard?error=No appointment found for today')
        
#         # Get patient's medical history
#         c.execute('''SELECT record_type, record_date, description, file_path
#                     FROM medical_records 
#                     WHERE member_id = ? 
#                     ORDER BY record_date DESC LIMIT 10''', 
#                  (appointment['patient_id'],))
#         medical_history = c.fetchall()
        
#         # Get patient's previous appointments with this doctor
#         c.execute('''SELECT a.id, s.slot_time, a.status
#                     FROM appointments a
#                     JOIN slots s ON a.slot_id = s.id
#                     WHERE a.member_id = ? AND s.doctor_id = ? AND a.id != ?
#                     ORDER BY s.slot_time DESC LIMIT 5''',
#                  (appointment['patient_id'], doctor_id, appointment['appointment_id']))
#         previous_appointments = c.fetchall()
        
#         # Get patient's prescriptions from this doctor with frequency and duration
#         try:
#             c.execute('''SELECT prescription_date, medication, dosage, frequency, duration, 
#                         instructions, notes, d.name as doctor_name
#                         FROM prescriptions p
#                         JOIN doctors d ON p.doctor_id = d.id
#                         WHERE p.member_id = ? AND p.doctor_id = ?
#                         ORDER BY p.prescription_date DESC LIMIT 5''',
#                      (appointment['patient_id'], doctor_id))
#             prescriptions = c.fetchall()
#         except Exception as e:
#             logger.error(f"Error fetching prescriptions: {e}")
#             prescriptions = []
        
#         conn.close()
        
#         # Also pass doctor info to the template for the navbar
#         doctor_info = {'name': appointment['doctor_name']}
        
#         return render_template('doctor_view_patient.html', 
#                               appointment=dict(appointment),
#                               medical_history=medical_history,
#                               previous_appointments=previous_appointments,
#                               prescriptions=prescriptions,
#                               doctor=doctor_info)
        
#     except Exception as e:
#         logger.error(f"Error in doctor_view_today_appointment route: {e}")
#         import traceback
#         logger.error(traceback.format_exc())
#         return redirect('/doctor_dashboard?error=Failed to load patient details')


# @app.route('/doctor/add_prescription', methods=['POST'])
# def doctor_add_prescription():
#     if 'family_id' not in session or session.get('user_type') != 'doctor':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get doctor details
#         c.execute('SELECT id FROM doctors WHERE family_id = ?', (uid,))
#         doctor = c.fetchone()
        
#         if not doctor:
#             conn.close()
#             return redirect('/doctor_dashboard?error=Doctor not found')
        
#         # Get form data
#         member_id = request.form['member_id']
#         medication = request.form['medication']
#         dosage = request.form['dosage']
#         frequency = request.form.get('frequency', '')
#         duration = request.form.get('duration', '')
#         instructions = request.form.get('instructions', '')
#         notes = request.form.get('notes', '')
#         appointment_id = request.form.get('appointment_id', '')
        
#         # Combine frequency, duration, and instructions
#         full_instructions = []
#         if frequency:
#             full_instructions.append(f"Frequency: {frequency}")
#         if duration:
#             full_instructions.append(f"Duration: {duration}")
#         if instructions:
#             full_instructions.append(f"Instructions: {instructions}")
#         if notes:
#             full_instructions.append(f"Notes: {notes}")
        
#         combined_instructions = "; ".join(full_instructions) if full_instructions else "No special instructions"
        
#         from datetime import datetime
#         prescription_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
#         # Insert prescription
#         c.execute('''INSERT INTO prescriptions (member_id, doctor_id, prescription_date, medication, dosage, instructions)
#                     VALUES (?, ?, ?, ?, ?, ?)''',
#                   (member_id, doctor['id'], prescription_date, medication, dosage, combined_instructions))
#         conn.commit()
#         conn.close()
        
#         # Redirect back to patient view
#         if appointment_id:
#             return redirect(f'/doctor/view_patient/{appointment_id}?success=Prescription added successfully')
#         else:
#             return redirect(f'/doctor/view_patient_by_id/{member_id}?success=Prescription added successfully')
            
#     except Exception as e:
#         logger.error(f"Error adding prescription: {e}")
#         return redirect('/doctor_dashboard?error=Failed to add prescription')


# @app.route('/doctor/add_prescription_dashboard', methods=['POST'])
# def doctor_add_prescription_dashboard():
#     if 'family_id' not in session or session.get('user_type') != 'doctor':
#         return redirect('/')
    
#     try:
#         uid = session['family_id']
#         conn = get_db()
#         c = conn.cursor()
        
#         # Get doctor details
#         c.execute('SELECT id FROM doctors WHERE family_id = ?', (uid,))
#         doctor = c.fetchone()
        
#         if not doctor:
#             conn.close()
#             return redirect('/doctor_dashboard?error=Doctor not found')
        
#         # Get form data
#         member_id = request.form['member_id']
#         medication = request.form['medication']
#         dosage = request.form['dosage']
#         frequency = request.form.get('frequency', '')
#         duration = request.form.get('duration', '')
#         instructions = request.form.get('instructions', '')
#         notes = request.form.get('notes', '')
        
#         from datetime import datetime
#         prescription_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
#         # Insert prescription with separate frequency and duration fields
#         c.execute('''INSERT INTO prescriptions (member_id, doctor_id, prescription_date, medication, dosage, 
#                     frequency, duration, instructions, notes)
#                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
#                   (member_id, doctor['id'], prescription_date, medication, dosage, 
#                    frequency, duration, instructions, notes))
#         conn.commit()
#         conn.close()
        
#         return redirect('/doctor_dashboard?success=Prescription added successfully')
            
#     except Exception as e:
#         logger.error(f"Error adding prescription: {e}")
#         return redirect('/doctor_dashboard?error=Failed to add prescription')



# @app.route('/doctor/add_prescription_patients', methods=['POST'])
# def doctor_add_prescription_patients():
    if 'family_id' not in session or session.get('user_type') != 'doctor':
        return redirect('/')
    
    try:
        uid = session['family_id']
        conn = get_db()
        c = conn.cursor()
        
        # Get doctor details
        c.execute('SELECT id FROM doctors WHERE family_id = ?', (uid,))
        doctor = c.fetchone()
        
        if not doctor:
            conn.close()
            return redirect('/doctor/patients?error=Doctor not found')
        
        # Get form data
        member_id = request.form['member_id']
        medication = request.form['medication']
        dosage = request.form['dosage']
        frequency = request.form.get('frequency', '')
        duration = request.form.get('duration', '')
        instructions = request.form.get('instructions', '')
        notes = request.form.get('notes', '')
        
        from datetime import datetime
        prescription_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Insert prescription with separate frequency and duration fields
        c.execute('''INSERT INTO prescriptions (member_id, doctor_id, prescription_date, medication, dosage, 
                    frequency, duration, instructions, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (member_id, doctor['id'], prescription_date, medication, dosage, 
                   frequency, duration, instructions, notes))
        conn.commit()
        conn.close()
        
        return redirect('/doctor/patients?success=Prescription added successfully')
            
    except Exception as e:
        logger.error(f"Error adding prescription: {e}")
        return redirect('/doctor/patients?error=Failed to add prescription')


import sys
import flask
import os
import time

@app.route('/admin/settings')
def admin_settings():
    if 'user_type' not in session or session.get('user_type') != 'admin':
        return redirect('/admin/login')
    
    # Get system information
    python_version = sys.version
    flask_version = flask.__version__
    
    # Get database size
    db_size = "0 MB"
    if os.path.exists(DATABASE):
        db_size = f"{os.path.getsize(DATABASE) / (1024 * 1024):.2f} MB"
    
    # Calculate uptime (simplified)
    uptime = "Always up"  # In a real app, you'd calculate this
    
    return render_template('admin/admin_settings.html', 
                          python_version=python_version,
                          flask_version=flask_version,
                          db_size=db_size,
                          uptime=uptime)





# Admin Api's
# -------------

# from flask import session
# from flask import jsonify, request, session
# import sqlite3

# def get_db():
#     conn = sqlite3.connect('hospital1.db')  # Replace with your DB file path
#     return conn
# def is_admin():
#     """Check if the current user is an admin based on session."""
#     return session.get('user_type') == 'admin'
# @app.route('/api/admin/members', methods=['GET'])
# def api_admin_members_list():
#     if not is_admin():
#         return jsonify({'success': False, 'error': 'Unauthorized'}), 401
#     conn = get_db()
#     c = conn.cursor()
#     page = int(request.args.get('page', 1))
#     per_page = int(request.args.get('perPage', 10))
#     sort_field = request.args.get('sort', 'id')
#     sort_order = request.args.get('order', 'ASC')
#     filter_str = request.args.get('filter', '{}')
#     filters = json.loads(filter_str)

#     where_clauses = []
#     params = []
#     for key, value in filters.items():
#         where_clauses.append(f"{key} LIKE ?")
#         params.append(f"%{value}%")

#     where_sql = ' WHERE ' + ' AND '.join(where_clauses) if where_clauses else ''
#     c.execute(f'SELECT COUNT(*) FROM members{where_sql}', params)
#     total = c.fetchone()[0]

#     offset = (page - 1) * per_page
#     c.execute(f'''SELECT id, family_id, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address
#                   FROM members{where_sql}
#                   ORDER BY {sort_field} {sort_order}
#                   LIMIT ? OFFSET ?''', (*params, per_page, offset))
#     members = [dict(zip([description[0] for description in c.description], row)) for row in c.fetchall()]

#     conn.close()
#     return jsonify({'data': members, 'total': total})
# # @app.route('/api/admin/members', methods=['GET'])
# # def api_admin_members_list():
# #     print("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
# #     if not is_admin():
# #         return jsonify({'success': False, 'error': 'Unauthorized'}), 401
# #     conn = get_db()
# #     c = conn.cursor()
# #     page = int(request.args.get('page', 1))
# #     per_page = int(request.args.get('perPage', 10))
# #     sort_field = request.args.get('sort', 'id')
# #     sort_order = request.args.get('order', 'ASC')
# #     filter_str = request.args.get('filter', '{}')
# #     filters = json.loads(filter_str)

# #     where_clauses = []
# #     params = []
# #     for key, value in filters.items():
# #         where_clauses.append(f"{key} LIKE ?")
# #         params.append(f"%{value}%")

# #     where_sql = ' WHERE ' + ' AND '.join(where_clauses) if where_clauses else ''
# #     c.execute(f'SELECT COUNT(*) FROM members{where_sql}', params)
# #     total = c.fetchone()[0]

# #     offset = (page - 1) * per_page
# #     c.execute(f'''SELECT id, family_id, first_name, middle_name, last_name, age, gender, phone, email, aadhar, address
# #                   FROM members{where_sql}
# #                   ORDER BY {sort_field} {sort_order}
# #                   LIMIT ? OFFSET ?''', (*params, per_page, offset))
# #     members = [dict(zip([description[0] for description in c.description], row)) for row in c.fetchall()]

# #     conn.close()
# #     return jsonify({'data': members, 'total': total})

# @app.route('/api/admin/appointments', methods=['GET'])
# def api_admin_appointments_list():
#     if not is_admin():
#         return jsonify({'success': False, 'error': 'Unauthorized'}), 401
#     conn = get_db()
#     c = conn.cursor()
#     page = int(request.args.get('page', 1))
#     per_page = int(request.args.get('perPage', 10))
#     sort_field = request.args.get('sort', 'id')
#     sort_order = request.args.get('order', 'ASC')
#     filter_str = request.args.get('filter', '{}')
#     filters = json.loads(filter_str)

#     where_clauses = []
#     params = []
#     for key, value in filters.items():
#         where_clauses.append(f"{key} LIKE ?")
#         params.append(f"%{value}%")

#     where_sql = ' WHERE ' + ' AND '.join(where_clauses) if where_clauses else ''
#     c.execute(f'SELECT COUNT(*) FROM appointments{where_sql}', params)
#     total = c.fetchone()[0]

#     offset = (page - 1) * per_page
#     c.execute(f'''SELECT id, member_id, slot_id, status
#                   FROM appointments{where_sql}
#                   ORDER BY {sort_field} {sort_order}
#                   LIMIT ? OFFSET ?''', (*params, per_page, offset))
#     appointments = [dict(zip([description[0] for description in c.description], row)) for row in c.fetchall()]

#     conn.close()
#     return jsonify({'data': appointments, 'total': total})

if __name__ == '__main__':
    app.run(debug=True)