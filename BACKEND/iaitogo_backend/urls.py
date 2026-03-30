from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# router.register(r'myendpoint', MyViewSet)  # décommentez et ajustez avec vos viewsets

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
