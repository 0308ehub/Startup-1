# TCGPlayer Affiliate Link Setup

This guide explains how to set up TCGPlayer affiliate links for your catalog.

## 🔗 Setting Up Your Affiliate Link

### Step 1: Get Your Partner ID
1. Log into your [Impact dashboard](https://app.impact.com/)
2. Look for TCGPlayer in your brand list
3. Find your **Partner ID** (it will be a series of numbers/letters)

### Step 2: Update Configuration
1. Open `src/lib/tcgplayer/config.ts`
2. Replace `'6468161'` with your actual Partner ID (if different):

```typescript
export const TCGPLAYER_CONFIG = {
  PARTNER_ID: '6468161', // Your partner ID is configured
  // ... rest of config
};
```

### Step 3: Test Your Links
After updating the Partner ID, your affiliate links will automatically work in:
- Card modal popups
- "View on TCGPlayer" buttons
- Any other TCGPlayer links in your app

## 📋 How It Works

The affiliate link system automatically:
1. **Uses official TCGPlayer API link** - `https://partner.tcgplayer.com/c/6468161/1830156/21018`
2. **Follows the ?u= parameter format** - Encodes target URLs and appends them to the API link
3. **Generates unique click IDs** - Each click creates a unique tracking ID
4. **Credits your Partner ID** - All clicks are attributed to your Impact partner ID (6468161)
5. **Opens in new tabs** - Better user experience
6. **Follows official guidelines** - Uses the exact format specified by TCGPlayer

## 🎯 Example Link Structure

```
API Link: https://partner.tcgplayer.com/c/6468161/1830156/21018
Direct Product: https://partner.tcgplayer.com/c/6468161/1830156/21018?u=https%3A%2F%2Ftcgplayer.com%2Fproduct%2F642283
Card Search: https://partner.tcgplayer.com/c/6468161/1830156/21018?u=https%3A%2F%2Ftcgplayer.com%2Fsearch%2Fyugioh%2Fproduct.html%3Fq%3DBlue-Eyes%2520White%2520Dragon
```

## 💡 Tips

- **Test your links** - Make sure they redirect to the correct TCGPlayer pages
- **Monitor performance** - Check your Impact dashboard for click tracking
- **Update regularly** - Keep your Partner ID current if it changes

## 🔧 Advanced Usage

You can also generate general Yu-Gi-Oh! links:

```typescript
import { TCGPLAYER_CONFIG } from '@/lib/tcgplayer/config';

// General Yu-Gi-Oh! search
const generalLink = TCGPLAYER_CONFIG.generateGeneralLink();

// Specific card search
const cardLink = TCGPLAYER_CONFIG.generateCardLink('Blue-Eyes White Dragon');
```

## 📊 Tracking

All affiliate links will:
- ✅ Track clicks in your Impact dashboard
- ✅ Generate unique click IDs
- ✅ Credit your Partner ID
- ✅ Provide analytics on performance
