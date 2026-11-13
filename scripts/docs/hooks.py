"""MkDocs hooks: serve docs/ written for github.com unchanged."""

import re
import textwrap
from pathlib import Path

from mkdocs.structure.files import File


# GitHub renders markdown in any <details>, md_in_html only in a top-level one:
# a <details> in a list item stays raw. pymdownx.details nests anywhere.
DETAILS = re.compile(
    r"^(?P<indent>[ ]*)<details>\s*<summary>(?P<title>.*?)</summary>[ ]*\n(?P<body>.*?)^[ ]*</details>[ ]*$",
    re.S | re.M)


LIST_ITEM = re.compile(r"[ ]*(?:[-*+]|\d+\.)[ ]")


def _details(match: re.Match) -> str:
    # Indented under a list item: its content, at a multiple of the 2-space
    # list indent. Indented elsewhere: GitHub's leeway, top level.
    previous = match.string[:match.start()].rstrip().rpartition("\n")[2]
    in_list = previous.startswith(" ") or LIST_ITEM.match(previous)
    indent = " " * (len(match["indent"]) // 2 * 2) if in_list else ""
    title = re.sub(r"<[^>]+>|\s+", lambda m: " " if m[0].isspace() else "", match["title"]).strip()
    body = textwrap.indent(textwrap.dedent(match["body"]), indent + "    ")
    return f'\n{indent}??? note "{title.replace(chr(34), chr(39))}"\n\n{body}'


# "Back to top" links serve GitHub readers; the site has Material's own button.
BACK_TO_TOP = re.compile(r'^(?:\[🔼 Back to top\](?:: #top)?|<a id="top"></a>)\n\n?', re.M)


DARK_HDR_LOGO = re.compile(r"images/epc-logo/epc-icon-black-hdr-[0-9a-f]{6}\.jpg")


# The site documents stable releases: their release candidates stay on GitHub.
RC_SECTION = re.compile(r"^## [^\n]*-rc\d+\)?\n.*?(?=^## |\Z)", re.S | re.M)


# A lone <br /> spaces blocks out on GitHub; the site's blocks have margins.
LONE_BR = re.compile(r"^[ \t]*<br\s*/?>[ \t]*\n", re.M)


# <picture> follows the OS scheme, Material's toggle only hides #only-light/dark.
PICTURE = re.compile(
    r'<picture>(?P<sources>(?:\s*<source[^>]*>)*)\s*<img src="(?P<src>[^"]+)"(?P<attrs>.*?)/?>\s*</picture>',
    re.S)
SOURCE = re.compile(r'<source\s+media="([^"]+)"\s+srcset="([^"]+)"\s*/?>')
DARK = "(prefers-color-scheme: dark)"


def _picture(match: re.Match) -> str:
    # Split on the theme: one <picture> per side, each keeping its other conditions.
    sources = SOURCE.findall(match["sources"])
    if not any(DARK in media for media, _ in sources):
        return match[0]
    dark = next((srcset for media, srcset in sources if media == DARK), match["src"])

    def tag(media: str, srcset: str) -> str:
        return f'<source media="{media}" srcset="{srcset}">'

    light_extra = "".join(tag(m, s) for m, s in sources if DARK not in m)
    dark_extra = "".join(tag(m.replace(f"{DARK} and ", ""), s) for m, s in sources if DARK in m and m != DARK)
    return (f'<picture>{light_extra}<img src="{match["src"]}#only-light"{match["attrs"]}/></picture>'
            f'<picture>{dark_extra}<img src="{dark}#only-dark"{match["attrs"]}/></picture>')


def _local(markdown: str, repo_url: str, site_url: str) -> str:
    # Absolute links to this repo's docs (README.md is also read on HACS)
    # become site-relative.
    for prefix in (f"{repo_url}/blob/main/docs/", f"{repo_url}/tree/main/docs/"):
        markdown = markdown.replace(prefix, "")
    raw = repo_url.replace("https://github.com/", "https://raw.githubusercontent.com/")
    markdown = markdown.replace(f"{raw}/main/docs/", "")
    # The README links to the site (HACS shows it): back to the source pages.
    markdown = re.sub(re.escape(site_url) + r"([\w-]+)/", r"\1.md", markdown)
    return DETAILS.sub(_details, LONE_BR.sub("", markdown))


def on_files(files, config):
    readme = Path(config.config_file_path).parent / config.extra.get("readme", "README.md")
    content = _local(readme.read_text(encoding="utf-8"), config.repo_url, config.site_url)
    content = DARK_HDR_LOGO.sub(config.extra["logo_dark_hdr"], content)
    files.append(File.generated(config, "index.md", content=content))
    changelog = (Path(config.config_file_path).parent / "CHANGELOG.md").read_text(encoding="utf-8")
    changelog = RC_SECTION.sub("", changelog).replace("](docs/", "](")
    files.append(File.generated(config, "changelog.md", content=_local(changelog, config.repo_url, config.site_url)))
    return files


def on_page_markdown(markdown, page, config, files):
    markdown = BACK_TO_TOP.sub("", markdown)
    markdown = _local(markdown, config.repo_url, config.site_url).replace("../README.md", "index.md")
    markdown = PICTURE.sub(_picture, markdown)
    # Raw HTML paths are not rewritten by MkDocs: a page is served one folder down.
    up = "../" * page.url.count("/")
    return re.sub(r'\b(src|srcset|href)="(?![a-z]+:|/|#|\.\./)', rf'\1="{up}', markdown)
