import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ExternalLink, Clock, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteUrl } from '@/lib/api';
import { PingUrl } from '@/types/ping';

interface UrlItemProps {
  url: PingUrl;
  onDelete: () => void;
}

export function UrlItem({ url, onDelete }: UrlItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const expires = new Date(url.expires_at);
      const created = new Date(url.created_at);
      const totalDuration = expires.getTime() - created.getTime();
      const remaining = Math.max(0, expires.getTime() - now.getTime());
      
      setTimeLeft(remaining);
      setProgress(remaining > 0 ? (remaining / totalDuration) * 100 : 0);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [url.expires_at, url.created_at]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUrl(url.id);
      onDelete();
      toast({
        title: "URL Removed",
        description: `Stopped pinging ${getDisplayUrl(url.url)}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Remove URL",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDisplayUrl = (fullUrl: string) => {
    try {
      const urlObj = new URL(fullUrl);
      return urlObj.hostname;
    } catch {
      return fullUrl;
    }
  };

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return '0m 0s';
    
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${seconds}s`;
  };

  const getStatusIcon = () => {
    if (!url.is_active) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (!url.last_ping_status) {
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
    if (url.last_ping_status >= 200 && url.last_ping_status < 300) {
      return <CheckCircle className="h-4 w-4 text-accent" />;
    }
    return <AlertCircle className="h-4 w-4 text-pulse-warning" />;
  };

  const getStatusText = () => {
    if (!url.is_active) return 'Inactive';
    if (!url.last_ping_status) return 'Pending';
    if (url.last_ping_status >= 200 && url.last_ping_status < 300) return 'Healthy';
    return `Error ${url.last_ping_status}`;
  };

  const getStatusVariant = () => {
    if (!url.is_active) return 'destructive';
    if (!url.last_ping_status) return 'secondary';
    if (url.last_ping_status >= 200 && url.last_ping_status < 300) return 'default';
    return 'destructive';
  };

  return (
    <Card className="bg-background/30 border border-border/30 hover:bg-background/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className="font-medium text-foreground truncate">
                  {getDisplayUrl(url.url)}
                </span>
              </div>
              <Badge variant={getStatusVariant() as any} className="text-xs">
                {getStatusText()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Time remaining: {formatTimeLeft(timeLeft)}</span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {url.ping_count} pings
                </span>
              </div>
              
              <Progress 
                value={progress} 
                className="h-2"
              />
              
              {url.last_ping_at && (
                <div className="text-xs text-muted-foreground">
                  Last ping: {new Date(url.last_ping_at).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(url.url, '_blank')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}