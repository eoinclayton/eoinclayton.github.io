---
layout: default
---

<div class="post-list">
  {% for post in site.posts %}
    <a class="post-card" href="{{ post.url }}">
      <span class="post-title">{{ post.title }}</span>
      <span class="post-date">{{ post.date | date: "%Y-%m-%d" }}</span>
    </a>
  {% endfor %}
</div>
