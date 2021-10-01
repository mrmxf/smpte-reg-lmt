/** @module route-validate */
/**
 * A route to view the validation of the JSON against the schema
 *
 * route: <mount-point>/validate
 */
const fs = require('fs')
const path = require('path')
const Prism = require('prismjs')

//helpers for this register
const menu = require('./menu')
const worker = require('./worker')

//core components for look & feel and parent menus
const coreTemplate = require('../../../core/inc/lib-coreTemplate')
const { schema } = require('./routes')

module.exports = (cfg, router) => {
    const log = cfg._log

    // GET homepage
    router.get(cfg._routes.validate, async (ctx, next) => {
        const processPath = path.join(cfg._folderPath, cfg.folder.processPath)

        const narrativeMdPath = path.join(processPath, cfg.smpteProcess.narrative.current)

        //get the json
        let filename = cfg.smpteProcess.register.current
        let filePath = path.join(cfg._folderPath, cfg.folder.processPath, filename)
        let json, schema

        try {
            json = fs.readFileSync(filePath, 'utf8')
        } catch (err) {
            ctx.status = 500
            log.error(`${ctx.status} route:${cfg._routes.register}`)
            log.debug(err)
            return
        }

        //get the schema
        filename = cfg.smpteProcess.schema.current
        filePath = path.join(cfg._folderPath, cfg.folder.processPath, filename)

        try {
            schema = fs.readFileSync(filePath)
        } catch (err) {
            ctx.status = 500
            log.error(`${ctx.status} route:${cfg._routes.register}`)
            log.debug(err)
        }

        //validate the data
        let response = worker.validate(json, schema)

        //prepare the UI view
        let segmentColor = (response.ok) ? "green" : "red"
        let uiView = `<div class ="ui ${segmentColor} segment">${response.HTML}</div>`

        // load the default template and homepage narrative
        const narrativeHTML = coreTemplate.loadNarrativeHTML(narrativeMdPath)
        const templateHTML = coreTemplate.loadTemplateHTML()

        let viewData = coreTemplate.createTemplateData({
            registerConfig: cfg._parent.home,
            registerSecondaryMenu: menu.html(cfg, cfg._routes.validate),
            pageNarrativeHTML: narrativeHTML,
            templateHTML: templateHTML,
            menuForThisRegister: `<div class="ui active item">${cfg.menu}</div>`,
            uiView: uiView
        })

        const rendering = coreTemplate.renderPageData(viewData)
        ctx.body = rendering.body
        ctx.status = rendering.status

        if (rendering.status < 300) {
            log.info(`${rendering.status} route:${cfg._routes.validate}`)
        } else {
            log.error(`${rendering.status} route:${cfg._routes.validate}`)
        }
    })

}