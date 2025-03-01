import random
from datetime import datetime, timedelta
import json
from typing import List, Dict

# Constants
STATES = [
    # States
    "AP", "AR", "AS", "BR", "CT", "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", 
    "MP", "MH", "MN", "ML", "MZ", "NL", "OR", "PB", "RJ", "SK", "TN", "TG", "TR", 
    "UP", "UT", "WB",
    # Union Territories
    "AN", "CH", "DN", "DL", "LD", "PY", "LA", "OT"
]

COMMODITIES = {
    "Crops": [
        "rice", "cotton", "sugarcane", "wheat", "pulses", "soybean", "millets", "jowar",
        "maize", "opium", "castor", "mint", "groundnuts", "coffee", "barley", "tea"
    ],
    "Root Vegetables": [
        "carrot", "onion", "potato", "tomatoes", "chilis", "cabbage", "brinjal",
        "radish", "garlic", "mushroom"
    ],
    "Fruits": [
        "apples", "bananas", "mangoes", "dragon fruit", "blackberry", "blueberry",
        "grapes", "pineapple", "avocado", "watermelon", "lychee", "pear", "papaya",
        "kiwi", "oranges"
    ],
    "Spices": [
        "cinnamon", "cloves", "cumin", "cardamom", "coriander seed", "carom seeds",
        "nutmeg", "fennel", "black pepper", "dry red chilli", "curry leaves", "asafoetida"
    ],
    "Organic": [
        "organic oil", "organic herbs", "organic sweetener", "organic flour",
        "organic dairy products", "organic pulses", "organic spices"
    ],
    "Nursery and Plants": [
        "indoor plants", "outdoor plants", "garden plants", "flowering plants",
        "fruit plants"
    ],
    "Dry Fruits": [
        "almond", "walnut", "cashew", "figs", "dates", "pistachios", "apricot",
        "fox nuts", "coconut", "pine nut", "hazelnut"
    ],
    "Animals": [
        "goat", "sheep", "cow", "buffalo", "chicken"
    ],
    "Seeds": [
        "vegetable seeds", "flower seeds", "herb seeds", "fruit seeds", "grain seed"
    ]
}

# State-specific price modifiers (based on agricultural production and market conditions)
STATE_PRICE_FACTORS = {
    "PB": 0.95,  # Punjab - Major agricultural state, lower prices
    "HR": 0.95,  # Haryana - Major agricultural state
    "UP": 0.98,  # Uttar Pradesh - Large agricultural production
    "MP": 0.97,  # Madhya Pradesh - Major agricultural state
    "MH": 1.05,  # Maharashtra - Higher prices due to urbanization
    "GJ": 1.02,  # Gujarat - Mixed agricultural and industrial
    "DL": 1.15,  # Delhi - Higher prices due to urban area
    "KA": 1.03,  # Karnataka - Mixed pricing
    "TN": 1.04,  # Tamil Nadu - Mixed pricing
    "WB": 1.02,  # West Bengal - Mixed pricing
    # Default factor of 1.0 will be used for other states
}

# Base prices for commodities (in INR) - approximate real market prices
BASE_PRICES = {
    # Crops (per kg)
    "rice": 40, "cotton": 60, "sugarcane": 3, "wheat": 25, "pulses": 90,
    "soybean": 45, "millets": 30, "jowar": 25, "maize": 20, "opium": 2500,
    "castor": 65, "mint": 100, "groundnuts": 80, "coffee": 350, "barley": 35, "tea": 300,
    
    # Root Vegetables (per kg)
    "carrot": 40, "onion": 35, "potato": 25, "tomatoes": 30, "chilis": 60,
    "cabbage": 20, "brinjal": 40, "radish": 30, "garlic": 100, "mushroom": 200,
    
    # Fruits (per kg)
    "apples": 150, "bananas": 40, "mangoes": 100, "dragon fruit": 250,
    "blackberry": 400, "blueberry": 800, "grapes": 80, "pineapple": 60,
    "avocado": 300, "watermelon": 25, "lychee": 200, "pear": 100,
    "papaya": 50, "kiwi": 400, "oranges": 60,
    
    # Spices (per kg)
    "cinnamon": 800, "cloves": 1000, "cumin": 200, "cardamom": 1500,
    "coriander seed": 100, "carom seeds": 300, "nutmeg": 800, "fennel": 150,
    "black pepper": 500, "dry red chilli": 200, "curry leaves": 100, "asafoetida": 2000,
    
    # Organic (per kg/ltr)
    "organic oil": 200, "organic herbs": 300, "organic sweetener": 150,
    "organic flour": 80, "organic dairy products": 100, "organic pulses": 150,
    "organic spices": 400,
    
    # Nursery and Plants (per unit)
    "indoor plants": 300, "outdoor plants": 200, "garden plants": 150,
    "flowering plants": 250, "fruit plants": 400,
    
    # Dry Fruits (per kg)
    "almond": 800, "walnut": 900, "cashew": 700, "figs": 500, "dates": 300,
    "pistachios": 1200, "apricot": 600, "fox nuts": 800, "coconut": 40,
    "pine nut": 2000, "hazelnut": 900,
    
    # Animals (per animal)
    "goat": 8000, "sheep": 7000, "cow": 40000, "buffalo": 50000, "chicken": 400,
    
    # Seeds (per kg)
    "vegetable seeds": 500, "flower seeds": 400, "herb seeds": 600,
    "fruit seeds": 300, "grain seed": 100
}

