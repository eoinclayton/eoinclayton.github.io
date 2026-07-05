---
name: proofread-post
description: Proofread a Jekyll/GitHub Pages blog post and convert Obsidian-flavoured syntax that Jekyll cannot render. Use when the user adds or edits posts under _posts/ and asks to proofread, review, or "fix up" a post, or before publishing. Handles Obsidian image embeds, callouts, Liquid-eaten {{ }}, code blocks inside lists, and typos — then verifies the rendered HTML.
---

# Proofread a blog post

This blog is written in Obsidian and published via GitHub Pages (Jekyll → Liquid →
kramdown/GFM). Posts routinely contain Obsidian syntax that renders wrong. See the repo
`CLAUDE.md` for the full background; this skill is the checklist to run.

## Scope

Default to the post(s) the user names, or the added/modified files under `_posts/` in
`git status`. Read each target post fully before editing.

## Two kinds of fix — do both

### A. Correctness / rendering fixes (the important part)

Apply every one of these that occurs. Each is something that renders wrong on GitHub Pages
even though it looks fine in Obsidian.

1. **Obsidian image embeds** — `![[Pasted image ….png]]` → `![](/assets/images/<file>.png)`.
   Obsidian pasted-image filenames contain spaces; **rename the files** to lowercase kebab-case
   with `git mv` (e.g. `"Pasted image 20260705110120.png"` → `pasted-image-20260705110120.png`)
   and update every reference. Don't `%20`-encode — rename.

2. **Callouts** — `> [!NOTE]`, `> [!NOTE] Title`, `> [!WARNING]`, etc. render as blockquotes
   containing literal `[!NOTE]` text. Convert to a bold-labelled blockquote:
   `> **Note:** …`, `> **Note — Title**`, `> **Warning**`.

3. **`{{ }}` eaten by Liquid** — any `{{ … }}` in the post (even inside code) is evaluated by
   Liquid before kramdown, so `${{ secrets.FOO }}` → `$` and `{{process.env.FOO}}` → empty.
   Wrap each code block that contains `{{ }}` in `{% raw %}` / `{% endraw %}` (the tags on their
   own lines, indented to match the surrounding block).

4. **Code blocks inside lists** — a fence directly under a numbered/bulleted line (no blank
   line, column 0) gets absorbed as text; a column-0 fence with a blank line splits the list and
   restarts numbering at 1. Fix: blank line after the list text, then indent the fence AND every
   code line by 3 spaces so it sits inside the `1. ` item and numbering stays continuous.

5. **Lists swallowed by a preceding paragraph** — a sub-list indented under a plain paragraph
   merges into it. Separate with a blank line and use a normal list. (Sub-lists under a real
   list item are fine — leave those.)

6. **Bare code fences** — add a language hint (`javascript`, `typescript`, `yaml`, `bash`,
   `text`) for syntax highlighting.

### B. Proofreading

Fix typos, missing/duplicated words, and obvious grammar slips (its/it's, "try hit" →
"try to hit", "setup" vs "set up", "an"/"and"). Preserve the author's voice, British spellings,
and any term that matches a real product/UI label (e.g. Cloudflare's "enrolment") — flag those
rather than "correcting" them. Don't rewrite for style; this is a proofread, not an edit.

## Verify before declaring done

Jekyll can't run under system Ruby here, so render the post through the same kramdown+GFM
parser GitHub Pages uses and inspect the HTML:

```bash
export GEM_HOME=$HOME/.gem/ruby/2.6.0   # needs: gem install --user-install kramdown -v 2.3.2 kramdown-parser-gfm -v 1.1.0
ruby -e '
require "kramdown"; require "kramdown-parser-gfm"
raw = File.read(ARGV[0]); body = raw.sub(/\A---.*?---\n/m, "")
out=""; in_raw=false
body.each_line do |line|
  in_raw=true  if line.sub!(/\{%\s*raw\s*%\}/,"")
  in_raw=false if line.sub!(/\{%\s*endraw\s*%\}/,"")
  line = line.gsub(/\{\{.*?\}\}/,"") unless in_raw
  out << line
end
puts Kramdown::Document.new(out, input: "GFM", hard_wrap: false).to_html
' _posts/<post>.md
```

Confirm in the output:
- No literal `![[` , `[!NOTE]`, or leftover Obsidian syntax.
- Every `{{ }}` expression the post intends is still present (secrets not reduced to `$`).
- Every `<pre>` code block sits inside its `<li>`; each section is one continuous `<ol>`.
- Images render as `<img src="/assets/images/…">` and each referenced file exists on disk.

If the kramdown gems aren't installed, install them with the `gem install --user-install`
line in the comment above.

## Report

Summarise the fixes grouped as (1) Obsidian→Jekyll rendering conversions and (2) proofreading,
and list anything you deliberately left alone (e.g. product-accurate spellings). Do not commit
or push unless the user asks — the repo publishes on push.
