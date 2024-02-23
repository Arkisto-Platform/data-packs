const data = "https://raw.githubusercontent.com/glottolog/glottolog-cldf/master/cldf/languages.csv";
//var alternativeNames = "./languages/Glottolog-language-data/alternativeNames.csv"
const alternativeNames = "./alternativeNames.json";
const languagePack = "./glottolog-language-data-pack.json";
const fetch = require("cross-fetch");
const { writeJson, readJSON } = require("fs-extra");

(async () => {
    let response = await fetch(data, { cache: "reload" });
    if (response.status !== 200) {
        throw new Error(response);
    }
    response = await response.text();

    const alternativeNameDict = await readJSON(alternativeNames);

    let components;
    const languageData = [];
    for (let line of response.split("\n")) {
        if (line.match("ID")) continue;

        try {
            components = line.split(",");
            const [
                languageCode,
                name,
                macroarea,
                latitude,
                longitude,
                glottocode,
                iso639,
                country,
            ] = components;

            // get alternative names
            let alternateName;
            if (name in alternativeNameDict) {
                if (alternativeNameDict[name].join().length > 0) {
                    // some entries have a empty string
                    alternateName = alternativeNameDict[name];
                } else {
                    alternateName = [];
                }
            } else {
                alternateName = [];
            }

            const geojson = {
                type: "Feature",
                properties: { name },
                geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
            };

            const geoLocation = {
                "@id": `_geo-glottolog-${languageCode}`,
                "@type": "Geometry",
                name: `Geographical coverage for ${name}`,
                asWKT: `POINT(${longitude} ${latitude})`,
            };

            let sameAsList = [];

            if (name && languageCode) {
                let language = {
                    "@id": `https://glottolog.org/resource/languoid/id/${languageCode}`,
                    "@type": "Language",
                    languageCode,
                    name,
                    geo: geoLocation,
                    source: "Glottolog",
                    // containtInPlace: macroarea, // needed to compare to austlang data which is limited to Australia
                    sameAs: sameAsList,
                    alternateName,
                };
                if (iso639) {
                    language.sameAs = [{ "@id": `https://www.ethnologue.com/language/${iso639}` }];
                    language["iso639-3"] = iso639;
                }

                languageData.push(language);
            }
        } catch (error) {
            console.log(error.message, components);
        }
        
    }

    await writeJson(languagePack, languageData);
})();
