const data =
    "https://data.gov.au/data/api/3/action/datastore_search?resource_id=e9a9ea06-d821-4b53-a05f-877409a1a19c";

const languagePack = "./austlang-language-data-pack.json";
const fetch = require("cross-fetch");
const { writeJson } = require("fs-extra");
const baseURL = "https://data.gov.au/data";

main();
async function main() {
    let response = await fetch(data, { cache: "reload" });
    if (response.status !== 200) {
        throw new Error(response);
    }
    response = await response.text();

    let dataJSON = JSON.parse(response);
    const languageData = [];

    await getLanguageData(languageData, dataJSON);
    await writeJson(languagePack, languageData);
}

async function getLanguageData(languageData, dataJSON) {
    for (let item of dataJSON.result.records) {
        const geoLocation = {
            "@id": `_geo-Austlang-${item.language_code}`,
            "@type": "Geometry",
            name: `Geographical coverage for ${item.language_name}`,
            asWKT: `POINT(${item.approximate_longitude_of_language_variety} ${item.approximate_latitude_of_language_variety})`
        }

        const languageObject = {
            "@id": `https://collection.aiatsis.gov.au/austlang/language/${item.language_code}`,
            "@type": "Language",
            languageCode: item.language_code,
            name: item.language_name,
            source: "Austlang",
            sameAs: [],
            alternateName: [],
            "iso639-3":[],
        }

        if (item.approximate_longitude_of_language_variety !== 0 && item.approximate_latitude_of_language_variety !== 0) {
            languageObject.geo = geoLocation;
        }

        // alternateName: [...item.language_name.split("/").map((name) => name.trim()), ...item.language_synonym.split("|").map((name) => name.trim())],
        if (item.language_name.includes("/")) {
            languageObject.alternateName.push(...item.language_name.split("/").map((name) => name.trim()))
        }
        if (item.language_synonym.match(/\w/)) {
            languageObject.alternateName.push(...item.language_synonym.split("|").map((name) => name.trim()))
        }
        if (languageObject.alternateName.length > 0) {
            languageObject.alternateName = [...new Set(languageObject.alternateName)];
        }
        languageData.push(languageObject);
    }
    if (dataJSON.result.records.length === 100) {
        let data = baseURL + dataJSON.result["_links"].next
        console.log(data)
        let response = await fetch(data, { cache: "reload" });
        if (response.status !== 200) {
            throw new Error(response);
        }
        response = await response.text();
        dataJSON = JSON.parse(response);
        await getLanguageData(languageData, dataJSON);
    }
}

