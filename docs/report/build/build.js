// Builds the BIT306 Assignment 1 report (.docx) for Service Day.
// Usage (from this folder): npm install && node build.js ../../.. ../Assignment1-Report-Komang-Masato-Kaneko.docx
// Version 2 of the report (branch revamp/ink-pine: Ink + Pine palette, Kaneko.co). Version 1 is the .docx committed on main.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, PageBreak, TableOfContents, Footer, PageNumber, LevelFormat,
  VerticalAlign, NumberFormat, SectionType, TableLayoutType,
} = require('docx');

const ROOT = process.argv[2];
const OUT = process.argv[3];
const SHOTS = path.join(ROOT, 'docs/screenshots');
const FONT = 'Times New Roman';
const MONO = 'Consolas';
const CONTENT_W = 9026; // A4 width 11906 − 2 × 1440 margins (DXA)

// ── helpers ─────────────────────────────────────────────────────────────
let fig = 0;
let tab = 0;
const run = (text, o = {}) => new TextRun({ text, font: FONT, size: 24, ...o });
/** Body paragraph; `parts` is a string or an array of strings / [text, {bold|italics}] pairs. */
function p(parts, o = {}) {
  const runs = (Array.isArray(parts) ? parts : [parts]).map((x) => (Array.isArray(x) ? run(x[0], x[1]) : run(x)));
  return new Paragraph({ children: runs, alignment: AlignmentType.JUSTIFIED, spacing: { line: 360, after: 120 }, indent: o.noIndent ? undefined : { firstLine: 567 }, ...o.para });
}
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(t, { bold: true, size: 32 })], pageBreakBefore: true });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(t, { bold: true, size: 26 })] });
const h3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [run(t, { bold: true, italics: true, size: 24 })] });
function bullets(items, level = 0) {
  return items.map((x) => new Paragraph({
    numbering: { reference: 'bullets', level },
    spacing: { line: 360, after: 60 },
    alignment: AlignmentType.JUSTIFIED,
    children: (Array.isArray(x) ? x : [x]).map((y) => (Array.isArray(y) ? run(y[0], y[1]) : run(y))),
  }));
}
function steps(items) {
  return items.map((x, i) => new Paragraph({
    numbering: { reference: 'steps', level: 0, instance: steps.n },
    spacing: { line: 360, after: 60 },
    children: (Array.isArray(x) ? x : [x]).map((y) => (Array.isArray(y) ? run(y[0], y[1]) : run(y))),
  }));
}
steps.n = 0;
const caption = (t) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, keepLines: true, children: [run(t, { italics: true, size: 20 })] });

/** Code listing in a light shaded box (one-cell table), with a caption under it. */
function code(lines, cap) {
  fig += 0;
  const paras = lines.split('\n').map((l) => new Paragraph({ spacing: { line: 240, after: 0 }, children: [new TextRun({ text: l.length ? l : ' ', font: MONO, size: 17 })] }));
  const box = new Table({ layout: TableLayoutType.FIXED,
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new TableRow({ cantSplit: false, children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F4F3F1' },
      margins: { top: 120, bottom: 120, left: 160, right: 160 },
      borders: { top: { style: BorderStyle.SINGLE, size: 4, color: 'DCD9D3' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DCD9D3' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'DCD9D3' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'DCD9D3' } },
      children: paras,
    })] })],
  });
  return [box, caption(cap)];
}

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
/** Screenshot scaled to the text width (max 6 in wide, max `maxIn` in tall), with a numbered caption. */
function shot(name, text, maxIn = 7.6, widthIn = 6.0) {
  const file = path.join(SHOTS, `${name}.png`);
  const { w, h } = pngSize(file);
  let width = widthIn * 96;
  let height = (width * h) / w;
  if (height > maxIn * 96) { height = maxIn * 96; width = (height * w) / h; }
  fig += 1;
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true, children: [new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: Math.round(width), height: Math.round(height) }, altText: { title: text, description: text, name } })] }),
    caption(`Figure ${fig}. ${text}`),
  ];
}

const border = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const borders = { top: border, bottom: border, left: border, right: border };
/** Data table with a shaded header row. `widths` in DXA must sum to the table width. */
function table(head, rows, widths, cap) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (t, i, header) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    borders,
    shading: header ? { type: ShadingType.CLEAR, color: 'auto', fill: 'E7E6E3' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ spacing: { line: 260, after: 0 }, children: [run(t, { size: 20, bold: header })] })],
  });
  tab += 1;
  return [
    new Paragraph({ spacing: { before: 120, after: 60 }, keepNext: true, children: [run(`Table ${tab}. ${cap}`, { italics: true, size: 20 })] }),
    new Table({ layout: TableLayoutType.FIXED,
      width: { size: total, type: WidthType.DXA },
      columnWidths: widths,
      rows: [new TableRow({ tableHeader: true, children: head.map((t, i) => cell(t, i, true)) }), ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((t, i) => cell(t, i, false)) }))],
    }),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
  ];
}

