from django.urls import path
from . import views

urlpatterns = [
    path('', views.convert_to_pdf_view, name='convert'),
    path('privacy/', views.privacy_view, name='privacy'),
    path('stats/', views.stats_view, name='stats'),
]
