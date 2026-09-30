cmake_minimum_required(VERSION 3.20)

project(akdev-resume
    VERSION 1.0.0
    DESCRIPTION "This is my resume."
    HOMEPAGE_URL "https://resume.akdev.xyz"
    LANGUAGES NONE)

# This project compiles nothing, so GNUInstallDirs cannot guess a libdir and
# warns about it. Nothing here installs libraries, so pin it and move on.
set(CMAKE_INSTALL_LIBDIR "lib" CACHE PATH "Object code libraries")
include(GNUInstallDirs)

# Out-of-tree builds only - keep the source tree clean.
if(CMAKE_SOURCE_DIR STREQUAL CMAKE_BINARY_DIR)
    message(FATAL_ERROR "In-tree builds are not supported. Use: cmake -B build")
endif()

option(RESUME_BUILD_PDF "Render the LaTeX resume with xelatex" ON)
option(RESUME_BUILD_WEB "Build the web pdf viewer" ON)
option(RESUME_STAGE_DOCS "Copy build artifacts into the published docs/ directory" ON)

set(RESUME_DOCS_DIR "${PROJECT_SOURCE_DIR}/docs"
    CACHE PATH "Directory the publishable site is staged into")
set(RESUME_NODE_PACKAGE_MANAGER "auto"
    CACHE STRING "Node package manager to build web/ with: auto, pnpm or npm")
set_property(CACHE RESUME_NODE_PACKAGE_MANAGER PROPERTY STRINGS auto pnpm npm)

set(WEB_SOURCE_DIR "${PROJECT_SOURCE_DIR}/web")
set(WEB_BUILD_DIR "${PROJECT_BINARY_DIR}/web")

set(stage_docs_deps "")

#
# resume-pdf - render src/main.tex
#
if(RESUME_BUILD_PDF)
    find_program(XELATEX_EXECUTABLE xelatex REQUIRED)
    find_program(NODE_EXECUTABLE node REQUIRED)

    # The resume content lives in resume.json; main.tex only lays it out and
    # \input's the macros generated here.
    add_custom_command(
        OUTPUT "${PROJECT_BINARY_DIR}/resume-data.tex"
        COMMAND "${NODE_EXECUTABLE}" "${PROJECT_SOURCE_DIR}/util/gen-tex.mjs"
                "${PROJECT_SOURCE_DIR}/src/resume.json"
                "${PROJECT_BINARY_DIR}/resume-data.tex"
        DEPENDS "${PROJECT_SOURCE_DIR}/src/resume.json"
                "${PROJECT_SOURCE_DIR}/util/gen-tex.mjs"
        COMMENT "Generating resume-data.tex from resume.json"
        VERBATIM)

    # xelatex is run twice: the first pass writes the aux files the
    # progressbar/textpos macros need, the second one produces the pdf.
    # TEXINPUTS lets main.tex find the generated file; the trailing path
    # separator keeps the default search path.
    set(xelatex_env "${CMAKE_COMMAND}" -E env "TEXINPUTS=${PROJECT_BINARY_DIR}:")
    add_custom_command(
        OUTPUT "${PROJECT_BINARY_DIR}/main.pdf"
        COMMAND ${xelatex_env} "${XELATEX_EXECUTABLE}"
                -halt-on-error -interaction=nonstopmode
                "--output-directory=${PROJECT_BINARY_DIR}" -no-pdf main.tex
        COMMAND ${xelatex_env} "${XELATEX_EXECUTABLE}"
                -halt-on-error -interaction=nonstopmode
                "--output-directory=${PROJECT_BINARY_DIR}" main.tex
        WORKING_DIRECTORY "${PROJECT_SOURCE_DIR}/src"
        DEPENDS "${PROJECT_SOURCE_DIR}/src/main.tex"
                "${PROJECT_SOURCE_DIR}/src/friggeri-cv.cls"
                "${PROJECT_BINARY_DIR}/resume-data.tex"
        COMMENT "Rendering main.pdf with xelatex"
        VERBATIM)

    add_custom_target(resume-pdf ALL DEPENDS "${PROJECT_BINARY_DIR}/main.pdf")
    list(APPEND stage_docs_deps "${PROJECT_BINARY_DIR}/main.pdf")

    install(FILES "${PROJECT_BINARY_DIR}/main.pdf"
            DESTINATION "${CMAKE_INSTALL_DATADIR}/akdev"
            RENAME resume.pdf)
