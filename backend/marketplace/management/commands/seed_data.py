import os
from pathlib import Path
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont
import io

from accounts.models import StudentProfile
from marketplace.models import (
    Product,
    Favorite,
    CategoryChoices,
    ConditionChoices,
    ListingTypeChoices,
    StatusChoices
)
from messaging.models import Enquiry, Message

User = get_user_model()

def create_product_banner(title: str, category_name: str, color_bg=(16, 185, 129), color_fg=(255, 255, 255)) -> ContentFile:
    """Generates a modern branded placeholder image with Pillow."""
    img = Image.new('RGB', (600, 400), color=color_bg)
    draw = ImageDraw.Draw(img)

    # Decorative header banner
    draw.rectangle([(0, 0), (600, 60)], fill=(15, 23, 42))
    
    # Try default or simple font
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    # Text drawing
    brand_text = "CAMPUSSWAP | Verified Student Listing"
    draw.text((20, 22), brand_text, fill=(255, 255, 255), font=font)

    # Category tag badge
    draw.rectangle([(30, 90), (220, 125)], fill=(255, 255, 255, 128))
    draw.text((45, 100), f"Category: {category_name}", fill=(15, 23, 42), font=font)

    # Product Title in center
    draw.rectangle([(30, 160), (570, 270)], fill=(15, 23, 42, 200))
    draw.text((50, 195), title[:45], fill=(255, 255, 255), font=font)
    draw.text((50, 225), "Buy * Sell * Swap * Save", fill=(52, 211, 153), font=font)

    # Bottom watermark
    draw.text((30, 360), "Official Campus Demonstration Product", fill=(255, 255, 255), font=font)

    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=88)
    return ContentFile(buffer.getvalue())

