import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UrlItem } from './UrlItem';
import { getUserUrls } from '@/lib/api';
import { useClientId } from '@/hooks/useClientId';
import { useLocalUrls } from '@/hooks/useLocalUrls';
import { useToast } from '@/hooks/use-toast';
import { PingUrl } from '@/types/ping';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UrlListProps {
  refreshTrigger: number;
}

export function UrlList({ refreshTrigger }: UrlListProps) {
  const [urls, setUrls] = useState<PingUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const clientId = useClientId();
  const { urlIds, removeUrl } = useLocalUrls();
  const { toast } = useToast();

  const fetchUrls = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      const allUrls = await getUserUrls(clientId);
      // Filter to only show URLs that are in localStorage (user's URLs)
      const userUrls = allUrls.filter(url => urlIds.includes(url.id));
      setUrls(userUrls);
    } catch (error) {
      toast({
        title: "Failed to Load URLs",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [clientId, urlIds, refreshTrigger]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchUrls();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [clientId, urlIds, isLoading]);

  const handleDelete = (urlId: string) => {
    removeUrl(urlId);
    setUrls(prev => prev.filter(url => url.id !== urlId));
  };

  if (urls.length === 0) {
    return (
      <Card className="gradient-card border border-border/50">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No Active URLs</p>
            <p className="text-sm">Add a URL above to start keeping your apps alive.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-success">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            Active URLs ({urls.filter(url => url.is_active).length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUrls}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {urls.map((url) => (
          <UrlItem
            key={url.id}
            url={url}
            onDelete={() => handleDelete(url.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}