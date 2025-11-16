---
layout: page
permalink: /media/
title: Media
description: Press coverage and media articles about my research and work
nav: true
---

There have been some media (press and institute) coverage of my work as well as the work we do as SA4S group at SERC, IIIT Hyderabad. Here are some of them:

<div class="media-cards">
  {% for article in site.data.media %}
  <div class="media-card">
    <div class="media-card-header">
      <div class="media-type-badge">{{ article.type }}</div>
      <div class="media-date">{{ article.date | date: "%B %Y" }}</div>
    </div>
    
    <div class="media-card-content">
      <h3 class="media-title">
        <a href="{{ article.url }}" target="_blank" rel="noopener noreferrer">
          {{ article.title }}
        </a>
      </h3>
      
      <p class="media-description">{{ article.description }}</p>
      
      <div class="media-source">
        <i class="fas fa-external-link-alt"></i>
        {{ article.source }}
      </div>
    </div>
    
    <div class="media-card-footer">
      <a href="{{ article.url }}" target="_blank" rel="noopener noreferrer" class="media-link-btn">
        <i class="fas fa-external-link-alt"></i>
        Read More
      </a>
    </div>
  </div>
  {% endfor %}
</div>