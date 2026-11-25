from django.urls import path
from .views import (
    ProductListCreateView,
    ProductDetailView,
    ProductStatusUpdateView,
    MyListingsView,
    FavoriteListCreateView,
    FavoriteDeleteView,
    PriceSuggestionView,
)

urlpatterns = [
    path('products/', ProductListCreateView.as_view(), name='product_list_create'),
    path('products/my-listings/', MyListingsView.as_view(), name='my_listings'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('products/<int:pk>/status/', ProductStatusUpdateView.as_view(), name='product_status_update'),
    path('favorites/', FavoriteListCreateView.as_view(), name='favorite_list_create'),
    path('favorites/<int:pk>/', FavoriteDeleteView.as_view(), name='favorite_delete'),
    path('price-suggestion/', PriceSuggestionView.as_view(), name='price_suggestion'),
]
