'use strict';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import React from 'react';
import ReactDOM from 'react-dom';

import * as appcss from './css/app.css';
import { PdfViewer } from './akdev/pdfviewer';

const pdfUrl = window.location.hash.slice(1) || "https://example.com";

console.log(`fetching pdf from ${pdfUrl}`);

ReactDOM.render(
    <PdfViewer pdfUrl={pdfUrl} />,
    document.querySelector("#app-root")
);
