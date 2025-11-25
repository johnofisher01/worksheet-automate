const fs = require('fs-extra');
const path = require('path');
const { google } = require('googleapis');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
require('dotenv').config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CREDS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || 'google-sheets-creds.json';
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'worksheet_template_10.docx');
const OUTPUT_DIR = path.join(__dirname, 'output'); // or your preferred folder

const SHEET_RANGE = 'Form Responses 1';

// Helper: replaces forbidden file name characters with '-'
function safeFilename(str) {
    return String(str || '').replace(/[\/\\?%*:|"<>]/g, '-');
}

async function getRows() {
    const creds = require(path.join(__dirname, CREDS_PATH));
    const auth = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: SHEET_RANGE,
    });
    const [header, ...rows] = response.data.values;
    return rows.map(row =>
        header.reduce((obj, key, i) => {
            obj[key] = row[i] || '';
            return obj;
        }, {})
    );
}

function mapSheetRowToTemplateFields(row) {
    // Adjust keys if your sheet headers differ!
    return {
        NAME: row['NAME'] || '',
        DATE: row['DATE'] || '',
        JOB_NO: row['Job Number'] || row['JOB NUMBER'] || '',
        CUSTOMER: row['Customer'] || '',
        ADDRESS: row['Address'] || '',
        WORKS_CARRIED_OUT: row['WORKS CARRIED OUT'] || '',
        HOURS: row['HOURS'] || '',
        WORK_STILL_TO_DO: row['WORK STILL TO DO/NEED TO GO BACK'] || '',
        WORKED_WITH: row['WORKED WITH'] || '',
        CERTIFICATE_SHARED: row['Certificate Shared'] || '',
        MATERIALS: row['MATERIALS'] || '',
        EXTRAS: row['VARIATIONS - Extras (works outside scope of works / specification of job)'] || '',
        HOURS_EXTRA: row['HOURS EXTRA'] || '',
        EXTRA_MATERIALS: row['EXTRA MATERIALS:'] || '',
        SUPPLIER: (row['SUPPLIER'] || row['SUPPLIER EXTRAS']) || '',
    };
}

function createDocx(data) {
    const content = fs.readFileSync(TEMPLATE_PATH, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render(data);
    fs.ensureDirSync(OUTPUT_DIR);

    // Build: DATE-NAME-JOBNO.docx from row data
    const safeDate = safeFilename(data.DATE || 'nodate');
    const safeName = safeFilename(data.NAME || 'NONAME');
    const safeJobNumber = safeFilename(data.JOB_NO || 'NOJOBNO');

    const outputFile = path.join(
        OUTPUT_DIR,
        `${safeDate}-${safeName}-${safeJobNumber}.docx`
    );

    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync(outputFile, buf);
    return outputFile;
}

(async () => {
    try {
        const rows = await getRows();
        let generatedCount = 0;
        rows.forEach((row, i) => {
            const tplData = mapSheetRowToTemplateFields(row);
            const out = createDocx(tplData);
            console.log('Generated for row', i + 1, ':', out);
            generatedCount++;
        });
        if (generatedCount === 0) {
            console.log('No rows in sheet!');
        }
    } catch (err) {
        console.error('Failed:', err);
    }
})();