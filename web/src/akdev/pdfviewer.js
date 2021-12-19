import React from 'react';

import * as pdfjs from 'pdfjs-dist';

import * as pdfviewercss from './css/pdfviewer.css';

class PdfNavBar extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-expand navbar-light bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">pdfviewer.js</a>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav">
                            <li><a className="nav-link active" aria-current="page" href="#">{this.props.pdfUrl}</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }
};

class PdfFooter extends React.Component {
    render() {
        return (
            <span></span>
        )
    }
};

class PdfContent extends React.Component {
    constructor(props) {
        super(props);
        this.renderTarget = React.createRef();
    }
    componentDidMount() {
        const canvas = this.renderTarget.current;
        const ctx = this.renderTarget.current.getContext("2d");
        ctx.fillText(`fetching ${this.props.pdfUrl}...`, 20, 100);

        const documentLoadTask = pdfjs.getDocument(this.props.pdfUrl);
        documentLoadTask.promise
            .then((doc) => doc.getPage(1))
            .then((page) => {
                const viewport = page.getViewport({scale: 1.0});

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                page.render({
                    canvasContext: ctx,
                    viewport
                });
            })
            .catch((error) => console.log(error));


    }
    render() {
        return (
            <canvas width="720" height="1280"ref={this.renderTarget} className="pdf-viewport" />
        )
    }
};

export class PdfViewer extends React.Component {
    render() {
        return (
            <div className="pdf-root container-fluid">
                <div className="row pdf-nav">
                    <PdfNavBar pdfUrl={this.props.pdfUrl} />
                </div>
                <div className="row pdf-main">
                    <PdfContent pdfUrl={this.props.pdfUrl} />
                </div>
                <div className="row pdf-footer">
                    <PdfFooter />
                </div>
            </div>
        )
    }
};
