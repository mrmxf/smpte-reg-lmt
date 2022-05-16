/** @module route-difference */
//  Copyright ©2022 Mr MXF info@mrmxf.com
//  MIT License https://opensource.org/licenses/MIT

/**
 * A route to view the difference between two versions of the register
 *
 * route: <mount-point>/difference
 */
const path = require('path')

//helpers for this register
const menu = require('./menu')

//components for look & feel and parent menus
const uiWorkflow = require('../../../core/utils/ui-utils/ui-page-file-workflow')

module.exports = (cfg, router) => {
    const log = cfg._log
    const realRoute= cfg._routes[cfg.routes.difference]

    // GET route ia defined in the config file
    router.get(realRoute, async (ctx, next) => {
        const processPath = path.join(cfg._folderPath, cfg.folder.processPath)
        const narrativeMdPath = path.join(processPath, cfg.smpteProcess.narrative.current)

        //get the json path
        let registerFilename = cfg.smpteProcess.register.current
        let registerJsonPath = path.join(cfg._folderPath, cfg.folder.processPath, registerFilename)

        //get the schema path
        let schemaFilename = cfg.smpteProcess.schema.current
        let schemaPath = path.join(cfg._folderPath, cfg.folder.processPath, schemaFilename)

        const res = uiWorkflow.renderPage(ctx, cfg, menu, {
            title: "Hello mum"
        })

        ctx.status = res.status
        ctx.body = res.body

        if (res.status < 300) {
            log.info(`${res.status} route:${cfg._routes.validate}`)
        } else {
            log.error(`${res.status} route:${cfg._routes.validate}`)
        }
    })

}