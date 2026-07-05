"""
Management command: seed_demo
Creates a demo hospital with sample data for testing.

Usage: python manage.py seed_demo
"""

import random
from datetime import date, timedelta, time
from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = 'Seed the database with demo hospital data'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing demo data first')

    @transaction.atomic
    def handle(self, *args, **options):
        from apps.hospitals.models import Hospital
        from apps.users.models import User
        from apps.departments.models import Department
        from apps.patients.models import Patient
        from apps.appointments.models import Appointment
        from apps.billing.models import Invoice
        from apps.pharmacy.models import Medicine
        from apps.lab.models import LabTest

        demo_password = 'Demo@1234'

        self.stdout.write('🏥 Seeding demo data...')

        def ensure_demo_user(email, name, role, hospital=None, **extra_fields):
            defaults = {
                'name': name,
                'role': role,
                'hospital': hospital,
                **extra_fields,
            }
            user, _ = User.objects.get_or_create(email=email, defaults=defaults)
            changed = False
            for field, value in defaults.items():
                if getattr(user, field) != value:
                    setattr(user, field, value)
                    changed = True
            if role == 'super_admin':
                if not user.is_staff:
                    user.is_staff = True
                    changed = True
                if not user.is_superuser:
                    user.is_superuser = True
                    changed = True
            user.set_password(demo_password)
            user.save()
            return user

        # ─── Platform Admin ───────────────────────────────────────────────────
        super_admin = ensure_demo_user(
            email='superadmin@hospora.test',
            name='Platform Admin',
            role='super_admin',
        )
        self.stdout.write(f'  ✅ Super admin: {super_admin.email} / password: {demo_password}')

        # ─── Hospital ─────────────────────────────────────────────────────────
        hospital, _ = Hospital.objects.get_or_create(
            email='demo@cityhospital.com',
            defaults={
                'name': 'City General Hospital',
                'phone': '+1-555-0100',
                'address': '100 Medical Center Drive',
                'city': 'New York',
                'country': 'US',
                'plan': 'advanced',
                'subscription_status': 'active',
                'total_beds': 200,
            }
        )
        hospital.name = 'City General Hospital'
        hospital.plan = 'advanced'
        hospital.subscription_status = 'active'
        hospital.total_beds = 200
        hospital.save()
        self.stdout.write(f'  ✅ Hospital: {hospital.name}')

        # ─── Admin ────────────────────────────────────────────────────────────
        admin = ensure_demo_user(
            email='admin@cityhospital.com',
            name='Dr. Sarah Mitchell',
            role='hospital_admin',
            hospital=hospital,
            phone='+1-555-0101',
        )
        self.stdout.write(f'  ✅ Admin: {admin.email} / password: {demo_password}')

        # ─── Departments ──────────────────────────────────────────────────────
        dept_names = [
            ('Cardiology', 'Heart and cardiovascular system'),
            ('Orthopedics', 'Bones, joints and musculoskeletal system'),
            ('Neurology', 'Brain and nervous system'),
            ('Pediatrics', 'Children health care'),
            ('Emergency', '24/7 emergency care'),
            ('Oncology', 'Cancer treatment and care'),
            ('General Medicine', 'Primary diagnosis, treatment, and referrals'),
            ('Gynecology', 'Women health, pregnancy, and reproductive care'),
            ('Dermatology', 'Skin, hair, and nail care'),
            ('ENT', 'Ear, nose, and throat care'),
            ('Ophthalmology', 'Eye care and vision services'),
            ('Radiology', 'Imaging, scans, and diagnostic reporting'),
            ('Pathology', 'Clinical laboratory and diagnostic pathology'),
            ('Physiotherapy', 'Rehabilitation and movement therapy'),
            ('Dentistry', 'Dental care and oral health'),
        ]
        departments = []
        for name, desc in dept_names:
            dept, _ = Department.objects.get_or_create(
                hospital=hospital, name=name,
                defaults={'description': desc}
            )
            departments.append(dept)
        self.stdout.write(f'  ✅ {len(departments)} departments created')

        # ─── Doctors ──────────────────────────────────────────────────────────
        doctor_data = [
            ('Dr. James Carter', 'jcarter@cityhospital.com', 'Cardiology', 'Interventional Cardiology'),
            ('Dr. Emily Chen', 'echen@cityhospital.com', 'Neurology', 'Neurological Surgery'),
            ('Dr. Michael Torres', 'mtorres@cityhospital.com', 'Orthopedics', 'Sports Medicine'),
            ('Dr. Priya Patel', 'ppatel@cityhospital.com', 'Pediatrics', 'Neonatal Care'),
            ('Dr. Robert Kim', 'rkim@cityhospital.com', 'Oncology', 'Medical Oncology'),
        ]
        doctors = []
        for name, email, dept_name, spec in doctor_data:
            dept = next((d for d in departments if d.name == dept_name), departments[0])
            doc = ensure_demo_user(
                email=email,
                name=name,
                role='doctor',
                hospital=hospital,
                department=dept,
                specialization=spec,
            )
            doctors.append(doc)

        # Staff
        receptionist = ensure_demo_user(
            email='reception@cityhospital.com',
            name='Lisa Thompson',
            role='receptionist',
            hospital=hospital,
        )

        lab_tech = ensure_demo_user(
            email='lab@cityhospital.com',
            name='Tom Wilson',
            role='lab_technician',
            hospital=hospital,
        )

        pharmacist = ensure_demo_user(
            email='pharmacy@cityhospital.com',
            name='Nina Brooks',
            role='pharmacist',
            hospital=hospital,
        )

        nurse = ensure_demo_user(
            email='nurse@cityhospital.com',
            name='Maria Garcia',
            role='nurse',
            hospital=hospital,
            department=next((d for d in departments if d.name == 'Emergency'), departments[0]),
        )

        self.stdout.write(f'  ✅ {len(doctors) + 4} staff members created')

        # ─── Patients ─────────────────────────────────────────────────────────
        patient_data = [
            ('Alice Johnson', 'F', '1985-03-15', 'A+', '+1-555-1001'),
            ('Bob Martinez', 'M', '1972-07-22', 'O+', '+1-555-1002'),
            ('Carol White', 'F', '1990-11-08', 'B-', '+1-555-1003'),
            ('David Brown', 'M', '1965-01-30', 'AB+', '+1-555-1004'),
            ('Emma Davis', 'F', '1998-05-12', 'A-', '+1-555-1005'),
            ('Frank Wilson', 'M', '1955-09-25', 'O-', '+1-555-1006'),
            ('Grace Lee', 'F', '2001-12-03', 'B+', '+1-555-1007'),
            ('Henry Taylor', 'M', '1978-04-18', 'A+', '+1-555-1008'),
            ('Isabella Anderson', 'F', '1993-08-27', 'O+', '+1-555-1009'),
            ('James Thomas', 'M', '1960-06-14', 'AB-', '+1-555-1010'),
        ]
        patients = []
        for name, gender, dob, blood, phone in patient_data:
            p, created = Patient.objects.get_or_create(
                phone=phone,
                hospital=hospital,
                defaults={
                    'name': name, 'gender': gender, 'date_of_birth': dob,
                    'blood_group': blood, 'email': f"{name.lower().replace(' ', '.')}@email.com",
                    'status': 'active', 'registered_by': receptionist,
                }
            )
            patients.append(p)
        self.stdout.write(f'  ✅ {len(patients)} patients created')

        # ─── Appointments ─────────────────────────────────────────────────────
        today = date.today()
        statuses = ['completed', 'completed', 'confirmed', 'scheduled', 'cancelled']
        types = ['consultation', 'follow_up', 'procedure', 'consultation', 'consultation']
        apt_count = 0
        for i, patient in enumerate(patients):
            for j in range(3):
                appt_date = today - timedelta(days=random.randint(0, 30)) + timedelta(days=j * 7)
                doctor = doctors[i % len(doctors)]
                appt, created = Appointment.objects.get_or_create(
                    hospital=hospital,
                    patient=patient,
                    appointment_date=appt_date,
                    appointment_time=time(9 + (i % 8), (j * 20) % 60),
                    defaults={
                        'doctor': doctor,
                        'department': doctor.department,
                        'type': types[j % len(types)],
                        'status': statuses[j % len(statuses)],
                        'reason': 'Regular checkup and consultation',
                        'created_by': receptionist,
                    }
                )
                if created:
                    apt_count += 1
        self.stdout.write(f'  ✅ {apt_count} appointments created')

        # ─── Invoices ─────────────────────────────────────────────────────────
        invoice_statuses = ['paid', 'paid', 'pending', 'pending', 'overdue']
        inv_count = 0
        for i, patient in enumerate(patients[:6]):
            items = [
                {'name': 'Consultation Fee', 'qty': 1, 'price': 150.00, 'total': 150.00},
                {'name': 'Lab Tests', 'qty': 1, 'price': 75.00, 'total': 75.00},
            ]
            subtotal = sum(item['total'] for item in items)
            status = invoice_statuses[i % len(invoice_statuses)]
            inv, created = Invoice.objects.get_or_create(
                hospital=hospital,
                patient=patient,
                invoice_number=f'INV-{1000 + i:05d}',
                defaults={
                    'status': status,
                    'items': items,
                    'subtotal': subtotal,
                    'tax_percent': 10,
                    'tax_amount': subtotal * 0.1,
                    'total': subtotal * 1.1,
                    'paid_amount': subtotal * 1.1 if status == 'paid' else 0,
                    'created_by': receptionist,
                    'due_date': today + timedelta(days=30),
                }
            )
            if created:
                inv_count += 1
        self.stdout.write(f'  ✅ {inv_count} invoices created')

        # ─── Medicines ────────────────────────────────────────────────────────
        medicines_data = [
            ('Amoxicillin 500mg', 'Amoxicillin', 'tablet', 'PharmaCo', 250, 30, 1.50),
            ('Ibuprofen 400mg', 'Ibuprofen', 'tablet', 'MediLife', 500, 50, 0.75),
            ('Metformin 500mg', 'Metformin HCl', 'tablet', 'DiabetCare', 8, 20, 0.90),
            ('Lisinopril 10mg', 'Lisinopril', 'tablet', 'CardioMed', 150, 25, 1.20),
            ('Cough Syrup 100ml', 'Dextromethorphan', 'syrup', 'HealthFirst', 45, 15, 4.99),
            ('Vitamin C 1000mg', 'Ascorbic Acid', 'tablet', 'VitaHealth', 600, 100, 0.30),
            ('Morphine 10mg/ml', 'Morphine Sulfate', 'injection', 'PainCare', 5, 10, 15.00),
            ('Omeprazole 20mg', 'Omeprazole', 'capsule', 'GastroMed', 300, 40, 0.60),
        ]
        med_count = 0
        for name, generic, cat, mfr, stock, min_stock, price in medicines_data:
            med, created = Medicine.objects.get_or_create(
                hospital=hospital, name=name,
                defaults={
                    'generic_name': generic, 'category': cat, 'manufacturer': mfr,
                    'stock': stock, 'min_stock': min_stock, 'unit_price': price,
                    'expiry_date': date(2026, 12, 31),
                }
            )
            if created:
                med_count += 1
        self.stdout.write(f'  ✅ {med_count} medicines created')

        # ─── Lab Tests ────────────────────────────────────────────────────────
        lab_data = [
            ('Complete Blood Count', 'CBC-001', 'Hematology', 35.00),
            ('Blood Glucose Fasting', 'BGL-001', 'Biochemistry', 20.00),
            ('Lipid Profile', 'LIP-001', 'Biochemistry', 45.00),
            ('Thyroid Function Test', 'TFT-001', 'Endocrinology', 60.00),
            ('Urine Analysis', 'UA-001', 'Urinalysis', 15.00),
        ]
        lab_count = 0
        for i, patient in enumerate(patients[:5]):
            test_name, code, cat, cost = lab_data[i % len(lab_data)]
            status = 'completed' if i < 3 else 'pending'
            lt, created = LabTest.objects.get_or_create(
                hospital=hospital, patient=patient, test_name=test_name,
                defaults={
                    'test_code': code, 'category': cat, 'cost': cost,
                    'status': status, 'ordered_by': doctors[i % len(doctors)],
                    'result': 'Normal range' if status == 'completed' else '',
                }
            )
            if created:
                lab_count += 1
        self.stdout.write(f'  ✅ {lab_count} lab tests created')

        self.stdout.write(self.style.SUCCESS('\n✅ Demo data seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('\n🔑 Demo logins:'))
        self.stdout.write(self.style.SUCCESS(f'  Super admin:  superadmin@hospora.test / {demo_password}'))
        self.stdout.write(self.style.SUCCESS(f'  Admin:        admin@cityhospital.com / {demo_password}'))
        self.stdout.write(self.style.SUCCESS(f'  Doctor:       jcarter@cityhospital.com / {demo_password}'))
        self.stdout.write(self.style.SUCCESS(f'  Reception:    reception@cityhospital.com / {demo_password}'))
        self.stdout.write(self.style.SUCCESS(f'  Nurse:        nurse@cityhospital.com / {demo_password}'))
        self.stdout.write(self.style.SUCCESS(f'  Lab:          lab@cityhospital.com / {demo_password}'))
        self.stdout.write(self.style.SUCCESS(f'  Pharmacy:     pharmacy@cityhospital.com / {demo_password}'))
        self.stdout.write(self.style.SUCCESS('  Patient data: Alice Johnson, Bob Martinez, Carol White, and more'))
        self.stdout.write(self.style.SUCCESS(f'🌐 API Docs: http://localhost:8000/api/docs/'))