class Command(BaseCommand):
    help = "Seeds database with realistic student accounts, marketplace listings, and enquiries."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Initializing CampusSwap demonstration data seed..."))

        # 1. Admin Superuser
        admin_email = "admin@campusswap.edu"
        admin_user, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'full_name': 'Campus Admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password("Admin@123")
            admin_user.save()
            StudentProfile.objects.create(
                user=admin_user,
                college_name="Indian Institute of Technology, Delhi",
                phone_number="+91 9876543210",
                bio="CampusSwap System Administrator & Platform Coordinator.",
                year_of_study="Faculty / Admin"
            )
            self.stdout.write(self.style.SUCCESS(f"Created Superuser: {admin_email} / Admin@123"))

        # 2. Student Accounts
        students_data = [
            {
                'email': 'rahul.sharma@iitd.ac.in',
                'full_name': 'Rahul Sharma',
                'college': 'Indian Institute of Technology, Delhi',
                'phone': '+91 9811122233',
                'bio': 'Final year CSE undergraduate. Selling and donating previous semester coursework materials.',
                'year': '4th Year, B.Tech CSE'
            },
            {
                'email': 'priya.patel@nitt.edu',
                'full_name': 'Priya Patel',
                'college': 'National Institute of Technology, Trichy',
                'phone': '+91 9822233344',
                'bio': '3rd year Mechanical student. Interested in exchanging engineering gear.',
                'year': '3rd Year, B.Tech Mech'
            },
            {
                'email': 'ananya.deshmukh@dtu.ac.in',
                'full_name': 'Ananya Deshmukh',
                'college': 'Delhi Technological University',
                'phone': '+91 9833344455',
                'bio': '2nd year ECE student looking to pass on hostel essentials and textbooks.',
                'year': '2nd Year, B.Tech ECE'
            },
            {
                'email': 'vikram.singh@bits.ac.in',
                'full_name': 'Vikram Singh',
                'college': 'BITS Pilani',
                'phone': '+91 9844455566',
                'bio': 'Hostel council member. Passionate about sustainability and campus circular economy.',
                'year': '4th Year, Dual Degree'
            }
        ]

        users = {}
        for s in students_data:
            user, created = User.objects.get_or_create(
                email=s['email'],
                defaults={'full_name': s['full_name']}
            )
            if created:
                user.set_password("Demo@123")
                user.save()
            StudentProfile.objects.update_or_create(
                user=user,
                defaults={
                    'college_name': s['college'],
                    'phone_number': s['phone'],
                    'bio': s['bio'],
                    'year_of_study': s['year']
                }
            )
            users[s['email']] = user
            self.stdout.write(f"Student ready: {s['email']} (Password: Demo@123)")

        # 3. Sample Listings (Including all requested 7 items + exchange & donation)
        products_data = [
            {
                'seller_email': 'rahul.sharma@iitd.ac.in',
                'title': 'Engineering Mathematics Textbook',
                'description': 'Advanced Engineering Mathematics by Erwin Kreyszig (10th Edition). Includes solved practice exercises, formula book, and highlighted semester exam notes. Great for 1st & 2nd year students.',
                'category': CategoryChoices.BOOKS_NOTES,
                'original_price': 850.00,
                'selling_price': 250.00,
                'condition': ConditionChoices.GOOD,
                'listing_type': ListingTypeChoices.SALE,
                'college_name': 'Indian Institute of Technology, Delhi',
                'color': (5, 150, 105), # emerald
            },
            {
                'seller_email': 'rahul.sharma@iitd.ac.in',
                'title': 'Scientific Calculator',
                'description': 'Casio fx-991EX ClassWiz scientific calculator. 552 functions with natural textbook display and spreadsheet capability. Fully functional with brand new battery installed.',
                'category': CategoryChoices.ACADEMIC_EQUIPMENT,
                'original_price': 1495.00,
                'selling_price': 450.00,
                'condition': ConditionChoices.LIKE_NEW,
                'listing_type': ListingTypeChoices.SALE,
                'college_name': 'Indian Institute of Technology, Delhi',
                'color': (30, 58, 138), # navy blue
            },
            {
                'seller_email': 'priya.patel@nitt.edu',
                'title': 'Engineering Drawing Kit',
                'description': 'Complete engineering graphics kit containing mini drafter, compass set, set squares (45 & 60 deg), French curves, drawing sheet holder tube, and 0.5mm mechanical pencils.',
                'category': CategoryChoices.ACADEMIC_EQUIPMENT,
                'original_price': 900.00,
                'selling_price': 300.00,
                'condition': ConditionChoices.GOOD,
                'listing_type': ListingTypeChoices.SALE,
                'college_name': 'National Institute of Technology, Trichy',
                'color': (14, 116, 144), # cyan dark
            },
            {
                'seller_email': 'vikram.singh@bits.ac.in',
                'title': 'Used Laptop Keyboard',
                'description': 'Logitech K380 multi-device wireless Bluetooth keyboard. Pairs with up to 3 devices simultaneously. All keys responsive with minimal cosmetic shine on spacebar.',
                'category': CategoryChoices.ELECTRONICS,
                'original_price': 2499.00,
                'selling_price': 500.00,
                'condition': ConditionChoices.USED,
                'listing_type': ListingTypeChoices.SALE,
                'college_name': 'BITS Pilani',
                'color': (51, 65, 85), # slate
            },
            {
                'seller_email': 'ananya.deshmukh@dtu.ac.in',
                'title': 'Hostel Study Lamp',
                'description': 'Rechargeable LED desk study lamp with 3 color temperatures, touch dimmer switch, and flexible 360-degree gooseneck. Lasts 6 hours on single charge during power cuts.',
                'category': CategoryChoices.HOSTEL_ESSENTIALS,
                'original_price': 699.00,
                'selling_price': 200.00,
                'condition': ConditionChoices.GOOD,
                'listing_type': ListingTypeChoices.SALE,
                'college_name': 'Delhi Technological University',
                'color': (217, 119, 6), # amber
            },
            {
                'seller_email': 'vikram.singh@bits.ac.in',
                'title': 'Sports Equipment',
                'description': 'Yonex Carbonex badminton racquet with protective full zip thermal cover and a can of 3 feather shuttlecocks. Freshly strung with BG65 at 24 lbs tension.',
                'category': CategoryChoices.SPORTS_EQUIPMENT,
                'original_price': 1200.00,
                'selling_price': 350.00,
                'condition': ConditionChoices.GOOD,
                'listing_type': ListingTypeChoices.SALE,
                'college_name': 'BITS Pilani',
                'color': (225, 29, 72), # rose
            },
            {
                'seller_email': 'rahul.sharma@iitd.ac.in',
                'title': 'Programming Reference Book',
                'description': 'Introduction to Algorithms (CLRS 3rd Edition) + Clean Code by Robert C. Martin. Essential guides for data structures, algorithms, coding competitions, and placements.',
                'category': CategoryChoices.BOOKS_NOTES,
                'original_price': 1500.00,
                'selling_price': 400.00,
                'condition': ConditionChoices.LIKE_NEW,
                'listing_type': ListingTypeChoices.SALE,
                'college_name': 'Indian Institute of Technology, Delhi',
                'color': (16, 185, 129), # emerald
            },
            # 8. Exchange listing
            {
                'seller_email': 'priya.patel@nitt.edu',
                'title': 'Arduino Starter Kit with Sensors',
                'description': 'Arduino Uno R3 board with breadboard, jumper wires, ultrasonic sensor, motor driver, and LCD display. Willing to swap with another student.',
                'category': CategoryChoices.ELECTRONICS,
                'original_price': 1600.00,
                'selling_price': 400.00,
                'condition': ConditionChoices.LIKE_NEW,
                'listing_type': ListingTypeChoices.EXCHANGE,
                'exchange_preference': 'Looking to swap for Raspberry Pi Zero or STM32 development board.',
                'college_name': 'National Institute of Technology, Trichy',
                'color': (3, 105, 161),
            },
            # 9. Free Donation listing
            {
                'seller_email': 'ananya.deshmukh@dtu.ac.in',
                'title': 'First Year Handwritten Lecture Notes & Question Bank',
                'description': 'Complete spiral-bound handwritten notes for Physics, Basic Electrical Engineering, and Workshop Technology. Free donation for any incoming junior student who needs it!',
                'category': CategoryChoices.BOOKS_NOTES,
                'original_price': 500.00,
                'selling_price': 0.00,
                'condition': ConditionChoices.GOOD,
                'listing_type': ListingTypeChoices.DONATION,
                'college_name': 'Delhi Technological University',
                'color': (13, 148, 136), # teal
            },
            # 10. Hostel essentials exchange
            {
                'seller_email': 'vikram.singh@bits.ac.in',
                'title': 'Hostel Electric Kettle (1.5L Stainless Steel)',
                'description': 'Prestige 1.5L electric kettle with auto-cutoff. Perfect for late-night noodles and coffee during exam week.',
                'category': CategoryChoices.HOSTEL_ESSENTIALS,
                'original_price': 999.00,
                'selling_price': 0.00,
                'condition': ConditionChoices.GOOD,
                'listing_type': ListingTypeChoices.DONATION,
                'college_name': 'BITS Pilani',
                'color': (100, 116, 139),
            }
        ]

        created_products = []
        for p in products_data:
            seller = users[p['seller_email']]
            product, created = Product.objects.get_or_create(
                title=p['title'],
                seller=seller,
                defaults={
                    'description': p['description'],
                    'category': p['category'],
                    'original_price': p['original_price'],
                    'selling_price': p['selling_price'],
                    'condition': p['condition'],
                    'listing_type': p['listing_type'],
                    'exchange_preference': p.get('exchange_preference', ''),
                    'college_name': p['college_name'],
                    'status': StatusChoices.ACTIVE,
                }
            )
            # Create banner image if not exists
            if not product.image:
                banner_file = create_product_banner(
                    title=p['title'],
                    category_name=p['category'],
                    color_bg=p.get('color', (16, 185, 129))
                )
                safe_slug = p['title'].lower().replace(' ', '_').replace('/', '_')[:30]
                product.image.save(f"{safe_slug}.jpg", banner_file, save=True)

            created_products.append(product)
            self.stdout.write(f"Product ready: {product.title} (₹{product.selling_price}) [{product.listing_type}]")

        # 4. Sample Favorites
        rahul = users['rahul.sharma@iitd.ac.in']
        priya = users['priya.patel@nitt.edu']
        ananya = users['ananya.deshmukh@dtu.ac.in']

        if len(created_products) >= 4:
            Favorite.objects.get_or_create(user=rahul, product=created_products[2])
            Favorite.objects.get_or_create(user=rahul, product=created_products[3])
            Favorite.objects.get_or_create(user=priya, product=created_products[0])
            Favorite.objects.get_or_create(user=ananya, product=created_products[1])
            self.stdout.write(self.style.SUCCESS("Sample Favorites populated."))

        # 5. Sample Enquiries & Messages
        calc_product = created_products[1] # Scientific Calculator by Rahul
        enquiry, enq_created = Enquiry.objects.get_or_create(
            product=calc_product,
            buyer=ananya,
            seller=calc_product.seller,
            defaults={'subject': f"Interested in '{calc_product.title}'"}
        )
        if enq_created:
            Message.objects.create(
                enquiry=enquiry,
                sender=ananya,
                body="Hi Rahul! Is the calculator still available? Can we meet near the library tomorrow?"
            )
            Message.objects.create(
                enquiry=enquiry,
                sender=calc_product.seller,
                body="Hello Ananya, yes it is available and working great! Sure, let us meet outside the central library around 4 PM."
            )
            self.stdout.write(self.style.SUCCESS("Sample Enquiry and Messages populated."))

        self.stdout.write(self.style.SUCCESS("\n[SUCCESS] CampusSwap seed data populated successfully!"))
