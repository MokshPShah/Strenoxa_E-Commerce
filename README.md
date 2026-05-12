# 🛒 Strenoxa - Premium E-Commerce Platform

Strenoxa is a full-featured, high-performance E-Commerce web application built with **Next.js 14+ (App Router)**, **React**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS**. Designed for a premium shopping experience, it offers a seamless cart workflow, highly secure checkout processes, coupon management, and dynamic tax/shipping calculations.

---

**🔗 Live Demo:** [strenoxa.vercel.app](https://strenoxa.vercel.app)

---

## ✨ Key Features

### 🛍️ User Experience & Cart Management
- **Dynamic Cart State**: Add, remove, and modify product quantities with real-time state updates powered by Redux Toolkit.
- **Coupon & Discount System**: Users can apply promo codes (via URL parameters or input), validated directly against the backend for percentage or flat-rate discounts.
- **Dynamic Math Calculations**: Automatically calculates Subtotal, Discount, Estimated Tax, and Conditional Shipping (e.g., Free shipping thresholds).

### 💳 Checkout & Payment Processing
- **Razorpay Integration**: Fully integrated online payment flow supporting Credit/Debit Cards, UPI, and Netbanking via dynamic script injection.
- **Cash on Delivery (COD)**: Alternate offline payment method.
- **Order Verification**: Secure server-side verification of Razorpay signatures to prevent payment tampering.
- **Address Book**: Users can save multiple shipping addresses, choose a default, and dynamically select where to ship during the checkout flow.

### ⚙️ Modern Architecture
- **Next.js 14 App Router**: Utilizes modern React features including Server Components, Client Components (`"use client"`), and `Suspense` boundaries for optimized rendering and URL search param handling.
- **Fully Type-Safe**: Developed entirely in TypeScript to ensure code reliability and maintainability.
- **Responsive Design**: Fluid, mobile-first UI built with Tailwind CSS.

---

## 🛠️ Technologies Used

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **State Management**| Redux Toolkit |
| **Payment Gateway** | Razorpay SDK |
| **Icons & UI** | React Icons, React Hot Toast |
| **Database** | MongoDB (via Mongoose) |

---

## 🏗️ Architecture & Payment Flow

The checkout process (`app/checkout/page.tsx`) handles complex logic to ensure a smooth transaction:

1. **Initialization**: On load, it concurrently fetches user addresses and global store settings (tax rates, shipping fees) using `Promise.all` for performance.
2. **Discount Validation**: Detects URL search parameters (e.g., `?coupon=SUMMER20`) within a React `Suspense` boundary, triggering a backend validation API to apply real-time discounts.
3. **Payment Routing**:
   - **If COD**: The app directly hits the `/api/orders` endpoint and clears the Redux cart upon success.
   - **If Razorpay**: The app initializes an order via `/api/razorpay`, invokes the Razorpay frontend SDK, and upon user completion, sends the `razorpay_signature` to `/api/orders` for cryptographic verification.

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- npm, yarn, pnpm, or bun
- A Razorpay Developer Account (for API keys)
- A MongoDB cluster (Atlas or local)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MokshPShah/e-commerce.git
   cd e-commerce
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root of your project and populate it with your keys:
   ```env
   # Razorpay Keys
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication (NextAuth)
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open http://localhost:3000 with your browser to see the application running.

---

## 📁 Project Structure

A brief overview of the core project structure:

- `app/`: Next.js 14 App Router pages, layouts, and API routes.
  - `checkout/page.tsx`: Handles the primary checkout UI, Razorpay script loading, and order submission.
  - `shop/`: Product listing pages.
  - `dashboard/`: Protected user routes for managing addresses and viewing orders.
  - `app/api/`: Backend endpoints for orders, razorpay verification, address fetching, and coupon validation.
- `store/`: Redux Toolkit setup containing the global store and slices (e.g., `cartSlice.ts`).
- `components/`: Reusable React components (Buttons, Modals, Navbar, Footer).
- `models/`: Mongoose schemas defining the structure for Users, Orders, Products, and Addresses.

---

## 🔗 API Endpoints

Below are the key backend routes powering the frontend logic:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/user/addresses` | Retrieves the authenticated user's saved shipping addresses. |
| `GET` | `/api/settings` | Fetches dynamic store configurations (tax rates, shipping fees). |
| `POST` | `/api/coupons/validate` | Validates a provided coupon code against the cart subtotal. |
| `POST` | `/api/razorpay` | Communicates with the Razorpay API to generate a new order ID. |
| `POST` | `/api/orders` | Finalizes the order. Handles Razorpay signature verification OR Cash on Delivery creation. |

---

## 🤝 Contributing

Contributions, issues, and feature requests are highly welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
