const fs = require("fs");
const { writeJson, readJson } = require("fs-extra");

const { groupBy, uniqBy, cloneDeep } = require("lodash");

const glottologOut = "./glottolog-language-data-pack.json";
const austlangOut = "./austlang-language-data-pack.json";

main();

async function main() {
    const austlangInput = await readJson(
        "./Austlang-language-data/austlang-language-data-pack.json"
    );
    const glottologInput = await readJson(
        "./Glottolog-language-data/glottolog-language-data-pack.json"
    );
    const ethnologueInput = await readJson(
        "./ISO-639-3-language-data/iso-639-3-language-data-pack.json"
    );

    const austlangGroupedByName = groupBy(austlangInput, "name");
    const glottologGroupedByName = groupBy(glottologInput, "name");
    const ethnologueGroupedByName = groupBy(ethnologueInput, "name");

    // map in austlang and ethnologue to glottolog
    let languages = [];
    glottologInput.forEach((entry) => {
        if (!entry.sameAs) entry.sameAs = [];

        // austlang match by name
        if (austlangGroupedByName[entry.name]) {
            const austlangEntry = austlangGroupedByName[entry.name][0];
            entry.sameAs.push({ "@id": austlangEntry["@id"] });
            entry["austlangCode"] = austlangEntry.languageCode;
        }

        // ethnologue match by name
        if (ethnologueGroupedByName[entry.name]) {
            const ethnologueEntry = ethnologueGroupedByName[entry.name][0];
            entry.sameAs.push({ "@id": ethnologueEntry["@id"] });
            entry["iso639-3"] = ethnologueEntry.languageCode;
        }
        entry.sameAs = uniqBy(entry.sameAs, "@id");
        languages.push(entry);
    });
    const glottologLanguageList = cloneDeep(languages);

    // map in glottolog and ethnologue to austlang
    languages = [];
    austlangInput.forEach((entry) => {
        if (!entry.sameAs) entry.sameAs = [];

        // glottolog match by name
        if (glottologGroupedByName[entry.name]) {
            const glottologEntry = glottologGroupedByName[entry.name][0];
            entry.sameAs.push({ "@id": glottologEntry["@id"] });
            entry["glottologCode"] = glottologEntry.languageCode;
        }

        // ethnologue match by name
        if (ethnologueGroupedByName[entry.name]) {
            const ethnologueEntry = ethnologueGroupedByName[entry.name][0];
            entry.sameAs.push({ "@id": ethnologueEntry["@id"] });
            entry["iso639-3"] = ethnologueEntry.languageCode;
        }
        entry.sameAs = uniqBy(entry.sameAs, "@id");
        languages.push(entry);
    });
    const austlangLanguageList = cloneDeep(languages);

    // write the individual packages
    await writeJson(glottologOut, glottologLanguageList);
    await writeJson(austlangOut, austlangLanguageList);
}
