from rest_framework.routers import DefaultRouter
from .views import QueueTicketViewSet

router = DefaultRouter()
router.register('', QueueTicketViewSet, basename='queue')
urlpatterns = router.urls
