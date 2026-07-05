from django.urls import path
from . import views

urlpatterns = [
    path('', views.HospitalListView.as_view(), name='hospital-list'),
    path('<int:pk>/', views.HospitalDetailView.as_view(), name='hospital-detail'),
    path('<int:pk>/upgrade/', views.upgrade_hospital, name='hospital-upgrade'),
]
