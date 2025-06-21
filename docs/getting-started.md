
# Getting Started

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd neurolint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_PAYPAL_CLIENT_ID`: PayPal client ID for payments

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## First Steps

1. **Create an account** - Sign up for a new user account
2. **Upload code files** - Drop your React/TypeScript files for analysis
3. **Review results** - Examine detected issues and suggestions
4. **Apply fixes** - Use one-click fixes or bulk operations
5. **Download improved code** - Get your optimized files

## Configuration

### Theme Settings
- Toggle between light/dark/system themes
- Customize notification preferences
- Set analysis preferences

### Analysis Options
- Enable/disable specific checkers
- Configure severity levels
- Set performance thresholds
- Customize security rules
