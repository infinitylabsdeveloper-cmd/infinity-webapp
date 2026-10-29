import json

def fix_subtopics():
    with open('./db.json', 'r') as f:
        data = json.load(f)

    for app in data.get('apps', []):
        for s in app.get('syllabus', []):
            for u in s.get('units', []):
                for t in u.get('topics', []):
                    subs = t.get('subtopics', [])
                    cleaned_subs = []
                    # Ensure General Practice is first
                    cleaned_subs.append('General Practice')
                    for item in subs:
                        if isinstance(item, dict):
                            name = item.get('name') or item.get('id') or ''
                        elif isinstance(item, str):
                            name = item
                        else:
                            name = str(item)
                        name = name.strip()
                        if name and name != 'General Practice' and name not in cleaned_subs:
                            cleaned_subs.append(name)
                    t['subtopics'] = cleaned_subs

    with open('./db.json', 'w') as f:
        json.dump(data, f, indent=2)

    print("All subtopics normalized to strings with 'General Practice' leading!")

if __name__ == '__main__':
    fix_subtopics()
