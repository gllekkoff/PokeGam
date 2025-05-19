import json
import random
import requests
import math
API_KEY = "c210671d-a1cc-4a9e-b0cc-5e209c61f5e6"
NUM_PAGES = 4
PAGE_SIZE = 250

def fetch_random_pages(num_pages, page_size):
    meta = requests.get(
        "https://api.pokemontcg.io/v2/cards",
        params={"page": 1, "pageSize": 1},
        headers={"X-Api-Key": API_KEY}
    ).json()
    total_count = meta.get("totalCount", 0)
    max_page    = math.ceil(total_count / page_size)

    pages = random.sample(range(1, max_page + 1), num_pages)

    cards = []
    for p in pages:
        resp = requests.get(
            "https://api.pokemontcg.io/v2/cards",
            params={"page": p, "pageSize": page_size},
            headers={"X-Api-Key": API_KEY}
        )
        resp.raise_for_status()
        cards.extend(resp.json().get("data", []))

    return cards

def stepped_price(low, high, step=10):
    return random.choice(list(range(low, high + 1, step)))

def build_price_ranges():
    return {
        "ACE SPEC Rare":               (700,  900),
        "Amazing Rare":                (900, 1100),
        "Classic Collection":          (100, 200),
        "Common":                      (50,  150),
        "Double Rare":                 (510, 700),
        "Hyper Rare":                  (1200,1400),
        "Illustration Rare":           (1300,1500),
        "LEGEND":                      (2000,3000),
        "Promo":                       (200, 600),
        "Radiant Rare":                (1400,1600),
        "Rare":                        (310, 500),
        "Rare ACE":                    (600, 800),
        "Rare BREAK":                  (910, 1200),
        "Rare Holo":                   (510, 800),
        "Rare Holo EX":                (810, 1200),
        "Rare Holo GX":                (900, 1300),
        "Rare Holo LV.X":              (1000,1500),
        "Rare Holo Star":              (1000,1500),
        "Rare Holo V":                 (1010,1600),
        "Rare Holo VMAX":              (1510,2500),
        "Rare Holo VSTAR":             (1510,2500),
        "Rare Prime":                  (700, 1000),
        "Rare Prism Star":             (810, 1300),
        "Rare Rainbow":                (1800,2300),
        "Rare Secret":                 (1800,2500),
        "Rare Shining":                (800, 1200),
        "Rare Shiny":                  (800, 1200),
        "Rare Shiny GX":               (1000,1600),
        "Rare Ultra":                  (1200,1800),
        "Shiny Rare":                  (1200,1800),
        "Shiny Ultra Rare":            (1800,2400),
        "Special Illustration Rare":   (2000,3000),
        "Trainer Gallery Rare Holo":   (1000,1500),
        "Ultra Rare":                  (1200,1800),
        "Uncommon":                    (160, 300),
    }

def main():
    with open("db.json", "r") as f:
        data = json.load(f)

    print(f"Fetching up to {PAGE_SIZE} cards…")
    api_cards = fetch_random_pages(NUM_PAGES, PAGE_SIZE)
    print(f"  → Retrieved {len(api_cards)} cards")

    price_ranges = build_price_ranges()

    new_cards = []
    for c in api_cards:
        rarity = c.get("rarity", "Common")
        low, high = price_ranges.get(rarity, (300, 800))
        price = stepped_price(low, high, step=10)

        new_cards.append({
            "id":       c["id"],
            "name":     c["name"],
            "imageUrl": c["images"]["large"],
            "rarity":   rarity,
            "price":    price
        })

    data["cards"] = new_cards
    print(f"Built data['cards'] with {len(new_cards)} entries")

    for pack in data.get("packs", []):
        pack["cards"] = random.sample(new_cards, 10)

    out_file = "new_db.json"
    with open(out_file, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Done! Wrote {out_file} with {len(new_cards)} cards & 10-card packs.")

if __name__ == "__main__":
    main()