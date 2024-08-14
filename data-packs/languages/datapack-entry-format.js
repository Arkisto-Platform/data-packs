/**
 * @global
 *
 * @name Language Entry Data Format - Austlang
 * @description Following is an example of a language entry in the Austlang Data Pack. The entry
 *  is constructed from the {@link https://data.gov.au/data/dataset/70132e6f-259c-4e0f-9f95-4aed1101c053/resource/e9a9ea06-d821-4b53-a05f-877409a1a19c/download/aiatsis_austlang_endpoint_001.csv Austlang Dataset}.
 *
 * Note the `sameAs` property which links this entry to the matching entries in Glottolog and Ethnologue.
 *
 * Note (in this example) the properties `iso639-3` and `glottologCode`. You can use these properties as lookup fields to find entries in this pack using codes from Ethnologue (iso639-3) and Glottolog.
 *
 * @example
 * {
        {
    "@id": "https://collection.aiatsis.gov.au/austlang/language/A69",
    "@type": "Language",
    "languageCode": "A69",
    "name": "Bunara",
    "source": "Austlang",
    "sameAs": [{
            "@id": "https://glottolog.org/resource/languoid/id/ngar1288"
        }, {
            "@id": "https://www.ethnologue.com/language/rxd"
        }, {
            "@id": "https://glottolog.org/resource/languoid/id/kolo1265"
        }, {
            "@id": "https://glottolog.org/resource/languoid/id/mung1268"
        }],
    "alternateName": ["Ngardi", "Ngardilj", "Ngarti", "Waringari", "Boonarra", "Buna:ra", "Ngadi", "Ngari", "Ngati", "Panara", "Boonara", "Waiangara", "Kolo", "Waiangari", "Wain gara", "Waiangadi", "Warangari", "Kukuruba", "Woneiga", "Wanayaga", "Puruwantung", "Buruwatung", "Manggai", "Munga", "Walmala", "Wommana"],
    "geo": {
        "@id": "_geo-Austlang-A69",
        "@type": "Geometry",
        "name": "Geographical coverage for Bunara",
        "asWKT": "POINT(129.04645622792 -20.709303855673)"
    },
    "glottologCode": "mung1268",
    "iso639-3": "rxd"
}
    },
 */

/**
 * @global
 *
 * @name Language Entry Data Format - GlottoLog
 * @description Following is an example of a language entry in the Glottolog Data Pack. The entry
 *  is constructed from the {@link https://raw.githubusercontent.com/glottolog/glottolog-cldf/master/cldf/languages.csv Glottolog Dataset}.
 *
 * Note the `sameAs` property which links this entry to the matching entries in Austlang and Ethnologue.
 *
 * Note (in this example) the properties `iso639-3` and `austlangCode`. You can use these properties as lookup fields to find entries in this pack using codes from Ethnologue (iso639-3) and Austlang.
 * @example
 * 
{
    "@id": "https://glottolog.org/resource/languoid/id/ngar1288",
    "@type": "Language",
    "languageCode": "ngar1288",
    "name": "Ngardi",
    "geo": {
        "@id": "_geo-glottolog-ngar1288",
        "@type": "Geometry",
        "name": "Geographical coverage for Ngardi",
        "asWKT": "POINT(129.0308 -21.0231)"
    },
    "source": "Glottolog",
    "sameAs": [{
            "@id": "https://www.ethnologue.com/language/rxd"
        }, {
            "@id": "https://collection.aiatsis.gov.au/austlang/language/A121"
        }],
    "alternateName": [],
    "iso639-3": "rxd",
    "austlangCode": "A121"
},
 */
