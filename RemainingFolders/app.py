from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from datetime import date
import os
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-12345'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hospital.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String(50), unique=True, nullable=False)
    user_type = db.Column(db.String(20), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(15))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    aadhar = db.Column(db.String(12))
    address = db.Column(db.Text)
    prev_problem = db.Column(db.Text)
    curr_problem = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'family_id': self.family_id,
            'user_type': self.user_type,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'age': self.age,
            'gender': self.gender,
            'aadhar': self.aadhar,
            'address': self.address,
            'prev_problem': self.prev_problem,
            'curr_problem': self.curr_problem
        }

class FamilyMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String(50), db.ForeignKey('user.family_id'))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(15))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    aadhar = db.Column(db.String(12))
    address = db.Column(db.Text)
    prev_problem = db.Column(db.Text)
    curr_problem = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'family_id': self.family_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'age': self.age,
            'gender': self.gender,
            'aadhar': self.aadhar,
            'address': self.address,
            'prev_problem': self.prev_problem,
            'curr_problem': self.curr_problem
        }

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    specialty = db.Column(db.String(50))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(15))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'specialty': self.specialty,
            'email': self.email,
            'phone': self.phone
        }

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String(50), db.ForeignKey('user.family_id'))
    member_id = db.Column(db.Integer, db.ForeignKey('family_member.id'))
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'))
    date = db.Column(db.String(10))
    time = db.Column(db.String(10))
    status = db.Column(db.String(20), default='Scheduled')

    def to_dict(self):
        member = FamilyMember.query.get(self.member_id)
        doctor = Doctor.query.get(self.doctor_id)
        return {
            'id': self.id,
            'family_id': self.family_id,
            'member_id': self.member_id,
            'patient_name': f"{member.first_name} {member.last_name}" if member else 'Unknown',
            'doctor_id': self.doctor_id,
            'doctor_name': doctor.name if doctor else 'Unknown',
            'date': self.date,
            'time': self.time,
            'status': self.status
        }

class MedicalRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String(50), db.ForeignKey('user.family_id'))
    member_id = db.Column(db.Integer, db.ForeignKey('family_member.id'))
    record_type = db.Column(db.String(50))
    record_date = db.Column(db.String(10))
    description = db.Column(db.Text)
    file_path = db.Column(db.String(200))

    def to_dict(self):
        member = FamilyMember.query.get(self.member_id)
        return {
            'id': self.id,
            'family_id': self.family_id,
            'member_id': self.member_id,
            'patient_name': f"{member.first_name} {member.last_name}" if member else 'Unknown',
            'record_type': self.record_type,
            'record_date': self.record_date,
            'description': self.description,
            'file_path': self.file_path
        }

class Bill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String(50), db.ForeignKey('user.family_id'))
    member_id = db.Column(db.Integer, db.ForeignKey('family_member.id'))
    bill_id = db.Column(db.String(50))
    amount = db.Column(db.Float)
    status = db.Column(db.String(20), default='Pending')
    date = db.Column(db.String(10))

    def to_dict(self):
        member = FamilyMember.query.get(self.member_id)
        return {
            'id': self.id,
            'family_id': self.family_id,
            'member_id': self.member_id,
            'patient_name': f"{member.first_name} {member.last_name}" if member else 'Unknown',
            'bill_id': self.bill_id,
            'amount': self.amount,
            'status': self.status,
            'date': self.date
        }

class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'))
    member_id = db.Column(db.Integer, db.ForeignKey('family_member.id'))
    medication = db.Column(db.String(100))
    dosage = db.Column(db.String(50))
    instructions = db.Column(db.Text)
    date = db.Column(db.String(10))

    def to_dict(self):
        member = FamilyMember.query.get(self.member_id)
        doctor = Doctor.query.get(self.doctor_id)
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'member_id': self.member_id,
            'patient_name': f"{member.first_name} {member.last_name}" if member else 'Unknown',
            'doctor_name': doctor.name if doctor else 'Unknown',
            'medication': self.medication,
            'dosage': self.dosage,
            'instructions': self.instructions,
            'date': self.date
        }

class Slot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'))
    date = db.Column(db.String(10))
    time = db.Column(db.String(10))
    status = db.Column(db.String(20), default='Available')

    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'date': self.date,
            'time': self.time,
            'status': self.status
        }

