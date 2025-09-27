
from datetime import datetime, timedelta
import hashlib
import random
import os
import logging

from flask import Flask, request, redirect, url_for, render_template, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

# -------------------- Configuration --------------------
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "super_secret_key")

# PostgreSQL connection string - update if needed
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:Ganesh@123*@localhost:5432/hospital1"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = "admin_login"

# -------------------- Models --------------------
class AdminUser(UserMixin, db.Model):
    __tablename__ = "admins"
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String, nullable=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String, nullable=False, default="System")
    last_name = db.Column(db.String, nullable=False, default="Administrator")
    email = db.Column(db.String, nullable=False, default="admin@example.com")
    created_date = db.Column(db.DateTime, default=datetime.utcnow)

    def check_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest() == self.password_hash

class Doctor(db.Model):
    __tablename__ = "doctors"
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String, nullable=True)
    name = db.Column(db.String, nullable=False)
    specialty = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=False)

class Member(db.Model):
    __tablename__ = "members"
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String, nullable=True)
    first_name = db.Column(db.String, nullable=False)
    middle_name = db.Column(db.String)
    last_name = db.Column(db.String, nullable=False)
    age = db.Column(db.Integer, nullable=False, default=0)
    gender = db.Column(db.String, nullable=False, default="")
    phone = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    aadhar = db.Column(db.String, nullable=True)
    address = db.Column(db.String, nullable=True)
    prev_problem = db.Column(db.String, nullable=True)
    curr_problem = db.Column(db.String, nullable=True)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)

class FrontOffice(db.Model):
    __tablename__ = "front_office"
    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.String, nullable=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=False)

class Slot(db.Model):
    __tablename__ = "slots"
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"))
    slot_time = db.Column(db.DateTime, nullable=False)
    booked = db.Column(db.Boolean, default=False)

class Appointment(db.Model):
    __tablename__ = "appointments"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey("members.id"))
    slot_id = db.Column(db.Integer, db.ForeignKey("slots.id"))
    status = db.Column(db.String, default="Scheduled")
    created_date = db.Column(db.DateTime, default=datetime.utcnow)

class MedicalRecord(db.Model):
    __tablename__ = "medical_records"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey("members.id"))
    record_type = db.Column(db.String, nullable=False)
    record_date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String)
    file_path = db.Column(db.String)
    uploaded_date = db.Column(db.DateTime, default=datetime.utcnow)

class Prescription(db.Model):
    __tablename__ = "prescriptions"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey("members.id"))
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"))
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointments.id"), nullable=True)
    prescription_date = db.Column(db.DateTime, nullable=False)
    medication = db.Column(db.String, nullable=False)
    dosage = db.Column(db.String)
    frequency = db.Column(db.String, default="")
    duration = db.Column(db.String, default="")
    instructions = db.Column(db.String, default="")
    notes = db.Column(db.String, default="")
    created_date = db.Column(db.DateTime, default=datetime.utcnow)

class Bill(db.Model):
    __tablename__ = "bills"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey("members.id"))
    bill_date = db.Column(db.DateTime, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String, default="Pending")
    description = db.Column(db.String)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)

class Checkin(db.Model):
    __tablename__ = "checkins"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey("members.id"))
    checkin_time = db.Column(db.DateTime, nullable=False)
    checkout_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String, default="Checked In")
    created_date = db.Column(db.DateTime, default=datetime.utcnow)

class UserType(db.Model):
    __tablename__ = "user_types"
    id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String, nullable=False, unique=True)

class Family(db.Model):
    __tablename__ = "families"
    id = db.Column(db.String, primary_key=True)
    user_type = db.Column(db.Integer, db.ForeignKey("user_types.id"), nullable=False, default=1)

# -------------------- Flask-Login --------------------
@login_manager.user_loader
def load_user(admin_id):
    return db.session.get(AdminUser, int(admin_id))

# -------------------- Flask-Admin --------------------
class SecureModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated

admin = Admin(app, name="Hospital Admin Panel", template_mode="bootstrap4")
admin.add_view(SecureModelView(Member, db.session, name="Members"))
admin.add_view(SecureModelView(Doctor, db.session, name="Doctors"))
admin.add_view(SecureModelView(FrontOffice, db.session, name="Front Office"))
admin.add_view(SecureModelView(Appointment, db.session, name="Appointments"))
admin.add_view(SecureModelView(Slot, db.session, name="Slots"))
admin.add_view(SecureModelView(MedicalRecord, db.session, name="Medical Records"))
admin.add_view(SecureModelView(Prescription, db.session, name="Prescriptions"))
admin.add_view(SecureModelView(Bill, db.session, name="Bills"))
admin.add_view(SecureModelView(Checkin, db.session, name="Check-ins"))
admin.add_view(SecureModelView(UserType, db.session, name="User Types"))
admin.add_view(SecureModelView(Family, db.session, name="Families"))
admin.add_view(SecureModelView(AdminUser, db.session, name="Admin Users"))

