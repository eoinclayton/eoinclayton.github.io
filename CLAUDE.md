# Blog (GitHub Pages + Jekyll)

Personal tech blog "Technicalities 2.0" — served at https://blog.eoinclayton.com via
**GitHub Pages** (Jekyll, `jekyll-theme-midnight`). Posts are written in **Obsidian**
first (see `.obsidian/`) and then committed here, so posts routinely arrive with
Obsidian-flavoured syntax that Jekyll does not understand. The single most common task
in this repo is proofreading a new post and converting that syntax.

## Repo layout

- `_posts/YYYY-MM-DD-slug.md` — the posts. Front matter is `layout: post`, `title:`, `date:`.
- `assets/images/` — post images. Referenced as `![](/assets/images/<file>.png)` (root-absolute).
- `_config.yml` — Jekyll config. Markdown is kramdown with the **GFM** input parser (GitHub Pages default).
- `_layouts/`, `index.md`, `about.md` — theme/layout plumbing. Rarely touched.

## The rendering pipeline (why "valid markdown" can still render wrong)

GitHub Pages processes every post as: **Liquid templating → kramdown (GFM) → HTML**.
Both stages have gotchas that don't show up in Obsidian's preview. Verified against
kramdown 2.3.2 + kramdown-parser-gfm (the same combo GitHub Pages uses).

## Obsidian → GitHub Pages conversions (do these on every new post)

1. **Image embeds.** Obsidian writes `![[Pasted image 20260705110120.png]]` (wikilink embed).
   kramdown renders that as literal text. Convert to `![](/assets/images/<file>.png)`.
   - Obsidian's pasted images have **spaces** in their filenames. Spaces break the markdown
     URL, so **rename the files** to kebab-case (`git mv "Pasted image ….png" pasted-image-….png`)
     and update the references — don't just `%20`-encode. Kebab-case, lowercase, no spaces.

2. **Callouts.** Obsidian callouts (`> [!NOTE]`, `> [!NOTE] Some Title`, `> [!WARNING]`)
   are NOT the same as GitHub's alert syntax, and kramdown renders neither as a fancy box —
   you get a blockquote containing the literal `[!NOTE]` text. Convert to a plain blockquote
   with a bold label: `> **Note:** …` or `> **Warning**` on its own line.

3. **`{{ … }}` gets eaten by Liquid.** Any `{{ }}` in a post (even inside a code block) is
   evaluated by Liquid as a template variable *before* kramdown runs. `${{ secrets.FOO }}`
   (GitHub Actions) renders as just `$`; `{{process.env.FOO}}` (Bruno) vanishes entirely.
   **Fix:** wrap any code block containing `{{ }}` in `{% raw %}` / `{% endraw %}`:
   ```
   {% raw %}
   ```yaml
   FOO: ${{ secrets.FOO }}
   ```
   {% endraw %}
   ```

4. **Code blocks inside numbered/bulleted lists.** A fenced code block placed at column 0
   directly under a list line (no blank line) gets absorbed into the list paragraph as plain
   text, and a fence at column 0 *with* a blank line splits the list (numbering restarts at 1).
   **Fix:** leave a blank line after the list text, then **indent the fence AND every code line
   by 3 spaces** (aligning with the content of a `1. ` marker). This keeps the code inside the
   step and the numbering continuous. Internal blank lines within the code are fine.
   ```
   1. Do the thing:

      ```yaml
      code: here
      ```

   2. Next step
   ```

5. **Tab/space-indented lists under a paragraph.** Obsidian sub-lists indented under a plain
   paragraph (not under a list item) get swallowed into the paragraph. Separate the list from
   the paragraph with a blank line and use a normal list. (Indented sub-lists *under a real
   list item* are fine — kramdown nests them correctly.)

6. **Code fence language hints.** Add a language to bare ```` ``` ```` fences
   (`javascript`, `typescript`, `yaml`, `bash`, `text`) so Rouge highlights them.

## Verifying a change actually renders

Jekyll won't run under the system Ruby (2.6; `github-pages` needs 3.x). To check rendering,
render the post through kramdown+GFM directly (installed to the user gem dir):

```bash
export GEM_HOME=$HOME/.gem/ruby/2.6.0   # kramdown 2.3.2 + kramdown-parser-gfm 1.1.0 live here
ruby -e '
require "kramdown"; require "kramdown-parser-gfm"
raw = File.read(ARGV[0]); body = raw.sub(/\A---.*?---\n/m, "")
# crude Liquid simulation: honour {% raw %}, blank out other {{ }}
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

Things to check in the HTML: `{{ }}` expressions survived; every `<pre>` sits inside its
`<li>`; each section is one continuous `<ol>` (not fragmented into several restarting at 1);
images are `<img src="/assets/images/…">`.

## Conventions

- Images: root-absolute `/assets/images/…`, kebab-case filenames, no spaces.
- Post filenames: `YYYY-MM-DD-slug.md`, dated the 1st of the month in this blog's cadence.
- Don't commit or push unless asked. This repo publishes on push to the default branch.
