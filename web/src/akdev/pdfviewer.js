import React from 'react';

import * as pdfjs from 'pdfjs-dist/webpack';

import * as pdfviewercss from './css/pdfviewer.css';

class PdfNavBar extends React.Component {
    render() {
        return (
            <nav className="pdf-nav">
                <div className="navbar-brand">
                    <a className="navbar-brand" href="#">pdfviewer.js</a>
                </div>
                <div className="navbar-gutter" />
                <div className="navbar-menu">
                    <ul className="navbar-nav">
                        <li className="navbar-menu-item">
                            <a aria-current="page" href="#">document: {this.props.pdfUrl}</a>
                        </li>
                    </ul>
                </div>
            </nav>
        )
    }
};

class PdfFooter extends React.Component {
    render() {
        return (
            <div className="pdf-footer">
                <p>
                    built by akdev, Powered by pdf.js, see the <a href="#">source</a>
                </p>
            </div>
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
                const viewport = page.getViewport({scale: 1.7 * window.devicePixelRatio});

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderTask = page.render({
                    canvasContext: ctx,
                    viewport
                });

                return renderTask.promise;
            })
            .catch((error) => console.log(error));


    }
    render() {
        return (
            <div className="pdf-main">
                <canvas ref={this.renderTarget} className="pdf-viewport" />
            </div>
        )
    }
};

export class PdfViewer extends React.Component {
    render() {
        return (
            <div className="pdf-root">
                <PdfNavBar pdfUrl={this.props.pdfUrl} />
                <PdfContent pdfUrl={this.props.pdfUrl} />
                <PdfFooter />
            </div>
        )
    }
};
