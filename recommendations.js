function generateClothingAdvice(temperature, rainProbability, windSpeed) {

    const recommendations = [];

    // TEMPERATURE

    if (temperature < 5) {
        recommendations.push({
            name: "Vinterjakke",
            description: "Holder dig varm i det kolde vejr."
        });

        recommendations.push({
            name: "Varm trøje",
            description: "Et varmt mellemlag under jakken."
        });

    } else if (temperature < 12) {
        recommendations.push({
            name: "Varm jakke",
            description: "Beskyttelse mod kølige temperaturer."
        });

        recommendations.push({
            name: "Sweater",
            description: "Et ekstra lag til at holde varmen."
        });

    } else if (temperature < 18) {
        recommendations.push({
            name: "Let jakke",
            description: "Passer til mildt og køligt vejr."
        });

    } else if (temperature < 25) {
        recommendations.push({
            name: "T-shirt",
            description: "Let og behageligt til mildt vejr."
        });

    } else {
        recommendations.push({
            name: "Let sommertøj",
            description: "Luftigt tøj til varme temperaturer."
        });
    }

    // RAIN

    if (rainProbability >= 40) {
        recommendations.push({
            name: "Regnjakke",
            description: "Beskyttelse mod forventet regn."
        });

        recommendations.push({
            name: "Paraply",
            description: "Praktisk ved risiko for regn."
        });
    }

    // WIND

    if (windSpeed > 8) {
        recommendations.push({
            name: "Vindjakke",
            description: "Beskytter mod kraftig vind."
        });
    }

    return recommendations;
}