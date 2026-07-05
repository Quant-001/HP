from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.core.mixins import HospitalScopedMixin, make_role_permission
from .models import QueueTicket
from .serializers import QueueTicketSerializer

QueueAccess = make_role_permission('hospital_admin', 'receptionist')

class QueueTicketViewSet(HospitalScopedMixin, viewsets.ModelViewSet):
    queryset = QueueTicket.objects.select_related('hospital', 'patient', 'appointment', 'doctor', 'department')
    serializer_class = QueueTicketSerializer
    permission_classes = [IsAuthenticated, QueueAccess]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'doctor', 'department', 'queue_date']
    search_fields = ['patient__name', 'patient__patient_id', 'doctor__name', 'visit_reason']
    ordering_fields = ['queue_date', 'token_number', 'created_at', 'updated_at']

    def get_queryset(self):
        qs = super().get_queryset()
        queue_date = self.request.query_params.get('queue_date')
        if not queue_date:
            qs = qs.filter(queue_date=timezone.localdate())
        return qs

    def perform_create(self, serializer):
        serializer.save(hospital=self.request.user.hospital, created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def call(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'called'
        ticket.called_at = timezone.now()
        ticket.save(update_fields=['status', 'called_at', 'updated_at'])
        return Response(self.get_serializer(ticket).data)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'in_progress'
        if not ticket.called_at:
            ticket.called_at = timezone.now()
        ticket.save(update_fields=['status', 'called_at', 'updated_at'])
        return Response(self.get_serializer(ticket).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'completed'
        ticket.completed_at = timezone.now()
        ticket.save(update_fields=['status', 'completed_at', 'updated_at'])
        return Response(self.get_serializer(ticket).data)

    @action(detail=True, methods=['post'])
    def no_show(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'no_show'
        ticket.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(ticket).data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        qs = self.get_queryset()
        data = {
            'waiting': qs.filter(status='waiting').count(),
            'called': qs.filter(status='called').count(),
            'in_progress': qs.filter(status='in_progress').count(),
            'completed': qs.filter(status='completed').count(),
            'no_show': qs.filter(status='no_show').count(),
            'total': qs.count(),
        }
        return Response(data, status=status.HTTP_200_OK)
