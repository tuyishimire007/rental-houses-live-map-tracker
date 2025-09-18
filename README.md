# Rental Tracker

A real-time rental property tracking application built with Next.js 14, Supabase, and Google Maps API.

## Features

- **Interactive Map Interface**: Full-screen Google Maps with real-time property pins
- **Property Management**: Owners can add, edit, and manage their rental properties
- **Real-time Updates**: Live updates when property status changes
- **Location Tracking**: Optional visitor arrival tracking with confirmation prompts
- **Role-based Access**: Different interfaces for owners, renters, and admins
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + real-time subscriptions)
- **Maps**: Google Maps JavaScript API
- **Authentication**: Supabase Auth
- **Hosting**: Vercel (frontend) + Supabase (backend)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Maps API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rental-tracker
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp env.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the migration file:
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
   ```
3. Enable Row Level Security (RLS) policies are already included in the migration
4. Get your project URL and anon key from Settings > API

### 4. Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Maps JavaScript API
3. Create an API key and restrict it to your domain
4. Add the key to your `.env.local` file

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

1. **profiles**
   - User profiles with role-based access (owner, renter, admin)
   - Links to Supabase auth users

2. **properties**
   - Rental property listings
   - Includes location, price, images, and status
   - Real-time status updates (available, occupied, pending_review)

3. **visit_confirmations**
   - Tracks when renters visit properties
   - Used for arrival confirmation system

## Key Features Implementation

### Map Interface
- Full-screen Google Maps on the home page
- Real-time property markers for available listings
- Click markers to view property details
- Location-based property filtering

### Property Management
- Owner dashboard for CRUD operations
- Image upload and management
- Status management (available/occupied)
- Location selection via map clicks

### Real-time Updates
- Supabase real-time subscriptions
- Instant map updates when properties change status
- Live notifications for property owners

### Location Tracking (Optional)
- Browser geolocation API integration
- Proximity-based arrival detection
- Confirmation prompts for property visits
- Privacy-focused with clear consent UI

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production domain)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Owner dashboard
│   ├── login/            # Authentication pages
│   └── signup/
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── map/              # Map-related components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
│   └── supabase/         # Supabase client configuration
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details