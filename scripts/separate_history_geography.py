import json

def separate_history_and_geography():
    with open('./db.json', 'r') as f:
        data = json.load(f)

    # Define the separate Indian History subject
    history_subject = {
        "id": "subj-indian-history",
        "name": "Indian history",
        "category": "prelims",
        "color": "from-amber-600 to-orange-700",
        "imageUrl": "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=800&q=80",
        "units": [
            {
                "id": "unit-ih-ancient",
                "name": "Unit 1: Ancient Indian History",
                "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Great_Sanchi_Stupa_%283%29.jpg/1280px-Great_Sanchi_Stupa_%283%29.jpg",
                "topics": [
                    {
                        "id": "topic-ih-ancient-civ",
                        "name": "Indus Valley Civilization & Vedic Culture",
                        "imageUrl": "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-ih-ivc", "name": "Harappan Sites, Town Planning & Economy", "notes": "Key sites: Harappa, Mohenjodaro, Lothal, Dholavira, Kalibangan."},
                            {"id": "sub-ih-vedic", "name": "Early & Later Vedic Period, Society & Literature", "notes": "Vedas, Upanishads, Sabha, Samiti, Varna system."}
                        ]
                    },
                    {
                        "id": "topic-ih-religions-empires",
                        "name": "Religious Movements & Early Empires",
                        "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-ih-jain-buddh", "name": "Buddhism & Jainism: Philosophy & Councils", "notes": "Four Noble Truths, Eightfold Path, Buddhist Councils."},
                            {"id": "sub-ih-maurya-gupta", "name": "Mauryan & Gupta Golden Age, Administration & Art", "notes": "Ashokan Edicts, Arthashastra, Gupta classical literature and science."}
                        ]
                    }
                ]
            },
            {
                "id": "unit-ih-medieval",
                "name": "Unit 2: Medieval Indian History",
                "imageUrl": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
                "topics": [
                    {
                        "id": "topic-ih-sultanate-mughal",
                        "name": "Delhi Sultanate & Mughal Empire",
                        "imageUrl": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-ih-sultanate", "name": "Sultanate Dynasties, Administration & Architecture", "notes": "Slave, Khilji, Tughlaq reforms, market control."},
                            {"id": "sub-ih-mughals", "name": "Mughal Governance, Mansabdari System & Culture", "notes": "Akbar's Din-i-Ilahi, revenue systems, art and monuments."}
                        ]
                    },
                    {
                        "id": "topic-ih-bhakti-sufi",
                        "name": "Bhakti Movement & Sufism",
                        "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-ih-bhakti", "name": "Bhakti Saints: Kabir, Guru Nanak, Mirabai, Ramanuja", "notes": "Devotional philosophy, Nirguna and Saguna traditions."},
                            {"id": "sub-ih-sufi", "name": "Sufi Silsilas: Chishti, Suhrawardi Orders", "notes": "Syncretic culture, dargahs, harmony."}
                        ]
                    }
                ]
            },
            {
                "id": "unit-ih-modern",
                "name": "Unit 3: Modern Indian History & National Movement",
                "imageUrl": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
                "topics": [
                    {
                        "id": "topic-ih-revolt-reforms",
                        "name": "1857 Revolt & Socio-Religious Reforms",
                        "imageUrl": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-ih-1857", "name": "Causes, Centers & Leaders of 1857 Uprising", "notes": "Mangal Pandey, Rani Lakshmibai, Bahadur Shah II."},
                            {"id": "sub-ih-renaissance", "name": "Raja Ram Mohan Roy, Jyotirao Phule, Vivekananda", "notes": "Brahmo Samaj, Arya Samaj, Satya Shodhak Samaj, widow remarriage."}
                        ]
                    },
                    {
                        "id": "topic-ih-freedom-movement",
                        "name": "National Movement & Gandhian Mass Movements",
                        "imageUrl": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-ih-gandhi-movements", "name": "Non-Cooperation, Civil Disobedience & Quit India", "notes": "Salt Satyagraha, Rowlatt Act, Dandi March, 1942 movement."},
                            {"id": "sub-ih-independence-partition", "name": "Cabinet Mission, Mountbatten Plan & Independence 1947", "notes": "Constituent Assembly, integration of princely states."}
                        ]
                    }
                ]
            }
        ]
    }

    # Define the separate Geography subject
    geography_subject = {
        "id": "subj-geography",
        "name": "Geography",
        "category": "prelims",
        "color": "from-teal-600 to-emerald-700",
        "imageUrl": "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
        "units": [
            {
                "id": "unit-geo-general-physical",
                "name": "Unit 1: General & Physical Geography",
                "imageUrl": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
                "topics": [
                    {
                        "id": "topic-geo-solar-earth",
                        "name": "Solar System, Earth Interior & Landforms",
                        "imageUrl": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-geo-earth-structure", "name": "Crust, Mantle, Core, Plate Tectonics & Earthquakes", "notes": "Lithosphere, Seismic waves, Continental Drift."},
                            {"id": "sub-geo-major-landforms", "name": "Mountains, Plateaus, Plains & Drainage Systems", "notes": "Himalayan vs Peninsular river systems: Indus, Ganga, Godavari, Krishna."}
                        ]
                    },
                    {
                        "id": "topic-geo-climate-oceans",
                        "name": "Atmosphere, Indian Monsoon & Oceanography",
                        "imageUrl": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-geo-monsoon", "name": "South-West & North-East Monsoons, El Nino & Cyclones", "notes": "Mechanism of monsoon, Jet streams, Bay of Bengal depressions."},
                            {"id": "sub-geo-oceans", "name": "Ocean Relief, Currents, Tides & Marine Resources", "notes": "Continental shelf, Gulf stream, Indian ocean currents, corals."}
                        ]
                    }
                ]
            },
            {
                "id": "unit-geo-economic",
                "name": "Unit 2: Economic Geography of India & Andhra Pradesh",
                "imageUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
                "topics": [
                    {
                        "id": "topic-geo-agri-resources",
                        "name": "Agriculture, Soils & Irrigation in India & AP",
                        "imageUrl": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-geo-soils-crops", "name": "Major Soil Types, Cropping Patterns & Green Revolution", "notes": "Alluvial, Black, Red soils, Rice, Millets, Commercial crops."},
                            {"id": "sub-geo-irrigation-ap", "name": "Major Irrigation Projects: Polavaram, Nagarjuna Sagar", "notes": "River basins, Interlinking of rivers, Water conservation."}
                        ]
                    },
                    {
                        "id": "topic-geo-minerals-industry",
                        "name": "Minerals, Energy & Industrial Corridors",
                        "imageUrl": "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-geo-minerals", "name": "Metallic & Non-Metallic Minerals, AP Bauxite & Barytes", "notes": "Iron ore, Coal, Petroleum, Renewable solar/wind energy."},
                            {"id": "sub-geo-industrial", "name": "Vizag-Chennai Industrial Corridor (VCIC) & Ports", "notes": "Visakhapatnam, Krishnapatnam ports, SEZs, logistics corridors."}
                        ]
                    }
                ]
            },
            {
                "id": "unit-geo-social-demographic",
                "name": "Unit 3: Social & Demographic Geography",
                "imageUrl": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
                "topics": [
                    {
                        "id": "topic-geo-demography",
                        "name": "Population Dynamics, Literacy & Urbanization",
                        "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
                        "subtopics": [
                            {"id": "sub-geo-census", "name": "Census Data, Sex Ratio, Density & Growth Rates in AP", "notes": "Demographic dividend, rural-to-urban migration trends."},
                            {"id": "sub-geo-tribes", "name": "Tribal Demography & Scheduled Areas of Andhra Pradesh", "notes": "Chenchus, Yanadis, Koyas, Bagatas and tribal welfare regions."}
                        ]
                    }
                ]
            }
        ]
    }

    # Process each app
    for app in data.get('apps', []):
        old_syllabus = app.get('syllabus', [])
        new_syllabus = []
        
        # We will replace 'subj-history-geography' with separate 'subj-indian-history' and 'subj-geography'
        for s in old_syllabus:
            if s.get('id') == 'subj-history-geography':
                new_syllabus.append(history_subject)
                new_syllabus.append(geography_subject)
            elif s.get('id') in ['subj-indian-history', 'subj-geography']:
                pass # skip if already present
            else:
                new_syllabus.append(s)
        
        # If 'subj-history-geography' was not found (e.g. fresh), ensure history and geography are first
        has_history = any(s.get('id') == 'subj-indian-history' for s in new_syllabus)
        has_geo = any(s.get('id') == 'subj-geography' for s in new_syllabus)
        if not has_history:
            new_syllabus.insert(0, history_subject)
        if not has_geo:
            new_syllabus.insert(1, geography_subject)
            
        app['syllabus'] = new_syllabus

    # Now let's update questions:
    # Any question with subjectId 'subj-history-geography':
    # If question text or topic mentions geography, assign to 'subj-geography'
    # Otherwise assign to 'subj-indian-history'
    geo_keywords = ['river', 'soil', 'monsoon', 'mountain', 'plateau', 'drainage', 'barytes', 'climate', 'landform', 'ocean', 'tide', 'current', 'latitude', 'longitude', 'corridor', 'port', 'chenchu', 'forest', 'peninsular', 'crop', 'irrigation', 'polavaram', 'godavari', 'krishna', 'bauxite', 'demographic', 'census']
    
    for q in data.get('questions', []):
        sid = q.get('subjectId')
        if sid == 'subj-history-geography':
            text = (q.get('question', '') + ' ' + q.get('topicId', '') + ' ' + q.get('unitId', '') + ' ' + q.get('explanation', '')).lower()
            if any(k in text for k in geo_keywords):
                q['subjectId'] = 'subj-geography'
                q['unitId'] = 'unit-geo-general-physical'
                q['topicId'] = 'topic-geo-solar-earth'
            else:
                q['subjectId'] = 'subj-indian-history'
                q['unitId'] = 'unit-ih-ancient'
                q['topicId'] = 'topic-ih-ancient-civ'
                
    with open('./db.json', 'w') as f:
        json.dump(data, f, indent=2)

    print("Successfully separated Indian History & Geography into 2 distinct Prelims subjects in db.json!")

if __name__ == '__main__':
    separate_history_and_geography()
