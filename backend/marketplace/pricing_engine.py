"""
AI Fair Price Assistant - Resale Price Estimation Engine
Provides student-friendly valuation and pricing benchmarks for campus second-hand listings.
Structured modularly for future expansion with Google Gemini API / live market inference.
"""

from decimal import Decimal, ROUND_HALF_UP

CATEGORY_MODIFIERS = {
    'books_notes': {
        'factor': 1.05,
        'note': "High student demand for standard university textbooks and annotated notes."
    },
    'electronics': {
        'factor': 0.95,
        'note': "Electronics experience faster technical wear; functional testing is recommended."
    },
    'academic_equipment': {
        'factor': 1.00,
        'note': "Engineering instruments and lab equipment maintain consistent utility across academic years."
    },
    'hostel_essentials': {
        'factor': 0.90,
        'note': "Hostel furnishings depend heavily on semester move-in cycles."
    },
    'sports_equipment': {
        'factor': 0.95,
        'note': "Recreational sports items hold steady demand among hostel and sports club students."
    },
    'other': {
        'factor': 0.90,
        'note': "General miscellaneous items."
    }
}

CONDITION_RANGES = {
    'like_new': (0.70, 0.85, "Like New condition (minimal wear, fully functional, original packaging or crisp pages)."),
    'good': (0.50, 0.70, "Good condition (minor cosmetic wear or highlighting, zero functional defects)."),
    'used': (0.25, 0.50, "Well-used condition (visible wear, markings, but structurally sound and usable).")
}

def calculate_fair_price(product_name: str, original_price: float, category: str, condition: str) -> dict:
    """
    Computes rule-based estimated fair resale price range for campus marketplace products.
    """
    orig_dec = Decimal(str(original_price))
    
    # Retrieve condition base percentages
    min_pct, max_pct, condition_note = CONDITION_RANGES.get(
        condition,
        (0.40, 0.60, "Standard campus condition.")
    )

    # Retrieve category modifier
    cat_info = CATEGORY_MODIFIERS.get(category, {'factor': 1.0, 'note': "General college supplies."})
    cat_factor = Decimal(str(cat_info['factor']))

    raw_min = orig_dec * Decimal(str(min_pct)) * cat_factor
    raw_max = orig_dec * Decimal(str(max_pct)) * cat_factor

    # Round to clean integer rupee values
    suggested_min = int(raw_min.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
    suggested_max = int(raw_max.quantize(Decimal('1'), rounding=ROUND_HALF_UP))

    # Guardrails
    if suggested_min < 10:
        suggested_min = 10
    if suggested_max <= suggested_min:
        suggested_max = suggested_min + 50

    explanation = (
        f"For '{product_name}' originally priced at ₹{int(orig_dec)}: "
        f"Based on a {condition.replace('_', ' ').title()} rating ({int(min_pct*100)}%-{int(max_pct*100)}% base value) "
        f"and {cat_info['note']} "
        f"We estimate students on campus will find ₹{suggested_min} – ₹{suggested_max} to be a quick and fair deal."
    )

    return {
        'product_name': product_name,
        'original_price': float(orig_dec),
        'suggested_min_price': suggested_min,
        'suggested_max_price': suggested_max,
        'currency': 'INR',
        'condition': condition,
        'category': category,
        'explanation': explanation,
        'model_type': 'Rule-Based Resale Valuation Engine (MVP v1.0)',
        'disclaimer': 'Estimated resale price based on campus item conditions. Final price remains at the seller\'s discretion.'
    }
