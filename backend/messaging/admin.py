from django.contrib import admin
from .models import Enquiry, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 1

@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'buyer', 'seller', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = ('product__title', 'buyer__full_name', 'seller__full_name', 'subject')
    inlines = [MessageInline]

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'enquiry', 'sender', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('body', 'sender__full_name')
