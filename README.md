# CampusSwap – Student Second-Hand Marketplace
> **"Buy. Sell. Swap. Save."**

CampusSwap is a full-stack, college-focused second-hand marketplace where students can buy, sell, exchange, and donate pre-loved products within their college community. It directly connects senior students who have unused coursework materials and hostel supplies with junior students who need affordable essentials, powering a zero-waste circular campus economy.

Developed as a startup innovation competition prototype with a production-grade architecture.

---

## 1. Project Folder Structure

```
CampusSwap/
├── backend/
│   ├── accounts/                        # Custom student auth & profile app
│   │   ├── migrations/                  # Database migration files
│   │   ├── admin.py                     # Django admin customizations
│   │   ├── models.py                    # User (AbstractBaseUser) & StudentProfile
│   │   ├── serializers.py              # JWT, profile & register serializers
│   │   ├── tests.py                     # Automated auth unit tests
│   │   ├── urls.py                      # /api/accounts/ routes
│   │   └── views.py                     # Register, Login, Profile & Stats views
│   ├── config/                          # Project configuration root
│   │   ├── settings.py                  # Settings, CORS, JWT, Media storage
│   │   ├── urls.py                      # Root URL routing & media dispatcher
│   │   ├── wsgi.py                      # WSGI production server hook
│   │   └── asgi.py                      # ASGI server hook
│   ├── marketplace/                     # Core product, favorites & pricing engine
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── seed_data.py         # Seed command generating realistic demo listings & Pillow banners
│   │   ├── migrations/                  # Product & Favorite migrations
│   │   ├── admin.py                     # Product & Favorite Django admin
│   │   ├── models.py                    # Product (choices, condition, type) & Favorite
│   │   ├── pricing_engine.py            # AI Fair Price Assistant (resale valuation engine)
│   │   ├── serializers.py              # Product list/detail, CRUD & price serializers
│   │   ├── tests.py                     # CRUD, permissions, price AI & messaging unit tests
│   │   ├── urls.py                      # /api/products/, /api/favorites/, /api/price-suggestion/
│   │   └── views.py                     # Product & Favorite views with filters & sorting
│   ├── media/                           # Local media storage for product photos & banners
│   │   └── products/                    # Organized uploads
│   ├── messaging/                       # Peer enquiry and message threading
│   │   ├── migrations/                  # Enquiry & Message migrations
│   │   ├── admin.py                     # Enquiry & Message admin
│   │   ├── models.py                    # Enquiry & Message models
│   │   ├── serializers.py              # Enquiry detail/list & reply serializers
│   │   ├── urls.py                      # /api/messages/ routes
│   │   └── views.py                     # Threaded conversation views
│   ├── db.sqlite3                       # Initial SQLite database (PostgreSQL compatible)
│   ├── manage.py                        # Django CLI entrypoint
│   └── requirements.txt                 # Backend Python dependencies
├── frontend/
│   ├── public/                          # Static assets and favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactSellerModal.jsx   # Direct modal to send product enquiries
│   │   │   ├── Footer.jsx               # Branded footer & campus safety guidelines
│   │   │   ├── Navbar.jsx               # Responsive navigation & student profile dropdown
│   │   │   ├── PriceAssistantWidget.jsx # AI Fair Price Assistant interactive calculator
│   │   │   ├── ProductCard.jsx          # Modern responsive card with favorite toggles
│   │   │   └── ProtectedRoute.jsx       # Route guard for authenticated actions
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # User state, JWT storage & session refresh
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Student dashboard (listings, favorites, enquiries, profile)
│   │   │   ├── DonatePage.jsx           # Free student donations hub
│   │   │   ├── EditItem.jsx             # Product editing form (owner protected)
│   │   │   ├── ExchangePage.jsx         # Product barter & exchange directory
│   │   │   ├── Home.jsx                 # Landing page (hero, categories, stats, how-it-works)
│   │   │   ├── Login.jsx                # Login with 1-click judge demo auto-fill
│   │   │   ├── Marketplace.jsx          # Search, category/condition filters, sorting, pagination
│   │   │   ├── ProductDetail.jsx        # Full listing details, seller info & contact action
│   │   │   ├── Register.jsx             # Registration form with college name
│   │   │   └── SellItem.jsx             # Product upload form with AI Price Assistant
│   │   ├── services/
│   │   │   └── api.js                   # Axios client with JWT interceptors & error handlers
│   │   ├── App.jsx                      # App router configuration
│   │   ├── index.css                    # Tailwind CSS directives & scrollbar styling
│   │   └── main.jsx                     # Vite DOM entrypoint
│   ├── index.html                       # HTML template with Plus Jakarta Sans & Inter
│   ├── package.json                     # Frontend dependencies & scripts
│   ├── postcss.config.js                # PostCSS configuration
│   ├── tailwind.config.js               # Emerald Green & Dark Navy custom color palette
│   └── vite.config.js                   # Vite configuration
├── .gitignore                           # Git ignore rules for Python, Node & Media
└── README.md                            # Comprehensive documentation & pitch guide
```

