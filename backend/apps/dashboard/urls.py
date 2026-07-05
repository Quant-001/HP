from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.dashboard_stats, name='dashboard-stats'),
    path('revenue-trends/', views.revenue_trends, name='revenue-trends'),
    path('recent-appointments/', views.recent_appointments, name='recent-appointments'),
    path('appointment-breakdown/', views.appointment_status_breakdown, name='appointment-breakdown'),
    path('patient-growth/', views.patient_growth, name='patient-growth'),
]
