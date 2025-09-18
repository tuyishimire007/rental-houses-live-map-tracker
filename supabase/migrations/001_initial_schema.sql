-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'renter' CHECK (role IN ('owner', 'renter', 'admin')),
  name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  images TEXT[],
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'pending_review')),
  first_tenant_date TIMESTAMP WITH TIME ZONE,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visit_confirmations table
CREATE TABLE IF NOT EXISTS visit_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  arrived_at TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_timestamp TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_visit_confirmations_property ON visit_confirmations(property_id);
CREATE INDEX IF NOT EXISTS idx_visit_confirmations_renter ON visit_confirmations(renter_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_confirmations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for properties
CREATE POLICY "Anyone can view available properties" ON properties
  FOR SELECT USING (status = 'available');

CREATE POLICY "Owners can view their own properties" ON properties
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert their own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own properties" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own properties" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for visit_confirmations
CREATE POLICY "Users can view their own visit confirmations" ON visit_confirmations
  FOR SELECT USING (auth.uid() = renter_id OR auth.uid() IN (
    SELECT owner_id FROM properties WHERE id = property_id
  ));

CREATE POLICY "Users can insert their own visit confirmations" ON visit_confirmations
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Property owners can update visit confirmations for their properties" ON visit_confirmations
  FOR UPDATE USING (auth.uid() IN (
    SELECT owner_id FROM properties WHERE id = property_id
  ));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
