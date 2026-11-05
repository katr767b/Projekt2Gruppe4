// FIND HTML ELEMENTS

const locationForm = document.querySelector("#locationForm");
const cityInput = document.querySelector("#cityInput");
const selectedCity = document.querySelector("#selectedCity");
const weatherLocation = document.querySelector("#weatherLocation");
const status = document.querySelector("#status");


// TRANSLATE WEATHER CODES INTO DANISH

function getWeatherDescription(code) {

    const weatherConditions = {
        0: "Klart",
        1: "Mest klart",
        2: "Delvist skyet",
        3: "Overskyet",
        45: "Tåge",
        48: "Rimtåge",
        51: "Let støvregn",
        53: "Støvregn",
        55: "Kraftig støvregn",
        61: "Let regn",
        63: "Regn",
        65: "Kraftig regn",
        71: "Let sne",
        73: "Sne",
        75: "Kraftig sne",
        80: "Regnbyger",
        81: "Regnbyger",
        82: "Kraftige regnbyger",
        95: "Tordenvejr",
        96: "Tordenvejr med hagl",
        99: "Kraftigt tordenvejr med hagl"
    };

    return weatherConditions[code] || "Ukendte vejrforhold";
}


// TRANSLATE WIND DIRECTIONS

function getWindDirection(degrees) {

    const directions = [
        "nord",
        "nordøst",
        "øst",
        "sydøst",
        "syd",
        "sydvest",
        "vest",
        "nordvest"
    ];

    const index = Math.round(degrees / 45) % 8;

    return directions[index];
}


// FETCH WEATHER DATA

async function getWeather(latitude, longitude) {

    const parameters = new URLSearchParams({

        latitude: latitude,
        longitude: longitude,

        current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m",

        hourly: "precipitation_probability",

        daily: "weather_code,temperature_2m_max,temperature_2m_min",

        forecast_days: "5",

        timezone: "auto"

    });

    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${parameters}`
    );

    if (!response.ok) {
        throw new Error("Weather data could not be fetched");
    }

    const data = await response.json();
console.log("Weather data:", data);

    // UPDATE CURRENT WEATHER

    const current = data.current;

    document.querySelector("#temperature").textContent =
        Math.round(current.temperature_2m) + "°C";

    document.querySelector("#weatherDescription").textContent =
        getWeatherDescription(current.weather_code);

    document.querySelector("#feelsLike").textContent =
        "Føles som " + Math.round(current.apparent_temperature) + "°C";

    document.querySelector("#wind").textContent =
        "Vind: " + current.wind_speed_10m +
        " m/s fra " + getWindDirection(current.wind_direction_10m);


    // FIND THE NEAREST HOURLY RAIN PROBABILITY

    let nearestIndex = 0;
    let smallestDifference = Infinity;

    for (let i = 0; i < data.hourly.time.length; i++) {

        const difference = Math.abs(
            new Date(data.hourly.time[i]) -
            new Date(current.time)
        );

        if (difference < smallestDifference) {
            smallestDifference = difference;
            nearestIndex = i;
        }
    }

    const rainProbability =
        data.hourly.precipitation_probability[nearestIndex];


        // GENERATE CLOTHING RECOMMENDATIONS

const clothingAdvice = generateClothingAdvice(
    current.temperature_2m,
    rainProbability,
    current.wind_speed_10m
);

// UPDATE CLOTHING RECOMMENDATIONS

const clothingList = document.querySelector("#clothingList");

clothingList.innerHTML = clothingAdvice.map(function(item) {

    return `
        <li>
            <h4>${item.name}</h4>
            <p>${item.description}</p>
        </li>
    `;

}).join("");

    document.querySelector("#rain").textContent =
        "Risiko for regn: " +
        (rainProbability ?? "Ukendt") + "%";


    // UPDATE FIVE-DAY FORECAST

    const forecastList = document.querySelector("#forecastList");

    const forecastItems = data.daily.time.map(function(date, index) {

        let dayName;

        if (index === 0) {
            dayName = "I dag";
        } else {
            dayName = new Intl.DateTimeFormat("da-DK", {
                weekday: "long"
            }).format(new Date(date + "T12:00:00"));

            dayName =
                dayName.charAt(0).toUpperCase() + dayName.slice(1);
        }

        const description =
            getWeatherDescription(data.daily.weather_code[index]);

        const minimum =
            Math.round(data.daily.temperature_2m_min[index]);

        const maximum =
            Math.round(data.daily.temperature_2m_max[index]);

        return `<li>${dayName} · ${description} · ${minimum}° / ${maximum}°</li>`;

    });

    forecastList.innerHTML = forecastItems.join("");

}


// SEARCH FOR CITY

locationForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        status.hidden = false;
        status.textContent = "Indtast venligst en by.";
        return;
    }

    try {

        status.hidden = false;
        status.textContent = "Søger efter byen...";

        // GET CITY COORDINATES

        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=da&format=json`
        );

        if (!response.ok) {
            throw new Error("Location search failed");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            status.textContent = "Byen blev ikke fundet.";
            return;
        }

        const location = data.results[0];
console.log("Found location:", location);
        // UPDATE LOCATION

        selectedCity.textContent =
            location.name + " · Valgt by";

        weatherLocation.textContent =
            location.name + ", " + location.country;

        status.textContent = "Henter vejret...";

        // GET ACTUAL WEATHER

        await getWeather(
            location.latitude,
            location.longitude
        );

        status.textContent = "Vejret er opdateret!";

        cityInput.value = "";

    } catch (error) {

        status.textContent =
            "Kunne ikke hente vejret. Prøv igen.";

        console.error(error);

    }

});