---

## 2. Technology Stack & Architecture

### Frontend
- **Framework:** React.js (v18) with Vite
- **Styling:** Tailwind CSS (Custom palette: Primary Emerald Green `#059669`, Secondary Navy `#0f172a`, Accent `#ecfdf5`)
- **Navigation:** React Router DOM (v6)
- **HTTP Client:** Axios with automated JWT Bearer interceptor and 401 token refresh
- **Icons:** Lucide React icons
- **Typography:** Plus Jakarta Sans & Inter

### Backend
- **Framework:** Python 3.11+ / Django 5.2
- **REST Layer:** Django REST Framework (DRF)
- **Authentication:** DRF Simple JWT (Access token + Refresh token rotation)
- **CORS Handling:** `django-cors-headers`
- **Image Processing:** Pillow 13.0 (for product image handling & banner generation)
- **Database:** SQLite 3 for zero-setup MVP development; ORM structure is 100% PostgreSQL compliant (uses standard BigAutoField, decimal fields, text choices, and indexed foreign keys).
- **Media Storage:** Django Media Storage with `/media/` serving during development and 5MB upload size guardrails.

---

## 3. Database Models & Schema Design

### 1. `accounts.User`
- `email`: `EmailField(unique=True, db_index=True)` – acts as `USERNAME_FIELD`
- `full_name`: `CharField(max_length=150)`
- `is_active`, `is_staff`, `date_joined`: Standard Django permission flags
- Password hashing via Django PBKDF2 with SHA256

### 2. `accounts.StudentProfile`
- `user`: OneToOne relation with `User` (`related_name='profile'`)
- `college_name`: `CharField(max_length=200)`
- `phone_number`: Optional contact number
- `bio`: Student bio & semester interests
- `year_of_study`: e.g. "3rd Year, B.Tech CSE"
- `avatar`: Profile photo upload

### 3. `marketplace.Product`
- `seller`: ForeignKey to `User` (`related_name='products'`)
- `title`: `CharField(max_length=200, db_index=True)`
- `description`: `TextField`
- `category`: Choices (`books_notes`, `electronics`, `academic_equipment`, `hostel_essentials`, `sports_equipment`, `other`)
- `original_price`: `DecimalField(max_digits=10, decimal_places=2)`
- `selling_price`: `DecimalField(max_digits=10, decimal_places=2, default=0.0)`
- `condition`: Choices (`like_new`, `good`, `used`)
- `listing_type`: Choices (`sale`, `exchange`, `donation`)
- `exchange_preference`: What the student wants in return when `listing_type == 'exchange'`
- `college_name`: Indexed college identifier (auto-inherited from seller profile)
- `status`: Choices (`active`, `sold`, `exchanged`, `donated`)
- `image`: `ImageField(upload_to='products/%Y/%m/', blank=True, null=True)`
- `created_at`, `updated_at`: Timestamps

### 4. `marketplace.Favorite`
- `user`: ForeignKey to `User`
- `product`: ForeignKey to `Product`
- `unique_together`: `('user', 'product')` ensures zero duplicate favorites

### 5. `messaging.Enquiry`
- `product`: ForeignKey to `Product`
- `buyer`: ForeignKey to `User`
- `seller`: ForeignKey to `User`
- `subject`: `CharField(max_length=200)`
- `status`: Choices (`pending`, `responded`, `closed`)

### 6. `messaging.Message`
- `enquiry`: ForeignKey to `Enquiry` (`related_name='messages'`)
- `sender`: ForeignKey to `User`
- `body`: `TextField`
- `is_read`: Boolean read status
- `created_at`: Timestamp for chronological ordering

---

