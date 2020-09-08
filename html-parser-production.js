const fs = require('fs'); 
const path = require('path');
const parse5 = require('parse5');

const rootPath = path.resolve(__dirname, 'build')
console.log(rootPath)
const versionController = {
    '0':'css',
    '1':'js',
    '2':'all'
}

function checkArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
}

/**
 * 
 * @param {*} nodeArr 
 * @param {String} key 
 * @param {String} val 
 */
function nodeFilter (nodeArr, key, val) {
    if (checkArray(nodeArr)) {
        return nodeArr.filter((node)=>{
            if(node[key] === val) {
                return node
            }
        })
    }
}

/**
 * retrive wanted attributes
 * @param {Array} attrs 
 * @param {String} key 
 * @param {RegExp} regexp 
 */
function retriveAttrs(attrs, key, regexp) {
    if (checkArray(attrs)) {
        return attrs.filter((item)=>{
            if (item.name === key) {
                if (regexp.test(item.value)) {
                    return item
                }
            }
        })
    }
}
/**
 * 
 * @param {*} attrs attributes
 * @param {String} extension js or css
 * @param {String} timestamp 时间戳
 */
function decorateAttrs(attrs, extension, timestamp) {
     return attrs.map((attr)=>{
        attr.value = `${attr.value.slice(0, attr.value.indexOf(`.${extension}`))}.${extension}?v=${timestamp}`
    })
}

function parseHTML (timestamp, tag) {
    fs.readFile(`./src/viewer.html`, 'utf8', function (err, data) {
        if (err) return console.error(err);
        const document = parse5.parse(data);
        let htmlNode = nodeFilter(document.childNodes, 'tagName', 'html')
        htmlNode = (htmlNode && htmlNode[0]) || {childNodes: []}
        // console.log(htmlNode)
        let headNode = nodeFilter(htmlNode.childNodes, 'tagName', 'head')
        headNode = (headNode && headNode[0])
        // console.log(headNode.childNodes)

        let mappingAttr = {}
        const headChildNodes = headNode.childNodes.map((item)=>{
            if (item.tagName === 'link' && (+tag === 0 || +tag === 2)) {
                mappingAttr = retriveAttrs(item.attrs, 'href', RegExp(/\.css$|\.css?/))
                decorateAttrs(mappingAttr, 'css', timestamp)
                // console.log('link attrs:', mappingAttr)
            }
            if (item.tagName === 'script' && (+tag === 1 || +tag === 2)) {
                mappingAttr = retriveAttrs(item.attrs, 'src', RegExp(/\.js$|\.js?/))
                decorateAttrs(mappingAttr, 'js', timestamp)
                // console.log('script attrs:', mappingAttr, item.attrs)
            }
        })
        // ast还原html
        const str = parse5.serialize(document);
        fs.writeFile(`./src/viewer_${timestamp}.html`, str, function (err) {
            if (err) throw err;
            console.log(`Saved! v=${timestamp}`);
        })

    });
}

parseHTML('2020090802', 2)