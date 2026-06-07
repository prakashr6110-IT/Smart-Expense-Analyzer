# Smart Expense Behavior Analyzer

A modern web application for tracking expenses, analyzing spending behavior, and providing pre-spending warnings to help you manage your finances effectively.

## Features

### 🎯 Core Features
- **Expense Tracking**: Log expenses with amount, category, date, time, and description
- **Dashboard**: Overview of total expenses, budget, top category, and predicted expenses
- **Analytics**: Visual charts (Pie, Bar, Line) with weekly/monthly/yearly filters
- **Behavior Analysis**: Detect spending patterns, weekend habits, and peak spending times
- **Smart Alerts**: Pre-spending warnings for budget limits, unusual patterns, and time-based triggers
- **Predictions**: Next month expense prediction based on 3-month average with trend analysis
- **Profile Management**: Set and update monthly budget

### 🔐 Authentication
- Secure login and registration using Supabase Auth
- Protected routes and user-specific data isolation
- Automatic profile creation on signup

### 📊 Analytics & Insights
- **Pie Chart**: Category-wise spending distribution
- **Bar Chart**: Category comparison
- **Line Chart**: Spending trends over time
- **Smart Insights**: 
  - "You spend more on weekends"
  - "You usually spend at night"
  - "Your top category is Food (35% of total)"

### ⚠️ Smart Alerts
- Budget threshold warnings (75%, 90%)
- Weekend overspending detection
- Time-based spending warnings
- Category spending spike alerts
- In-app browser notifications

### 🎨 UI/UX
- Clean, modern design with Tailwind CSS
- Dark sidebar + light dashboard
- Responsive design (mobile, tablet, desktop)
- Interactive charts with Recharts
- Intuitive navigation and forms

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Backend**: Supabase
  - Authentication: Supabase Auth
  - Database: PostgreSQL with Row Level Security
  - Real-time: Supabase client

## Prerequisites

- Node.js 16+ and npm
- Supabase account (free tier works)

## Setup Instructions

### 1. Clone the Repository

```bash
cd "d:\Smart expense - qoder 2"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste and run the SQL script
6. Go to **Project Settings** > **API**
7. Copy your **Project URL** and **anon/public key**

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Create Your First Account

1. Open the app in your browser
2. Click "Sign up"
3. Enter your email and password
4. Start adding expenses!

## Project Structure

```
smart-expense-analyzer/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # Database schema
├── src/
│   ├── components/
│   │   ├── Dashboard/                   # Dashboard components
│   │   ├── Layout/                      # Sidebar, TopBar
│   │   └── ...
│   ├── context/                         # React Context (Auth, Expenses)
│   ├── pages/                           # Page components
│   ├── utils/                           # Utility functions
│   │   ├── supabase.js                  # Supabase client
│   │   ├── behaviorAnalysis.js          # Pattern detection
│   │   ├── prediction.js                # Expense prediction
│   │   └── alertGenerator.js            # Alert logic
│   ├── App.jsx                          # Main app with routing
│   └── main.jsx                         # Entry point
├── .env.example                         # Environment template
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Database Schema

### Tables

1. **profiles**: User profiles with monthly budget
2. **expenses**: All expense records
3. **alerts**: Generated warnings and notifications
4. **insights**: Behavioral analysis results
5. **predictions**: Monthly expense predictions

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Usage Guide

### Adding an Expense
1. Navigate to "Add Expense"
2. Fill in amount, category, date, time, and optional description
3. Click "Add Expense"
4. The app will automatically:
   - Save the expense
   - Analyze your spending patterns
   - Generate insights
   - Create alerts if thresholds are exceeded
   - Update predictions

### Viewing Analytics
1. Go to "Analytics" page
2. Select time period: Weekly, Monthly, or Yearly
3. View:
   - Pie chart: Category distribution
   - Bar chart: Category comparison
   - Line chart: Spending trends
   - Insights: Text-based spending patterns

### Managing Alerts
1. Check the "Alerts" page for all warnings
2. Filter by: All, Unread, or Read
3. Mark alerts as read
4. Dashboard shows top 3 unread alerts

### Setting Budget
1. Go to "Profile" page
2. Update your monthly budget
3. Budget is used for:
   - Dashboard stats
   - Budget threshold alerts
   - Spending percentage calculations

## Behavior Analysis Features

### Time Pattern Detection
- Identifies peak spending hours (morning, afternoon, evening, night)
- Generates time-based warnings when you're likely to spend

### Weekend Spending Analysis
- Compares weekend vs weekday spending
- Alerts when weekend spending exceeds 70% of total

### Category Analysis
- Tracks spending by category
- Detects unusual spikes (>50% increase from last month)
- Identifies top spending category

### Prediction Algorithm
- Calculates average of last 3 months
- Applies trend analysis (linear regression)
- Provides confidence score based on spending consistency

## Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |

## Security

- Row Level Security (RLS) on all tables
- User-specific data isolation
- Secure authentication via Supabase Auth
- Environment variables for sensitive data
- Password validation (min 6 characters)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Export expenses to CSV/PDF
- [ ] Recurring expense tracking
- [ ] Budget categories with individual limits
- [ ] Email notifications
- [ ] Dark mode toggle
- [ ] Multi-currency support
- [ ] Receipt image uploads
- [ ] Expense sharing between accounts
- [ ] Mobile app (React Native)

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you've created a `.env` file with your Supabase credentials
- Restart the development server after updating `.env`

### No data showing after adding expenses
- Check browser console for errors
- Verify your Supabase project is active
- Ensure you've run the SQL migration script

### Authentication issues
- Clear browser cache and cookies
- Verify Supabase Auth is enabled in your project
- Check email confirmation settings in Supabase

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Review Supabase documentation
3. Check browser console for error messages

---

**Built with ❤️ using React, Tailwind CSS, and Supabase**

Track • Analyze • Predict • Stay in control of your finances!