# -------------------- Utility --------------------
def generate_unique_id():
    while True:
        uid = str(random.randint(100000000000, 999999999999))
        if not Family.query.get(uid):
            return uid

# -------------------- Routes --------------------
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        user = AdminUser.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect("/admin")
        else:
            return render_template("admin/admin_login.html", error="Invalid credentials")
    return render_template("admin/admin_login.html")

@app.route("/admin/logout")
@login_required
def admin_logout():
    logout_user()
    return redirect(url_for("admin_login"))

@app.route("/admin/debug")
def admin_debug():
    admin_user = AdminUser.query.filter_by(username="admin").first()
    expected_hash = hashlib.sha256("admin123".encode()).hexdigest()
    return jsonify({
        "admin_exists": bool(admin_user),
        "stored_hash": admin_user.password_hash if admin_user else None,
        "expected_hash": expected_hash,
        "password_match": admin_user and admin_user.password_hash == expected_hash
    })

@app.route("/")
def home():
    return render_template("home.html")

# -------------------- Patient Registration & Family --------------------
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        try:
            first_name = request.form["first_name"]
            last_name = request.form["last_name"]
            phone = request.form["phone"]
            email = request.form["email"]
            age = int(request.form.get("age", 0))
            gender = request.form.get("gender", "")
            aadhar = request.form.get("aadhar", "")
            address = request.form.get("address", "")
            prev_problem = request.form.get("prev_problem", "")
            curr_problem = request.form.get("curr_problem", "")

            # Check email uniqueness
            if Member.query.filter_by(email=email).first():
                return render_template("register.html", error="Email already exists.")

            uid = generate_unique_id()
            # create family record
            patient_type = UserType.query.filter_by(type_name="patient").first()
            family = Family(id=uid, user_type=patient_type.id if patient_type else 1)
            db.session.add(family)
            db.session.flush()

            member = Member(
                family_id=uid,
                first_name=first_name,
                middle_name=request.form.get("middle_name",""),
                last_name=last_name,
                age=age,
                gender=gender,
                phone=phone,
                email=email,
                aadhar=aadhar,
                address=address,
                prev_problem=prev_problem,
                curr_problem=curr_problem
            )
            db.session.add(member)
            db.session.commit()
            return redirect("/login?message=Registered. Your Family ID: " + uid)
        except Exception as e:
            logger.error("Register error: %s", e)
            db.session.rollback()
            return render_template("register.html", error="Registration failed: " + str(e))
    return render_template("register.html")

@app.route("/add_family_member", methods=["GET", "POST"])
def add_family_member():
    if "family_id" not in session or session.get("user_type") != "patient":
        return redirect("/")
    if request.method == "POST":
        try:
            uid = session["family_id"]
            email = request.form["email"]
            if Member.query.filter_by(email=email).first():
                return render_template("add_family_member.html", error="Email already exists.")
            member = Member(
                family_id=uid,
                first_name=request.form["first_name"],
                middle_name=request.form.get("middle_name",""),
                last_name=request.form["last_name"],
                age=int(request.form.get("age",0)),
                gender=request.form.get("gender",""),
                phone=request.form.get("phone",""),
                email=email,
                aadhar=request.form.get("aadhar",""),
                address=request.form.get("address",""),
                prev_problem=request.form.get("prev_problem",""),
                curr_problem=request.form.get("curr_problem","")
            )
            db.session.add(member)
            db.session.commit()
            return redirect("/patient_dashboard#family")
        except Exception as e:
            logger.error("Add family member error: %s", e)
            db.session.rollback()
            return render_template("add_family_member.html", error="Failed to add member: " + str(e))
    return render_template("add_family_member.html")

