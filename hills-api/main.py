from fastapi import FastAPI
from pydantic import BaseModel
from math import radians, cos, sin, asin, sqrt, atan2, degrees
import pandas as pd
import uvicorn

hills_data = pd.read_excel('./data/DoBIH_v18.xlsx', sheet_name='DoBIH_v18')[['Name', 'Latitude', 'Longitude', 'Metres']].dropna()

app = FastAPI()


class Hill(BaseModel):
    name: str
    distance: float
    bearing: float
    height: float


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # https://en.wikipedia.org/wiki/Haversine_formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 3958.8  # Earth's radius in miles
    return c * r


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlon = lon2 - lon1
    x = sin(dlon) * cos(lat2)
    y = cos(lat1) * sin(lat2) - (sin(lat1) * cos(lat2) * cos(dlon))
    initial_bearing = atan2(x, y)
    
    # Convert radians to degrees
    initial_bearing = degrees(initial_bearing)
    compass_bearing = (initial_bearing + 360) % 360
    return compass_bearing

@app.get("/nearest")
def nearest(latitude: float, longitude: float, furthest: float = 25) -> dict:
    results = []

    for _, row in hills_data.iterrows():
        hill_name = row['Name']
        hill_lat = row['Latitude']
        hill_long = row['Longitude']
        hill_height = row['Metres']
        
        distance = haversine(latitude, longitude, hill_lat, hill_long)
        if distance <= furthest: 
            bearing = calculate_bearing(latitude, longitude, hill_lat, hill_long)
            results.append(Hill(name=hill_name, distance=distance, bearing=bearing, height=hill_height))
    
    results.sort(key=lambda x: x.distance)
    
    return {"results": results}

# Run the app using Uvicorn
if __name__ == "__main__":
    uvicorn.run(app, host="172.20.10.2", port=8000)
