import json
import os
import random
from collections import defaultdict
import itertools
from pprint import pprint

# Define the path to the data
data_path = 'file_path'

playlists_needed = 1000000

# List to store selected playlists
selected_playlists = []

all_files = [f for f in os.listdir(data_path) if f.endswith('.json')]
random.shuffle(all_files)

for file_name in all_files:
    if playlists_needed <= 0:
        break
    file_path = os.path.join(data_path, file_name)
    with open(file_path, 'r') as f:
        data = json.load(f)
        playlists = data['playlists']
        if len(playlists) <= playlists_needed:
            selected_playlists.extend(playlists)
            playlists_needed -= len(playlists)
        else:
            selected_playlists.extend(playlists[:playlists_needed])
            playlists_needed = 0

print(f"Selected {len(selected_playlists)} playlists.")

# Initialize co-occurrence counts
co_occurrence = defaultdict(int)
artists = set({})

# Process each playlist
for playlist in selected_playlists:
    # Get the set of unique artist IDs in the playlist
    playlist_artist_ids = set()

    for track in playlist['tracks']:
        artist_uri = track.get('artist_name')
        if artist_uri:
            artist_id = artist_uri.split(':')[-1]
            playlist_artist_ids.add(artist_id)

    for artist1, artist2 in itertools.combinations(playlist_artist_ids, 2):
        pair = tuple(sorted((artist1, artist2)))
        co_occurrence[pair] += 1

edges = []
mx = [-1]
for (artist1, artist2), weight in co_occurrence.items():
    if weight > mx[0]:
        mx = [weight, artist1, artist2]
    if weight >= 1000:
        artists = artists.union({artist1, artist2})
        edges.append({
            'source': artist1,
            'target': artist2,
            'weight': weight
        })

nodes = []
for i in artists:
    nodes.append({'id': i})
top10 = sorted(edges, key=lambda d: d['weight'], reverse=True)
final_json = dict({
    'nodes': nodes,
    'edges': list(edges)
})
pprint(final_json)
print(len(edges))
with open('file_path', 'w') as f:
    json.dump(final_json, f)

#for i in top10:
    # if i['source'] != 'Drake' and i['target'] != 'Drake': #DRAKE FILTER
