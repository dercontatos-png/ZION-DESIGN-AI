import os, re, urllib.request, json
from html import unescape

# We will read this file itself or a script with the raw html
# Let's write the complete downloader
def main():
    with open('/scripts/user_payload.html', 'r', encoding='utf-8') as f:
        html = f.read()

    os.makedirs('public/community_home/thumbnails', exist_ok=True)
    os.makedirs('public/community_home/avatars', exist_ok=True)
    os.makedirs('public/community_home/strip', exist_ok=True)

    # 1. Parse Comunidade Strip
    strip_match = re.search(r'<div class="h-full bordas-que-desvanecem">(.*?)</div>\s*<button', html, re.DOTALL)
    strip_items = []
    if strip_match:
        strip_html = strip_match.group(1)
        raw_items = re.findall(r'<a[^>]*href="/community"[^>]*><img\s+alt="\[?([a-zA-Z0-9_-]+)\]?[^"]*"\s+loading="lazy"\s+class="[^"]*"\s+src="([^"]+)"', strip_html)
        print(f"Found {len(raw_items)} strip items")
        for idx, (code, url) in enumerate(raw_items):
            clean_url = unescape(url)
            filename = f"strip_{idx}_{code}.avif"
            local_path = f"public/community_home/strip/{filename}"
            rel_path = f"/community_home/strip/{filename}"
            
            if not os.path.exists(local_path) or os.path.getsize(local_path) == 0:
                try:
                    req = urllib.request.Request(clean_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req) as resp, open(local_path, 'wb') as out_f:
                        out_f.write(resp.read())
                    print(f"Downloaded strip {idx}: {code}")
                except Exception as e:
                    print(f"Error downloading strip {code}: {e}")
                    rel_path = clean_url
            strip_items.append({"id": code, "alt": f"[{code}]", "src": rel_path})

    # 2. Parse 4 columns feed
    feed_match = re.search(r'style="--duracao-zoom:\s*280ms;"\s*>(.*?)</div>\s*<div class="pointer-events-none absolute inset-x-0 bottom-0', html, re.DOTALL)
    columns_data = [[], [], [], []]
    
    if feed_match:
        feed_html = feed_match.group(1)
        col_blocks = re.findall(r'<div class="flex min-w-0 flex-1 flex-col gap-\[2px\]">(.*?)</div>(?=\s*<div class="flex min-w-0 flex-1 flex-col|\s*$)', feed_html, re.DOTALL)
        print(f"Found {len(col_blocks)} column blocks")
        
        for c_idx, col_html in enumerate(col_blocks[:4]):
            card_matches = re.finditer(r'<a\s+href="/community\?art=([a-zA-Z0-9_-]+)"[^>]*>(.*?)</a>', col_html, re.DOTALL)
            
            for m in card_matches:
                art_code = m.group(1)
                body = m.group(2)
                
                img_src_m = re.search(r'<img\s+alt="[^"]*"\s+loading="lazy"\s+class="[^"]*"\s+src="([^"]+)"', body)
                img_url = unescape(img_src_m.group(1)) if img_src_m else ""
                
                author_m = re.search(r'<span class="block truncate text-\[12px\] font-medium leading-tight text-white">(.*?)</span>', body)
                author = author_m.group(1).strip() if author_m else "Membro"
                
                avatar_m = re.search(r'<img\s+alt=""\s+loading="lazy"\s+class="relative h-7 w-7[^"]*"\s+src="([^"]+)"', body)
                avatar_url = unescape(avatar_m.group(1)) if avatar_m else ""
                
                initial_m = re.search(r'<span class="relative flex h-7 w-7[^"]*">([A-Z0-9])</span>', body)
                initial = initial_m.group(1).strip() if initial_m else (author[0].upper() if author else "U")
                
                thumb_filename = f"thumb_{art_code}.avif"
                thumb_local = f"public/community_home/thumbnails/{thumb_filename}"
                thumb_rel = f"/community_home/thumbnails/{thumb_filename}"
                
                if img_url:
                    if not os.path.exists(thumb_local) or os.path.getsize(thumb_local) == 0:
                        try:
                            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(req) as resp, open(thumb_local, 'wb') as out_f:
                                out_f.write(resp.read())
                        except Exception as e:
                            print(f"Error downloading thumb {art_code}: {e}")
                            thumb_rel = img_url
                
                avatar_rel = None
                if avatar_url:
                    ext = "png" if ".png" in avatar_url else "webp" if ".webp" in avatar_url else "jpg"
                    clean_id = re.sub(r'[^a-zA-Z0-9]', '_', art_code)
                    avatar_filename = f"avatar_{clean_id}.{ext}"
                    avatar_local = f"public/community_home/avatars/{avatar_filename}"
                    avatar_rel = f"/community_home/avatars/{avatar_filename}"
                    
                    if not os.path.exists(avatar_local) or os.path.getsize(avatar_local) == 0:
                        try:
                            req = urllib.request.Request(avatar_url, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(req) as resp, open(avatar_local, 'wb') as out_f:
                                out_f.write(resp.read())
                        except Exception as e:
                            avatar_rel = avatar_url
                
                card_obj = {
                    "id": art_code,
                    "src": thumb_rel,
                    "author": author,
                    "initial": initial
                }
                if avatar_rel:
                    card_obj["avatar"] = avatar_rel
                    
                columns_data[c_idx].append(card_obj)
                
    result = {
        "strip": strip_items,
        "col1": columns_data[0],
        "col2": columns_data[1],
        "col3": columns_data[2],
        "col4": columns_data[3],
    }
    
    with open('public/community_home_data.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
        
    print(f"Done! Strip: {len(strip_items)}, Col1: {len(columns_data[0])}, Col2: {len(columns_data[1])}, Col3: {len(columns_data[2])}, Col4: {len(columns_data[3])}")
    print(f"Total community cards saved: {sum(len(c) for c in columns_data)}")

if __name__ == '__main__':
    main()
