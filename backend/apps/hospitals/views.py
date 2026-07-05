from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Hospital
from .serializers import HospitalSerializer, HospitalUpgradeSerializer
from apps.core.mixins import make_role_permission

AdminOnly = make_role_permission('hospital_admin', 'super_admin')


class HospitalDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user.role == 'super_admin':
            return Hospital.objects.get(pk=self.kwargs['pk'])
        return user.hospital


class HospitalListView(generics.ListAPIView):
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Hospital.objects.prefetch_related('staff').order_by('-created_at')
        if user.role == 'super_admin':
            return qs
        return qs.filter(pk=user.hospital_id)


@api_view(['POST'])
@permission_classes([IsAuthenticated, AdminOnly])
def upgrade_hospital(request, pk):
    """Upgrade hospital plan."""
    hospital = request.user.hospital
    serializer = HospitalUpgradeSerializer(data=request.data)
    if serializer.is_valid():
        requested_plan = serializer.validated_data['plan']
        plan_config = Hospital.PLAN_CATALOG[requested_plan]
        usage = hospital.subscription_usage
        blocking_limits = []
        for key, item in usage.items():
            limit = plan_config['limits'].get(key)
            if limit is not None and item['used'] > limit:
                blocking_limits.append(f'{key}: {item["used"]}/{limit}')
        if blocking_limits:
            return Response({
                'plan': f'Current usage exceeds this plan: {", ".join(blocking_limits)}.'
            }, status=status.HTTP_400_BAD_REQUEST)

        hospital.plan = requested_plan
        hospital.subscription_status = 'active'
        hospital.save()
        return Response(HospitalSerializer(hospital).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
