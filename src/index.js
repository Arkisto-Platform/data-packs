/**
 * @global
 *
 * @description The data packs that are available in this repository.
 *
 * @property {object}  packs - the available data packs
 * @property {String}  packs.Austlang - The Austlang language data pack
 * @property {String}  packs.Glottolog - The Glottolog language data pack
 * @property {String}  packs.Country - The Countries data pack
 * @property {String}  packs.Languages - All languages data pack = ["Austlang", "Glottolog" ]
 */
const datapacks = {
    Austlang: "languages/austlang-language-data-pack.json",
    Glottolog: "languages/glottolog-language-data-pack.json",
    Country: "countries/iso-639-6-country-data-pack.json",
    Languages: ["Austlang", "Glottolog"],
};

module.exports = {
    host: "https://raw.githubusercontent.com/Language-Research-Technology/data-packs/master/data-packs",
    datapacks,
};
