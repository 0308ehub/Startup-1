# TCGPlayer Price Lookup Tool

A command-line tool to fetch card prices from the TCGPlayer API.

## Prerequisites

1. **Environment Variables**: Make sure you have a `.env.local` file in the `deckvault` directory with your TCGPlayer API credentials:
   ```
   TCGPLAYER_PUBLIC_KEY=your_public_key_here
   TCGPLAYER_PRIVATE_KEY=your_private_key_here
   ```

2. **Dependencies**: The script requires `node-fetch` and `dotenv` which are already installed in this project.

## Usage

### Search by Card Name
```bash
node get-tcg-prices.js "Card Name"
```

Example:
```bash
node get-tcg-prices.js "Blue-Eyes White Dragon"
```

### Get Prices by Product IDs
```bash
node get-tcg-prices.js --ids product_id1,product_id2,product_id3
```

Example:
```bash
node get-tcg-prices.js --ids 21715,21716,21717
```

### Search and Specify Product IDs
```bash
node get-tcg-prices.js "Card Name" product_id1,product_id2
```

## Features

- 🔍 **Product Search**: Search for cards by name in the Yu-Gi-Oh! category
- 💰 **Price Data**: Get comprehensive price information including:
  - Market Price
  - Low Price
  - Mid Price
  - High Price
  - Direct Low Price
- 📊 **Multiple Editions**: Shows prices for different card editions (1st Edition, Unlimited, etc.)
- 🎯 **Multiple Products**: Look up prices for multiple cards at once
- 🔐 **Authentication**: Automatic token management for TCGPlayer API

## Output Format

The script displays:
- Product information (ID, name, image URL)
- Price entries for each product
- Different card editions and their respective prices
- Only shows entries with actual price data

## Example Output

```
🎴 TCGPlayer Price Lookup Tool

🔑 Getting authentication token...
✅ Authentication successful

💰 Getting prices for 1 products...

💰 Price Results:
==================================================

📦 Product 1:
   Product ID: 21715
   📊 Found 2 price entries:

   💰 Price Entry 1:
      SubType: Unlimited
      Market Price: $0.15
      Low Price: $0.03
      Mid Price: $0.2
      High Price: $5.99
      Direct Low Price: $0.1

   💰 Price Entry 2:
      SubType: 1st Edition
      Market Price: $0.29
      Low Price: $0.05
      Mid Price: $0.29
      High Price: $5.99
      Direct Low Price: $N/A
```

## Error Handling

The script includes comprehensive error handling for:
- Missing environment variables
- Authentication failures
- API request errors
- Invalid product IDs
- Network issues

## Notes

- The script searches specifically in the Yu-Gi-Oh! category (ID: 2)
- Product search results are limited to 10 items
- Only price entries with actual data are displayed
- The script automatically groups results by product ID to avoid duplicates
