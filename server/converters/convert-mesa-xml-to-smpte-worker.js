/** @module convert-mesa-xml-to-smpte-worker */
/**
 * This plugin provides 2 functions
 *    - to_lmt( xml2js_obj )  - takes a mesa xml string converted with xml2js and returns a smpte LMT object
 *    - to_xml( lmt, sample ) - takes a smpte LMT object and sample Mesa XML and returns a mesa xml string
 */


//define some constants so that different plugins have less conde to modify
const mesaCfg = {
    root: "Synaptica-ZThes",
    term: "term",
}
//the requires properties of a term
const term_required_props = ["Name", "Code", "LongDescription1"]
const mustache = require('mustache')
const spacetime = require('spacetime')

/**
 *
 * @param {Integer} status error code to return to ctx
 * @param {*} body a markdown error message
 * @param {*} mustacheData a json object to substitute into the parseError
 * @returns {Object} ctx
 * @returns {integer} ctx.status - the status code
 * @return {string} ctx.body - the html for output
 */
const parseError = (status, body, mustacheData) => {
    let html = mustache.render(body, mustacheData)
    return {
        status: status,
        body: html
    }
}

/* ------------------------- Term from xmljs ------------------------- */

/** create a term from a term node or a relation node
 * @param {Object} node - a node in the hierarchy for the object
 * @returns {Object} a term object
 */
const createSmpteTerm = (node) => {
    let term = {
        warnings: []
    }
    let is_a_group = false
    let has_audio_tag = false
    let has_video_tag = false

    /* ------------------------- Pre-flight ------------------------- */
    if (undefined == node.termID) { throw new Error(`MESA XML required element termID not found. Giving up`) }
    let id = node.termID

    if (undefined == node.termName) { throw new Error(`MESA XML required element termName not found in termID ${id}. Giving up`) }
    term.Name = node.termName[0]

    if (undefined == node.termNote) { throw new Error(`MESA XML required element termNote element not found in termID ${id}. Giving up`) }
    node.termNote.forEach(note => {
        switch (note.$.label) {
            case "Audio Language Tag":
                term.AudioLanguageTag = note._
                has_audio_tag = true
                break
            case "Audio Language Display Name 1":
                term.AudioLanguageDisplayName1 = note._
                break
            case "Audio Language Display Name 2":
                term.AudioLanguageDisplayName2 = note._
                break
            case "Code":
                term.Code = note._
                break
            case "Long Description 1":
                term.LongDescription1 = note._
                break
            case "Long Description 2":
                term.long_description_2 = note._
                break
            case "Notes":
                term.notes = note._
                break
            case "Visual Language Display Name 1":
                term.VisualLanguageDisplayName1 = note._
                break
            case "Visual Language Display Name 2":
                term.VisualLanguageDisplayName2 = note._
                break
            case "Visual Language Tag 1":
                term.VisualLanguageTag1 = note._
                has_video_tag = true
                break
            case "Visual Language Tag 2":
                term.VisualLanguageTag2 = note._
                has_video_tag = true
                break
            case "Language Group Code":
            case "Language Group Tag":
            case "Language Group Name":
                //ignore group codes for now...
                is_a_group = true
                break
            default:
                term.warnings.push(`MESA XML unknown termNote with label=${note.$.label} in termID ${id}. Ignoring termNote.`)
        }
    })

    let maybe_a_term = true
    term_required_props.forEach(property => maybe_a_term - maybe_a_term && term.hasOwnProperty(property))

    /* All terms have audio tags or video tags - if it has neither then it's only a group */
    maybe_a_term = maybe_a_term && (has_audio_tag || has_video_tag)

    /* The MESA XML reuses some term labels as groups. We therefore decode any valid
       term here and leave the group decoding for the create_group function
     */
    if (maybe_a_term) {
        let mapping = {}
        if (has_audio_tag) {
            mapping[term.AudioLanguageTag] = id
        } else {
            mapping[term.VisualLanguageTag1] = id
        }
        return { term: term, mapping: mapping }
    }

    /* return undefined if it seems like a valid group
     */
    if (is_a_group) {
        return undefined
    }

    /* If it wasn't a valid group or a team then one of these errors should fire
     */
    term_required_props.forEach(property => {
        if (undefined == term[property]) {
            let msg = `MESA XML did not set term property ${property} in termID ${id}. Ignoring Term.`
            term.warnings.push(msg)
            throw new Error(msg)
        }
    })
    let msg = `MESA XML has something weird going on in termID ${id}. Neither group not term. Ignoring Term.`
    term.warnings.push(msg)
    throw new Error(msg)
}

