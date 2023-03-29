const { IndexDataPacks } = require("../src/index-datapacks.js");

main();
async function main() {
    // If using auth see: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html#auth-apikey
    const index = new IndexDataPacks({ 
        elasticPath: "data",
        elasticUrl: "https://lookups.ldaca.edu.au/",  
        elasticAuth: { apiKey: 'base64EncodedKey' },
        log: true,
        indexName: "common"
    });
    await index.load();
}
