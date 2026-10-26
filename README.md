# THE CLASSIC CRUSH — BAKERY & CAFE ☕🍰
> **100% Pure Vegetarian Bakery, Café & Gifting Studio**

A premium, fully responsive, editorial website and management portal built from scratch for **The Classic Crush — Bakery & Cafe**. Inspired by high-end café visual branding, the official brand menu PDF, and the signature turquoise tabletop aesthetic.

---

## 🎨 Visual Identity & Palette

The design system strictly adheres to the brand palette tokens:
- **Signature Turquoise:** `#078F96` (Primary vibrant café accents & buttons)
- **Deep Teal:** `#064F50` (Primary editorial typography, dark hero backgrounds, and navbar highlights)
- **Warm Ivory / Cream:** `#F8F5ED` (Backgrounds, surface cards, and primary navbar)
- **Muted Sand:** `#D8C7AC` (Delicate separators, chip backgrounds, and card borders)
- **Espresso Brown:** `#594235` (Secondary body text and warm subtitles)
- **Pure White:** `#FFFFFF` (Surface cards and contrast pills)
- **Restrained Golden-Yellow:** `#E8C45A` (Subtitle badges, hero accents, and highlights)

**Typography:**
- **Headlines:** `Cinzel` & `Cormorant Garamond` (Oversized, high-contrast, editorial serif)
- **Body & Controls:** `DM Sans` (Clean, contemporary sans-serif)

---

## 🍽️ Source-of-Truth Menu (100% Pure Vegetarian)

Every item name, spelling, category, and Indian Rupee (₹) price aligns directly with the official TCC Menu PDF:

1. **Signature Desserts (Sweet cravings, always a good idea.)**
   - Sprinkled Baby — ₹49
   - Dark & White Delight — ₹59
   - Dark & Milk Delight — ₹59
   - Oreo Dark Crunch — ₹69
   - Triple Chocolate — ₹69
   - Milk Chocolate Fantasy — ₹69
   - Sweetheart — ₹69
   - I'm a Gems Baby — ₹69
   - Triple Choclate — ₹69 *(preserved spelling)*
   - Naughty Nutella — ₹69
   - Kitkat-ishh — ₹69 *(preserved spelling)*

2. **Beverages (Hot, cold, always a good idea.)**
   - Tea — ₹15
   - Hot Coffee — ₹30
   - Cold Coffee — ₹49
   - Mango Shake — ₹30
   - Lassi — ₹30
   - Mojito — ₹49
   - Blue Lagoon — ₹49

3. **Sandwiches & Maggie (Comfort in every bite)**
   - Veg Sandwich — ₹39
   - Cheese Sandwich — ₹59
   - Paneer Sandwich — ₹59
   - Corn Cheese Sandwich — ₹59
   - Tandoori Sandwich — ₹69
   - Veg Maggie — ₹39
   - Paneer Maggie — ₹59
   - Cheese Maggie — ₹59

4. **Burger & Fries (Classic done right)**
   - Veg Burger — ₹49
   - Paneer Burger — ₹59
   - Cheese Burger — ₹59
   - Classic Fries — ₹39
   - Peri Peri Fries — ₹49
   - Cheesy Fries — ₹59

5. **Momo (A bite of goodness)**
   - Veg Momo — ₹49
   - Fried Momo — ₹59
   - Kurkure Momo — ₹69
   - Cheese Momo — ₹69

6. **Quick Bites (Simple bites, big hapiness)**
   - Masala Patties — ₹25
   - Regular Patties — ₹20
   - Paneer Patties — ₹30
   - Cheese Masala Patties — ₹35
   - Regular Veg Pizza — ₹59
   - Korean Bun (1 Pc) — ₹39
   - Korean Bun (2 Pc) — ₹59
   - Paneer Pizza — ₹69

---

## 🛍️ Customer Pages & Key Features