/* ------------------------- ENTRY POINT ------------------------- */
/**
 *
 * @param {Object} xml2jsResult the object from succesfully parsing the MESA xml
 * @returns {Object} AJAXres
 * @returns {Integer} AJAXres.status the status code for the AJAX call
 * @returns {String}  AJAXres.body the smpte register data (JSON)
 * @returns {String}  AJAXres.warningHtml warning message(s)
 */
module.exports.mesaXmlToSmpteJson = (xml2jsResult) => {
    let lmtJson = {
        Metadata: {
            creationDateIso8601: spacetime.now('America/New_York').format("iso"),
            convertedFrom: "Mesa XML",
            published: false,
            controllingDocument: "none",
            DOI: "none",
        },
        terms: [],
        groups: [],
    }
    let m2sMmapping = {
        errors: [],
        term: {},
        group: {}
    }

    //gather all the terms from the input XML
    //throw annoying errors one by one as you go....
    let rawJson = xml2jsResult[mesaCfg.root]
    if (undefined == rawJson)
        return parseError(400, `MESA XML root element ${mesaCfg.root} not found. Giving up`)

    //iterate across every term in the source array push a new term to lmt
    /* ------------------------- Term Conversion ------------------------- */
    rawJson[mesaCfg.term].forEach(node => {
        //create a term - errors are caught and displayed at the end
        let res
        try {
            res = createSmpteTerm(node)
        } catch (err) {
            m2sMmapping.errors.push(err)
        }

        if (res) {
            for (tag in res.mapping) {
                //check for duplicate terms - the mapping should not exist for this term
                if (!(undefined == m2sMmapping.term[tag])) {
                    m2sMmapping.errors.push(new Error(`MESA XML has a duplicate unique term tag ${tag} in termID ${res.mapping[tag]}. Ignoring Term.`))
                }

                //remember the mapping of this term to the underlying synaptica ids
                m2sMmapping.term[tag] = res.mapping[tag]
            }
            //append the term to the list
            lmtJson.terms.push(res.term)
        } else {
            /* when the function returns undefined it is because we found a group
             * We need to iterate over the relations elements and add each of them as a term
             */
            node.relation.forEach(relation => {
                //create a term - errors are caught at a higher level
                let res = createSmpteTerm(relation)
                if (res) {
                    for (tag in res.mapping) {
                        //check for duplicate terms - the mapping should not exist for this term
                        if (!(undefined == m2sMmapping.term[tag])) {
                            m2sMmapping.errors.push(new Error(`MESA XML has a duplicate unique term tag ${tag} in the relations of termID ${res.mapping[tag]}. Ignoring Term.`))
                        }

                        //remember the mapping of this term to the underlying synaptica ids
                        m2sMmapping.term[tag] = res.mapping[tag]
                    }
                    //append the term to the list
                    lmtJson.terms.push(res.term)
                }
            })
        }
    })

    /* ------------------------- Group Conversion ------------------------- */
    rawJson[mesaCfg.term].forEach(grp => {
        let group = {}
        let is_group = false

        /* ------------------------- Pre-flight ------------------------- */
        if (undefined == grp.termID) { throw new Error(`MESA XML required element termID not found. Ignoring Group.`) }
        let id = grp.termID

        if (undefined == grp.termName) { throw new Error(`MESA XML required element termName not found in termID ${id}. Ignoring Group.`) }
        group.Name = grp.termName[0]

        if (undefined == grp.termNote) { throw new Error(`MESA XML required element termNote element not found in termID ${id}. Ignoring Group.`) }
        grp.termNote.forEach(note => {
            switch (note.$.label) {
                case "Language Group Code":
                    group.Code = note._
                    is_group = true
                    break
                case "Language Group Tag":
                    group.GroupTag = note._
                    is_group = true
                    break
                case "Language Group Name":
                    group.Name = note._
                    is_group = true
                    break
                default:
                // ignore plain terms
            }
        })
        //Look at all the relations for this group to populate the group members
        if (is_group) {
            group.members = []
            if (grp.relation) {
                grp.relation.forEach(relation => {
                    let member = {}
                    member.relationType = relation.relationType[0]
                    member.relationWeight = relation.relationWeight[0]
                    relation.termNote.forEach(note => {
                        if (note.$.label == "Audio Language Tag") member.AudioLanguageTag = note._
                    })
                    group.members.push(member)
                })
            }

            //remember the mapping of this group to the underlying synaptica ids
            m2sMmapping.term[group.GroupTag] = id

            //append the term to the list
            lmtJson.groups.push(group)
        }
    })

    let warnings = []
    if (m2sMmapping.errors.length > 0) {
        m2sMmapping.errors.forEach(err => warnings.push(err.message))
    }
    return {
        status: 200,
        body: JSON.stringify({
            warnings: warnings,
            smpte: lmtJson
        }, undefined, 2),
    }
}