// ── Cover sheet (HELP University template layout, to be completed by hand) ──
function coverCell(t, w, o = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.CENTER,
    shading: o.shade ? { type: ShadingType.CLEAR, color: 'auto', fill: 'D9D9D9' } : undefined,
    rowSpan: o.rowSpan, columnSpan: o.columnSpan,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: (Array.isArray(t) ? t : [t]).map((x) => new Paragraph({ alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [run(x, { size: 22, bold: o.bold })] })),
  });
}
const coverSheet = [
  new Paragraph({ spacing: { after: 120 }, children: [run('[Insert HELP University logo here]', { italics: true, color: '808080', size: 20 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [run('Assignment Cover Sheet', { bold: true, size: 40 })] }),
  new Table({ layout: TableLayoutType.FIXED,
    width: { size: 9026, type: WidthType.DXA }, columnWidths: [4300, 2400, 2326],
    rows: [
      new TableRow({ children: [coverCell('Student Information (For group assignment, please state names of all members)', 6700, { shade: true, bold: true, columnSpan: 2 }), coverCell('Grade/Marks', 2326, { shade: true, bold: true, center: true })] }),
      new TableRow({ children: [coverCell('Name', 4300, { bold: true }), coverCell('ID', 2400, { bold: true }), coverCell('', 2326, { rowSpan: 7 })] }),
      new TableRow({ children: [coverCell('Komang Masato Kaneko', 4300), coverCell('E24000666', 2400)] }),
      ...[1, 2, 3, 4, 5].map(() => new TableRow({ children: [coverCell('', 4300), coverCell('', 2400)] })),
    ],
  }),
  new Paragraph({ spacing: { after: 200 }, children: [] }),
  new Table({ layout: TableLayoutType.FIXED,
    width: { size: 9026, type: WidthType.DXA }, columnWidths: [2500, 4200, 2326],
    rows: [
      new TableRow({ children: [coverCell('Module/Subject Information', 6700, { shade: true, bold: true, columnSpan: 2 }), coverCell('Office Acknowledgement', 2326, { shade: true, bold: true, center: true })] }),
      new TableRow({ children: [coverCell('Module/Subject Code', 2500, { bold: true }), coverCell('BIT306', 4200), coverCell('', 2326, { rowSpan: 6 })] }),
      new TableRow({ children: [coverCell('Module/Subject Name', 2500, { bold: true }), coverCell('PROGRAMMING IN WEB TECHNOLOGIES', 4200)] }),
      new TableRow({ children: [coverCell('Lecturer/Tutor/Facilitator', 2500, { bold: true }), coverCell('Mr. Koon Kim Peh', 4200)] }),
      new TableRow({ children: [coverCell('Due Date', 2500, { bold: true }), coverCell('1st December 2026', 4200)] }),
      new TableRow({ children: [coverCell('Assignment Title/Topic', 2500, { bold: true }), coverCell('Assignment 1', 4200)] }),
      new TableRow({ children: [coverCell('Intake (where applicable)', 2500, { bold: true }), coverCell('', 4200)] }),
      new TableRow({ children: [coverCell('Word Count', 2500, { bold: true }), coverCell('[fill in]', 4200), coverCell('Date/Time', 2326, { bold: true, center: true })] }),
    ],
  }),
  new Paragraph({ spacing: { before: 240, after: 120 }, children: [run('Declaration', { bold: true })] }),
  ...[
    'I/We have read and understood the Programme Handbook that explains on plagiarism, and I/we testify that, unless otherwise acknowledged, the work submitted herein is entirely my/our own.',
    'I/We declare that no part of this assignment has been written for me/us by any other person(s) except where such collaboration has been authorized by the lecturer concerned.',
    'I/We authorize the University to test any work submitted by me/us, using text comparison software, for instances of plagiarism. I/We understand this will involve the University or its contractors copying my/our work and storing it on a database to be used in future to test work submitted by others.',
  ].map((t) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 }, alignment: AlignmentType.JUSTIFIED, children: [run(t, { size: 20 })] })),
  new Paragraph({ spacing: { before: 120 }, children: [run('Note: 1) The attachment of this statement on any electronically submitted assignments will be deemed to have the same authority as a signed statement. 2) The Group Leader signs the declaration on behalf of all members.', { size: 18 })] }),
  new Paragraph({ spacing: { after: 160 }, children: [] }),
  new Table({ layout: TableLayoutType.FIXED,
    width: { size: 9026, type: WidthType.DXA }, columnWidths: [5800, 3226],
    rows: [
      new TableRow({ height: { value: 900, rule: 'atLeast' }, children: [coverCell('Signature:', 5800), coverCell('Date:', 3226)] }),
      new TableRow({ children: [coverCell('E-mail: komangmasatoo@gmail.com', 9026, { columnSpan: 2 })] }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] }),
  new Table({ layout: TableLayoutType.FIXED,
    width: { size: 9026, type: WidthType.DXA }, columnWidths: [9026],
    rows: [
      new TableRow({ children: [coverCell('Feedback/Comments*', 9026, { shade: true, bold: true, center: true })] }),
      new TableRow({ children: [coverCell('Main Strengths', 9026, { shade: true, bold: true })] }),
      ...Array.from({ length: 6 }, () => new TableRow({ height: { value: 400, rule: 'atLeast' }, children: [coverCell('', 9026)] })),
      new TableRow({ children: [coverCell('Main Weaknesses', 9026, { shade: true, bold: true })] }),
      ...Array.from({ length: 6 }, () => new TableRow({ height: { value: 400, rule: 'atLeast' }, children: [coverCell('', 9026)] })),
      new TableRow({ children: [coverCell('Suggestions for improvement', 9026, { shade: true, bold: true })] }),
      ...Array.from({ length: 5 }, () => new TableRow({ height: { value: 400, rule: 'atLeast' }, children: [coverCell('', 9026)] })),
    ],
  }),
  new Paragraph({ spacing: { after: 160 }, children: [] }),
  new Table({ layout: TableLayoutType.FIXED,
    width: { size: 9026, type: WidthType.DXA }, columnWidths: [4513, 4513],
    rows: [
      new TableRow({ children: [coverCell(['', '', 'Grader\'s signature'], 4513, { rowSpan: 2 }), coverCell('Student acknowledge feedback/comments', 4513, { shade: true, bold: true })] }),
      new TableRow({ height: { value: 900, rule: 'atLeast' }, children: [coverCell('Student\'s signature:', 4513)] }),
      new TableRow({ children: [coverCell('Date:', 4513), coverCell('Date:', 4513)] }),
    ],
  }),
  new Paragraph({ spacing: { before: 120 }, children: [run('Note: 1) A soft and hard copy of the assignment shall be submitted. 2) The signed copy of the assignment cover sheet shall be retained by the marker. 3) If the Turnitin report is required, students have to submit it with the assignment. However, departments may allow students up to THREE (3) working days after submission of the assignment to submit the Turnitin report. The assignment shall only be marked upon the submission of the Turnitin report.', { size: 18 })] }),
  new Paragraph({ children: [run('*Use additional sheets if required.', { size: 18 })] }),
];

// ── Title page ──────────────────────────────────────────────────────────
const titlePage = [
  new Paragraph({ spacing: { before: 1200 }, alignment: AlignmentType.CENTER, children: [run('Service Day', { size: 52 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [run('A Corporate Volunteering Dashboard Built with the Angular Framework', { size: 32 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [run('[Insert HELP University logo here]', { italics: true, color: '808080' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1200 }, children: [run('[Insert Institut Teknologi dan Bisnis STIKOM Bali logo here]', { italics: true, color: '808080' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [run('BIT306 Programming in Web Technologies — Assignment 1')] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [run('Lecturer: Mr. Koon Kim Peh')] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Compiled by:')] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Komang Masato Kaneko – E24000666')] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [run('[Name – Student ID]', { color: '808080', italics: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [run('December 2026')] }),
];

// ── Body ────────────────────────────────────────────────────────────────
const body = [];
const add = (...xs) => xs.flat().forEach((x) => body.push(x));

// 1 Introduction
add(
  h1('1. Introduction'),
  h2('1.1. Overview'),
  p('Service Day is a web application that supports the annual corporate social responsibility (CSR) volunteering day of Kaneko.co, a fictional company used for this case study. On Service Day, employees spend one working day helping a partner non-governmental organisation (NGO), for example packing food hampers, reading with children or planting mangroves. Organising such a day by e-mail and spreadsheets makes it hard to know how many places are left, who has changed their mind, and who has not signed up at all. The application replaces that process with a single-page web dashboard used by two roles: employees, who choose and manage their place, and administrators, who manage the NGOs, the activities and the attendance.'),
  h2('1.2. Purpose'),
  p('The purpose of the project is to demonstrate the front-end web technologies covered in the module through a complete, realistic application. In particular, the application is designed to show a clear Model–View–Controller (MVC) separation, a deliberate front-end design that uses semantic HTML5, the CSS box model and Flexbox, asynchronous communication with a REST API (AJAX), and an organised structure of Angular modules and third-party packages. The application is front-end only for Assignment 1; a mock REST API stands in for the server so that every screen already exchanges data over HTTP, and Assignment 2 can replace it with an Express and MongoDB back-end by changing one configuration value.'),
  h2('1.3. Scope'),
  p('The case study defines six use cases. Table 1 shows how each one is implemented in this build. Two of them, notifications (UC5) and QR check-in (UC6), depend on server features such as e-mail delivery and scheduled jobs; in Assignment 1 their user interfaces are complete and their behaviour is simulated by the client, which writes the same records the server will write later.'),
  table(['Use case', 'Actor', 'Implementation in Assignment 1'], [
    ['UC1 Manage NGO availability', 'Administrator', 'Full create, read, update and delete (CRUD) of NGOs and activities over HTTP; publish, unpublish and cancel'],
    ['UC2 View opportunities', 'Employee', 'Searchable, filterable list with live slot counts that refresh every 10 seconds'],
    ['UC3 Register, switch, withdraw', 'Employee', 'One place per employee, changes allowed until a cut-off, overbooking guard'],
    ['UC4 Monitor participation', 'Administrator', 'Key figures, a fill-by-NGO chart, a participation gauge, lists of staff without a place'],
    ['UC5 Notifications and reminders', 'Administrator / system', 'Inbox, broadcasts, manual reminders and a previewed reminder schedule'],
    ['UC6 QR check-in', 'Employee / Administrator', 'QR code generation, check-in by link or code, live arrivals and a CSV attendance export'],
  ], [2600, 1900, 4526], 'Use cases and their implementation'),
  h2('1.4. Structure of the report'),
  p('Section 2 explains the technologies used and why they were chosen, with supporting literature. Section 3 describes the system architecture: the MVC mapping, one complete data flow, the module structure and the AJAX communication. Section 4 presents the front-end design. Section 5 is the installation and configuration guide, Section 6 the user manual for both roles, Section 7 summarises testing and evaluation, and Section 8 concludes.'),
);

// 2 Technologies
add(
  h1('2. Technologies Used'),
  p('Each technology was chosen because it either is required by the assignment (Angular) or answers a specific need of the case study with the smallest reasonable dependency. Table 2 lists the packages and their installed versions, taken from the project\'s package.json file; the subsections that follow justify each choice.'),
  table(['Package', 'Version', 'Role in Service Day'], [
    ['Angular (core, common, router, forms, platform-browser)', '22.2', 'Single-page application framework, NgModules, dependency injection, routing, reactive forms, HttpClient'],
    ['RxJS', '7.8.2', 'Observable streams for HTTP results, polling and refresh'],
    ['TypeScript', '6.0.3', 'Typed data models and compile-time checking'],
    ['json-server', '1.0.0-beta.15', 'Mock REST API over a JSON file'],
    ['concurrently', '10.0.6', 'Starts the API and the development server together'],
    ['@lucide/angular', '1.70.0', 'Line icons, registered one by one'],
    ['chart.js with ng2-charts (and @angular/cdk)', '4.6.1 / 11.0.0 / 22.2.6', 'Bar chart on the administrator overview'],
    ['date-fns', '4.4.0', 'Date calculations for cut-offs and countdowns'],
    ['angularx-qrcode', '22.0.1', 'QR code generation in the browser'],
    ['@fontsource-variable/instrument-sans', '5.3.0', 'Self-hosted typeface'],
    ['Vitest with jsdom', '5.1.0 / 30.0.0', 'Unit testing'],
  ], [3300, 1900, 3826], 'Technologies, frameworks and libraries'),
  h2('2.1. Angular'),
  p('Angular is a component-based framework for single-page applications (SPAs) maintained by Google (Angular Team, n.d.). An SPA loads one HTML page and then updates parts of it with data fetched in the background, which avoids full page reloads and gives a more responsive experience; Mesbah and van Deursen (2007) describe this move from multi-page web applications to single-page AJAX interfaces and its benefits for interactivity. Angular was selected because, in one framework, it provides every feature the assignment asks to demonstrate: templates and component classes that separate the view from the controller, injectable services for data access, a router that can load feature modules lazily, reactive forms with synchronous and asynchronous validation, and HttpClient for REST calls.'),
  p('The project deliberately uses the NgModule architecture (the application was created with the --standalone=false option) rather than standalone components. NgModules make the module structure of the application explicit: every component, pipe and directive is declared in exactly one module, and each module lists what it imports and exports. This makes the "Modules and packages" criterion directly visible in the code, as Section 3.4 shows.'),
  h2('2.2. RxJS'),
  p('RxJS implements the reactive programming model of observable streams. Meijer (2012) describes this model as a way to treat asynchronous events, such as user input and server responses, as streams that can be queried and combined like data collections. In Service Day every service method returns an Observable. Polling, refreshing after a change, cancelling an outdated request and sharing one request between several screens are therefore written as stream operators (timer, switchMap, shareReplay) instead of manual timers and callbacks. Listing 3 in Section 3.5 shows the central example.'),
  h2('2.3. TypeScript'),
  p('TypeScript adds a static type system, classes, interfaces and modules to JavaScript (Bierman et al., 2014). The application defines an interface for every entity (Activity, Registration, AppNotification, User and others) in src/app/core/models/. These interfaces form the data part of the Model layer: the compiler rejects any template or service that uses a property that does not exist, and the code base contains no use of the unsafe any type.'),
  h2('2.4. json-server'),
  p('Assignment 1 does not include a back-end, but the AJAX criterion requires real asynchronous HTTP communication. json-server turns a JSON file into a REST API that supports GET, POST, PUT, PATCH and DELETE, filtering by query parameters and generated identifiers (Typicode, n.d.). The resources follow the REST style described by Fielding (2000), in which each collection (/activities, /registrations and so on) is addressed by a URL and manipulated with the standard HTTP methods. Because the front-end already speaks this REST interface, the Express server of Assignment 2 can replace json-server without changes to components or business rules.'),
  h2('2.5. Chart.js and ng2-charts'),
  p('The administrator overview needs a chart that compares places taken with capacity for each NGO. Chart.js draws charts on an HTML canvas, and ng2-charts wraps it in an Angular directive. Only the five Chart.js parts that a horizontal bar chart needs are registered, and the chart belongs to the lazily loaded administrator module, so employees never download it. The chart follows the dashboard guidance of Few (2006): a single, simple chart type, muted capacity bars, the accent colour reserved for the data that matters, and no decorative effects.'),
  h2('2.6. date-fns, angularx-qrcode, Lucide and Instrument Sans'),
  p('date-fns provides small, individually imported date functions that the business rules use to decide whether a cut-off has passed or whether today is an activity\'s date. angularx-qrcode renders the check-in QR code on a canvas, which also allows the administrator to download a printable poster without a server. @lucide/angular supplies a consistent family of thin line icons; only the 41 icons the application uses are registered, so the others are removed from the bundle. The Instrument Sans typeface is installed as a package and served with the application, so the interface does not depend on a third-party font service and works offline during a demonstration.'),
  h2('2.7. Development tooling'),
  p('concurrently starts the mock API and the Angular development server with one command (npm run dev). Vitest, the default test runner of Angular CLI 22, runs 73 unit tests of the business rules, filters, validators and presets. These tools do not change what users see, but they make the project reproducible for a reader who installs it from the instructions in Section 5.'),
);

// 3 Architecture
add(
  h1('3. System Architecture'),
  h2('3.1. Overall architecture'),
  p('Service Day is a client-side single-page application that communicates with a REST API. Figure 1 summarises the layers. The browser loads the Angular application once; afterwards, every change of page is handled by the Angular router and every piece of data is requested from the API with HttpClient. In development the API is json-server on port 3000 and the application is served on port 4200.'),
  (fig = 1, null),
  ...code(
`Browser (Angular SPA, http://localhost:4200)
 ├─ View        component templates + CSS            (presentation)
 ├─ Controller  component classes                    (events, delegation)
 ├─ Services    core/services/*  ──── HTTP (REST) ───►  json-server :3000
 │                                                      mock-api/db.json
 └─ Model       core/models/* (interfaces)
                core/rules/*  (pure business rules)`,
    'Figure 1. Layers of the application and the REST connection'),
  h2('3.2. Model–View–Controller mapping'),
  p('MVC separates the data and rules of an application (the model) from its presentation (the view) and from the code that reacts to user input (the controller); Krasner and Pope (1988) give the classic description of this paradigm for interactive user interfaces. Angular does not enforce MVC by itself, so the project applies the rules in Table 3 throughout the code.'),
  table(['Layer', 'Location', 'Responsibility and constraint'], [
    ['Model (data)', 'src/app/core/models/', 'TypeScript interfaces for every entity and view model; no logic.'],
    ['Model (rules)', 'src/app/core/rules/', 'Pure functions for availability, registration, switching, withdrawal, administrator edits, check-in and reminders. They receive the current time as a parameter and never touch HTTP or the page, which makes them unit-testable (51 tests).'],
    ['Services', 'src/app/core/services/', 'All HTTP access and the orchestration of business operations. Components never inject HttpClient; every URL is built from environment.apiUrl.'],
    ['Controller', 'component classes (*.ts)', 'Read Observables from services, react to events and delegate; each class stays under about 120 lines.'],
    ['View', 'component templates and CSS', 'Presentation only: no business rules, date calculations or filtering in templates.'],
  ], [1700, 2400, 4926], 'MVC mapping in Service Day'),
  p('One design decision deserves mention: the number of places taken on an activity is never stored. It is derived each time from the registrations whose status is "registered" (ActivityService.toViews), so it cannot drift away from the real registrations, even when several people change their places at the same time.'),
  h2('3.3. Data flow: an employee registers for an activity'),
  p('The registration flow passes through every layer and shows how they cooperate. In the view, the Register button is shown only when the rule result allows it; otherwise the template shows a disabled button together with the sentence returned by the rule (Listing 1).'),
  ...code(
`@if (s.register.ok) {
  <button type="button" class="btn btn--primary btn--block"
          (click)="pending.set('register')">Register</button>
} @else {
  <button type="button" class="btn btn--primary btn--block" disabled
          aria-describedby="action-reason">Register</button>
  <p class="locked-reason" id="action-reason">{{ s.register.reason }}</p>
}`,
    'Listing 1. The view only displays the rule result (activity-detail.html)'),
  p('When the employee confirms the dialog, the controller ActivityDetail delegates to a small flow class, which calls RegistrationService.register (Listing 2). The service does not trust the data on screen, which may be up to ten seconds old: it first fetches a fresh snapshot of activities and registrations, re-runs the pure rule canRegister, and only then sends POST /registrations and a confirmation notice. This is the overbooking guard: if someone else took the last place a moment earlier, the rule refuses and the employee sees "Someone just took the last slot. The list has been refreshed." Finally, finalize calls refresh(), so every screen subscribed to the activity stream reloads immediately. The whole chain is wrapped in runToCompletion, a small helper explained in Section 3.5, so that it always finishes once it has started.'),
  ...code(
`register(userId: string, activityId: string): Observable<Registration> {
  // Runs to the end even if the page is left mid-way (see runToCompletion).
  return runToCompletion(this.guard(userId).pipe( // fresh data right before writing
    switchMap((ctx) => {
      const target = this.find(ctx, activityId);
      const result = canRegister(target, this.taken(ctx, activityId),
                                 ctx.snapshot.now, ctx.current !== null);
      if (!result.ok) return violation(result);    // human sentence for the UI
      return this.create(userId, activityId).pipe( // POST /registrations
        switchMap((created) => this.notifications
          .notifyRegistered(userId, target, this.ngoOf(ctx, target))
          .pipe(map(() => created))),
      );
    }),
    finalize(() => this.activities.refresh()),     // every view updates, no reload
  ));
}`,
    'Listing 2. Service orchestration with the overbooking guard (registration-service.ts)'),
  h2('3.4. Modules and packages'),
  p('The application is organised into NgModules with clear responsibilities (Table 4). CoreModule provides HttpClient and the interceptors once, and its constructor throws an error if it is imported a second time, which prevents duplicate singleton services. SharedModule declares the reusable presentation components, pipes and a directive, and re-exports them so that each feature module needs only one import. The three feature modules are loaded lazily by the router with loadChildren, so the code of the administrator area, including Chart.js and the QR library, is downloaded only by administrators.'),
  table(['Module', 'Declares', 'Imports / provides'], [
    ['AppModule', 'App (root component)', 'BrowserModule, CoreModule, SharedModule, LayoutModule, AppRoutingModule'],
    ['CoreModule', '—', 'HttpClient with ErrorInterceptor and LatencyInterceptor; re-import guard'],
    ['SharedModule', '17 components, 5 pipes, the SkipLink directive', 'CommonModule, RouterModule, Lucide icons; re-exports everything'],
    ['LayoutModule', 'AppShell, Sidebar, Topbar, NotificationBell, NotFound', 'SharedModule'],
    ['AuthModule (lazy)', 'AuthLayout, Login, Register', 'SharedModule, ReactiveFormsModule, AuthRoutingModule'],
    ['EmployeeModule (lazy)', 'Home, Opportunities, ActivityDetail, MyRegistrations, Inbox, CheckIn', 'SharedModule, AreaShellModule, EmployeeRoutingModule'],
    ['AdminModule (lazy)', 'Overview, FillChart, Activities, ActivityForm, ActivityDetail, NGOs, Participation, NotificationsCenter (3 tabs), CheckIns', 'SharedModule, ReactiveFormsModule, AreaShellModule, AdminRoutingModule, ng2-charts, angularx-qrcode'],
  ], [2000, 3500, 3526], 'Angular modules'),
  p('Lazy loading has a measurable effect. The production build has an initial bundle of about 592 kB (about 126 kB when compressed for transfer), while the administrator chunk is about 309 kB and the employee chunk about 61 kB. ReactiveFormsModule is imported only by the two modules that contain forms, which kept the forms library out of the initial bundle and reduced it by about 49 kB.'),
  h2('3.5. Asynchronous communication (AJAX)'),
  p('All requests are made with Angular HttpClient inside the services, using GET, POST, PUT, PATCH and DELETE on six REST resources: users, ngos, activities, registrations, notifications and reminderSettings. Examples include PATCH /registrations/:id to mark a place as switched or to record a check-in time, PUT /ngos/:id to replace an NGO, and DELETE /activities/:id, which is allowed only when no one is registered.'),
  p('Views stay current without reloading the page through two mechanisms. First, the activity data is polled every ten seconds (Listing 3): timer restarts a ten-second clock, switchMap discards an outdated request when a new one starts, and shareReplay lets every subscribed screen share the same response. The inbox is polled every 15 seconds and the arrivals list on the check-in page every five seconds. Second, every write calls refresh(), which restarts the poll immediately on the screen that made the change. In practice, when one employee takes the last place on an activity, a second employee\'s browser shows the activity as full within ten seconds, without any action.'),
  ...code(
`readonly snapshot$ = merge(this.refresh$, this.ngoService.changed$).pipe(
  startWith(undefined),
  switchMap(() => timer(0, POLL_MS)),          // poll every 10 s; restart on refresh
  switchMap(() => this.snapshotOnce().pipe(    // GET activities, ngos, registrations
    tap(() => this.loadFailedSubject.next(false)),
    catchError(() => { this.loadFailedSubject.next(true); return EMPTY; }),
  )),
  shareReplay({ bufferSize: 1, refCount: true }), // one request for every view
);`,
    'Listing 3. Live data with polling and refresh (activity-service.ts)'),
  p('Two HTTP interceptors handle concerns that apply to every request. LatencyInterceptor adds a random delay of 250 to 600 milliseconds in development so that loading states can be seen and tested. ErrorInterceptor adds a 15-second timeout, translates network and HTTP errors into specific messages (for example, "Can\'t reach the Service Day server. Is npm run api running?"), shows each message only once in ten seconds, and passes the error on so that the page can display its own error state. A failed poll does not stop polling: when the server becomes available again, the pages recover by themselves.'),
  p('Some writes need several requests in a row. A switch, for example, marks the old place as switched (PATCH), creates the new place (POST) and stores a confirmation notice (POST). Components subscribe to these operations with takeUntilDestroyed, which cancels the subscription when the component is removed. The final verification (Section 7) showed that an employee who confirmed a switch and immediately selected another menu item could therefore stop the chain half-way: the old place was released but the new one was never created. The helper in Listing 4 solves this by starting the chain at once and connecting it to a ReplaySubject, so the requests finish on their own while the component, if it is still on screen, still receives the result. It is used for registering, switching, withdrawing, broadcasts, cancelling an activity, saving an activity that notifies participants, and marking all notices as read.'),
  ...code(
`export function runToCompletion<T>(source$: Observable<T>): Observable<T> {
  const result$ = new ReplaySubject<T>(1);
  source$.subscribe(result$);          // starts now and finishes on its own
  return result$.asObservable();       // the caller still gets the result or error
}`,
    'Listing 4. Letting a multi-request write finish (run-to-completion.ts)'),
);

// 4 Front-end design
add(
  h1('4. Front-end Design'),
  h2('4.1. Design approach'),
  p('The interface is a working dashboard, so the design aims for clarity and calm rather than decoration. It uses a cool, light grey-green background, white cards with rounded corners and no shadows at rest, and one typeface at three weights. Colour has two jobs only. Near-black ink marks what the user acts on or where they are: the primary button, the current menu item, the selected filter and the selected tab, so each group has exactly one dark item. A deep pine green marks what is being counted: chart bars, slot meters and the participation gauge. The success colour is a separate, yellower leaf green, so that an "Open" status never reads as the accent, and every status also carries a text label. The contrast of every text and background pair was calculated, and each one reaches at least 4.5:1. All colours, sizes, spacing values and corner radii are defined once as CSS custom properties in src/styles/tokens.css; component stylesheets use only these tokens, which keeps the design consistent and prepares it for a future dark theme. Figure 2 shows the administrator overview.'),
  shot('admin-overview', 'Administrator overview: key figures, fill by NGO, participation gauge and items that need attention', 7.4),
  p('Every disabled action explains why it is unavailable, for example "Registration closed on 7 Nov, 17:00." This follows the usability principle that a system should keep users informed about its state and help them recover from errors (Nielsen, 1994). Every list and table also has a loading state (skeleton placeholders), an empty state that suggests the next step, and an error state.'),
  h2('4.2. Layout with Flexbox'),
  p('All layouts use the CSS Flexible Box Layout module (World Wide Web Consortium [W3C], n.d.); the stylesheets contain 215 flex declarations and no CSS Grid, so that the use of Flexbox is unambiguous. The application shell is a flex row of a fixed-width sidebar and a flexible main column, and the main column is itself a flex column of the top bar and the page content. Card collections use a wrapping flex row in which each card grows from a minimum basis (Listing 5): four key-figure cards appear side by side on a wide screen, two on a tablet and one on a phone, without any media query.'),
  ...code(
`/* src/styles/layout.css */
.card-row { display: flex; flex-wrap: wrap; gap: var(--card-gap); }
.card-row > .kpi-slot { flex: 1 1 220px; min-width: 0; }   /* 4 → 2 → 1 cards */
.card-row > .col-main { flex: 2 1 560px; min-width: 0; }   /* wide column    */
.card-row > .col-side { flex: 1 1 320px; min-width: 0; }   /* narrow column  */

/* src/app/layout/app-shell/app-shell.css */
.shell       { display: flex; align-items: flex-start; gap: var(--shell-inset); }
.shell__main { display: flex; flex: 1; flex-direction: column; min-width: 0; }`,
    'Listing 5. Flexbox layout primitives and the application shell'),
  p('The segmented slot meter, which shows how many places remain, is also a flex row in which each slot is an equal flex item (flex: 1). In the administrator\'s activities table, a CSS container query turns each table row into a two-line flex row when the card is narrower than 880 pixels, so the table never forces the page to scroll sideways.'),
  h2('4.3. The box model'),
  p('Spacing follows one rule based on the CSS box model: padding creates space inside a component, the flex gap creates space between components, and cards carry no outer margins (Listing 6). Buttons have horizontal padding instead of a fixed width, so their width follows their label, and form fields have a one-pixel border whose contrast meets the WCAG requirement for the edges of user-interface components. All values come from a four-pixel spacing scale defined in the tokens file.'),
  ...code(
`/* Box model: padding inside the card; the gap between cards comes
   from the parent's flex gap, so cards carry no margin. */
.surface-card { background: var(--surface); border-radius: var(--radius-card);
                padding: var(--card-padding); }

/* Horizontal padding gives the button its width; no fixed width. */
.btn   { min-height: var(--control-height); padding: 0 var(--space-5); }

/* A 1px border with 3:1 contrast marks the edge of a field. */
.input { padding: 0 var(--space-4);
         border: var(--border-width) solid var(--control-border); }`,
    'Listing 6. Box-model rules (layout.css and base.css)'),
  h2('4.4. Semantic HTML and accessibility'),
  p('The templates use HTML5 elements according to their meaning: header for the top bar and section headings, nav for the menu and "back" links, main for the page content, aside for the sidebar and side panels, section and article for content groups, footer for dialog actions, fieldset and legend for groups of form fields, and table with caption for tabular data. Each page has exactly one h1 element. Every input has a label, error messages are linked to their field, and focus moves to the first invalid field when a form is submitted.'),
  p('The application targets the Web Content Accessibility Guidelines 2.2 at level AA (W3C, 2023). Text colours meet a contrast ratio of at least 4.5:1, a visible focus ring marks the keyboard position, a "Skip to content" link is the first element on every page, dialogs keep keyboard focus inside and return it to the button that opened them, and status messages are announced to screen readers through an aria-live region. An automated audit with the axe-core engine on 21 routes and four screen widths reported no violations (Section 7).'),
  h2('4.5. Responsive design'),
  p('Responsive web design adapts one layout to many screen sizes with flexible layouts and media queries (Marcotte, 2010). Service Day was checked at widths of 1440, 1024, 768 and 390 pixels. Below 900 pixels the sidebar becomes a menu that slides in from the left (Figure 3), below 600 pixels tables become stacked rows with a label on the left and the value on the right, filter buttons scroll inside their own row, and form fields use 16-pixel text so that mobile browsers do not zoom in when a field is selected. At no width does the page scroll sideways.'),
  shot('mobile-menu', 'Phone layout: the sidebar becomes a menu drawer (390 px)', 6.2, 2.6),
);

// 5 Installation guide
add(
  h1('5. Installation and Configuration Guide'),
  p('This section explains how to install and run the application on a new computer. The full guide, including Windows commands and troubleshooting, is included in the source code as docs/SETUP.md.'),
  h2('5.1. Prerequisites'),
  ...bullets([
    [['Node.js', { bold: true }], ' version 22.22.3 or later, 24.15 or later, or 26 (the project was tested with 26.12.1), downloaded from https://nodejs.org. npm 11 is included with Node.js.'],
    [['Git', { bold: true }], ', to clone the repository (https://git-scm.com).'],
    [['A current web browser', { bold: true }], ' (Chrome, Edge, Firefox or Safari). The Angular CLI is installed with the project, so a global installation is optional.'],
  ]),
  p('The installation can be checked by running node -v and npm -v in a terminal; both commands should print a version number.'),
  h2('5.2. Installing and running'),
  (steps.n = 1, null),
  ...steps([
    ['Clone the repository and open its folder: ', ['git clone https://github.com/Masatoooo/Service-Day.git', { font: MONO, size: 20 }], ' then ', ['cd Service-Day', { font: MONO, size: 20 }], '.'],
    ['Install the dependencies: ', ['npm install', { font: MONO, size: 20 }], '. This downloads the packages listed in package.json.'],
    ['Start the application: ', ['npm run dev', { font: MONO, size: 20 }], '. The command creates the demonstration database if it does not exist, starts the mock API on port 3000 and the application on port 4200.'],
    ['Open http://localhost:4200 in the browser and sign in with one of the demonstration accounts in Table 5. Press Ctrl+C in the terminal to stop both servers.'],
  ]).filter(Boolean),
  table(['Account', 'Password', 'Role and prepared situation'], [
    ['masato@kaneko.co', 'Admin#2026', 'Administrator (Masato Kaneko)'],
    ['aisha.rahman@kaneko.co', 'Volunteer#1', 'Employee whose activity is past its cut-off (changes locked)'],
    ['daniel.koh@kaneko.co', 'Volunteer#1', 'Employee with a place that can still be changed'],
    ['komangmasato@kaneko.co', 'Volunteer#1', 'Employee without a place (Komang Masato)'],
    ['marcus.tan@kaneko.co', 'Volunteer#1', 'Employee whose activity takes place today (check-in)'],
  ], [3000, 1600, 4426], 'Demonstration accounts'),
  h2('5.3. Demonstration data and configuration'),
  p('The demonstration data is generated by mock-api/seed.mjs with dates relative to the day it runs, so that one activity always takes place "today", one is about to close and one has a single place left. To start again with fresh data, stop the servers, run npm run db:reset and start npm run dev again; json-server keeps its data in memory, so a reset while it is running has no effect. The API address is defined once, as apiUrl in the files in src/environments/. Moving to the Assignment 2 back-end therefore requires changing this value and registering the prepared authentication interceptor; no component needs to change. The mock API stores passwords in plain text, which is acceptable only for this prototype; the browser itself never stores the password.'),
  p('An optional command, npm run dev:lan, makes the application reachable from a phone on the same Wi-Fi network, so that the check-in QR code can be scanned with a real camera during a demonstration.'),
);

// 6 User manual
add(
  h1('6. User Manual'),
  p('This manual describes the main tasks of each role. Section 6.1 covers functions shared by both roles, Section 6.2 the employee module and Section 6.3 the administrator module. A longer version with all steps is provided in docs/USER-MANUAL.md.'),
  h2('6.1. Shared functions'),
  h3('6.1.1. Signing in'),
  p('Visitors who are not signed in are taken to the sign-in page (Figure 4). After entering a work e-mail address and password and selecting Sign in, employees arrive on their home page and administrators on the overview. For demonstrations, the Demo accounts panel lists the prepared accounts with a Use button that fills in the form. Specific messages distinguish an unknown e-mail address from a wrong password.'),
  shot('login', 'Sign-in page with the demonstration accounts link', 4.2),
  h3('6.1.2. Creating an employee account'),
  p('New staff members select Create an account and enter their name, a work e-mail address ending in @kaneko.co, their department and a password of at least eight characters containing a number. Each field explains its own problem, and the e-mail address is checked against the server while it is typed so that an address cannot be registered twice (Figure 5). Administrator accounts cannot be created on this page.'),
  shot('register-errors', 'Account creation with field-level validation messages', 5.2),
  h3('6.1.3. Layout and notifications'),
  p('The sidebar lists the pages of the current role, a short explanation of the rules ("How it works") and Sign out. The bell in the top bar shows the number of unread notices; selecting it opens the five newest notices (Figure 6), and the count updates by itself every 15 seconds.'),
  shot('bell-dropdown', 'Notification bell with the latest notices', 4.2),
  h2('6.2. Employee module'),
  h3('6.2.1. Home'),
  p('The home page shows the employee\'s place for Service Day: the activity, the NGO, date, time and location, the cut-off ("Closes in 10 days · 18 Nov, 17:00") and the actions that are still possible (Figure 7). Below it are three key figures, the activities closing soon and the latest notices. On the day of the activity a Check in button appears.'),
  shot('employee-home', 'Employee home page with the current place and possible actions', 4.2),
  h3('6.2.2. Browsing opportunities'),
  p('The Opportunities page lists the published activities as cards with their availability, a slot meter and the cut-off (Figure 8). Employees can search, filter by service type and date, change the order, and include full or closed activities. The filters are stored in the address bar, so a refreshed or shared page keeps the selection, and the counts update every ten seconds.'),
  shot('opportunities', 'Opportunities with search, filters and live slot meters', 4.2),
  h3('6.2.3. Registering, switching and withdrawing'),
  p('Selecting an activity opens its details and the rules for registration. Selecting Register opens a dialog that repeats the date, time, location and cut-off (Figure 9); after confirmation the place is saved, the slot meter updates and a confirmation notice arrives. An employee who already has a place sees Switch to this activity instead, and the dialog states exactly which place will be left and which joined. Withdraw releases the place for someone else. After the cut-off these actions disappear and the page explains why (Figure 10). The My registrations page lists the current place and the history of changes.'),
  shot('register-confirm', 'Registration dialog summarising the activity before confirmation', 4.2),
  shot('activity-detail-locked', 'Actions locked after the cut-off, with the reason shown', 4.2),
  h3('6.2.4. Notifications and check-in'),
  p('The Notifications page lists confirmations, reminders and announcements, newest first, with All and Unread filters and Mark as read actions. On the day of the activity, the employee scans the QR code at the venue or types the eight-character code printed under it on the Check in page. The page confirms the arrival time (Figure 11), marks arrivals more than 15 minutes after the start as late, and politely refuses a second check-in.'),
  shot('check-in-success', 'Successful check-in with the arrival time', 4.2),
  h2('6.3. Administrator module'),
  h3('6.3.1. Overview and participation'),
  p('The overview (Figure 2) shows slots offered, taken and remaining, staff participation, a chart of places taken against capacity for each NGO, a participation gauge with this week\'s and last week\'s sign-ups, and the activities that need attention. The Participation page shows the share of each department and NGO, a table of every published activity, and the list of staff without a place; the administrator can select people and send them a reminder that appears in their notifications immediately (Figure 12).'),
  shot('admin-reminder-confirm', 'Sending a reminder to selected staff without a place', 4.2),
  h3('6.3.2. Managing activities and NGOs'),
  p('The Activities page lists every activity of the season with filters, a Publish button for drafts, and a menu with Unpublish, Cancel activity and Delete (Figure 13). Deleting an activity that has participants is refused with the reason and the alternative of cancelling it, which notifies the participants. New activity and Edit open a form with sections for basics, schedule, capacity and cut-off, and visibility; it checks, among other rules, that the end time is after the start time, that the cut-off is before the start, and that the maximum number of places is not below the number of people already registered (Figure 14). The NGOs page manages partner organisations in a side panel and refuses to delete an NGO that still has activities.'),
  shot('admin-activity-menu', 'Activities table with the row actions menu', 4.2),
  shot('admin-activity-form-errors', 'Activity form with specific validation messages', 6.4),
  h3('6.3.3. Notification centre'),
  p('The Notification centre has three tabs. Schedule sets the days before an activity on which reminders are planned and shows a preview of the next reminders while the settings are edited. Broadcast composes a notice for all staff, staff without a place, the participants of one activity or an NGO contact, shows how it will look in the inbox and how many people it will reach, and asks for confirmation before sending (Figure 15). History lists every notice sent, with its audience, number of recipients and sender.'),
  shot('admin-broadcast', 'Broadcast composer with an inbox preview and the number of recipients', 4.2),
  h3('6.3.4. QR check-in and attendance'),
  p('The Check-ins page lists today\'s activities first. For the selected activity it shows the QR code and its eight-character code, and offers Generate or Regenerate, Download PNG for a printable poster, and Copy link (Figure 16). The arrivals list and the counters for present, expected, not arrived and late update every five seconds, and Export CSV downloads the attendance list for a spreadsheet program.'),
  shot('admin-check-ins-arrived', 'Check-in page with the QR code and live arrivals', 4.2),
);

// 7 Testing and evaluation
add(
  h1('7. Testing and Evaluation'),
  h2('7.1. Testing'),
  p('The project was tested at three levels. First, 73 unit tests written with Vitest check the pure business rules (51 tests covering every availability state, the registration, switching and withdrawal rules, administrator edits and check-in edge cases), the opportunity filters, the form validators and the broadcast presets. Second, the ten demonstration scenarios of the project plan, such as taking the last place, the live update in a second browser window and the complete check-in, were automated with the Playwright browser automation tool. Third, a quality pass audited all 21 routes for both roles at four screen widths. Finally, a final verification repeated the installation from a fresh copy of the repository (npm ci, a production build and the unit tests) and ran all ten scenarios again on fresh data, checking both the screen and the records in the API.'),
  table(['Check', 'Result'], [
    ['Unit tests (npm test)', '73 of 73 passed'],
    ['Accessibility audit (axe-core, WCAG 2.2 A/AA rules), 21 routes × 4 widths', '0 violations'],
    ['Horizontal scrolling, clipped text, touch targets below 24 px', 'None found'],
    ['Keyboard use: skip link, visible focus, dialogs keep and return focus', '21 of 21 checks passed'],
    ['API stopped and restarted while the application is open', 'Clear error messages; automatic recovery without reloading'],
    ['Very long names, emoji and accented characters', 'Text wraps; layout remains intact'],
    ['Production build', 'No errors or warnings'],
    ['Final verification: fresh clone, build, tests and the 10 demo scenarios', '10 of 10 scenarios passed'],
    ['Switch confirmed, then another page opened 150 ms later', 'Switch completes (after the fix in Section 3.5)'],
  ], [5600, 3426], 'Summary of quality checks'),
  h2('7.2. Evaluation and limitations'),
  p('The application meets the goals set out in Section 1.2. The MVC rules are applied consistently, the layouts are built entirely with Flexbox on a single spacing system, every screen exchanges data with a REST API asynchronously and updates without reloading, and the code is organised into core, shared, layout and three lazily loaded feature modules. The final verification also found one real defect: leaving a page while a switch was still saving could release the old place without creating the new one. It was fixed with the runToCompletion helper described in Section 3.5 and confirmed by repeating the scenario. The main limitations follow from the front-end scope of Assignment 1. Even with this fix, a full page reload or a closed browser tab in the middle of a write can still interrupt it, and the overbooking guard runs in the browser, so two requests arriving at exactly the same moment could still both succeed; the server of Assignment 2 can make this check atomic. Authentication compares passwords in the browser against the mock data, reminders are previewed rather than sent by a scheduler, and NGO notices are recorded but not e-mailed. A dark theme was designed for but has not been implemented. These items are planned for the back-end in Assignment 2, which the configuration of the front-end already anticipates.'),
);

// 8 Conclusion
add(
  h1('8. Conclusion'),
  p('Service Day shows how the Angular framework and a small set of well-chosen libraries can deliver a complete, multi-role web application within the front-end scope of Assignment 1. The NgModule structure, the separation of models, rules, services, controllers and views, the Flexbox-based design system and the observable-based AJAX communication each correspond directly to a criterion of the module. Because the front-end already communicates with a REST API through a single configurable address, the application is ready to be connected to the Node.js, Express and MongoDB back-end of Assignment 2.'),
);

// References (APA 7) — every entry was checked to exist.
const refs = [
  ['Angular Team. (n.d.). ', ['Angular documentation', { italics: true }], '. Google. Retrieved November 8, 2026, from https://angular.dev'],
  ['Bierman, G., Abadi, M., & Torgersen, M. (2014). Understanding TypeScript. In R. Jones (Ed.), ', ['ECOOP 2014 – Object-Oriented Programming', { italics: true }], ' (Lecture Notes in Computer Science, Vol. 8586). Springer. https://doi.org/10.1007/978-3-662-44202-9_11'],
  ['Few, S. (2006). ', ['Information dashboard design: The effective visual communication of data', { italics: true }], '. O\'Reilly Media.'],
  ['Fielding, R. T. (2000). ', ['Architectural styles and the design of network-based software architectures', { italics: true }], ' [Doctoral dissertation, University of California, Irvine]. https://ics.uci.edu/~fielding/pubs/dissertation/top.htm'],
  ['Krasner, G. E., & Pope, S. T. (1988). A cookbook for using the model-view-controller user interface paradigm in Smalltalk-80. ', ['Journal of Object-Oriented Programming, 1', { italics: true }], '(3), 26–49.'],
  ['Marcotte, E. (2010, May 25). Responsive web design. ', ['A List Apart', { italics: true }], '. https://alistapart.com/article/responsive-web-design/'],
  ['Meijer, E. (2012). Your mouse is a database. ', ['Communications of the ACM, 55', { italics: true }], '(5), 66–73.'],
  ['Mesbah, A., & van Deursen, A. (2007). Migrating multi-page web applications to single-page AJAX interfaces. In ', ['Proceedings of the 11th European Conference on Software Maintenance and Reengineering (CSMR 2007)', { italics: true }], ' (pp. 181–190). IEEE. https://doi.org/10.1109/CSMR.2007.33'],
  ['Nielsen, J. (1994). Enhancing the explanatory power of usability heuristics. In ', ['Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (CHI \'94)', { italics: true }], ' (pp. 152–158). ACM. https://doi.org/10.1145/191666.191729'],
  ['Typicode. (n.d.). ', ['json-server', { italics: true }], ' [Computer software]. GitHub. Retrieved November 8, 2026, from https://github.com/typicode/json-server'],
  ['World Wide Web Consortium. (n.d.). ', ['CSS flexible box layout module level 1', { italics: true }], '. Retrieved November 8, 2026, from https://www.w3.org/TR/css-flexbox-1/'],
  ['World Wide Web Consortium. (2023). ', ['Web content accessibility guidelines (WCAG) 2.2', { italics: true }], ' (W3C Recommendation). https://www.w3.org/TR/WCAG22/'],
];
add(
  new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, alignment: AlignmentType.CENTER, children: [run('References', { bold: true, size: 32 })] }),
  ...refs.map((r) => new Paragraph({ spacing: { line: 360, after: 120 }, indent: { left: 720, hanging: 720 }, children: r.map((x) => (Array.isArray(x) ? run(x[0], x[1]) : run(x))) })),
);

// ── Document ────────────────────────────────────────────────────────────
const pageFooter = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 })] })] });
const doc = new Document({
  creator: 'Komang Masato Kaneko',
  title: 'Service Day — BIT306 Assignment 1 Report',
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 32, bold: true }, paragraph: { spacing: { before: 240, after: 200 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 26, bold: true }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, italics: true }, paragraph: { spacing: { before: 160, after: 80 }, keepNext: true, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    { properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children: coverSheet },
    { properties: { type: SectionType.NEXT_PAGE, page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children: titlePage },
    {
      properties: { type: SectionType.NEXT_PAGE, page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN } } },
      footers: { default: pageFooter },
      children: [
        new Paragraph({ spacing: { after: 240 }, children: [run('Table of Contents', { bold: true, size: 32 })] }),
        new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }),
        new Paragraph({ spacing: { before: 240 }, children: [run('(If the table is empty, right-click it in Word and choose Update Field → Update entire table.)', { italics: true, size: 18, color: '808080' })] }),
      ],
    },
    {
      properties: { type: SectionType.NEXT_PAGE, page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } },
      footers: { default: pageFooter },
      children: body.filter(Boolean),
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buf);
  console.log('written', OUT, (buf.length / 1024 / 1024).toFixed(1) + ' MB', 'figures:', fig, 'tables:', tab);
});
