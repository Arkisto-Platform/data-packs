const { datapacks, host } = require("./index.js");
const { fetch } = require("cross-fetch");
const path = require("path");
const { isString, chunk, flattenDeep } = require("lodash");
const { Client } = require("@elastic/elasticsearch");
const { Transport } = require('@elastic/transport')

// then create a class, that extends Transport class to modify the path


/** Class to load data packs into ElasticSearch. */
class IndexDataPacks {
    /**
     * Load data packs
     * @constructor
     * @param {Object} params
     * @param {string} params.elasticUrl - the URL to the elastic search server
     * @param {string} params.elasticPath - the URL to the elastic path to a non-root elastic server
     * @param {string} params.elasticAuth- the authentication object eg. { apiKey: 'base64EncodedKey'}
     * @param {string} params.indexName - the name of the elastic index
     * @param {string} [params.chunkSize=500] - the number of documents to bulk load per chunk
     * @param {Boolean} [params.log] - log which data pack is being loaded
     */
    constructor({ elasticUrl, elasticPath, elasticAuth, indexName, chunkSize = 500, log = false }) {
        this.chunkSize = chunkSize;
        this.elasticUrl = elasticUrl;
        this.elasticAuth = elasticAuth;
        this.indexName = indexName;
        this.log = log;
        // Extending Transport class see: https://github.com/elastic/elasticsearch-js/issues/1709
        this.MTransport = class extends Transport {
            request(params, options, callback) {
                if (elasticPath) {
                    params.path = elasticPath + params.path // <- append the path if non-root
                }
                return super.request(params, options, callback)
            }
        }
    }

    /**
     * Load the data packs and index them
     * @async
     */
    async load() {
        const client = new Client({
            node: this.elasticUrl,
            Transport: this.MTransport,
            auth: this.elasticAuth
        });
        for (let pack of Object.keys(datapacks)) {
            if (this.log) {
                console.log(`Loading ${pack}`);
            }
            if (isString(datapacks[pack]) && datapacks[pack].match(/.*\.json$/)) {
                pack = path.join(host, datapacks[pack]);
                let data = await this.fetchDataPack({ pack });
                let chunks = chunk(data, this.chunkSize);
                for (let chunk of chunks) {
                    chunk = chunk.map((c) => {
                        return [{ index: { _id: c["@id"], _index: this.indexName } }, c];
                    });
                    chunk = flattenDeep(chunk);
                    try {
                        await client.bulk({ body: chunk });
                    } catch (error) {
                        console.log(error.message);
                    }
                }
            }
        }
    }

    /**
     * @private
     */
    async fetchDataPack({ pack }) {
        let response = await fetch(pack);
        if (response.status === 200) {
            let data = await response.json();
            return data;
        } else {
            console.error(`Unable to fetch data pack: '${pack}'`);
            return [];
        }
    }
}

module.exports = {
    IndexDataPacks,
};