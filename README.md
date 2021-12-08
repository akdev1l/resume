# akdev's resume

## Problem

Keeping my resume up to date is a shore. I hate dealing with word processing software.
versioning in most word processing software sucks and diffing capabilities are limited.

As a result I used to not keep my resume up to date and creating resumes adhoc whenever
I needed one. 


## Solution (maybe?)

Write the resume in LaTeX so that the entire layout can be described in text form. This
allows to apply a more traditional development style to resume writing, while also encouraging
me to learn LaTeX.

As result I have created this project. It contains my resume in LaTeX format along with a basic
cd/ci pipeline that builds each commit.

I can now keep track of all the changes and diff between versions. :) 


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
