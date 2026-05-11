from django.urls import path
from . import views

urlpatterns = [
    path('', views.convert_to_pdf_view, name='convert'),
]