def get_unit(category: str) -> str:
    """Determine the unit based on category."""
    if category in ["Crops", "Root Vegetables", "Fruits", "Spices", "Dry Fruits"]:
        return "KG"
    elif category == "Organic":
        return "Ltr" if "oil" in category or "dairy" in category else "KG"
    elif category == "Animals":
        return "Per Animal"
    else:
        return "Per Dozen" if category == "Nursery and Plants" else "KG"

def calculate_seasonal_price_factor(commodity: str, date: datetime, state: str) -> float:
    """Calculate seasonal price variations based on month and state."""
    month = date.month
    
    # Winter premium for vegetables and fruits (December-February)
    winter_premium = 1.2 if month in [12, 1, 2] else 1.0
    
    # State-specific seasonal adjustments
    state_factor = STATE_PRICE_FACTORS.get(state, 1.0)
    
    # Specific commodity adjustments
    if commodity in ["tomatoes", "onion", "potato"]:
        return winter_premium * 1.1 * state_factor  # Higher demand in winter
    elif commodity in ["mangoes", "watermelon"]:
        return 0.9 * state_factor  # Off-season in winter
    elif commodity in ["apples", "oranges"]:
        return winter_premium * 1.15 * state_factor  # Peak season
    
    return winter_premium * state_factor

def calculate_market_trend_factor(date: datetime) -> float:
    """Simulate market trends and random fluctuations."""
    # Add some random market fluctuation
    daily_fluctuation = random.uniform(0.95, 1.05)
    
    # Simulate general market trend (slight upward trend over time)
    days_since_start = (date - datetime(2024, 12, 1)).days
    trend_factor = 1 + (days_since_start * 0.001)  # Small daily increase
    
    return daily_fluctuation * trend_factor

def generate_price(base_price: float, date: datetime, commodity: str, state: str) -> float:
    """Generate final price considering all factors."""
    seasonal_factor = calculate_seasonal_price_factor(commodity, date, state)
    market_factor = calculate_market_trend_factor(date)
    
    # Calculate final price
    final_price = base_price * seasonal_factor * market_factor
    
    # Add some random variation (±5%)
    random_variation = random.uniform(0.95, 1.05)
    final_price *= random_variation
    
    return round(final_price, 2)

def generate_market_data(start_date: datetime, end_date: datetime) -> List[Dict]:
    """Generate market data for the specified date range."""
    market_data = []
    current_date = start_date
    
    while current_date <= end_date:
        for category, commodities in COMMODITIES.items():
            for commodity in commodities:
                for state in STATES:
                    base_price = BASE_PRICES[commodity]
                    price = generate_price(base_price, current_date, commodity, state)
                    
                    market_data.append({
                        "commodity": commodity,
                        "category": category,
                        "price": price,
                        "unit": get_unit(category),
                        "location": state,
                        "date": current_date.strftime("%Y-%m-%d")
                    })
        
        current_date += timedelta(days=1)
    
    return market_data

def main():
    # Generate data from December 2024 to February 2025
    start_date = datetime(2024, 12, 1)
    end_date = datetime(2025, 2, 28)
    
    market_data = generate_market_data(start_date, end_date)
    
    # Save to JSON file
    with open('market_data.json', 'w') as f:
        json.dump(market_data, f, indent=2)
    
    print(f"Generated {len(market_data)} records of market data")

if __name__ == "__main__":
    main()