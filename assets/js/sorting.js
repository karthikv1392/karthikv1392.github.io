// Sorting functionality for publications and content
class ContentSorter {
  constructor() {
    this.init();
  }

  init() {
    // Add sorting controls to publications page
    this.addSortingControls();
    this.bindEvents();
  }

  addSortingControls() {
    // Check if we're on a page that needs sorting
    const publicationsContainer = document.querySelector('.publications');
    const talksContainer = document.querySelector('#recent-talks');
    
    if (publicationsContainer) {
      this.addSortingUI(publicationsContainer, 'publications');
    }
    
    if (talksContainer) {
      this.addSortingUI(talksContainer, 'talks');
    }
  }

  addSortingUI(container, type) {
    const sortingDiv = document.createElement('div');
    sortingDiv.className = 'sorting-controls mb-4';
    sortingDiv.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <label for="sort-select" class="mb-0 fw-bold">Sort by:</label>
        <select id="sort-select" class="form-select form-select-sm" style="width: auto;">
          <option value="year-desc">Year (Newest First)</option>
          <option value="year-asc">Year (Oldest First)</option>
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
        </select>
        <button id="reset-sort" class="btn btn-outline-secondary btn-sm">Reset</button>
      </div>
    `;
    
    container.insertBefore(sortingDiv, container.firstChild);
  }

  bindEvents() {
    document.addEventListener('change', (e) => {
      if (e.target.id === 'sort-select') {
        this.handleSort(e.target.value);
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.id === 'reset-sort') {
        this.resetSort();
      }
    });
  }

  handleSort(sortType) {
    const publicationsContainer = document.querySelector('.publications');
    const talksContainer = document.querySelector('#recent-talks');
    
    if (publicationsContainer) {
      this.sortPublications(publicationsContainer, sortType);
    }
    
    if (talksContainer) {
      this.sortTalks(talksContainer, sortType);
    }
  }

  sortPublications(container, sortType) {
    const yearSections = Array.from(container.querySelectorAll('.year'));
    const sortedSections = [...yearSections];

    switch (sortType) {
      case 'year-desc':
        sortedSections.sort((a, b) => parseInt(b.textContent) - parseInt(a.textContent));
        break;
      case 'year-asc':
        sortedSections.sort((a, b) => parseInt(a.textContent) - parseInt(b.textContent));
        break;
      case 'title-asc':
        // For publications, we'll sort by year but could be enhanced
        sortedSections.sort((a, b) => parseInt(b.textContent) - parseInt(a.textContent));
        break;
      case 'title-desc':
        sortedSections.sort((a, b) => parseInt(b.textContent) - parseInt(a.textContent));
        break;
    }

    // Reorder the sections
    sortedSections.forEach(section => {
      const nextElement = section.nextElementSibling;
      if (nextElement && nextElement.tagName === 'OL') {
        container.appendChild(section);
        container.appendChild(nextElement);
      }
    });
  }

  sortTalks(container, sortType) {
    const talkSections = Array.from(container.querySelectorAll('h2'));
    const sortedSections = [...talkSections];

    switch (sortType) {
      case 'year-desc':
        sortedSections.sort((a, b) => parseInt(b.textContent) - parseInt(a.textContent));
        break;
      case 'year-asc':
        sortedSections.sort((a, b) => parseInt(a.textContent) - parseInt(b.textContent));
        break;
      case 'title-asc':
        // For talks, we'll keep year order but could be enhanced
        sortedSections.sort((a, b) => parseInt(b.textContent) - parseInt(a.textContent));
        break;
      case 'title-desc':
        sortedSections.sort((a, b) => parseInt(b.textContent) - parseInt(a.textContent));
        break;
    }

    // Reorder the sections
    sortedSections.forEach(section => {
      const nextElements = [];
      let current = section.nextElementSibling;
      
      // Collect all elements until the next h2 or end
      while (current && current.tagName !== 'H2') {
        nextElements.push(current);
        current = current.nextElementSibling;
      }
      
      container.appendChild(section);
      nextElements.forEach(el => container.appendChild(el));
    });
  }

  resetSort() {
    // Reload the page to reset to original order
    window.location.reload();
  }
}

// Initialize sorting when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ContentSorter();
}); 