endif()

#
# resume-launcher - the akdev-resume wrapper script
#
# cmake -E copy cannot set a mode, and the launcher has to stay executable.
find_program(INSTALL_EXECUTABLE install REQUIRED)

add_custom_command(
    OUTPUT "${PROJECT_BINARY_DIR}/akdev-resume"
    COMMAND "${INSTALL_EXECUTABLE}" -m 0755
            "${PROJECT_SOURCE_DIR}/src/bin/akdev-resume.sh"
            "${PROJECT_BINARY_DIR}/akdev-resume"
    DEPENDS "${PROJECT_SOURCE_DIR}/src/bin/akdev-resume.sh"
    COMMENT "Staging akdev-resume launcher"
    VERBATIM)

add_custom_target(resume-launcher ALL DEPENDS "${PROJECT_BINARY_DIR}/akdev-resume")
list(APPEND stage_docs_deps "${PROJECT_BINARY_DIR}/akdev-resume")

install(PROGRAMS "${PROJECT_BINARY_DIR}/akdev-resume"
        DESTINATION "${CMAKE_INSTALL_BINDIR}")

#
# man page
#
find_program(GZIP_EXECUTABLE gzip REQUIRED)

file(WRITE "${PROJECT_BINARY_DIR}/akdev-resume.1"
".TH AKDEV-RESUME 1 \"\" \"${PROJECT_NAME} ${PROJECT_VERSION}\" \"User Commands\"
.SH NAME
akdev-resume \\- open akdev's resume
.SH SYNOPSIS
.B akdev-resume
.SH DESCRIPTION
Opens the installed copy of the resume with the desktop's default pdf viewer.
.SH SEE ALSO
${PROJECT_HOMEPAGE_URL}
")

add_custom_command(
    OUTPUT "${PROJECT_BINARY_DIR}/akdev-resume.gz"
    COMMAND "${GZIP_EXECUTABLE}" -c -n "${PROJECT_BINARY_DIR}/akdev-resume.1"
            > "${PROJECT_BINARY_DIR}/akdev-resume.gz"
    DEPENDS "${PROJECT_BINARY_DIR}/akdev-resume.1"
    COMMENT "Compressing man page"
    VERBATIM)

add_custom_target(resume-man ALL DEPENDS "${PROJECT_BINARY_DIR}/akdev-resume.gz")

# The rpm spec expects man1/akdev-resume.gz, not the usual akdev-resume.1.gz.
install(FILES "${PROJECT_BINARY_DIR}/akdev-resume.gz"
        DESTINATION "${CMAKE_INSTALL_MANDIR}/man1")

#
# resume-web - copy web/ out of the source tree, then build it there
#
if(RESUME_BUILD_WEB)
    if(RESUME_NODE_PACKAGE_MANAGER STREQUAL "auto")
        if(EXISTS "${WEB_SOURCE_DIR}/pnpm-lock.yaml")
            set(node_pm pnpm)
        else()
            set(node_pm npm)
        endif()
    else()
        set(node_pm "${RESUME_NODE_PACKAGE_MANAGER}")
    endif()

    find_program(NODE_PM_EXECUTABLE "${node_pm}" REQUIRED)

    if(node_pm STREQUAL "pnpm")
        set(node_install_args install --frozen-lockfile)
    else()
        set(node_install_args ci)
    endif()

    # Everything the web build needs; node_modules, dist and the package
    # manager store are deliberately left behind.
    set(web_copy_candidates
        package.json package-lock.json pnpm-lock.yaml pnpm-workspace.yaml
        index.html .babelrc .npmrc
        webpack.config.js vite.config.js vite.config.ts
        tsconfig.json tsconfig.node.json)

    set(web_copy_commands "")
    set(web_copy_depends "")
    foreach(entry IN LISTS web_copy_candidates)
        if(EXISTS "${WEB_SOURCE_DIR}/${entry}")
            list(APPEND web_copy_commands
                COMMAND "${CMAKE_COMMAND}" -E copy_if_different
                        "${WEB_SOURCE_DIR}/${entry}" "${WEB_BUILD_DIR}/${entry}")
            list(APPEND web_copy_depends "${WEB_SOURCE_DIR}/${entry}")
        endif()
    endforeach()

    file(GLOB_RECURSE web_src_files CONFIGURE_DEPENDS "${WEB_SOURCE_DIR}/src/*")
    if(EXISTS "${WEB_SOURCE_DIR}/public")
        file(GLOB_RECURSE web_public_files CONFIGURE_DEPENDS "${WEB_SOURCE_DIR}/public/*")
        list(APPEND web_copy_commands
            COMMAND "${CMAKE_COMMAND}" -E copy_directory
                    "${WEB_SOURCE_DIR}/public" "${WEB_BUILD_DIR}/public")
        list(APPEND web_copy_depends ${web_public_files})
    endif()

    # WORKING_DIRECTORY has to exist before the recipe runs, so it cannot be
    # created by one of the COMMANDs below.
    file(MAKE_DIRECTORY "${WEB_BUILD_DIR}")

    add_custom_command(
        OUTPUT "${WEB_BUILD_DIR}/dist/index.html"
        COMMAND "${CMAKE_COMMAND}" -E rm -rf "${WEB_BUILD_DIR}/dist"
        COMMAND "${CMAKE_COMMAND}" -E copy_directory
                "${WEB_SOURCE_DIR}/src" "${WEB_BUILD_DIR}/src"
        ${web_copy_commands}
        COMMAND "${NODE_PM_EXECUTABLE}" ${node_install_args}
        COMMAND "${NODE_PM_EXECUTABLE}" run build
        WORKING_DIRECTORY "${WEB_BUILD_DIR}"
        DEPENDS ${web_copy_depends} ${web_src_files}
        COMMENT "Building web/ with ${node_pm}"
        VERBATIM)

    add_custom_target(resume-web ALL DEPENDS "${WEB_BUILD_DIR}/dist/index.html")
    list(APPEND stage_docs_deps "${WEB_BUILD_DIR}/dist/index.html")
endif()

#
# docs/ staging - what gets published to resume.akdev.xyz
#
if(RESUME_STAGE_DOCS)
    set(stage_docs_commands
        COMMAND "${CMAKE_COMMAND}" -E make_directory "${RESUME_DOCS_DIR}")

    if(RESUME_BUILD_WEB)
        list(APPEND stage_docs_commands
            COMMAND "${CMAKE_COMMAND}" -E copy_directory
                    "${WEB_BUILD_DIR}/dist" "${RESUME_DOCS_DIR}")
    endif()
    if(RESUME_BUILD_PDF)
        list(APPEND stage_docs_commands
            COMMAND "${CMAKE_COMMAND}" -E copy_if_different
                    "${PROJECT_BINARY_DIR}/main.pdf" "${RESUME_DOCS_DIR}/main.pdf")
    endif()
    list(APPEND stage_docs_commands
        COMMAND "${INSTALL_EXECUTABLE}" -m 0755
                "${PROJECT_BINARY_DIR}/akdev-resume" "${RESUME_DOCS_DIR}/akdev-resume")

    add_custom_target(stage-docs ALL
        ${stage_docs_commands}
        DEPENDS ${stage_docs_deps}
        COMMENT "Staging artifacts into ${RESUME_DOCS_DIR}"
        VERBATIM)
endif()

#
# rpm - convenience wrapper around rpkg, not part of ALL
#
find_program(RPKG_EXECUTABLE rpkg)
if(RPKG_EXECUTABLE)
    add_custom_target(rpm
        COMMAND "${CMAKE_COMMAND}" -E make_directory "${PROJECT_BINARY_DIR}/rpm"
        COMMAND "${RPKG_EXECUTABLE}" local
                --spec "${PROJECT_SOURCE_DIR}/rpm/akdev-resume.spec.rpkg"
                --outdir "${PROJECT_BINARY_DIR}/rpm"
        WORKING_DIRECTORY "${PROJECT_SOURCE_DIR}"
        COMMENT "Building rpm into ${PROJECT_BINARY_DIR}/rpm"
        USES_TERMINAL
        VERBATIM)
endif()
