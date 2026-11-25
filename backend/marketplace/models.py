from django.db import models
from django.conf import settings

class CategoryChoices(models.TextChoices):
    BOOKS_NOTES = 'books_notes', 'Books and Notes'
    ELECTRONICS = 'electronics', 'Electronics'
    ACADEMIC_EQUIPMENT = 'academic_equipment', 'Academic Equipment'
    HOSTEL_ESSENTIALS = 'hostel_essentials', 'Hostel Essentials'
    SPORTS_EQUIPMENT = 'sports_equipment', 'Sports Equipment'
    OTHER = 'other', 'Other'

class ConditionChoices(models.TextChoices):
    LIKE_NEW = 'like_new', 'Like New'
    GOOD = 'good', 'Good'
    USED = 'used', 'Used'

class ListingTypeChoices(models.TextChoices):
    SALE = 'sale', 'For Sale'
    EXCHANGE = 'exchange', 'For Exchange'
    DONATION = 'donation', 'Free Donation'

class StatusChoices(models.TextChoices):
    ACTIVE = 'active', 'Active'
    SOLD = 'sold', 'Sold'
    EXCHANGED = 'exchanged', 'Exchanged'
    DONATED = 'donated', 'Donated'

class Product(models.Model):
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products'
    )
    title = models.CharField(max_length=200, db_index=True)
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=CategoryChoices.choices,
        default=CategoryChoices.BOOKS_NOTES,
        db_index=True
    )
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    condition = models.CharField(
        max_length=20,
        choices=ConditionChoices.choices,
        default=ConditionChoices.GOOD,
        db_index=True
    )
    image = models.ImageField(upload_to='products/%Y/%m/', blank=True, null=True)
    listing_type = models.CharField(
        max_length=20,
        choices=ListingTypeChoices.choices,
        default=ListingTypeChoices.SALE,
        db_index=True
    )
    exchange_preference = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Items or categories the seller wants in return"
    )
    college_name = models.CharField(max_length=200, blank=True, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (₹{self.selling_price}) - {self.get_listing_type_display()}"

    def save(self, *args, **kwargs):
        # Default college_name to seller's college if not explicitly provided
        if not self.college_name and hasattr(self.seller, 'profile') and self.seller.profile.college_name:
            self.college_name = self.seller.profile.college_name
        # Free donation items always have selling_price = 0
        if self.listing_type == ListingTypeChoices.DONATION:
            self.selling_price = 0.0
        super().save(*args, **kwargs)

class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} -> {self.product.title}"
