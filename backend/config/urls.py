"""Hospora URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

admin.site.site_header = 'Hospora Owner Administration'
admin.site.site_title = 'Hospora Admin'
admin.site.index_title = 'Owner Dashboard'

_default_get_app_list = admin.site.get_app_list


def owner_get_app_list(request, app_label=None):
    app_list = _default_get_app_list(request, app_label)

    if app_label:
        return app_list

    primary_models = []
    for app in app_list:
        for model in app['models']:
            key = (app['app_label'], model['object_name'])
            if key in {('hospitals', 'Hospital'), ('users', 'User')}:
                primary_models.append(model)

    primary_order = {'Hospital': 0, 'User': 1}
    primary_models.sort(key=lambda model: primary_order.get(model['object_name'], 99))

    owner_sections = []
    if primary_models:
        owner_sections.append({
            'name': 'Registered Hospitals & Owners',
            'app_label': 'owner_accounts',
            'app_url': '',
            'has_module_perms': True,
            'models': primary_models,
        })

    return owner_sections


admin.site.get_app_list = owner_get_app_list

urlpatterns = [
    path('admin/', admin.site.urls),
    # API Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # API Routes
    path('api/auth/', include('apps.users.urls')),
    path('api/hospitals/', include('apps.hospitals.urls')),
    path('api/patients/', include('apps.patients.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
    path('api/staff/', include('apps.users.staff_urls')),
    path('api/departments/', include('apps.departments.urls')),
    path('api/medical-records/', include('apps.medical_records.urls')),
    path('api/billing/', include('apps.billing.urls')),
    path('api/pharmacy/', include('apps.pharmacy.urls')),
    path('api/lab/', include('apps.lab.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/queue/', include('apps.queue.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
