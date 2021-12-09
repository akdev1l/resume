# akdev's resume


You can find the build output [here](https://akdev1l.github.io/resume/main.pdf) or [here](/docs/main.pdf).

## Problem

Keeping my resume up to date is a chore. I do not enjoy dealing with word processing software.
Versioning in most word processing software also has very interesting interfaces and diffing capabilities are limited.

As a result I used to not keep my resume up to date and creating resumes adhoc whenever
I needed one. 

## Solution (maybe?)

Write the resume in LaTeX so that the entire layout can be described in text form. This
allows to apply a more traditional development style to resume writing, while also encouraging
me to learn LaTeX.

As result I have created this project. It contains my resume in LaTeX format along with a basic
cd/ci pipeline that builds each commit.

I can now keep track of all the changes and diff between versions. I also keep my resume up to
date because I find learning LaTeX quite entertaining. :)


## How to build


Dependencies are captured in the Containerfile, it should be as easy as:


```
$ podman build -t akdev/resume-writer:latest . 
$ podman run -v $PWD:$PWD -w $PWD akdev/resume-write:latest make
```

## Github Workflows

Currently there is a workflow that builds the pdf on each commit. It needs to be modified to publish the 
resulting artifact on github pages.

In the future a linter may be added if such a thing exists for LaTeX documents.

## Acknowledgements


This project uses the [Friggeri CV Template hosted at OverLeaf](https://www.overleaf.com/latex/templates/friggeri-cv-template/hmnchbfmjgqh) as base. I customized it somewhat heavily.

Original by Adrien Friggeri (MIT license) with modifications by Alejandro Pérez Londoño (CC-BY)


## License

All the code here is released under the GPLv3, you can find a copy at [GNU's website](https://www.gnu.org/licenses/gpl-3.0.en.html) or in the LICENSE file.