## 4. REST API Endpoint Documentation

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/accounts/register/` | Register new student (`full_name`, `email`, `password`, `confirm_password`, `college_name`) | No |
| `POST` | `/api/accounts/login/` | Obtain JWT access and refresh tokens + profile payload | No |
| `POST` | `/api/accounts/token/refresh/` | Refresh expired access token | No |
| `GET` | `/api/accounts/profile/` | Fetch current student profile details | Yes (Bearer) |
| `PUT` | `/api/accounts/profile/` | Update profile information and bio | Yes (Bearer) |
| `GET` | `/api/accounts/dashboard/stats/`| Aggregated metrics (active listings, sold, favorites, enquiries) | Yes (Bearer) |
| `GET` | `/api/products/` | Filtered & paginated listings (`search`, `category`, `condition`, `listing_type`, `sort`) | No |
| `POST` | `/api/products/` | Create a new product listing (multipart with image) | Yes (Bearer) |
| `GET` | `/api/products/{id}/` | Retrieve full product details & seller public info | No |
| `PUT` | `/api/products/{id}/` | Update product listing details | Yes (Owner) |
| `DELETE` | `/api/products/{id}/` | Delete product listing permanently | Yes (Owner) |
| `PATCH` | `/api/products/{id}/status/` | Toggle status (e.g. mark as `sold` or `active`) | Yes (Owner) |
| `GET` | `/api/products/my-listings/` | List products owned by logged-in student | Yes (Bearer) |
| `GET` | `/api/favorites/` | List all saved products for the current student | Yes (Bearer) |
| `POST` | `/api/favorites/` | Add a product to favorites (`product_id`) | Yes (Bearer) |
| `DELETE` | `/api/favorites/{id}/` | Remove product from favorites by favorite ID or product ID | Yes (Bearer) |
| `GET` | `/api/messages/` | List enquiries (`?type=received` or `?type=sent`) | Yes (Bearer) |
| `POST` | `/api/messages/` | Create new enquiry (`product_id`, `message`) or reply (`enquiry_id`, `body`) | Yes (Bearer) |
| `GET` | `/api/messages/{id}/` | Retrieve full conversation thread and mark incoming as read | Yes (Participant) |
| `POST` | `/api/price-suggestion/` | AI Fair Price Assistant calculation | No |

---

## 5. Innovation Feature: "AI Fair Price Assistant"

### The Problem
College students frequently struggle to price their pre-loved textbooks, drafters, or electronics. Overpricing leads to unsold items gathering dust in dorm rooms; underpricing discourages seniors from listing products.

### The Innovation
CampusSwap features a built-in **AI Fair Price Assistant** rule-based resale valuation engine:
- **Condition Multipliers:**
  - *Like New:* 70% – 85% of original purchase price.
  - *Good:* 50% – 70% of original purchase price.
  - *Used:* 25% – 50% of original purchase price.
- **Category Dynamic Adjustments:**
  - *Books & Notes:* +5% demand adjustment for standardized curriculum textbooks.
  - *Academic Equipment:* 1.0x stable multi-semester retention for mechanical instruments (drafters, compasses).
  - *Electronics:* -5% technical wear discount.
  - *Hostel Essentials:* Seasonal depreciation adjustment.
- **Explainability:** Returns an estimated rupee range (e.g. ₹1050 – ₹1275) accompanied by a transparent breakdown explaining why that range enables a fast, equitable campus deal.
- **1-Click Integration:** On the "Sell an Item" form, clicking "Use Average" or "Use Min" auto-populates the selling price field immediately.
- **Extensible Architecture:** Encapsulated in `marketplace/pricing_engine.py`, structured so an LLM API (such as Google Gemini Flash) or market inference model can be dropped in seamlessly.

---

## 6. Installation & Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend Setup

1. **Navigate to the backend directory and activate the virtual environment:**
   ```bash
   cd backend
   # On Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   # source venv/bin/activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Apply database migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Seed demonstration accounts and listings:**
   ```bash
   python manage.py seed_data
   ```

5. **Start the Django development server:**
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   *Backend will run at:* `http://127.0.0.1:8000/`

---

### Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install npm dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   *Frontend will run at:* `http://localhost:5173/`

---

## 7. Demonstration Accounts (For Startup Competition Judges)

All demo accounts come pre-configured with realistic campus listings, favorites, and enquiry threads.

| Student Name | Email | Password | Campus / Role |
|---|---|---|---|
| **Rahul Sharma** | `rahul.sharma@iitd.ac.in` | `Demo@123` | IIT Delhi (Senior CSE – Books & Scientific Calculator seller) |
| **Priya Patel** | `priya.patel@nitt.edu` | `Demo@123` | NIT Trichy (Mech – Drawing Kit seller & Arduino barter) |
| **Ananya Deshmukh**| `ananya.deshmukh@dtu.ac.in` | `Demo@123` | DTU (ECE – Study lamp seller & Free Lecture Notes donor) |
| **Vikram Singh** | `vikram.singh@bits.ac.in` | `Demo@123` | BITS Pilani (Dual Degree – Keyboard & Badminton racquet) |
| **Campus Admin** | `admin@campusswap.edu` | `Admin@123` | Platform Administrator (`/admin/`) |

