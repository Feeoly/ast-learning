const fs = require('fs'); 
const htmlparser2 = require("htmlparser2")
const parse5 = require('parse5');

const timeStamp = '2020090501'

fs.readFile('./src/viewer.html', 'utf8', function(err, data){ 
    // htmlparser2
    const parser = new htmlparser2.Parser(
        {
            onopentag(name, attribs) {
                if (name === "script" && attribs.type === "text/javascript") {
                    console.log("<script> start", attribs);
                }
            },
            ontext(text) {
                // console.log("text-->", text);
            },
            onclosetag(tagname) {
                if (tagname === "script") {
                    console.log("<script> end");
                }
            },
            onattribute(name, value) {
                // console.log('attrs---', name, value)
            }
        },
        { decodeEntities: true }
    );
    parser.write(
        data
    );
    parser.end();

    // parse5
    const document = parse5.parse(data);
    let htmlNode = document.childNodes.filter((childNode)=>{
        if (childNode.tagName === 'html'){
            return childNode
        }
    })
    htmlNode = htmlNode[0] || {childNodes: []}
    // console.log('html childnodes=', htmlNode)
    let headNode = htmlNode.childNodes.filter((childNode)=>{
        if (childNode.tagName === 'head'){
            return childNode
        }
    })
    headNode = headNode[0] || {childNodes: []}
    // console.log('head childnodes=', headNode.childNodes)
    let mappingAttr = {}
    const headChildNodes = headNode.childNodes.map((item)=>{
        if (item.tagName === 'link') {
            mappingAttr = retriveAttrs(item.attrs, 'href', RegExp(/\.css$/))
            if (mappingAttr[0]){
                mappingAttr[0].value = `${mappingAttr[0].value}?v=${timeStamp}`
            }
            // console.log('link attrs=', mappingAttr, item.attrs)
        }
        if (item.tagName === 'script') {
            mappingAttr = retriveAttrs(item.attrs, 'src', RegExp(/\.js$/))
            if (mappingAttr[0]){
                mappingAttr[0].value = `${mappingAttr[0].value}?v=${timeStamp}`
            }
            // console.log('script attrs=', mappingAttr, item.attrs)
        }
    })
    // Serializes the <html> element content.
    const str = parse5.serialize(document);
    fs.writeFile('./src/viewer_timestamp.html', str, function (err) {
        if (err) throw err;
        console.log('Saved!');
    })
    //console.log(str); //> '<head></head><body>...</body>'
});

/**
 * retrive wanted attributes
 * @param {Array} attrs 
 * @param {String} key 
 * @param {RegExp} regexp 
 */
function retriveAttrs(attrs, key, regexp) {
    let attrsArr = attrs || []
    return attrsArr.filter((item)=>{
        if (item.name === key) {
            if (regexp.test(item.value)) {
                return item
            }
        }
    })
}


