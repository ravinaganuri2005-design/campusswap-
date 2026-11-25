from django.db import models
from django.conf import settings
from marketplace.models import Product

class EnquiryStatus(models.TextChoices):
    PENDING = 'pending', 'Pending Response'
    RESPONDED = 'responded', 'Responded'
    CLOSED = 'closed', 'Closed'

class Enquiry(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='enquiries'
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_enquiries'
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_enquiries'
    )
    subject = models.CharField(max_length=200, blank=True)
    status = models.CharField(
        max_length=20,
        choices=EnquiryStatus.choices,
        default=EnquiryStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Enquiry from {self.buyer.full_name} for '{self.product.title}'"

class Message(models.Model):
    enquiry = models.ForeignKey(
        Enquiry,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message by {self.sender.full_name} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