> **Pro-Tip for Judges:** On the **Login Page (`/login`)**, click any student button under **"Demo Accounts for Judges"** to auto-fill credentials with 1 click!

---

## 8. Automated Test Results

Automated unit tests cover all user journeys, including user registration, login, JWT token issuance, profile updates, product creation, permission checks, status toggling, favorite management, AI price suggestion, and buyer-seller messaging:

```bash
python manage.py test accounts marketplace
```

**Output:**
```text
Creating test database for alias 'default'...
...........
----------------------------------------------------------------------
Ran 11 tests in 13.183s

OK
Destroying test database for alias 'default'...
Found 11 test(s).
System check identified no issues (0 silenced).
```

---

## 9. Startup Competition Demonstration Guide

Follow this 5-minute step-by-step walkthrough during your pitch:

### Step 1: The Campus Problem & Landing Page (1 minute)
1. Open `http://localhost:5173/`.
2. Highlight the tagline: **"Buy. Sell. Swap. Save."**
3. Showcase the **Sustainability Impact Tracker** (textbooks reused, kg CO₂ avoided, zero-commission savings).
4. Browse the **Categories** and click **"Books and Notes"** or **"Academic Equipment"** to filter the marketplace.

### Step 2: Marketplace Search & Condition Filters (1 minute)
1. In the search bar, type `Calculator` or `Drawing`.
2. Notice the instant search and filtering.
3. Filter by **Listing Type** (e.g. click "For Exchange" or "Free Donation").
4. Filter by **Condition** ("Like New", "Good", "Used").
5. Sort by **"Price: Low to High"**.

### Step 3: Interactive Innovation – "AI Fair Price Assistant" (1.5 minutes)
1. Click **"Sell an Item"** in the navigation bar.
2. If prompted, log in with 1-click as **Rahul Sharma**.
3. In the right-hand **AI Fair Price Assistant** widget:
   - Enter Product Title: `Casio Scientific Calculator`
   - Enter Original Price: `1500`
   - Select Condition: `Like New (70% - 85%)`
   - Click **"Calculate Fair Price Recommendation"**.
4. Show the judges the calculated range: **₹1050 – ₹1275** with the transparent valuation rationale.
5. Click **"Use Average: ₹1163"** — notice how the selling price input on the listing form instantly populates!
6. Publish the listing and show how it immediately appears on the live marketplace.

### Step 4: Contact Seller & Messaging System (1 minute)
1. Click on **"Scientific Calculator"** or **"Engineering Drawing Kit"**.
2. Click **"Contact Seller"**.
3. Send an enquiry: *"Can we meet outside the central library tomorrow at 4 PM to inspect the drafter?"*
4. Go to **Dashboard (`/dashboard`)** -> **"Messages & Enquiries"** tab.
5. Demonstrate the conversational thread, timestamps, and reply box.

### Step 5: Student Dashboard & Sustainable Exchange (30 seconds)
1. Show the **Student Dashboard**:
   - Live database stats (Active Listings, Sold Items, Saved Favorites, Inbound Enquiries).
   - Toggle an item's status to **"Mark Sold"** — observe how the card updates to "Sold Out" across the app.
   - Show the **"Free Donation"** section (`/donate`) highlighting community-driven campus support.

---

## 10. Known Limitations & Roadmap

1. **Real-Time WebSockets:** Current messaging uses REST polling and active enquiry updates. The models and frontend architecture are prepared for Django Channels WebSockets in v2.0.
2. **PostgreSQL Migration:** SQLite was used for rapid offline demonstration; transitioning to PostgreSQL in production requires only configuring `DATABASE_URL` in `config/settings.py` (all models use DB-agnostic fields).
3. **Live Gemini AI Integration:** The rule-based engine in `marketplace/pricing_engine.py` can be upgraded to live Google Gemini Flash API calls with visual image-condition verification.
4. **Email Verification:** The MVP provides a frictionless demo registration workflow without requiring external SMTP configuration. Production deployment can enable standard Django email tokens.

---

## License
MIT License. Built for university innovation competitions and collegiate circular economy initiatives.