| Route | Page | Highlights |
|---|---|---|
| `/` | **Homepage (Showstopper)** | Photographic hero with turquoise table overhead shot, stacked serif headline, 100% vegetarian pill, golden subtitle, View Menu & Order Now CTAs, Signature Cravings asymmetrical showcase, Gifting teaser, Our Little Corner, A Glimpse Inside horizontal gallery strip, and Come By, Stay Awhile visit card. |
| `/menu` | **Full Menu** | Category tabs with query param deep-linking (`?category=...`), instant text search, interactive quantity counters, live floating cart pill, and pure veg badges. |
| `/gifting` | **Gifting Studio** | Inspired by Ferns N Petals (FNP) in TCC branding: Fresh Flower Bouquets, Chocolate Hampers, Dessert & Sweet Boxes, Combos, Birthday Surprises, Just Because Gifts. Occasion filters, quick add, and sorting. |
| `/gifting/:slug` | **Gift Product Detail** | High-res gallery preview, add-on selections (cards, candles, extra truffles), personalized message composer, and recipient delivery scheduling. |
| `/gifting/build-your-gift` | **Custom Hamper Builder** | Step-by-step interactive hamper creator: choose packaging base, pick bakery sweets, add fresh blooms, write custom calligraphy card, and review summary. |
| `/our-story` | **Our Story** | Narrative about neighbourhood café culture, morning bakery bakes, 100% pure vegetarian promise, student-friendly ethos, and hospitality pillars. |
| `/gallery` | **Visual Journal** | Responsive masonry grid with category filters (Food, Drinks, Desserts, Gifting, Café) and interactive full-screen Lightbox modal. |
| `/visit-us` | **Visit Us** | Address details, opening hours, direct call & WhatsApp links, interactive Google Maps embed, and "Get Directions" navigation. |

---

## 🛒 Online Ordering & Fulfillment Flow

1. **Browse & Add:** Tap `+ Add` on any menu item or gift product.
2. **Persistent Cart Drawer (`QuickOrderDrawer`):** Slide-out drawer accessible on all pages. Adjust quantities with `+` / `-`, view item breakdown, subtotal, and grand total.
3. **Fulfillment Selection:** Choose between **Dine-in** (with table number), **Takeaway** (ready in ~15-20 mins), or **Home Delivery** (with address & landmark).
4. **Order Placement:** Enter full name and 10-digit mobile number.
5. **Confirmation Receipt:** Displays unique Order ID (e.g. `#1043`), itemized summary, estimated prep time, and direct WhatsApp sync button.
6. **Live Admin Sync:** Placed orders automatically appear in real-time in `/admin/orders`!

---

## 🔐 Staff Admin Portal (`/admin`)

Access the management dashboard at `/admin` (or `/admin/login`):

- **Default Email:** `admin@classiccrush.cafe`
- **Default Password:** `admin123`

### Administrative Capabilities:
- **Dashboard Overview:** Live order count, total revenue, average order value, popular items calculated from real orders, and recent order stream.
- **Menu Management (`/admin/menu`):** Add new items, edit names/prices/descriptions/images, toggle stock availability (In Stock / Sold Out), and delete items.
- **Order Management (`/admin/orders`):** Filter by status (`Pending`, `Confirmed`, `Preparing`, `Ready`, `Completed`, `Cancelled`), view customer address/notes, and update order statuses in real-time.
- **Gifting Catalogue (`/admin/gifting`):** Manage gift products, prices, included items, and gift orders.
- **Gallery Management (`/admin/gallery`):** Add new photos, change captions and categories, or toggle visibility.
- **Cafe Info & Settings (`/admin/cafe-info` & `/admin/settings`):** Update address, opening hours, WhatsApp number, phone number, and maintenance mode toggle.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (native `@theme` CSS custom properties)
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **State & Storage:** React Context (`DataContext`, `OrderContext`, `AuthContext`, `ToastContext`) with resilient `localStorage` persistence.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🗄️ Optional Backend / Supabase Configuration

The application is architected to transition seamlessly from client-side state/localStorage to a hosted Supabase PostgreSQL backend.

### Required Environment Variables (`.env.local`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### Recommended PostgreSQL Schema:
```sql
-- Menu Items
CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  price_display TEXT,
  description TEXT,
  image TEXT NOT NULL,
  is_vegetarian BOOLEAN DEFAULT TRUE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_signature BOOLEAN DEFAULT FALSE,
  prep_note TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pending',
  order_type TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Admins can edit menu items" ON menu_items FOR ALL TO authenticated USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and update orders" ON orders FOR ALL TO authenticated USING (true);
```

---

*Made with love for The Classic Crush — Bakery & Cafe.*
