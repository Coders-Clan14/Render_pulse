import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addPingUrl } from '@/lib/api';
import { useClientId } from '@/hooks/useClientId';
import { useLocalUrls } from '@/hooks/useLocalUrls';

interface AddUrlFormProps {
  onUrlAdded: () => void;
}

export function AddUrlForm({ onUrlAdded }: AddUrlFormProps) {
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('60');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const clientId = useClientId();
  const { addUrl, canAddMore, count } = useLocalUrls();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) {
      toast({
        title: "Error",
        description: "Client ID not initialized. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (!canAddMore) {
      toast({
        title: "Limit Reached",
        description: "You can only add up to 3 URLs at a time.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      const urlObj = new URL(url);
      if (!url.startsWith('https://')) {
        throw new Error('URL must use HTTPS protocol');
      }
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid HTTPS URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const newUrl = await addPingUrl({
        client_id: clientId,
        url,
        duration: parseInt(duration),
      });

      addUrl(newUrl.id);
      setUrl('');
      setDuration('60');
      
      toast({
        title: "URL Added Successfully! 🚀",
        description: `Now pinging ${url} every 30 seconds for ${duration} minutes.`,
      });

      onUrlAdded();
      window.location.reload(); 

    } catch (error) {
      toast({
        title: "Failed to Add URL",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  if (!canAddMore) {
    return (
      <Card className="gradient-card border border-border/50">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Maximum URLs Reached</p>
            <p className="text-sm">You currently have {count}/3 active URLs. Remove one to add another.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </div>
          Keep Your App Alive
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">HTTPS URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://your-app.render.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="bg-background/50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Keep Alive Duration</Label>
            <Select value={duration} onValueChange={setDuration} disabled={isLoading}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
                <SelectItem value="720">12 hours (max)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {count}/3 active URLs
            </p>
            <Button 
              type="submit" 
              variant="pulse" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add URL
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}