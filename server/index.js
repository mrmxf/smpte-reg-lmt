/** @module lmt */

//  Copyright ©2022 Mr MXF info@mrmxf.com
//  MIT License https://opensource.org/licenses/MIT

/**Entry point for the sample register
 *
 * The entry point establishes routes that allows custom
 * views, menus and other services to be displayed.
 *
 * The sample-register contains a single example of each
 * framework call.
 */

/** export the routes for this register
 * the routes are used in koa's app.use(register.routes) function
 */

const Router = require('koa-router')
const router = new Router();
let cfg

const javascriptAutoloader = require(__smr + '/utils/javascript-autoloader')

/** initialise the plugin with its config
 * @param {Object} registerConfigObject - the register's config.json as an object
 */
module.exports.init = (registerConfigObject) => {
    cfg = registerConfigObject

    /** construct all the route names for this register & add to cfg */
    cfg._routes = require('./routes')
    cfg._routes.init(cfg)

    const home = cfg._absRoute

    /** autoload register's JS as `ctx.smr.pageJavascript` for rendering */
    router.use(javascriptAutoloader)

    //process all the routes in the config file in the order they appear
    for (let r in cfg.routes) {
        //set the absolute route for this instances mount point
        cfg.routes[r].absRoute = `${home}${cfg.routes[r].realRoute}`
        //load the handling function for each route in the config (in order)
        let tmp = require(`./route-${r}`)
        tmp(cfg, router)
    }
}

module.exports.router = router