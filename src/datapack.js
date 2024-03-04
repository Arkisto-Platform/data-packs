const { datapacks, host } = require("./index.js");
const { cwd } = require("process");
const path = require("path");
const { fetch } = require("cross-fetch");
const { pathExists, ensureDir, stat: fileStat, readJSON, writeJSON } = require("fs-extra");
const { isString, groupBy, flattenDeep, cloneDeep, uniq } = require("lodash");

/** Class to interact with data packs . */
class DataPack {
    /**
     * Interact with data packs
     * @constructor
     * @param {Object} params
     * @param {string|string[]} params.dataPacks - the data packs you wish to load
     * @param {string[]} [params.indexFields=@id, name, alternateName, languageCode] - the fields you wish to index over
     * @param {boolean} [params.cache = true] - whether to cache the data file for repeated lookups. The cache will automatically invalidate after 1 hour
     */
    constructor({
        dataPacks = [],
        indexFields = ["@id", "name", "alternateName", "languageCode"],
        cache = true,
    }) {
        if (isString(dataPacks)) dataPacks = [dataPacks];

        dataPacks = dataPacks.map((pack) => {
            if (isString(datapacks[pack]) && datapacks[pack].match(/.*\.json$/)) {
                return pack;
            } else {
                return datapacks[pack].map((p) => p);
            }
        });
        this.dataPacks = flattenDeep(dataPacks);
        this.packData = [];
        this.indexFields = indexFields;
        this.indexes = {};
        this.cache = cache;
        this.cachePath = path.join(cwd(), "node_modules", ".cache", "ldac-data-packs");
    }

    /**
     * Load the data packs and index them
     * @async
     */
    async load() {
        await ensureDir(this.cachePath);
        let packs = [];
        for (let pack of this.dataPacks) {
            pack = await this.fetchDataPack({ pack: path.join(host, datapacks[pack]) });
            packs = [...packs, ...pack];
        }
        this.packData = packs;

        for (let field of this.indexFields) {
            this.indexes[field] = groupBy(packs, field);
        }
    }

    /**a
     * @private
     */
    async fetchDataPack({ pack }) {
        const dataPack = path.basename(pack);
        const cachedDataPack = path.join(this.cachePath, dataPack);
        if (this.cache && (await pathExists(cachedDataPack))) {
            let stat = await fileStat(cachedDataPack);
            let now = new Date().getTime();
            if ((now - stat.mtimeMs) / 1000 < 3600) {
                return await readJSON(cachedDataPack);
            }
        }
        let response = await fetch(pack);
        if (response.status === 200) {
            let data = await response.json();
            await writeJSON(cachedDataPack, data);
            return data;
        } else {
            console.error(`Unable to fetch data pack: '${pack}'`);
            return [];
        }
    }

    /**
     * Get something from the datapacks
     * @param {Object} params
     * @param {string} params.field - the field to search on, e.g.: '@id'
     * @param {string} params.value - the string to search for
     * @param {string[]} params.properties - the properties to include in the search results
     */
    get({ field, value, properties = [] }) {
        const defaultProperties = ["@id", "@type"];
        let result;
        try {
            result = this.indexes[field][value];
        } catch (error) {
            if (error.message.match(/Cannot read properties of undefined \(reading/)) {
                console.log(`No match found for '${value}' in '${field}'`);
                return undefined;
            }
        }
        if (!result || result.length === 0) {
            return undefined;
        } else if (result.length === 1) {
            result = cloneDeep(result[0]);
            if (properties.length)
                result = this.pluckProperties({
                    properties: [...defaultProperties, ...properties],
                    entry: result,
                });
            return result;
        } else {
            result = cloneDeep(result);
            result = result.map((entry) =>
                this.pluckProperties({
                    properties: [...defaultProperties, ...properties],
                    entry,
                })
            );
            return result;
        }
    }

    pluckProperties({ properties, entry }) {
        properties = uniq(properties);
        for (let property of Object.keys(entry)) {
            if (!properties.includes(property)) delete entry[property];
        }
        return entry;
    }
}

module.exports = { DataPack };
