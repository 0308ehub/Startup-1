# DeckVault Setup Guide

## Setting up Username/Password Authentication with Supabase

### 1. Supabase Database Setup

1. **Go to your Supabase project dashboard**
2. **Navigate to the SQL Editor**
3. **Run the SQL schema** from `supabase-schema.sql` file

This will create:
- `profiles` table for user profiles
- `collections` table for user card collections
- `cards` and `card_sets` tables for card data
- `decks` and `deck_slots` tables for deck management
- `listings` and `orders` tables for marketplace
- `prices` table for card pricing data
- Row Level Security (RLS) policies
- Triggers for automatic profile creation

### 2. Supabase Authentication Configuration

1. **Go to Authentication > Settings**
2. **Enable Email confirmations** (optional, but recommended)
3. **Set up your site URL** in the Site URL field
4. **Configure redirect URLs** to include your domain

### 3. Environment Variables

Make sure you have these environment variables set in your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. How It Works

#### Sign Up Process:
1. User enters email, username, and password
2. System checks if username is already taken
3. Creates user account in Supabase Auth
4. Automatically creates profile in `profiles` table
5. Automatically creates collection in `collections` table
6. Redirects to sign-in page

#### Sign In Process:
1. User enters email and password
2. Authenticates with Supabase Auth
3. Fetches user profile from `profiles` table
4. Redirects to dashboard or intended page

#### User Data:
- **Profile data** is stored in the `profiles` table
- **Collections** are automatically created for each user
- **Decks** are linked to user accounts
- **All data** is protected by Row Level Security

### 5. Features

✅ **Username/password authentication**  
✅ **Automatic profile creation**  
✅ **Automatic collection creation**  
✅ **Secure data access** with RLS  
✅ **User profile management**  
✅ **Deck management**  
✅ **Collection management**  
✅ **Marketplace functionality**  

### 6. Testing

1. **Sign up** with a new account
2. **Sign in** with your credentials
3. **Check your profile** - should show your username
4. **Access protected pages** - should work without issues
5. **Update profile** - should persist changes

### 7. Troubleshooting

**If sign-up fails:**
- Check if username is already taken
- Verify Supabase connection
- Check browser console for errors

**If sign-in fails:**
- Verify email/password combination
- Check if account was created properly
- Verify Supabase authentication settings

**If profile data doesn't load:**
- Check if `profiles` table was created
- Verify RLS policies are in place
- Check Supabase logs for errors

### 8. Next Steps

After setup, you can:
1. **Add real card data** to the `cards` and `card_sets` tables
2. **Implement card search** using the database
3. **Add price tracking** functionality
4. **Enhance marketplace** features
5. **Add deck sharing** capabilities
