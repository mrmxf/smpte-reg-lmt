/** @module lmt */

//  Copyright ©2022 Mr MXF info@mrmxf.com
//  MIT License https://opensource.org/licenses/MIT

/**
 * Display the secondary menu
 * usage: html = menu.html(registerConfigObject)
 *
 * @param {Object} cfg The config.json as a JAvascript object
 * @param {String} activeRoute The route that controls UI highlighting
 */

module.exports.html = (cfg, activeRoute, breadCrumbMenus) => {
    const route = cfg.routes

    //helper variables for the actual route s defined by the confid file
    let rCvt = cfg.routes.convert.absRoute
    let rDif = cfg.routes.difference.absRoute
    let rVal = cfg.routes.validate.absRoute

    let aHo = (activeRoute == route.home.absRoute) ? " active " : ""
    let aJD = (activeRoute == route.jsonData.absRoute) ? " active" : ""
    let aJS = (activeRoute == route.jsonSchema.absRoute) ? " active" : ""
    let aCo = (activeRoute == route.convert.absRoute) ? " active" : ""
    let aDi = (activeRoute == route.difference.absRoute) ? " active" : ""
    let aVa = (activeRoute == route.validate.absRoute) ? " active" : ""

    return (
        `<div class="ui secondary menu">
          <!-- Home -->
          <a class="item${aHo}" href="${route.home.absRoute}"><i class="home ${cfg.homeIconClass} icon"></i>${cfg.menu}</a>

          ${(breadCrumbMenus)?breadCrumbMenus:''}

          <!-- ux views -->
          <div class="ui simple dropdown item">
            <i class="eye icon"></i>  Views  <i class="dropdown icon"></i>

            <div class="menu">
              <a class="item${aJD}" href="${route.jsonData.absRoute}"><i class="code icon"></i>Json</a>
              <a class="item${aJS}" href="${route.jsonSchema.absRoute}"><i class="tasks icon"></i>Schema</a>
            </div>
          </div>

          <!-- ux Tools -->
          <div class="ui simple dropdown item">
            <i class="tools icon"></i>  Tools  <i class="dropdown icon"></i>

            <div class="menu">
            <a class="item${aCo}" href="${cfg.routes.convert.absRoute}"><i class="exchange alternate icon"></i>Convert</a>
            <a class="item${aDi}" href="${cfg.routes.difference.absRoute}"><i class="balance scale left icon"></i>Difference</a>
            <a class="item${aVa}" href="${cfg.routes.validate.absRoute}"><i class="check circle outline icon"></i>Validate</a>
            </div>
          </div>

          <!-- Right aligned menu item for full screen items-->
          <div class="right item">
            <div class="ui simple dropdown item">
              <i class="robot icon"></i>  API endpoints  <i class="dropdown icon"></i>

              <div class="menu">
                <a class="item" href="${route.register.absRoute}"><i class="document icon"></i>Register</a>
                <a class="item" href="${route.schema.absRoute}"><i class="json icon"></i>Schema</a>
                <a class="item" href="${route.document.absRoute}"><i class="json icon"></i>Document</a>
              </div>
            </div>
          </div>
        </div>`
    )
}