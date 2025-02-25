# Fantasy Basketball Application

## Overview

This is a comprehensive fantasy basketball application built using Next.js 15, React 19, Tailwind CSS, and Supabase. The application allows users to manage fantasy basketball leagues, view player statistics, and communicate with other users. It features a modern, responsive UI with both light and dark mode support, internationalization capabilities, and real-time updates.

## Key Features

- **User Authentication**: Secure user authentication and profile management using Supabase Auth
- **Player Statistics**: Real-time NBA player statistics via the Ball Don't Lie API
- **Fantasy Leagues**: Create and manage fantasy basketball leagues with custom scoring
- **Team Management**: Draft players, manage rosters, and track performance
- **Player Analysis**: Comprehensive player statistics and performance metrics
- **Chat System**: In-app communication between users
- **Dark/Light Mode**: Full theming support with automatic system preference detection
- **Internationalization**: Multi-language support through next-intl

## Project Structure

The application follows a modern Next.js structure with the App Router pattern:

```
└── src/
    ├── app/                  # Next.js App Router pages and layouts
    │   ├── (app)/            # Main application routes (protected)
    │   │   ├── dashboard/    # Dashboard page
    │   │   ├── league/       # League management
    │   │   ├── players/      # Player listings and stats
    │   │   ├── profile/      # User profile
    │   │   ├── stats/        # Statistics pages
    │   │   ├── talk/         # Chat functionality
    │   │   └── teams/        # Team management
    │   ├── api/              # API routes
    │   ├── auth/             # Authentication pages
    │   └── admin/            # Admin functionality
    ├── components/           # Reusable UI components
    │   ├── ui/               # Base UI components
    │   ├── layout/           # Layout components
    │   └── chat/             # Chat-specific components
    ├── contexts/             # React context providers
    ├── lib/                  # Utility functions and services
    │   ├── hooks/            # Custom React hooks
    │   ├── i18n/             # Internationalization setup
    │   ├── supabase/         # Supabase client and types
    │   ├── balldontlie/      # Ball Don't Lie API client
    │   └── types/            # Type definitions
    ├── locales/              # Internationalization messages
    └── types/                # Global TypeScript types
```

## Backend Infrastructure

The application uses Supabase as its backend. The database schema includes the following tables and relationships:

### Database Types and Enums

- **league_member_role**: Enum for user roles in leagues ('admin', 'member')
- **draft_type**: Enum for draft types ('snake', 'auction', 'linear')
- **scoring_type**: Enum for scoring types ('category', 'points', 'both')

### User Management

- **profiles**: User profile information
  - id (uuid, PK): Linked to Supabase auth user
  - username (text, unique): User's chosen username
  - full_name (text): User's full name
  - avatar_url (text): URL to user's avatar image
  - email (text): User's email address
  - email_notifications (boolean): Preference for email notifications
  - dark_mode (boolean): Theme preference
  - created_at & updated_at: Timestamps

### NBA Data

- **teams**: NBA team information
  - id (bigint, PK): Team ID from Ball Don't Lie API
  - name (varchar): Team name
  - city (varchar): Team city
  - created_at & updated_at: Timestamps

- **players**: NBA player information
  - id (bigint, PK): Player ID from Ball Don't Lie API
  - first_name & last_name (varchar): Player name
  - position (varchar): Player position
  - team_id (bigint, FK): Reference to teams table
  - height & weight (varchar): Player physical attributes
  - jersey_number (varchar): Player's jersey number
  - college & country (varchar): Player background
  - draft information: draft_year, draft_round, draft_number
  - has_profile_picture (boolean): Whether player has a custom profile image
  - profile_picture_url (text): URL to player's image
  - nba_cdn_id (integer): ID for NBA content delivery network
  - created_at & updated_at: Timestamps

- **player_stats**: Statistical data for players
  - id (bigint, PK): Unique identifier for stats entry
  - player_id (bigint, FK): Reference to players table
  - season (integer): NBA season year
  - games_played (integer): Number of games played
  - minutes (varchar): Average minutes played
  - Various statistical fields: fgm, fga, fg3m, fg3a, ftm, fta, oreb, dreb, reb, ast, stl, blk, turnover, pf, pts
  - Percentage fields: fg_pct, fg3_pct, ft_pct
  - created_at & updated_at: Timestamps

### Fantasy League Management

- **leagues**: Fantasy basketball leagues
  - id (uuid, PK): Unique identifier
  - name (text): League name
  - description (text): League description
  - created_by (uuid, FK): Reference to auth.users (creator)
  - season (integer): NBA season year
  - draft_date (timestamp): Scheduled draft date
  - draft_type (enum): Snake, auction, or linear
  - scoring_type (enum): Category, points, or both
  - is_public (boolean): Whether league is public
  - status (text): League status (active, completed, etc.)
  - Various scoring settings: pts, drbs, orbs, asts, stls, blks, tos, etc.
  - Roster position settings: roster_pg, roster_sg, roster_sf, etc.
  - Dynasty league settings: is_dynasty, dynasty_keepers, etc.
  - created_at & updated_at: Timestamps

- **league_members**: Maps users to leagues
  - id (uuid, PK): Unique identifier
  - league_id (uuid, FK): Reference to leagues table
  - user_id (uuid, FK): Reference to auth.users
  - role (enum): Admin or member
  - team_name (text): User's team name in this league
  - is_active (boolean): Whether user is still active
  - joined_at (timestamp): When user joined the league

- **league_invites**: Invitations to join leagues
  - id (uuid, PK): Unique identifier
  - league_id (uuid, FK): Reference to leagues table
  - code (uuid): Unique invitation code
  - created_at (timestamp): When invitation was created
  - used_at (timestamp): When invitation was used
  - used_by (uuid, FK): User who used the invitation

