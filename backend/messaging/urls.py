from django.urls import path
from .views import EnquiryListCreateView, EnquiryDetailView

urlpatterns = [
    path('', EnquiryListCreateView.as_view(), name='enquiry_list_create'),
    path('<int:pk>/', EnquiryDetailView.as_view(), name='enquiry_detail'),
]
