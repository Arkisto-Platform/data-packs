const countryCodesTab = "https://www.ethnologue.com/codes/CountryCodes.tab";
const countryGeoJSON = "https://datahub.io/core/geo-countries/r/countries.geojson";
const languagePack = "./iso-639-6-country-data-pack.json";
const countryISOMapping = require("./mapping-iso3-iso2.json"); // from https://github.com/vtex/country-iso-3-to-2
const fetch = require("cross-fetch");
const { writeJson } = require("fs-extra");
const { groupBy } = require("lodash");
const iso2to3Mapping = flipIsoMapping();

main();
async function main() {
    let countryCodes = await get({ url: countryCodesTab });
    const lines = countryCodes.split("\n").map((l) => l.trim());

    let countryData = [];
    for (let line of lines.slice(1, lines.length)) {
        let components, code, country, name;
        try {
            let [code, name, region] = line.split("\t");
            if (name && code) {
                // console.log(code, country, name);
                countryData.push({
                    "@id": `https://www.ethnologue.com/country/${code}`,
                    "@type": "Country",
                    name,
                    isoA2: code,
                    isoA3: iso2to3Mapping[code],
                });
            }
        } catch (error) {
            console.log(error.message, components);
        }
    }

    let countryGeoJSONData = await get({ url: countryGeoJSON, as: "json" });
    countryGeoJSONGroupedByName = groupBy(countryGeoJSONData.features, (c) => c.properties.ISO_A3);
    let geoJSONasWKT = {};
    Object.keys(countryGeoJSONGroupedByName).forEach((key) => {
        let countryCoordinates = [...countryGeoJSONGroupedByName[key][0].geometry.coordinates];
        let coordinateType = countryGeoJSONGroupedByName[key][0].geometry.type;
        if (coordinateType === "Polygon") {
            for (let p in countryCoordinates[0]) {
                countryCoordinates[0][p] = countryCoordinates[0][p].join(" ");
            }
            geoJSONasWKT[key] = `POLYGON((${countryCoordinates[0].join(",")}))`;
        } else if (coordinateType === "MultiPolygon") {
            geoJSONasWKT[key] = `MULTIPOLYGON(`;
            for (let g in countryCoordinates) {
                geoJSONasWKT[key] += `(`;
                console.log(countryCoordinates[g][0])
                for (let p in countryCoordinates[g][0]) {
                    console.log(countryCoordinates[g][0][p])
                    countryCoordinates[g][0][p] = countryCoordinates[g][0][p].join(" ");
                }
                geoJSONasWKT[key] += `${countryCoordinates[g][0].join(",")})`;
            }
            geoJSONasWKT[key] += `)`;
        } else {
            console.log(coordinateType);
            process.exit()
        }
    })

    countryData = countryData.map((country) => {
        try {
            country = {
                ...country,
                geo: {
                    "@id": "#" + country.name,
                    "@type": "Geometry",
                    name: `Geographical coverage for ${country.name}`,
                    asWKT: geoJSONasWKT[country.isoA3]
                },
            };
        } catch (error) {
            console.warn(`No coordinate data found for: ${country.name}`);
        }
        return country;
    });

    await writeJson(languagePack, countryData);
}

async function get({ url, as = "text" }) {
    let response = await fetch(url, { cache: "reload" });
    if (response.status !== 200) {
        throw new Error(response);
    }
    if (as === "text") {
        return await response.text();
    } else if (as === "json") {
        return await response.json();
    }
}

function flipIsoMapping() {
    let mapping = {};
    Object.keys(countryISOMapping).forEach((key) => (mapping[countryISOMapping[key]] = key));
    return mapping;
}
