import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TerraBuildAppBar from '@/components/TerraBuildAppBar';
import TerraBuildSplashScreen from '@/components/TerraBuildSplashScreen';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  FileBarChart, 
  UserIcon, 
  Building,
  BarChart4,
  ListFilter,
  TrendingUp,
  PieChart,
  Factory,
  Camera
} from 'lucide-react';

export default function DashboardPage() {
  // Reference to the dashboard content for screenshot functionality
  const dashboardContentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  
  // Query to check OpenAI API key status
  const { data: apiKeyStatus } = useQuery({
    queryKey: ['/api/settings/OPENAI_API_KEY_STATUS'],
    staleTime: 60000, // 1 minute
  });

  // Check if OpenAI API key is configured
  const isApiKeyConfigured = apiKeyStatus && 
    typeof apiKeyStatus === 'object' && 
    'value' in apiKeyStatus && 
    apiKeyStatus.value === 'configured';
  
  useEffect(() => {
    // Simulate loading time for the splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { 
      title: 'Total Building Types', 
      value: 12, 
      change: '+2', 
      changeType: 'positive',
      icon: <Building className="h-8 w-8 text-blue-500" />
    },
    { 
      title: 'Regions', 
      value: 8, 
      change: '+1', 
      changeType: 'positive',
      icon: <Factory className="h-8 w-8 text-green-500" />
    },
    { 
      title: 'Cost Matrices', 
      value: 32, 
      change: '+5', 
      changeType: 'positive',
      icon: <BarChart4 className="h-8 w-8 text-purple-500" />
    },
    { 
      title: 'Active Users', 
      value: 18, 
      change: '+3', 
      changeType: 'positive',
      icon: <UserIcon className="h-8 w-8 text-amber-500" />
    },
  ];

  if (loading) {
    return <TerraBuildSplashScreen moduleName="TerraBuild Analytics" onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TerraBuildAppBar userName="Benton County Assessor" userRole="Administrator" />
      
      <main className="flex-1 bg-gray-50">
        <div className="p-6 space-y-6">
          {/* Header with title and screenshot button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TerraBuild Analytics</h1>
              <p className="text-gray-500">Interactive visualizations for building cost analysis</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" /> Refresh Data
              </Button>
              <Button variant="default" size="sm" className="flex items-center gap-1">
                <Camera className="h-4 w-4" /> Screenshot
              </Button>
            </div>
          </div>
          
          {/* Dashboard content that can be captured */}
          <div ref={dashboardContentRef} className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white shadow-sm rounded-lg p-5 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                      <p className={`text-xs mt-1 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change} from last period
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 border shadow-sm rounded-lg">
                <h3 className="text-lg font-medium mb-4">Building Cost Trends</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-gray-400">Cost trend visualization</div>
                </div>
              </div>
              
              <div className="bg-white p-5 border shadow-sm rounded-lg">
                <h3 className="text-lg font-medium mb-4">Regional Cost Comparison</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-gray-400">Regional cost comparison visualization</div>
                </div>
              </div>
            </div>
            
            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 border shadow-sm rounded-lg">
                <h3 className="text-lg font-medium mb-4">Building Type Cost Breakdown</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-gray-400">Building type cost breakdown visualization</div>
                </div>
              </div>
              
              <div className="bg-white p-5 border shadow-sm rounded-lg">
                <h3 className="text-lg font-medium mb-4">Cost Prediction Insights</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-gray-400">
                    {isApiKeyConfigured ? 
                      "AI-powered cost prediction insights" : 
                      "API key required for AI-powered insights"}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Features Section */}
            <div className="bg-white border shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-blue-500" />
                Additional Analysis Tools
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <ListFilter className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Advanced Filters</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Fine-tune your cost analysis with advanced filtering options
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 hover:bg-green-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-medium">Trend Analysis</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Discover long-term cost trends and seasonal variations
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 hover:bg-purple-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <PieChart className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-medium">Cost Breakdown</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Detailed breakdown of costs by materials, labor, and other factors
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}