@app.route("/edit_family_member/<int:member_id>", methods=["GET","POST"])
def edit_family_member(member_id):
    if "family_id" not in session or session.get("user_type") != "patient":
        return redirect("/")
    member = Member.query.filter_by(id=member_id, family_id=session.get("family_id")).first()
    if not member:
        return redirect("/patient_dashboard#family?error=Not found")
    if request.method == "POST":
        try:
            email = request.form["email"]
            exists = Member.query.filter(Member.email==email, Member.id!=member_id, Member.family_id==session.get("family_id")).first()
            if exists:
                return render_template("edit_family_member.html", member=member, error="Email already exists.")
            member.first_name = request.form["first_name"]
            member.middle_name = request.form.get("middle_name","")
            member.last_name = request.form["last_name"]
            member.age = int(request.form.get("age",0))
            member.gender = request.form.get("gender","")
            member.phone = request.form.get("phone","")
            member.email = email
            member.aadhar = request.form.get("aadhar","")
            member.address = request.form.get("address","")
            member.prev_problem = request.form.get("prev_problem","")
            member.curr_problem = request.form.get("curr_problem","")
            db.session.commit()
            return redirect("/patient_dashboard#family?success=Updated")
        except Exception as e:
            logger.error("Edit family member error: %s", e)
            db.session.rollback()
            return render_template("edit_family_member.html", member=member, error="Update failed: "+str(e))
    return render_template("edit_family_member.html", member=member)

@app.route("/delete_family_member/<int:member_id>")
def delete_family_member(member_id):
    if "family_id" not in session or session.get("user_type") != "patient":
        return redirect("/")
    try:
        Member.query.filter_by(id=member_id, family_id=session.get("family_id")).delete()
        db.session.commit()
    except Exception as e:
        logger.error("Delete family member error: %s", e)
        db.session.rollback()
    return redirect("/patient_dashboard#family")

# -------------------- Booking --------------------
@app.route("/book_appointment", methods=["GET", "POST"])
def book_appointment():
    if "family_id" not in session or session.get("user_type") != "patient":
        return redirect("/")
    members = Member.query.filter_by(family_id=session.get("family_id")).all()
    doctors = Doctor.query.order_by(Doctor.name).all()
    appointment_id = request.args.get("appointment_id")
    member_id = request.args.get("member_id")
    doctor_id = request.args.get("doctor_id")
    date = request.args.get("date")
    current_appointment = None
    if appointment_id:
        current_appointment = Appointment.query.get(int(appointment_id))
    if request.method == "POST":
        try:
            member_id = int(request.form["member_id"])
            doctor_id = int(request.form["doctor_id"])
            date_str = request.form["date"]
            slot_id = int(request.form["slot_id"])
            appointment_id = request.form.get("appointment_id")
            slot = Slot.query.get(slot_id)
            if not slot:
                return render_template("book_appointment.html", members=members, doctors=doctors, error="Slot not found.")
            if slot.slot_time <= datetime.now():
                return render_template("book_appointment.html", members=members, doctors=doctors, error="Cannot book past slot.")
            if slot.doctor_id != doctor_id:
                return render_template("book_appointment.html", members=members, doctors=doctors, error="Slot doesn't belong to doctor.")
            existing = Appointment.query.filter_by(slot_id=slot_id, status="Scheduled").first()
            if existing and (not appointment_id or existing.id != int(appointment_id)):
                return render_template("book_appointment.html", members=members, doctors=doctors, error="Slot already booked.")
            if appointment_id and current_appointment:
                current_appointment.slot_id = slot_id
                current_appointment.status = "Scheduled"
            else:
                appt = Appointment(member_id=member_id, slot_id=slot_id, status="Scheduled")
                db.session.add(appt)
            db.session.commit()
            return redirect("/patient_dashboard#appointments?success=Booked")
        except Exception as e:
            logger.error("Book appointment error: %s", e)
            db.session.rollback()
            return render_template("book_appointment.html", members=members, doctors=doctors, error="Failed: "+str(e))
    # GET: optionally filter slots by doctor and date
    slots = []
    if doctor_id:
        try:
            doctor_id_i = int(doctor_id)
            q = Slot.query.filter_by(doctor_id=doctor_id_i, booked=False)
            if date:
                try:
                    date_dt = datetime.strptime(date, "%Y-%m-%d").date()
                    q = q.filter(db.func.date(Slot.slot_time) == date_dt)
                except:
                    pass
            slots = q.order_by(Slot.slot_time).limit(200).all()
        except:
            slots = []
    return render_template("book_appointment.html", members=members, doctors=doctors, slots=slots, member_id=member_id, doctor_id=doctor_id, date=date, appointment_id=appointment_id, current_appointment=current_appointment)

