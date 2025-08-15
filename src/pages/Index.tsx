import { useState } from 'react';
import { Header } from '@/components/Header';
import { AddUrlForm } from '@/components/AddUrlForm';
import { UrlList } from '@/components/UrlList';

const Index = () => {
const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUrlAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        
        <div className="space-y-8">
         <AddUrlForm onUrlAdded={() => setRefreshTrigger(prev => prev + 1)} />
<UrlList refreshTrigger={refreshTrigger} />
        </div>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Built by Prasham and Rishi (Stackwise)</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
