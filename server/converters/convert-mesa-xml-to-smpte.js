/** @module sample-register-convert-xml */
/**
 * toSmpte(str) converts a XML to json (without validation)
 * fromSmpte(str) converts json to XML (without validation)
 */
const xml2js = require('xml2js')

const worker = require("./convert-mesa-xml-to-smpte-worker")
/**
 *
 * @param {String} xmlString the xml to be converted to json (from dialog box)
 * @returns {ctx} 
 */

module.exports.toSmpte = async (xmlString) => {
    return new Promise(resolve => {
        //use xml2js 0.4.23 in reversible mode - catch namespaces, attributes - the lot!
        let parser = new xml2js.Parser()
        const obj = parser.parseStringPromise(xmlString)
            .then(xml2jsResult => {
                // we know that xml to JSON needs special help. In the specific conversion
                // for LMT, all the translation rules are in the worker function
                let result = worker.mesaXmlToSmpteJson(xml2jsResult)

                //error codes for bad MESA xml are handled in the worker rules
                resolve({ status: result.status, body: result.body })
            })
            .catch(err => {
                resolve({ status: 400, body: `Bad Request - MESA xml conversion to json failed </br>\n ${err}` })
            })
    })
}

// module.exports.fromSmpte = async (jsonString) => {
//     let ctx = {}
//     let jsonObject

//     try {
//         jsonObject = JSON.parse(jsonString)
//     } catch (err) {
//         ctx.status = 400 //Bad Request
//         ctx.body = `Bad Request - json conversion to xml failed </br>\n ${err.message}`
//         return ctx
//     }

//     let builder = new xml2js.Builder();

//     // xml2js has a canonical way to represent things like
//     // arrays. Lets munge the json to create the representative XML

//     //if there is one object in a JSON object then xml2js assumes it's the names of the root object.
//     //xml cannot represent arrays as the root, so insert an item wrapper to become XML friendly
//     jsonObject = { root: {item: jsonObject} }

//     try {
//         const xmlDoc = builder.buildObject(jsonObject)

//         //on success we get a string
//         ctx.status = 200
//         ctx.body = xmlDoc
//     } catch (err) {
//         ctx.status = 400 //Bad Request
//         ctx.body = `Bad Request - json conversion to xml failed </br>\n ${err.message}`
//     }
//     return ctx
// }