# -------------------- Dashboards --------------------
@app.route("/patient_dashboard")
def patient_dashboard():
    if "family_id" not in session or session.get("user_type") != "patient":
        return redirect("/")
    uid = session["family_id"]
    profile = Member.query.filter_by(family_id=uid).first()
    if not profile:
        return render_template("patient_dashboard.html", error="No profile found.")
    family_members = Member.query.filter_by(family_id=uid).all()
    # appointments for family
    appointments = db.session.query(Appointment, Slot, Doctor, Member).join(Slot, Appointment.slot_id==Slot.id).join(Doctor, Slot.doctor_id==Doctor.id).join(Member, Appointment.member_id==Member.id).filter(Member.family_id==uid).order_by(Slot.slot_time).all()
    # medical records
    medical_records = db.session.query(MedicalRecord, Member).join(Member, MedicalRecord.member_id==Member.id).filter(Member.family_id==uid).order_by(MedicalRecord.record_date.desc()).all()
    prescriptions = db.session.query(Prescription, Member, Doctor).join(Member, Prescription.member_id==Member.id).join(Doctor, Prescription.doctor_id==Doctor.id).filter(Member.family_id==uid).order_by(Prescription.prescription_date.desc()).all()
    bills = db.session.query(Bill, Member).join(Member, Bill.member_id==Member.id).filter(Member.family_id==uid).order_by(Bill.bill_date.desc()).all()
    return render_template("patient_dashboard.html", profile=profile, family_members=family_members, appointments=appointments, medical_records=medical_records, prescriptions=prescriptions, bills=bills)

@app.route("/doctor_dashboard")
def doctor_dashboard():
    if "family_id" not in session or session.get("user_type") != "doctor":
        return redirect("/")
    uid = session["family_id"]
    doctor = Doctor.query.filter_by(family_id=uid).first()
    if not doctor:
        return render_template("doctor_dashboard.html", error="Doctor not found", doctor=None)
    today = datetime.now().date()
    total_patients_today = db.session.query(Appointment).join(Slot, Appointment.slot_id==Slot.id).filter(db.func.date(Slot.slot_time)==today, Slot.doctor_id==doctor.id).count()
    appointments_q = db.session.query(Appointment, Slot, Member).join(Slot, Appointment.slot_id==Slot.id).join(Member, Appointment.member_id==Member.id).filter(db.func.date(Slot.slot_time)==today, Slot.doctor_id==doctor.id).order_by(Slot.slot_time).all()
    recent_patients = db.session.query(Member, db.func.max(Slot.slot_time).label("last_visit")).join(Appointment, Appointment.member_id==Member.id).join(Slot, Appointment.slot_id==Slot.id).filter(Slot.doctor_id==doctor.id).group_by(Member.id).order_by(db.func.max(Slot.slot_time).desc()).limit(5).all()
    return render_template("doctor_dashboard.html", doctor=doctor, total_patients_today=total_patients_today, appointments=appointments_q, recent_patients=recent_patients)

@app.route("/front_office_dashboard")
def front_office_dashboard():
    if "family_id" not in session or session.get("user_type") != "front_office":
        return redirect("/")
    uid = session["family_id"]
    front = FrontOffice.query.filter_by(family_id=uid).first()
    if not front:
        return render_template("front_office_dashboard.html", error="Not found")
    today = datetime.now().date()
    scheduled_today = db.session.query(Appointment).join(Slot, Appointment.slot_id==Slot.id).filter(db.func.date(Slot.slot_time)==today).count()
    appointments_q = db.session.query(Appointment, Slot, Member, Doctor).join(Slot, Appointment.slot_id==Slot.id).join(Member, Appointment.member_id==Member.id).join(Doctor, Slot.doctor_id==Doctor.id).filter(db.func.date(Slot.slot_time)==today).order_by(Slot.slot_time).all()
    return render_template("front_office_dashboard.html", front_office=front, scheduled_today=scheduled_today, appointments=appointments_q)

