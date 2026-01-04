import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { mockResources, Resource } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Search, 
  FileText, 
  Scale, 
  GraduationCap, 
  File,
  Star,
  ArrowRight
} from 'lucide-react';

const categoryConfig: Record<Resource['category'], { label: string; icon: typeof FileText; color: string }> = {
  toolkit: { 
    label: 'Toolkit', 
    icon: FileText,
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
  },
  legislation: { 
    label: 'Legislation', 
    icon: Scale,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  training: { 
    label: 'Training', 
    icon: GraduationCap,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  template: { 
    label: 'Template', 
    icon: File,
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
  },
};

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const featuredResources = useMemo(() => 
    mockResources.filter(r => r.featured), 
    []
  );

  const filteredResources = useMemo(() => {
    return mockResources.filter(resource => {
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeTab === 'all' || resource.category === activeTab;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeTab]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-accent" />
            Resources
          </h1>
          <p className="text-muted-foreground mt-2">
            Access advocacy tools, training materials, and legislative resources
          </p>
        </div>

        {/* Featured Resources */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            Featured Resources
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredResources.map(resource => {
              const config = categoryConfig[resource.category];
              const Icon = config.icon;
              
              return (
                <Card key={resource.id} className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <Badge variant="secondary" className={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{resource.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="outline" size="sm" className="gap-2">
                      View Resource
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* All Resources */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            All Resources
          </h2>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="toolkit">Toolkits</TabsTrigger>
              <TabsTrigger value="legislation">Legislation</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="template">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-3">
                {filteredResources.map(resource => {
                  const config = categoryConfig[resource.category];
                  const Icon = config.icon;

                  return (
                    <Card key={resource.id} className="hover:bg-secondary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-medium text-foreground">
                                  {resource.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {resource.description}
                                </p>
                              </div>
                              <Badge variant="secondary" className={`${config.color} shrink-0`}>
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground">No resources found</h3>
                  <p className="text-muted-foreground">Try adjusting your search</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
}
