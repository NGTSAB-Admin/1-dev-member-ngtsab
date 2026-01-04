// Mock data for member portal - replace with Supabase integration later

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'advisor' | 'alumni' | 'board';
  state: string;
  chapter?: string;
  joinedAt: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'toolkit' | 'legislation' | 'training' | 'template';
  url: string;
  createdAt: string;
  featured?: boolean;
}

export const mockMembers: Member[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@example.com',
    role: 'student',
    state: 'California',
    chapter: 'Bay Area SAB',
    joinedAt: '2024-01-15',
    bio: 'Passionate about expanding gifted education access in underserved communities.',
  },
  {
    id: '2',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.j@example.com',
    role: 'board',
    state: 'Texas',
    chapter: 'Austin Gifted Advocates',
    joinedAt: '2023-06-20',
    bio: 'State board member focused on legislative advocacy.',
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.r@example.com',
    role: 'advisor',
    state: 'New York',
    chapter: 'NYC Education Alliance',
    joinedAt: '2023-09-01',
    bio: 'Former teacher turned advocacy coordinator.',
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@example.com',
    role: 'alumni',
    state: 'Washington',
    joinedAt: '2022-03-10',
    bio: 'NGTSAB founding member, now pursuing education policy at university.',
  },
  {
    id: '5',
    firstName: 'Aisha',
    lastName: 'Patel',
    email: 'aisha.p@example.com',
    role: 'student',
    state: 'Florida',
    chapter: 'Miami SAB',
    joinedAt: '2024-02-28',
    bio: 'High school junior advocating for automatic enrollment policies.',
  },
  {
    id: '6',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.w@example.com',
    role: 'student',
    state: 'Illinois',
    chapter: 'Chicago Youth Advocates',
    joinedAt: '2024-03-15',
    bio: 'Working to establish student advocacy boards in Chicago schools.',
  },
];

export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Advocacy Toolkit 2024',
    description: 'Comprehensive guide for student advocates including talking points, meeting templates, and action plans.',
    category: 'toolkit',
    url: '#',
    createdAt: '2024-01-10',
    featured: true,
  },
  {
    id: '2',
    title: 'State Legislation Tracker',
    description: 'Live tracking of gifted education legislation across all 50 states.',
    category: 'legislation',
    url: '#',
    createdAt: '2024-02-15',
    featured: true,
  },
  {
    id: '3',
    title: 'Public Speaking Training',
    description: 'Video series on effective testimony and public speaking for education advocacy.',
    category: 'training',
    url: '#',
    createdAt: '2023-11-20',
  },
  {
    id: '4',
    title: 'SAB Formation Guide',
    description: 'Step-by-step guide for establishing a Student Advocacy Board at your school or district.',
    category: 'template',
    url: '#',
    createdAt: '2023-08-05',
    featured: true,
  },
  {
    id: '5',
    title: 'Letter to Legislators Template',
    description: 'Customizable letter templates for contacting state and local representatives.',
    category: 'template',
    url: '#',
    createdAt: '2024-01-25',
  },
  {
    id: '6',
    title: 'Media Training Workshop',
    description: 'Learn how to effectively communicate with journalists and media outlets.',
    category: 'training',
    url: '#',
    createdAt: '2024-03-01',
  },
];

// Mock current user for demo
export const mockCurrentUser: Member | null = null; // Set to null to show login page
