import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { mockMembers, Member } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MapPin, Users } from 'lucide-react';

const roleLabels: Record<Member['role'], string> = {
  student: 'Student',
  advisor: 'Advisor',
  alumni: 'Alumni',
  board: 'Board Member',
};

const roleColors: Record<Member['role'], string> = {
  student: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  advisor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  alumni: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  board: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
};

export default function Directory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const states = useMemo(() => {
    const uniqueStates = [...new Set(mockMembers.map(m => m.state))];
    return uniqueStates.sort();
  }, []);

  const filteredMembers = useMemo(() => {
    return mockMembers.filter(member => {
      const matchesSearch = 
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.chapter?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesState = stateFilter === 'all' || member.state === stateFilter;

      return matchesSearch && matchesRole && matchesState;
    });
  }, [searchQuery, roleFilter, stateFilter]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-accent" />
            Member Directory
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect with {mockMembers.length} advocates across the country
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or chapter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="advisor">Advisors</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="board">Board Members</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
        </p>

        {/* Member Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map(member => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className={roleColors[member.role]}>
                        {roleLabels[member.role]}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {member.state}
                      </span>
                    </div>
                    {member.chapter && (
                      <p className="text-xs text-muted-foreground mt-2 truncate">
                        {member.chapter}
                      </p>
                    )}
                  </div>
                </div>
                {member.bio && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {member.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No members found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setStateFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
