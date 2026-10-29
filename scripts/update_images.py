import json

def update_images():
    with open('./db.json', 'r') as f:
        data = json.load(f)

    # Master curated images map
    image_map = {
        'subj-indian-history': {
            'imageUrl': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
            'bannerImage': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
            'units': {
                'unit-ih-ancient': {
                    'imageUrl': 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1200&q=80',
                    'topics': {
                        'top-ih-ivc-vedic': 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=800&q=80',
                        'top-ih-rel-empires': 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80'
                    }
                },
                'unit-ih-medieval': {
                    'imageUrl': 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80',
                    'topics': {
                        'top-ih-sultanate-mughal': 'https://images.unsplash.com/photo-1545129139-1beb780cf337?auto=format&fit=crop&w=800&q=80',
                        'top-ih-bhakti-sufi': 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80'
                    }
                },
                'unit-ih-modern': {
                    'imageUrl': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
                    'topics': {
                        'top-ih-1857-reforms': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
                        'top-ih-national-movement': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80'
                    }
                }
            }
        },
        'subj-ap-history': {
            'imageUrl': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
            'bannerImage': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
            'units': {
                'unit-ap-ancient': {
                    'imageUrl': 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?auto=format&fit=crop&w=1200&q=80'
                },
                'unit-ap-medieval': {
                    'imageUrl': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80'
                },
                'unit-ap-modern': {
                    'imageUrl': 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?auto=format&fit=crop&w=1200&q=80'
                }
            }
        },
        'subj-geography': {
            'imageUrl': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
            'bannerImage': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
            'units': {
                'unit-geo-physical': {
                    'imageUrl': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
                },
                'unit-geo-economic': {
                    'imageUrl': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
                },
                'unit-geo-demographic': {
                    'imageUrl': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80'
                }
            }
        }
    }

    for app in data.get('apps', []):
        for s in app.get('syllabus', []):
            s_id = s.get('id')
            if s_id in image_map:
                cfg = image_map[s_id]
                s['imageUrl'] = cfg['imageUrl']
                s['bannerImage'] = cfg['bannerImage']
                for u in s.get('units', []):
                    u_id = u.get('id')
                    if u_id in cfg.get('units', {}):
                        u_cfg = cfg['units'][u_id]
                        u['imageUrl'] = u_cfg['imageUrl']
                        for t in u.get('topics', []):
                            t_id = t.get('id')
                            if t_id in u_cfg.get('topics', {}):
                                t['imageUrl'] = u_cfg['topics'][t_id]
            else:
                # Also handle if matching by subject name
                s_name = (s.get('name') or '').lower()
                if 'history' in s_name and 'andhra' not in s_name:
                    s['imageUrl'] = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'
                    s['bannerImage'] = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'
                    for idx, u in enumerate(s.get('units', [])):
                        u_name = (u.get('name') or '').lower()
                        if 'ancient' in u_name or idx == 0:
                            u['imageUrl'] = 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1200&q=80'
                        elif 'medieval' in u_name or idx == 1:
                            u['imageUrl'] = 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80'
                        elif 'modern' in u_name or idx == 2:
                            u['imageUrl'] = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80'

    with open('./db.json', 'w') as f:
        json.dump(data, f, indent=2)

    print("db.json background images updated successfully!")

if __name__ == '__main__':
    update_images()
