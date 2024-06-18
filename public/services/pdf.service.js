
import PDFDocument from 'pdfkit'
import fs from 'fs'


export const pdfService = {
    // suggestImgs,
    buildPDF
}

// function suggestImgs(term) {
//     const url = `https://www.istockphoto.com/search/2/image?phrase=${term}`
//     return utilService.httpGet(url)
//         .then((res) => {
//             const $ = load(res)
//             const topImg = Array.from($('[class*="yGh0CfFS4AMLWjEE9W7v"]'))[0]
//             const imgUrl = topImg.attribs.src
//             return imgUrl
//         })
// }

function buildPDF(bugs, filename = 'bugs.pdf') {

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filename));

    doc
        .fontSize(25)
        .text('Bugs List', 100, 100);

    bugs.forEach(bug => {
        console.log("🚀 ~ buildPDF ~ bug:", bug)
        doc
            .addPage()
            .fontSize(15)
            .text(`${bug.title}`, 100, 100);

        // doc.image(`animal-pictures/${animal.name}.png`, {
        //     fit: [250, 300],
        //     align: 'center',
        //     valign: 'center'
        // });
    });

    doc.end();
}