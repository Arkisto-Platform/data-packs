- [For users](#for-users)
  - [Install the package](#install-the-package)
  - [Loading the data packs into elastic search](#loading-the-data-packs-into-elastic-search)
  - [Working with the package](#working-with-the-package)
- [For Developers](#for-developers)
  - [Working on the package - writing tests](#working-on-the-package---writing-tests)
  - [Updating the JSDoc documentation](#updating-the-jsdoc-documentation)
  - [Adding a data pack to this repository](#adding-a-data-pack-to-this-repository)
  - [Building and publishing an update](#building-and-publishing-an-update)

A repository to host data packs for use in Describo. A data pack is simply a pre-defined array of
JSON-LD objects that can be used as the value of a property.

Github: [https://github.com/describo/data-packs](https://github.com/describo/data-packs)

# For users

## Install the package

```bash
npm install --save @describo/data-packs
```

## Loading the data packs into elastic search

For development you can start a local elastic search service with:

```bash
docker compose up -d ; docker compose logs -f ; docker compose stop ; docker compose rm -f
```

Then in your application you can trigger a load of all of the data packs:

```js
const { IndexDataPacks } = require('@describo/data-packs')
const index = new IndexDataPacks({ elasticUrl: "http://localhost:9200", indexName: "common" });
await index.load();
```

Or to do it once somewhere outside of your app with something like the script
`./bin/index-data-packs.js`

And **if** you are using an external elastic server use the following example:
```js
const { IndexDataPacks } = require('@describo/data-packs')
const index = new IndexDataPacks({
    elasticPath: "data",
    elasticUrl: "https://lookups.ldaca.edu.au/",  
    elasticAuth: { apiKey: 'base64EncodedKey' }, 
    log: true,
    indexName: "common"
});
await index.load();
```

## Working with the package

```
const { DataPack } = require('@describo/data-packs')
let datapack = new DataPack({ dataPacks: ['Austlang', 'Glottolog'], indexFields: ['@id', 'name']})
await datapack.load()

let language = datapack.get({
  field: "name",
  value: "Nyaki Nyaki / Njaki Njaki",
});
```

Returns a JSON-LD snippet if a match is found.

If you only want a subset of the properties try:

```
const { DataPack } = require('@describo/data-packs')
let datapack = new DataPack({ dataPacks: ['Austlang', 'Glottolog'], indexFields: ['@id', 'name']})
await datapack.load()


let language = datapack.get({
  field: "name",
  value: "Nyaki Nyaki / Njaki Njaki",
  properties: ['name', 'languageCode']
});
```

And you will get only those (along with @id and @type which are always returned).

# For Developers

## Working on the package - writing tests

-   start elastic search docker container: `docker compose up`
-   Run the tests in watch mode: `npm run test:watch`

## Updating the JSDoc documentation

-   npm run generate-docs
-   Then commit the docs and push to github

## Adding a data pack to this repository

-   add a folder in the `data-packs` top level folder named as your data pack.
-   create an update script inside that folder named like: `create-data-pack.js`.
    -   Your script should be self contained and retrieve the data it needs. That is, don't check a
        datasource into this repo if you can avoid it. Get it from the web so that the data pack is
        updated from the main version online. Whatever, and wherever, that is.
-   add a reference to that script in `update-all-packages.sh` so that your data pack is updated
    when the others are.
-   document the data structure by adding a file in your data pack folder called:
    `datapack-entry-format.js`. Follow the example in `languages/datapack-entry-format.js`.

## Building and publishing an update

-   `bash ./update_all_packages.sh`
-   `npm run generate-docs`
-   Commit all of the changes
-   Bump the version: `npm version minor`
-   Publish `npm publish`
