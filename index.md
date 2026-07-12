---
layout: default
---

<section class="hero">
  <h1 class="visually-hidden">Technicalities 2.0</h1>
  <div class="matrix" data-text="TECHNICALITIES 2.0" data-split="TECHNICALITIES|2.0">
    <p class="matrix-fallback" aria-hidden="true">Technicalities 2.0</p>
    <canvas aria-hidden="true"></canvas>
  </div>
  <p class="tagline"><span class="prompt">&gt;</span>Notes on software, systems, and what the docs leave out.<span class="cursor" aria-hidden="true"></span></p>
  <p class="statusline">Eoin Clayton · Canberra AU · {{ site.posts | size }} entries · last entry {{ site.posts.first.date | date: "%Y-%m-%d" }}</p>
</section>

<section class="log">
  <div class="log-head">
    <span>Index</span>
    <span>{{ site.posts | size }} entries</span>
  </div>
  {% for post in site.posts %}
  <a class="log-row" href="{{ post.url | relative_url }}">
    <canvas class="log-glyph" data-char="{{ post.title | slice: 0 }}" aria-hidden="true"></canvas>
    <span class="log-title">{{ post.title }}</span>
    <span class="log-leader" aria-hidden="true"></span>
    <time class="log-date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
  </a>
  {% endfor %}
</section>