class CheckIn(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointment.id'))
    date = db.Column(db.String(10))
    time = db.Column(db.String(10))
    status = db.Column(db.String(20), default='Pending')

    def to_dict(self):
        appointment = Appointment.query.get(self.appointment_id)
        member = FamilyMember.query.get(appointment.member_id) if appointment else None
        return {
            'id': self.id,
            'appointment_id': self.appointment_id,
            'patient_name': f"{member.first_name} {member.last_name}" if member else 'Unknown',
            'date': self.date,
            'time': self.time,
            'status': self.status
        }

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))
    date = db.Column(db.String(10))
    description = db.Column(db.Text)
    file_path = db.Column(db.String(200))

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'date': self.date,
            'description': self.description,
            'file_path': self.file_path
        }

# Ensure upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Routes
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    family_id = data.get('family_id')
    user = User.query.filter_by(family_id=family_id).first()
    if user:
        session['user_id'] = user.id
        session['user_type'] = user.user_type
        session['family_id'] = user.family_id
        return jsonify({
            'success': True,
            'user_type': user.user_type,
            'message': 'Login successful'
        })
    return jsonify({'success': False, 'error': 'Invalid Family ID'}), 401

@app.route('/logout')
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    family_id = str(uuid.uuid4())[:8]
    user = User(
        family_id=family_id,
        user_type='patient',
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        email=data.get('email'),
        phone=data.get('phone'),
        age=data.get('age'),
        gender=data.get('gender'),
        aadhar=data.get('aadhar'),
        address=data.get('address'),
        prev_problem=data.get('prev_problem'),
        curr_problem=data.get('curr_problem')
    )
    try:
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.id
        session['user_type'] = user.user_type
        session['family_id'] = user.family_id
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'family_id': family_id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/patient_dashboard')
def patient_dashboard():
    if 'user_id' not in session or session['user_type'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get(session['user_id'])
    family_members = FamilyMember.query.filter_by(family_id=user.family_id).all()
    appointments = Appointment.query.filter_by(family_id=user.family_id).all()
    records = MedicalRecord.query.filter_by(family_id=user.family_id).all()
    bills = Bill.query.filter_by(family_id=user.family_id).all()
    return jsonify({
        'profile': user.to_dict(),
        'family_members': [m.to_dict() for m in family_members],
        'appointments': [a.to_dict() for a in appointments],
        'medical_records': [r.to_dict() for r in records],
        'bills': [b.to_dict() for b in bills],
        'family_id': user.family_id
    })

@app.route('/add_family_member', methods=['POST'])
def add_family_member():
    if 'user_id' not in session or session['user_type'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    member = FamilyMember(
        family_id=session['family_id'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        email=data.get('email'),
        phone=data.get('phone'),
        age=data.get('age'),
        gender=data.get('gender'),
        aadhar=data.get('aadhar'),
        address=data.get('address'),
        prev_problem=data.get('prev_problem'),
        curr_problem=data.get('curr_problem')
    )
    try:
        db.session.add(member)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Family member added'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/edit_family_member/<int:id>', methods=['POST'])
def edit_family_member(id):
    if 'user_id' not in session or session['user_type'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    member = FamilyMember.query.get_or_404(id)
    if member.family_id != session['family_id']:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    for key, value in data.items():
        if hasattr(member, key):
            setattr(member, key, value)
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Family member updated'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/delete_family_member/<int:id>', methods=['DELETE'])
def delete_family_member(id):
    if 'user_id' not in session or session['user_type'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    member = FamilyMember.query.get_or_404(id)
    if member.family_id != session['family_id']:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        db.session.delete(member)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Family member deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/book_appointment', methods=['GET', 'POST'])
def book_appointment():
    if 'user_id' not in session or session['user_type'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    if request.method == 'GET':
        members = FamilyMember.query.filter_by(family_id=session['family_id']).all()
        doctors = Doctor.query.all()
        slots = Slot.query.filter_by(status='Available').all()
        return jsonify({
            'members': [m.to_dict() for m in members],
            'doctors': [d.to_dict() for d in doctors],
            'slots': [s.to_dict() for s in slots]
        })
    data = request.get_json()
    appointment = Appointment(
        family_id=session['family_id'],
        member_id=data.get('member_id'),
        doctor_id=data.get('doctor_id'),
        date=data.get('date'),
        time=data.get('time'),
        status='Scheduled'
    )
    slot = Slot.query.filter_by(doctor_id=data.get('doctor_id'), date=data.get('date'), time=data.get('time')).first()
    if slot:
        slot.status = 'Booked'
    try:
        db.session.add(appointment)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Appointment booked'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/view_appointment/<int:id>')
def view_appointment(id):
    if 'user_id' not in session or session['user_type'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    appointment = Appointment.query.get_or_404(id)
    if appointment.family_id != session['family_id']:
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify(appointment.to_dict())

@app.route('/cancel_appointment/<int:id>', methods=['POST'])
def cancel_appointment(id):
    if 'user_id' not in session or session['user_type'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    appointment = Appointment.query.get_or_404(id)
    if appointment.family_id != session['family_id']:
        return jsonify({'error': 'Unauthorized'}), 401
    appointment.status = 'Cancelled'
    slot = Slot.query.filter_by(doctor_id=appointment.doctor_id, date=appointment.date, time=appointment.time).first()
    if slot:
        slot.status = 'Available'
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Appointment cancelled'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/upload_medical_record', methods=['POST'])
def upload_medical_record():
    if 'user_id' not in session or session['user_type'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.form
    file = request.files.get('record_file')
    if not file:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    record = MedicalRecord(
        family_id=session['family_id'],
        member_id=data.get('member_id'),
        record_type=data.get('record_type'),
        record_date=data.get('record_date'),
        description=data.get('description'),
        file_path=f'/static/uploads/{filename}'
    )
    try:
        db.session.add(record)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Record uploaded'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/pay_bill/<int:id>', methods=['POST'])
def pay_bill(id):
    if 'user_id' not in session or session['user_type'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    bill = Bill.query.get_or_404(id)
    if bill.family_id != session['family_id']:
        return jsonify({'error': 'Unauthorized'}), 401
    bill.status = 'Paid'
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Bill paid'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/view_patient_details/<int:id>')
def view_patient_details(id):
    if 'user_id' not in session or session['user_type'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    member = FamilyMember.query.get_or_404(id)
    if member.family_id != session['family_id']:
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify(member.to_dict())

@app.route('/doctor_dashboard')
def doctor_dashboard():
    if 'user_id' not in session or session['user_type'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    doctor = Doctor.query.get_or_404(session['user_id'])
    appointments = Appointment.query.filter_by(doctor_id=doctor.id, status='Scheduled').all()
    records = MedicalRecord.query.join(Appointment).filter(Appointment.doctor_id == doctor.id).all()
    stats = {
        'total_appointments': Appointment.query.filter_by(doctor_id=doctor.id).count(),
        'patients_today': Appointment.query.filter_by(doctor_id=doctor.id, date=date.today().strftime('%Y-%m-%d')).count(),
        'prescriptions_issued': Prescription.query.filter_by(doctor_id=doctor.id).count()
    }
    return jsonify({
        'profile': doctor.to_dict(),
        'upcoming_appointments': [a.to_dict() for a in appointments],
        'recent_records': [r.to_dict() for r in records],
        'stats': stats
    })

@app.route('/doctor_appointments')
def doctor_appointments():
    if 'user_id' not in session or session['user_type'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    appointments = Appointment.query.filter_by(doctor_id=session['user_id']).all()
    return jsonify({'appointments': [a.to_dict() for a in appointments]})

@app.route('/doctor_medical_records')
def doctor_medical_records():
    if 'user_id' not in session or session['user_type'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    records = MedicalRecord.query.join(Appointment).filter(Appointment.doctor_id == session['user_id']).all()
    return jsonify({'records': [r.to_dict() for r in records]})

@app.route('/doctor_patients')
def doctor_patients():
    if 'user_id' not in session or session['user_type'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    patients = FamilyMember.query.join(Appointment).filter(Appointment.doctor_id == session['user_id']).distinct().all()
    return jsonify({'patients': [p.to_dict() for p in patients]})

@app.route('/doctor_prescriptions', methods=['GET', 'POST'])
def doctor_prescriptions():
    if 'user_id' not in session or session['user_type'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    if request.method == 'GET':
        prescriptions = Prescription.query.filter_by(doctor_id=session['user_id']).all()
        patients = FamilyMember.query.join(Appointment).filter(Appointment.doctor_id == session['user_id']).distinct().all()
        return jsonify({
            'prescriptions': [p.to_dict() for p in prescriptions],
            'patients': [p.to_dict() for p in patients]
        })
    data = request.get_json()
    prescription = Prescription(
        doctor_id=session['user_id'],
        member_id=data.get('patient_id'),
        medication=data.get('medication'),
        dosage=data.get('dosage'),
        instructions=data.get('instructions'),
        date=date.today().strftime('%Y-%m-%d')
    )
    try:
        db.session.add(prescription)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Prescription added'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/doctor_schedule')
def doctor_schedule():
    if 'user_id' not in session or session['user_type'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    schedule = Slot.query.filter_by(doctor_id=session['user_id']).all()
    return jsonify({'schedule': [s.to_dict() for s in schedule]})

@app.route('/doctor_view_patient/<int:id>')
def doctor_view_patient(id):
    if 'user_id' not in session or session['user_type'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    patient = FamilyMember.query.get_or_404(id)
    return jsonify(patient.to_dict())

@app.route('/front_office_dashboard')
def front_office_dashboard():
    if 'user_id' not in session or session['user_type'] != 'front_office':
        return jsonify({'error': 'Unauthorized'}), 401
    checkins = CheckIn.query.filter_by(date=date.today().strftime('%Y-%m-%d')).all()
    appointments = Appointment.query.filter_by(status='Scheduled').all()
    stats = {
        'total_checkins': CheckIn.query.count(),
        'pending_appointments': Appointment.query.filter_by(status='Scheduled').count(),
        'payments_today': Bill.query.filter_by(date=date.today().strftime('%Y-%m-%d'), status='Paid').count()
    }
    return jsonify({
        'stats': stats,
        'recent_checkins': [c.to_dict() for c in checkins],
        'recent_appointments': [a.to_dict() for a in appointments]
    })

@app.route('/front_office_patients')
def front_office_patients():
    if 'user_id' not in session or session['user_type'] != 'front_office':
        return jsonify({'error': 'Unauthorized'}), 401
    patients = FamilyMember.query.all()
    return jsonify({'patients': [p.to_dict() for p in patients]})

@app.route('/front_office_checkins', methods=['GET', 'POST'])
def front_office_checkins():
    if 'user_id' not in session or session['user_type'] != 'front_office':
        return jsonify({'error': 'Unauthorized'}), 401
    if request.method == 'GET':
        checkins = CheckIn.query.all()
        return jsonify({'checkins': [c.to_dict() for c in checkins]})
    data = request.get_json()
    appointment = Appointment.query.get_or_404(data.get('appointment_id'))
    checkin = CheckIn(
        appointment_id=data.get('appointment_id'),
        date=date.today().strftime('%Y-%m-%d'),
        time=data.get('time'),
        status='Checked-in'
    )
    try:
        db.session.add(checkin)
        appointment.status = 'Checked-in'
        db.session.commit()
        return jsonify({'success': True, 'message': 'Patient checked in'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/front_office_appointments')
def front_office_appointments():
    if 'user_id' not in session or session['user_type'] != 'front_office':
        return jsonify({'error': 'Unauthorized'}), 401
    appointments = Appointment.query.all()
    return jsonify({'appointments': [a.to_dict() for a in appointments]})

@app.route('/front_office_payments')
def front_office_payments():
    if 'user_id' not in session or session['user_type'] != 'front_office':
        return jsonify({'error': 'Unauthorized'}), 401
    payments = Bill.query.all()
    return jsonify({'payments': [p.to_dict() for p in payments]})

@app.route('/front_office_reports')
def front_office_reports():
    if 'user_id' not in session or session['user_type'] != 'front_office':
        return jsonify({'error': 'Unauthorized'}), 401
    reports = Report.query.all()
    return jsonify({'reports': [r.to_dict() for r in reports]})

@app.route('/front_office_view_patient/<int:id>')
def front_office_view_patient(id):
    if 'user_id' not in session or session['user_type'] != 'front_office':
        return jsonify({'error': 'Unauthorized'}), 401
    patient = FamilyMember.query.get_or_404(id)
    return jsonify(patient.to_dict())

# Serve React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    return send_from_directory('static/build', 'index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True)