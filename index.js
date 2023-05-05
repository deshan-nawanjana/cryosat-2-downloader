// method to fetch content
const getListing = async path => {
    // request endpoint content
    const data = await fetch(path).then(resp => resp.json())
    // return results
    return 'results' in data ? data.results : []
}

// method to fetch file data
const getFile = async path => {
    // fetch file content
    const blob = await fetch(path).then(resp => resp.blob())
    // create blob url
    const burl = URL.createObjectURL(blob)
    // create link element
    const link = document.createElement('a')
    // set file name
    link.setAttribute('download', path.split('/').pop())
    // set blob url
    link.setAttribute('href', burl)
    // click link
    link.click()
    // revoke url
    URL.revokeObjectURL(burl)
}

// output object
let object = [{ path: '', is_dir: true }]

// extensions array
let extens = []

// method to log
const log = message => {
    // create element
    const e = document.createElement('div')
    // set inner html
    e.innerHTML = message
    // append to body
    document.body.appendChild(e)
}

// endpoint url
const endpoint = 'https://science-pds.cryosat.esa.int/?do=list&pos=0&file='

// download url
const dwnpoint = 'https://science-pds.cryosat.esa.int/?do=download&file='

// method to recursive download
const download = async item => {
    // check item type
    if (item.is_dir) {
        // log item
        log('Listing Files: ' + item.path)
        // get path file listing
        const data = 'child' in item
            ? item.child
            : await getListing(endpoint + item.path)
        // set data on child
        item.child = data
        // for each data item
        for (let i = 0; i < data.length; i++) {
            // download each item
            await download(data[i])
        }
    } else if (!item.done) {
        // get extension
        const ext = '.' + item.path.split('.').pop().toLowerCase()
        // if file extension includes
        if (extens.includes(ext)) {
            // log item
            log('Downloading File: ' + item.path)
            // download file
            await getFile(dwnpoint + item.path)
        } else {
            // log item
            log('Skip File: ' + item.path)
        }
    }
}

// listener to download
document.querySelector('button').addEventListener('click', async event => {
    // remove button
    event.target.remove()
    // get start point
    const start = document.querySelector('#input_1')
    // get start value
    const value = decodeURIComponent(start.value.split('#')[1] || '')
    // get extensions
    const types = document.querySelector('#input_2')
    // set extensions
    extens = types.value.replace(/ /g, '').split('|')
    // remove extensions element
    types.outerHTML = types.value
    // set start value
    object[0].path = value
    // remove start element
    start.outerHTML = value
    // start download
    await download(object[0])
    // log item
    log('Download Complete!')
})