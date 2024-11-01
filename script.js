document.getElementById("fetchCoordinates").addEventListener("click", function() {
    const place = document.getElementById("place").value;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&addressdetails=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                document.getElementById("latitude").value = lat;
                document.getElementById("longitude").value = lon;
            } else {
                alert("No results found for the entered place.");
            }
        })
        .catch(error => {
            console.error("Error fetching coordinates:", error);
            alert("Error fetching coordinates. Please try again.");
        });
});

document.getElementById("fetchWeather").addEventListener("click", function() {
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,windspeed_10m`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayWeatherData(data);
        })
        .catch(error => {
            console.error("Error fetching the weather data:", error);
            document.getElementById("weatherData").innerHTML = "Error fetching data. Please check the coordinates.";
        });
});

function displayWeatherData(data) {
    const weatherDataDiv = document.getElementById("weatherData");
    weatherDataDiv.innerHTML = ''; // Clear previous data

    if (data.error) {
        weatherDataDiv.innerHTML = "Error: " + data.reason;
        return;
    }

    const hourly = data.hourly;
    let html = `<h2>Weather Data</h2>`;
    html += `<table>
                <tr>
                    <th>Date & Time</th>
                    <th>Temperature (°C)</th>
                    <th>Precipitation (mm)</th>
                    <th>Wind Speed (m/s)</th>
                </tr>`;
    
    for (let i = 0; i < hourly.time.length; i++) {
        html += `<tr>
                    <td>${new Date(hourly.time[i] * 1000).toLocaleString()}</td>
                    <td>${hourly.temperature_2m[i]}</td>
                    <td>${hourly.precipitation[i]}</td>
                    <td>${hourly.windspeed_10m[i]}</td>
                 </tr>`;
    }
    
    html += `</table>`;
    weatherDataDiv.innerHTML = html;
}
