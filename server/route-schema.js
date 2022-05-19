/** @module lmt */

//  Copyright ©2022 Mr MXF info@mrmxf.com
//  MIT License https://opensource.org/licenses/MIT

/**
 * A route to return the register data in a raw format
 *
 * route: <mount-point>/register
 */
const fs = require('fs')
const path = require('path')

module.exports = (cfg, router) => {
    const log = cfg._log

    // GET raw data
    router.get(cfg.routes.schema.absRoute, async (ctx, next) => {
        let filename = cfg.smpteProcess.schema.current
        let filePath = path.join(cfg._folderPath, cfg.folder.processPath, filename)

        try {
            let json = fs.readFileSync(filePath)
            ctx.status = 200
            ctx.set('Content-Type', 'application/json')
            ctx.body = json
            log.info(`${ctx.status} route:${cfg._routes.register}`)
        } catch (err) {
            ctx.status = 500
            log.error(`${ctx.status} route:${cfg._routes.register}`)
            log.debug(err)
        }
    })

}