# Recipe Finder Setup Guide

## Overview
The Recipe Finder feature uses Google's Gemini AI model to generate Indian recipes based on available ingredients and preferences. **It's completely FREE to use!**

## Setup Instructions

### 1. Get Google Gemini API Key (Free!)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (save it securely)

### 2. Configure Environment Variables
1. Copy the `env.example` file to `.env` in the root directory:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

### 3. Restart Development Server
```bash
npm run dev
```

## Features

### Recipe Generation
- Input available ingredients
- Specify cuisine preferences (optional)
- Add dietary restrictions (optional)
- Get detailed recipe with:
  - Ingredients list with quantities
  - Step-by-step instructions
  - Cooking times and difficulty
  - Chef's tips

### Why Gemini over OpenAI?
- **100% FREE**: No cost per API call
- **No CORS Issues**: Better browser compatibility
- **High Quality**: Google's latest AI model
- **Fast Response**: Quick recipe generation
- **No Billing Required**: No credit card needed

## Usage

1. Navigate to `/recipe-finder` or click "Recipe Finder" in the navigation
2. Enter your available ingredients in the text area
3. Optionally specify cuisine type and dietary restrictions
4. Click "Find Recipe" to generate a personalized recipe
5. View detailed recipe with ingredients, instructions, and tips

## Troubleshooting

### "Gemini API key not configured"
- Ensure the `.env` file exists in the root directory
- Check that the API key is correctly set as `VITE_GEMINI_API_KEY`
- Restart the development server after adding the API key

### "Invalid Gemini API key"
- Verify your API key is correct from Google AI Studio
- Make sure you're signed in to the correct Google account

### "Quota exceeded"
- Gemini has generous free limits, but check your usage in Google AI Studio
- If needed, you can request quota increases for free

## Cost & Limits
- **Completely FREE** for personal and commercial use
- Up to 15 requests per minute
- Up to 1,500 requests per day
- No billing or credit card required
- Perfect for recipe generation use cases 