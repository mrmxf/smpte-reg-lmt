/** @module lmt */

//  Copyright ©2022 Mr MXF info@mrmxf.com
//  MIT License https://opensource.org/licenses/MIT

/**
 * A route to view the difference between two versions of the register
 *
 * route: <mount-point>/difference
 */
const path = require('path')

//helpers for this register
const lmtMenu = require('./menu')

//components for look & feel and parent menus
const uiWorkflow = require(__smr + '/ui/ui-page-file-workflow')

module.exports = (cfg, router) => {
    const log = cfg._log

    // GET route ia defined in the config file
    router.get(cfg.routes.difference.absRoute, async (ctx, next) => {
        //create some variable for the on-disk file paths etc.
        const processPath = path.join(cfg._folderPath, cfg.folder.processPath)
        const narrativeMdPath = path.join(processPath, cfg.smpteProcess.narrative.current)

        //get the json path
        let registerFilename = cfg.smpteProcess.register.current
        let registerJsonPath = path.join(cfg._folderPath, cfg.folder.processPath, registerFilename)

        //get the schema path
        let schemaFilename = cfg.smpteProcess.schema.current
        let schemaPath = path.join(cfg._folderPath, cfg.folder.processPath, schemaFilename)

        // render a page using the file-workflow template
        const res = uiWorkflow.renderPage(ctx, cfg, lmtMenu, {
            pageTitle: "LMT Difference",
            pageHelp: "Display the differences between two register versions.",
            breadCrumbsMenu: `<span class="item active" "><i class="exchange alternate ${cfg.homeIconClass} icon"></i>breadcrumb: ${cfg.routes.difference.display}</span>`,
            route: cfg.routes.difference
        })

        ctx.status = res.status
        ctx.body = res.body
    })

}