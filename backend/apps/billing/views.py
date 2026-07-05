from django.db.models import Sum
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.mixins import HospitalScopedMixin, make_role_permission
from .models import Invoice
from .serializers import InvoiceSerializer

BillingAccess = make_role_permission('hospital_admin', 'receptionist')

class InvoiceViewSet(HospitalScopedMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('hospital', 'patient', 'appointment')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, BillingAccess]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'patient']
    search_fields = ['invoice_number', 'patient__name']
    ordering_fields = ['created_at', 'total', 'due_date']

    def perform_create(self, serializer):
        serializer.save(hospital=self.request.user.hospital, created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        qs = self.get_queryset()
        total_revenue = qs.filter(status='paid').aggregate(t=Sum('total'))['t'] or 0
        total_pending = qs.filter(status='pending').aggregate(t=Sum('total'))['t'] or 0
        return Response({
            'total_revenue': float(total_revenue),
            'total_pending': float(total_pending),
            'total_invoices': qs.count(),
        })
