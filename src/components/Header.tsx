import { Card, CardContent } from '@/components/ui/card';
import { Activity, Zap } from 'lucide-react';

export function Header() {
  return (
    <Card className="gradient-card border border-border/50 mb-8">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 rounded-xl bg-gradient-primary pulse-glow">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RenderPulse
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Keep your deployed apps alive by pinging them every 30 seconds. 
            Perfect for preventing Render.com free tier apps from sleeping.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-background/30">
              <Zap className="h-4 w-4 text-accent" />
              <span>Ping every 30 seconds</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-background/30">
              <Activity className="h-4 w-4 text-primary" />
              <span>Up to 12 hours duration</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-background/30">
              <span className="text-lg font-bold text-accent">3</span>
              <span>URLs maximum</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}