# -------------------- Doctor: view patient --------------------
@app.route("/doctor/view_patient/<int:appointment_id>")
def doctor_view_patient(appointment_id):
    if "family_id" not in session or session.get("user_type") != "doctor":
        return redirect("/")
    doctor = Doctor.query.filter_by(family_id=session.get("family_id")).first()
    if not doctor:
        return redirect("/doctor_dashboard?error=Doctor not found")
    appointment = db.session.query(Appointment, Slot, Member).join(Slot, Appointment.slot_id==Slot.id).join(Member, Appointment.member_id==Member.id).filter(Appointment.id==appointment_id, Slot.doctor_id==doctor.id).first()
    if not appointment:
        return redirect("/doctor_dashboard?error=Appointment not found")
    appt, slot, member = appointment
    medical_history = MedicalRecord.query.filter_by(member_id=member.id).order_by(MedicalRecord.record_date.desc()).limit(10).all()
    previous_appointments = db.session.query(Appointment, Slot).join(Slot, Appointment.slot_id==Slot.id).filter(Appointment.member_id==member.id, Slot.doctor_id==doctor.id, Appointment.id!=appointment_id).order_by(Slot.slot_time.desc()).limit(5).all()
    prescriptions = Prescription.query.filter_by(member_id=member.id, doctor_id=doctor.id).order_by(Prescription.prescription_date.desc()).limit(5).all()
    return render_template("doctor_view_patient.html", appointment=appt, slot=slot, member=member, medical_history=medical_history, previous_appointments=previous_appointments, prescriptions=prescriptions)

# -------------------- Seed Data --------------------
def seed_data():
    # seed user types
    types = ["patient", "doctor", "front_office", "admin"]
    for t in types:
        if not UserType.query.filter_by(type_name=t).first():
            db.session.add(UserType(type_name=t))
    db.session.commit()

    # seed admin
    if not AdminUser.query.filter_by(username="admin").first():
        password_hash = hashlib.sha256("admin123".encode()).hexdigest()
        admin = AdminUser(family_id="ADMIN001", username="admin", password_hash=password_hash, first_name="System", last_name="Administrator", email="admin@hospital.com")
        db.session.add(admin)
        # ensure family for admin exists
        admin_type = UserType.query.filter_by(type_name="admin").first()
        if admin_type and not Family.query.get("ADMIN001"):
            db.session.add(Family(id="ADMIN001", user_type=admin_type.id))
        db.session.commit()

    # seed doctors
    if Doctor.query.count() == 0:
        doctors = [
            Doctor(family_id="DOC001", name="Dr. Alice Smith", specialty="General Medicine", email="alice.smith@hospital.com", phone="1234567890"),
            Doctor(family_id="DOC002", name="Dr. Bob Jones", specialty="Cardiology", email="bob.jones@hospital.com", phone="1234567891"),
            Doctor(family_id="DOC003", name="Dr. Carol Brown", specialty="Pediatrics", email="carol.brown@hospital.com", phone="1234567892"),
        ]
        db.session.add_all(doctors)
        # ensure families for doctors
        doc_type = UserType.query.filter_by(type_name="doctor").first()
        for d in doctors:
            if doc_type and not Family.query.get(d.family_id):
                db.session.add(Family(id=d.family_id, user_type=doc_type.id))
        db.session.commit()

    # seed front office staff
    if FrontOffice.query.count() == 0:
        staff = [
            FrontOffice(family_id="OFC111", first_name="Radha", last_name="Kumar", email="radha.kumar@hospital.com", phone="9876543210"),
            FrontOffice(family_id="OFC112", first_name="Mary", last_name="Thomas", email="mary.thomas@hospital.com", phone="9876543211"),
            FrontOffice(family_id="OFC113", first_name="Priya", last_name="Sharma", email="priya.sharma@hospital.com", phone="9876543212"),
        ]
        db.session.add_all(staff)
        fo_type = UserType.query.filter_by(type_name="front_office").first()
        for s in staff:
            if fo_type and not Family.query.get(s.family_id):
                db.session.add(Family(id=s.family_id, user_type=fo_type.id))
        db.session.commit()

    # seed slots for next 60 days for doctors with ids 1..3
    if Slot.query.count() == 0 and Doctor.query.count() >= 3:
        start_date = datetime.now()
        for i in range(60):
            current_date = start_date + timedelta(days=i)
            weekday = current_date.weekday()
            if weekday < 5:
                ranges = [(10,13), (14,18)]
            else:
                ranges = [(10,13)]
            for hr_range in ranges:
                for hour in range(hr_range[0], hr_range[1]):
                    for minute in [0,30]:
                        slot_time = current_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                        for doc_id in range(1, min(Doctor.query.count(),3)+1):
                            s = Slot(doctor_id=doc_id, slot_time=slot_time, booked=False)
                            db.session.add(s)
        db.session.commit()

# -------------------- Initialize --------------------
with app.app_context():
    db.create_all()
    try:
        seed_data()
    except Exception as e:
        logger.error("Seeding error: %s", e)
        db.session.rollback()

# -------------------- Run --------------------
if __name__ == "__main__":
    # ensure upload folder exists
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)
