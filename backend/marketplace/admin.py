from django.contrib import admin
from .models import Product, Favorite

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'selling_price', 'condition', 'listing_type', 'status', 'college_name', 'seller', 'created_at')
    list_filter = ('category', 'condition', 'listing_type', 'status', 'college_name')
    search_fields = ('title', 'description', 'college_name', 'seller__full_name', 'seller__email')
    list_editable = ('status', 'selling_price')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    search_fields = ('user__email', 'product__title')
