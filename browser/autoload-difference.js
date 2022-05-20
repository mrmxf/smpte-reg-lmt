// LMT difference

if (typeof mm !== undefined) (mm = {})

//initialise objects and control
mm.smpteJson = "{}"

$('.ui.radio.checkbox').checkbox();

//source and candidate files
mm.src = {
    radio: "sRadio",
    radioSelecotr: `input[type=radio][name=sRadio]`,
    uploader: "#sUploader-container",
    uploadBtn: "#sUploader-button",
    pasteBox: "#sPasteBox-container"
}
mm.can = {
    radio: "cRadio",
    radioSelecotr: `input[type=radio][name=cRadio]`,
    uploader: "#cUploader-container",
    uploadBtn: "#cUploader-button",
    pasteBox:   "#cPasteBox-container"
}



/**
 *  Radio Button - make controls visible or otherwise
 */
mm.clickRadio = 
function () {
    //grab the radio button value tha looks like `upload-schema`
    let action = this.value
    //split into the control and documentType
    let slice = action.split("-")
    mm.control = slice[0]
    mm.documentType = slice[1]
    switch (mm.control) {
        case "uploader":
            $(mm.uploader).show()
            $(mm.pasteBox).hide()
            break
        case "pasteBox":
            $(mm.uploader).hide()
            $(mm.pasteBox).show()
            break
        default:
            $(mm.uploader).hide()
            $(mm.pasteBox).hide()
    }
}

//hook up the click handler to the radio controls
$(mm.src.radioSelecotr).on('change', mm.clickRadio)

// -----------------------------------------------------------------------------
// original convert code
// -----------------------------------------------------------------------------
/** Create a downloadbutton as a child of id
 * clicking the button will download a formatted JSON version of downloadObject
 * the button can be styled with classes e.g. "ui right icon"
 * the innerHTML will be the contents of the button
 */
mm.jsonDownloadButton = (insertId, cssClasses, innerHTML, downloadObject, downloadFilename) => {

    //now create the button that triggers the download
    let btn = $(`<button></button>`)
    btn.addClass(cssClasses)
    btn.html(innerHTML)

    // create the target for downloading
    mm.downloadTarget = $(`<a>CLICK ME becaue I am friendly</a>`)
    mm.downloadTarget.attr('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(downloadObject))
    mm.downloadTarget.attr('download', downloadFilename)
    mm.downloadTarget.css(`display`, `none`)

    //insert into document
    $(insertId).before(mm.downloadTarget)

    btn.click(() => {
        //click the link
        mm.downloadTarget[0].click();
        //remove from the body - need to wait until download complete
        // target.remove()
    })
    $(insertId).html(btn)
}

/** trap changes in the conversion radio buttons to make the help information visible or invisible */
$('input[type=radio][name=cvt]').on('change', function () {
    let selectedId = $(this)[0].id
    let helpSelector = `#help${selectedId}`
    //hide all the divs with an id starting "helpid"
    $('div[id^=help]').hide()
    //show the one we want (if it exists)
    $(helpSelector).show()
})

/** handle the conversion button */
$('#doConversion').on('click', function () {
    let txt = $("#sourceText").val()
    if (txt.length < 10) {
        alert("Hmm that seems suspicious. Only " + txt.length + " characters? Really?")
        return
    }
    let cvtId
    try {
        cvtId = $('input[type=radio][name=cvt]:checked')[0].id

    } catch (error) {
        alert("Please select a conversion after pasting your data!")
        return
    }
    if (!cvtId || (cvtId.length == 0)) {
        alert("Please select a conversion after pasting your data!")
        return
    }
    // alert("alrighty lets do the " + cvt + " conversion")
    let data = {
        conversion: cvtId,
        sourceText: txt
    }
    $.post("", data)
        .done(function (responseText) {
            //success in the conversion. Use prism to format the output
            let cvtId = $('input[type=radio][name=cvt]:checked')[0].id
            let lblId = `label${cvtId}`
            let labelHtml = $(`#${lblId}`)[0].textContent
            let resHtml
            switch (cvtId) {
                default:
                    var body = JSON.parse(responseText)
                    var warnings = body.warnings
                    var register = body.smpte
                    //use the globalvariable so that we can download it
                    mm.smpteJson = JSON.stringify(register, undefined, 2)
                    var escaped = $("<div>").text(mm.smpteJson).html();
                    warningHTML = ""
                    if (warnings && warnings.length > 0) {
                        warningHTML = `
                        <div class="ui warning message container">
                         <div class="header"><i class="warning icon"></i>
                          ${warnings.length} Errors found during conversion
                         </div>
                         <div class="content">
                          <ol class="ui list">\n`
                        warnings.forEach(w => {
                            warningHTML += `<li>${w}</li>`
                        })
                        warningHTML += `</ol>
                         </div>
                        </div>`
                    }

                    resHtml = `
                    <div class="ui green padded basic center aligned segment">
                    <div id="dlButton"></div>
                     ${warningHTML}
                     <div class="ui segment">
                      <pre><code class="language-json line-numbers">${escaped}</code></pre>
                     </div>
                    </div>
                    `
            }
            $("#dataView").html(resHtml)

            let bClass = `ui right labeled icon button`
            let bHtml = `<i class="file download icon"></i>Conversion ${labelHtml}`
            let bName = `smpte-lmt-draft.json`
            mm.jsonDownloadButton("#dlButton", bClass, bHtml, mm.smpteJson, bName)

            Prism.highlightAll()
        })
        .fail(function (res) {
            let cvtId = $('input[type=radio][name=cvt]:checked')[0].id
            let lblId = `label${cvtId}`
            let labelHtml = $(`#${lblId}`)[0].textContent
            $("#dataView").html(`
              <div class="ui red padded basic center aligned segment">
                <div class = "ui negative compact  message">
                <div class="header">Conversion ${labelHtml}: Error Code ${res.status}</div>
                <p>${res.responseText}</p>
                </div>
              </div>
            `
            )
        })
        .always(function (res) { })
})