### Communication

- **league_channels**: Chat channels within leagues
  - id (uuid, PK): Unique identifier
  - league_id (uuid, FK): Reference to leagues table
  - name (text): Channel name
  - description (text): Channel description
  - type (text): Channel type (text, voice, announcement)
  - created_by (uuid, FK): User who created the channel
  - is_default (boolean): Whether this is a default channel
  - position (integer): Display order position
  - created_at (timestamp): When channel was created

- **channel_messages**: Messages in chat channels
  - id (uuid, PK): Unique identifier
  - channel_id (uuid, FK): Reference to league_channels table
  - user_id (uuid, FK): Reference to auth.users (sender)
  - content (text): Message content
  - is_pinned (boolean): Whether message is pinned
  - reply_to (uuid, FK): Reference to another message (for replies)
  - content_tsvector (tsvector): Text search vector for message content
  - created_at & updated_at: Timestamps

### Fantasy Gameplay

- **scoring_templates**: Reusable scoring systems
  - id (uuid, PK): Unique identifier
  - name (text, unique): Template name
  - created_by (uuid, FK): User who created the template
  - Various scoring settings: pts, drbs, orbs, asts, stls, blks, etc.
  - created_at (timestamp): When template was created

### Database Triggers and Functions

The database includes several triggers for automating actions:

- **add_league_creator_as_admin**: Automatically adds the league creator as an admin member
- **create_default_league_channels**: Creates default chat channels when a new league is created
- **cleanup_expired_invites**: Removes expired league invitations
- **handle_message_update**: Updates timestamp when messages are edited
- **update_updated_at_column**: Keeps updated_at timestamps current
- **handle_new_user**: Creates a profile when a new user registers

## File Descriptions

### Core Configuration

- **package.json**: Project dependencies and scripts
- **tsconfig.json**: TypeScript configuration
- **next.config.js/ts**: Next.js configuration
- **tailwind.config.ts**: Tailwind CSS configuration
- **eslint.config.mjs**: ESLint configuration
- **postcss.config.mjs**: PostCSS configuration

### Application Structure

- **src/app/layout.tsx**: Root layout with providers and global styles
- **src/app/page.tsx**: Root page that redirects to dashboard
- **src/app/globals.css**: Global CSS styles
- **src/app/(app)/layout.tsx**: Protected routes layout with sidebar
- **src/app/auth/**: Authentication pages

### Core Functionality

- **src/app/(app)/dashboard/page.tsx**: Dashboard with user overview and league stats
- **src/app/(app)/players/page.tsx**: Player listings with filtering and sorting
- **src/app/(app)/talk/page.tsx**: In-app chat functionality
- **src/app/(app)/league/**: League management features
- **src/app/(app)/teams/**: Team management features
- **src/app/(app)/profile/**: User profile management
- **src/app/(app)/stats/**: Statistical analysis tools

### Components

- **src/components/layout/Sidebar.tsx**: Main navigation sidebar
- **src/components/PlayerTable.tsx**: Table displaying player data and statistics
- **src/components/ThemeProvider.tsx**: Theme context and provider
- **src/components/ThemeToggle.tsx**: UI toggle for light/dark mode
- **src/components/LanguageSelector.tsx**: Language selection component
- **src/components/ui/**: Reusable UI components like buttons, forms, modals
- **src/components/chat/**: Chat-related components

### Context Providers

- **src/contexts/AuthContext.tsx**: Authentication context and provider

### Utilities and Services

- **src/lib/supabase/client.ts**: Supabase client configuration
- **src/lib/supabase/types.ts**: TypeScript types for Supabase tables
- **src/lib/supabase/sync.ts**: Data synchronization utilities
- **src/lib/balldontlie/api.ts**: Client for the Ball Don't Lie API
- **src/lib/utils.ts**: General utility functions
- **src/lib/theme.ts**: Theme configuration
- **src/lib/hooks/**: Custom React hooks

### Types

- **src/types/player.ts**: Type definitions for player data
- **src/lib/supabase/types.ts**: Database schema types

### Internationalization

- **src/locales/en.json**: English language strings
- **src/lib/i18n/**: Internationalization configuration

## Technical Details

### Authentication Flow

The application uses Supabase Authentication with JWT tokens. The AuthContext provider manages auth state and provides user information throughout the application.

### Data Fetching

- **Server Components**: Direct database queries for server-rendered content
- **Client Components**: React Query for client-side data fetching, caching, and state management
- **External APIs**: Integration with Ball Don't Lie for NBA stats

### Theme System

The application supports both light and dark modes with:
- System preference detection
- Manual user preference override
- Persistent theme selection

### Performance Optimizations

- Next.js App Router with React Server Components
- Client-side component caching with React Query
- Optimized data loading patterns
- Route-based code splitting

## Development Guidelines

### Styling Approach

The application uses Tailwind CSS with:
- Custom theme configuration in `src/lib/theme.ts`
- Consistent use of the `cn()` utility for merging class names
- Dark mode support via the `dark:` variant

### Type Safety

- Strong TypeScript typing throughout the application
- Database schema types generated from Supabase
- Proper typing for all API responses and state

### Code Organization

- Feature-based organization within the app directory
- Reusable components in the components directory
- Utility functions and services in the lib directory

## Deployment

The application is designed to be deployed to Vercel, with Supabase handling the backend database and authentication.

## Future Enhancements

- Real-time game updates and scoring
- Mobile application
- Advanced statistical analysis
- AI-powered fantasy recommendations
- Social features and league chat
- Draft room functionality 