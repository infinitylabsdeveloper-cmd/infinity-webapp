import json

def update_history_images():
    with open('./db.json', 'r') as f:
        data = json.load(f)

    # Image constants
    INDIAN_HISTORY_MAIN = "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80" # Hampi Stone Chariot (UNESCO World Heritage)
    ANCIENT_HISTORY_UNIT = "https://images.unsplash.com/photo-1621682372775-533449e550ed?auto=format&fit=crop&w=1200&q=80" # Ancient Shore Temple / Classical India
    ANCIENT_TOPIC_1 = "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80" # Ancient stone heritage / IVC & Vedic
    ANCIENT_TOPIC_2 = "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80" # Ancient spiritual cradle / Buddhism & Mauryas

    MEDIEVAL_HISTORY_UNIT = "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80" # Red Fort (Mughal & Medieval India)
    MEDIEVAL_TOPIC_1 = "https://images.unsplash.com/photo-1545129139-1beb780cf337?auto=format&fit=crop&w=1200&q=80" # Qutb Minar (Delhi Sultanate)
    MEDIEVAL_TOPIC_2 = "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80" # Amber Palace & Rajput / Bhakti syncretic culture

    MODERN_HISTORY_UNIT = "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80" # India Gate (Modern Indian national monument)
    MODERN_TOPIC_1 = "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80" # National reforms & institution building
    MODERN_TOPIC_2 = "https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?auto=format&fit=crop&w=1200&q=80" # Indian National Flag / Freedom struggle & Independence

    for app in data.get('apps', []):
        for s in app.get('syllabus', []):
            if s.get('id') == 'subj-indian-history' or s.get('name', '').lower() == 'indian history':
                s['imageUrl'] = INDIAN_HISTORY_MAIN
                s['bannerImage'] = INDIAN_HISTORY_MAIN
                
                for u in s.get('units', []):
                    uname = u.get('name', '').lower()
                    if 'ancient' in uname or u.get('id') == 'unit-ih-ancient':
                        u['imageUrl'] = ANCIENT_HISTORY_UNIT
                        for t in u.get('topics', []):
                            tname = t.get('name', '').lower()
                            if 'indus' in tname or 'vedic' in tname:
                                t['imageUrl'] = ANCIENT_TOPIC_1
                            else:
                                t['imageUrl'] = ANCIENT_TOPIC_2
                    elif 'medieval' in uname or u.get('id') == 'unit-ih-medieval':
                        u['imageUrl'] = MEDIEVAL_HISTORY_UNIT
                        for t in u.get('topics', []):
                            tname = t.get('name', '').lower()
                            if 'sultanate' in tname or 'mughal' in tname:
                                t['imageUrl'] = MEDIEVAL_TOPIC_1
                            else:
                                t['imageUrl'] = MEDIEVAL_TOPIC_2
                    elif 'modern' in uname or u.get('id') == 'unit-ih-modern':
                        u['imageUrl'] = MODERN_HISTORY_UNIT
                        for t in u.get('topics', []):
                            tname = t.get('name', '').lower()
                            if '1857' in tname or 'reform' in tname:
                                t['imageUrl'] = MODERN_TOPIC_1
                            else:
                                t['imageUrl'] = MODERN_TOPIC_2

    with open('./db.json', 'w') as f:
        json.dump(data, f, indent=2)

    print("Updated Indian history images in db.json successfully!")

if __name__ == '__main__':
    update_history_images()
