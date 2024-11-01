import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry

# Configure cache and retry sessions
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)  # Cache for 1 hour
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)

# Initialize Open-Meteo client with retry and cache capabilities
openmeteo = openmeteo_requests.Client(session=retry_session)

# API parameters - Customize latitude and longitude to your location of interest
url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": 34.05,   # Example coordinates for Los Angeles
    "longitude": -118.24,
    "hourly": ["temperature_2m", "precipitation", "windspeed_10m"]
}

# Fetch data from Open-Meteo
responses = openmeteo.weather_api(url, params=params)

# Process data for a single location
response = responses[0]
print(f"Coordinates: {response.Latitude()}°N, {response.Longitude()}°E")
print(f"Elevation: {response.Elevation()} m above sea level")
print(f"Timezone: {response.Timezone()} {response.TimezoneAbbreviation()}")
print(f"UTC Offset: {response.UtcOffsetSeconds()} seconds")

# Extract hourly data variables and convert them to Numpy arrays
hourly = response.Hourly()
hourly_temperature = hourly.Variables(0).ValuesAsNumpy()
hourly_precipitation = hourly.Variables(1).ValuesAsNumpy()
hourly_windspeed = hourly.Variables(2).ValuesAsNumpy()

# Construct a DataFrame for hourly data
hourly_data = {
    "date": pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    ),
    "temperature_2m": hourly_temperature,
    "precipitation": hourly_precipitation,
    "windspeed_10m": hourly_windspeed
}

hourly_dataframe = pd.DataFrame(data=hourly_data)
print(hourly_dataframe)
