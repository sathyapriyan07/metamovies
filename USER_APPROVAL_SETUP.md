# User Approval System - Setup Guide

## Overview
Admin control to approve/reject user registrations before they can access the platform.

## Setup Steps

### 1. Run SQL Migration
Execute `user-approval-migration.sql` in Supabase SQL Editor:
- Adds `approved` column to users table (default: false)
- Updates RLS policies to check approval status
- Allows admins to manage all users

### 2. Access Admin Panel
1. Login as admin
2. Go to `/admin`
3. Click "👥 Manage Users"

## Features

### Admin Controls
- **View All Users** - See all registered users
- **Filter by Status** - All / Pending / Approved
- **Approve Users** - Grant access to pending users
- **Revoke Access** - Remove approval from users
- **Delete Users** - Permanently remove user accounts

### User Flow
1. User signs up → `approved = false`
2. User cannot access protected content
3. Admin approves user → `approved = true`
4. User can now access all features

### Display Info
- Username & Email
- Role (user/admin)
- Approval status (Pending/Approved)
- Join date

## Security
- Only approved users can access protected routes
- Admins can see and manage all users
- RLS policies enforce approval checks
- New signups default to unapproved

## Notes
- Existing users are auto-approved during migration
- Admins are always approved
- Deleted users are removed from auth.users
