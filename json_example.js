var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};

var PdfPrinter = require('../src/printer');
var printer = new PdfPrinter(fonts);
var fs = require('fs');

const employees = [
    {"firstName":"John", "lastName":"Doe"}, 
    {"firstName":"Anna", "lastName":"Smith"},
    {"firstName":"Peter", "lastName":"Jones"}
];
const document = { content: [{text: 'Employees', fontStyle: 15, lineHeight: 2}] }
employees.forEach(employee => {
    document.content.push({
        columns: [
            { text: 'firstname', width: 60 },
            { text: ':', width: 10 },
            { text:employee.firstName, width: 50 },
            { text: 'lastName', width: 60 },
            {text: ':', width: 10 }, { text: employee.lastName, width: 50}
        ],
        lineHeight: 2
    });
});

var pdfDoc = printer.createPdfKitDocument(document);
pdfDoc.pipe(fs.createWriteStream('pdfs/json_example.pdf'));
pdfDoc.end();
