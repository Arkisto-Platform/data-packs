
main();
async function search({ query, limit = 10, fields = this.fields }) {
    console.log(fields)
    let response = await fetch("https://lookups.ldaca.edu.au/data/_search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "ApiKey bXJWcEVvY0JrZXVEdG93dy14c046YndJOVBLcGFUVk9zQW0xN282NERSQQ==" // Read only api-key
        },
        body: JSON.stringify({
            query: {
                multi_match: { query, fields }
            },
            from: 0,
            size: limit,
            sort: []
        }),
    });
    let status = response.status;
    response = await response.json();
    console.log(response)
    if (status !== 200) {
        return [];
    }
    const total = response.hits.total.value;
    const documents = response.hits.hits.map((doc) => ({ ...doc._source }));
    console.log(total)
    return documents;
}

async function main() {
    let documents = await search({ query: "Australian English", fields: ["name", "alternateName", "languageCode"] })
    console.log((documents));
}