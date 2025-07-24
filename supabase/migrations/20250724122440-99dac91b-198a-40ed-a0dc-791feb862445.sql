-- Create table for storing ping URLs
CREATE TABLE public.ping_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0 AND duration <= 720), -- Max 12 hours (720 minutes)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  client_id UUID NOT NULL,
  last_ping_at TIMESTAMP WITH TIME ZONE,
  last_ping_status INTEGER, -- HTTP status code from last ping
  ping_count INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.ping_urls ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Anyone can view ping_urls" 
ON public.ping_urls 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert ping_urls" 
ON public.ping_urls 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update ping_urls" 
ON public.ping_urls 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete ping_urls" 
ON public.ping_urls 
FOR DELETE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_ping_urls_client_id ON public.ping_urls(client_id);
CREATE INDEX idx_ping_urls_active_expires ON public.ping_urls(is_active, expires_at);
CREATE INDEX idx_ping_urls_created_at ON public.ping_urls(created_at);

-- Create function to automatically set expires_at
CREATE OR REPLACE FUNCTION public.set_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at = NEW.created_at + (NEW.duration * INTERVAL '1 minute');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set expires_at
CREATE TRIGGER set_expires_at_trigger
  BEFORE INSERT ON public.ping_urls
  FOR EACH ROW
  EXECUTE FUNCTION public.set_expires_at();