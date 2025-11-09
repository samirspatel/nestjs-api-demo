const API_BASE = '';

// State management
let books = [];
let authors = [];
let borrowings = [];
let booksPagination = {
  currentPage: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupFormHandlers();
  loadInitialData();
});

// Tab switching
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update content
  document.querySelectorAll('.tab-content').forEach((content) => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');

  // Load data for the tab
  if (tabName === 'books') {
    loadBooks();
  } else if (tabName === 'authors') {
    loadAuthors();
  } else if (tabName === 'borrowings') {
    loadBorrowings();
  }
}

// Load initial data
async function loadInitialData() {
  await Promise.all([loadAuthors(), loadBooks(), loadBorrowings()]);
}

// API Functions - Books
async function loadBooks(page = 1, limit = 20) {
  try {
    const searchQuery = document.getElementById('book-search')?.value || '';
    const authorFilter = document.getElementById('book-author-filter')?.value || '';
    const genreFilter = document.getElementById('book-genre-filter')?.value || '';
    const availabilityFilter = document.getElementById('book-availability-filter')?.value || '';

    let url = `${API_BASE}/books?page=${page}&limit=${limit}`;
    if (authorFilter) url += `&authorId=${authorFilter}`;
    if (genreFilter) url += `&genre=${genreFilter}`;
    if (availabilityFilter === 'available') url += `&available=true`;
    if (availabilityFilter === 'unavailable') url += `&available=false`;

    const response = await fetch(url);
    const result = await response.json();

    // Handle both paginated and non-paginated responses (for backward compatibility)
    if (result.data) {
      books = result.data;
      booksPagination = {
        currentPage: result.page || page,
        limit: result.limit || limit,
        total: result.total || 0,
        totalPages: result.totalPages || 0,
      };
    } else {
      // Fallback for non-paginated response
      books = Array.isArray(result) ? result : [];
      booksPagination = {
        currentPage: 1,
        limit: limit,
        total: books.length,
        totalPages: 1,
      };
    }

    // Note: Search filtering is done client-side on the current page only
    // For full-text search across all pages, implement server-side search
    let booksToRender = books;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      booksToRender = books.filter((book) => {
        const title = book.title?.toLowerCase() || '';
        const isbn = book.isbn?.toLowerCase() || '';
        const author = authors.find((a) => a.id === book.authorId);
        const authorName = author ? `${author.firstName} ${author.lastName}`.toLowerCase() : '';
        return (
          title.includes(searchLower) ||
          isbn.includes(searchLower) ||
          authorName.includes(searchLower)
        );
      });
      // Update pagination info for filtered results
      booksPagination.total = booksToRender.length;
      booksPagination.totalPages = 1;
    }

    renderBooks(booksToRender);
    renderBooksPagination();
    updateBookFilters();
  } catch (error) {
    showAlert('Error loading books: ' + error.message, 'error');
  }
}

async function createBook(bookData) {
  try {
    const response = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });
    if (!response.ok) throw new Error('Failed to create book');
    await loadBooks(booksPagination.currentPage, booksPagination.limit);
    closeModal('book-modal');
    showAlert('Book created successfully!', 'success');
  } catch (error) {
    showAlert('Error creating book: ' + error.message, 'error');
  }
}

async function updateBook(id, bookData) {
  try {
    const response = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });
    if (!response.ok) throw new Error('Failed to update book');
    await loadBooks(booksPagination.currentPage, booksPagination.limit);
    closeModal('book-modal');
    showAlert('Book updated successfully!', 'success');
  } catch (error) {
    showAlert('Error updating book: ' + error.message, 'error');
  }
}

async function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;
  try {
    const response = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete book');
    await loadBooks(booksPagination.currentPage, booksPagination.limit);
    showAlert('Book deleted successfully!', 'success');
  } catch (error) {
    showAlert('Error deleting book: ' + error.message, 'error');
  }
}

function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generatePlaceholderImage(book) {
  // Generate initials from book title
  const words = book.title.trim().split(/\s+/);
  let initials = '';
  if (words.length >= 2) {
    initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].substring(0, 2).toUpperCase();
  } else {
    initials = 'BK';
  }

  // Generate color based on book ID for consistency
  const colors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#fee140',
    '#30cfd0',
    '#ff6b6b',
    '#4ecdc4',
  ];
  const colorIndex = (book.id || (book.title ? book.title.charCodeAt(0) : 0)) % colors.length;
  const bgColor = colors[colorIndex];

  const safeTitle = book.title ? book.title.substring(0, 20) : 'Book';
  const safeInitials = initials || 'BK';

  // Create SVG placeholder
  const svg = `<svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad${book.id || 0}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="200" height="300" fill="url(#grad${book.id || 0})"/>
        <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${escapeXml(safeInitials)}</text>
        <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">${escapeXml(safeTitle)}${book.title && book.title.length > 20 ? '...' : ''}</text>
    </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function getBookCoverImageUrl(book) {
  // Try to get cover from Open Library using ISBN (remove dashes)
  const isbn = book.isbn.replace(/-/g, '').replace(/\s/g, '');

  // For ISBN-13 starting with 978, also try ISBN-10 format
  if (isbn.length === 13 && isbn.startsWith('978')) {
    // Calculate ISBN-10 from ISBN-13
    const isbn10Base = isbn.substring(3, 12);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn10Base[i]) * (10 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 11;
    const checkChar = checkDigit === 10 ? 'X' : checkDigit.toString();
    const isbn10 = isbn10Base + checkChar;

    // Store both URLs for fallback - we'll try ISBN-10 first as it's more reliable
    // The checkImageLoaded function will handle fallback if both fail
    return {
      primary: `https://covers.openlibrary.org/b/isbn/${isbn10}-L.jpg`,
      fallback: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
    };
  }

  // For regular ISBN-13 or ISBN-10
  if (isbn.length === 13 || isbn.length === 10) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  }

  return null;
}

function generateAuthorPlaceholderImage(author) {
  // Generate initials from author name
  const firstName = author.firstName || '';
  const lastName = author.lastName || '';
  let initials = '';

  if (firstName && lastName) {
    initials = (firstName[0] + lastName[0]).toUpperCase();
  } else if (firstName) {
    initials = firstName.substring(0, 2).toUpperCase();
  } else if (lastName) {
    initials = lastName.substring(0, 2).toUpperCase();
  } else {
    initials = 'AU';
  }

  // Generate color based on author ID for consistency
  const colors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#fee140',
    '#30cfd0',
    '#ff6b6b',
    '#4ecdc4',
  ];
  const colorIndex =
    (author.id || (author.firstName ? author.firstName.charCodeAt(0) : 0)) % colors.length;
  const bgColor = colors[colorIndex];

  const fullName = `${firstName} ${lastName}`.trim() || 'Author';

  // Create SVG placeholder
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="authorGrad${author.id || 0}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#authorGrad${author.id || 0})" rx="50%"/>
        <circle cx="100" cy="80" r="35" fill="rgba(255,255,255,0.3)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${escapeXml(initials)}</text>
        <text x="50%" y="75%" font-family="Arial, sans-serif" font-size="10" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">${escapeXml(fullName.substring(0, 15))}${fullName.length > 15 ? '...' : ''}</text>
    </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function getAuthorImageUrl(author) {
  // Try to get author image from Wikipedia or other sources
  // For now, we'll use placeholder images
  // In the future, could integrate with Wikipedia API or other services
  const fullName = `${author.firstName} ${author.lastName}`.trim();
  // Wikipedia image URL format (would need API call to get actual image)
  // For now, return null to use placeholder
  return null;
}

function renderBooks(booksToRender) {
  const container = document.getElementById('books-list');
  if (booksToRender.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><h3>No books found</h3><p>Add your first book to get started!</p></div>';
    return;
  }

  container.innerHTML = booksToRender
    .map((book) => {
      const author = authors.find((a) => a.id === book.authorId);
      const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown';
      const placeholderImage = generatePlaceholderImage(book);
      const coverImageUrlData = getBookCoverImageUrl(book);
      const coverImageUrl =
        coverImageUrlData && typeof coverImageUrlData === 'object'
          ? coverImageUrlData.primary
          : coverImageUrlData;
      const fallbackImageUrl =
        coverImageUrlData && typeof coverImageUrlData === 'object'
          ? coverImageUrlData.fallback
          : null;
      const bookId = book.id;
      const bookTitle = escapeHtml(book.title);

      return `
            <div class="card book-card">
                <div class="book-cover">
                    ${
                      coverImageUrl
                        ? `
                        <img 
                            src="${coverImageUrl}" 
                            alt="${bookTitle}" 
                            data-placeholder="${placeholderImage}"
                            data-fallback="${fallbackImageUrl || ''}"
                            data-book-id="${bookId}"
                            onerror="handleImageError(this)"
                            onload="checkImageLoaded(this)"
                            loading="lazy"
                        >
                    `
                        : `
                        <img 
                            src="${placeholderImage}" 
                            alt="${bookTitle}"
                            loading="lazy"
                        >
                    `
                    }
                </div>
                <div class="card-header">
                    <div style="flex: 1;">
                        <div class="card-title">${bookTitle}</div>
                        <div class="card-subtitle">by ${escapeHtml(authorName)}</div>
                    </div>
                </div>
                <div class="card-info">
                    ${book.genre ? `<div style="text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; color: #717171; margin-bottom: 4px;">${escapeHtml(book.genre)}</div>` : ''}
                    <div style="font-size: 14px; color: #717171;">${book.publishedYear}</div>
                </div>
                <div class="card-actions">
                    ${book.available ? `<button class="btn btn-primary btn-small" onclick="showBorrowForm(${book.id})" style="flex: 1;">Borrow</button>` : '<div style="padding: 8px 16px; font-size: 14px; color: #717171; text-align: center; flex: 1;">Unavailable</div>'}
                    <button class="btn btn-secondary btn-small" onclick="editBook(${book.id})" style="min-width: 60px;">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteBook(${book.id})" style="min-width: 60px;">Delete</button>
                </div>
            </div>
        `;
    })
    .join('');
}

function updateBookFilters() {
  const authorFilter = document.getElementById('book-author-filter');
  const genreFilter = document.getElementById('book-genre-filter');

  // Update author filter
  const authorOptions = ['<option value="">All Authors</option>'];
  authors.forEach((author) => {
    authorOptions.push(
      `<option value="${author.id}">${escapeHtml(author.firstName)} ${escapeHtml(author.lastName)}</option>`,
    );
  });
  authorFilter.innerHTML = authorOptions.join('');

  // Update genre filter
  const genres = [...new Set(books.map((b) => b.genre).filter(Boolean))];
  const genreOptions = ['<option value="">All Genres</option>'];
  genres.forEach((genre) => {
    genreOptions.push(`<option value="${genre}">${escapeHtml(genre)}</option>`);
  });
  genreFilter.innerHTML = genreOptions.join('');
}

function filterBooks() {
  // Reset to first page when filtering
  booksPagination.currentPage = 1;
  loadBooks(1, booksPagination.limit);
}

function goToBooksPage(page) {
  if (page >= 1 && page <= booksPagination.totalPages) {
    loadBooks(page, booksPagination.limit);
  }
}

function changeBooksPageSize(newLimit) {
  booksPagination.limit = parseInt(newLimit);
  booksPagination.currentPage = 1;
  loadBooks(1, booksPagination.limit);
}

function renderBooksPagination() {
  const paginationContainer = document.getElementById('books-pagination');
  if (!paginationContainer) return;

  if (booksPagination.totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  const { currentPage, totalPages, total, limit } = booksPagination;
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  let paginationHTML = `
        <div class="pagination-info">
            Showing ${startItem}-${endItem} of ${total} books
        </div>
        <div class="pagination-controls">
    `;

  // Previous button
  paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToBooksPage(${currentPage - 1})">
            Previous
        </button>
    `;

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="goToBooksPage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToBooksPage(${i})">
                ${i}
            </button>
        `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
    paginationHTML += `<button class="pagination-btn" onclick="goToBooksPage(${totalPages})">${totalPages}</button>`;
  }

  // Next button
  paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToBooksPage(${currentPage + 1})">
            Next
        </button>
    `;

  paginationHTML += `
        </div>
        <div class="pagination-size">
            <label>Items per page:</label>
            <select onchange="changeBooksPageSize(this.value)">
                <option value="10" ${limit === 10 ? 'selected' : ''}>10</option>
                <option value="20" ${limit === 20 ? 'selected' : ''}>20</option>
                <option value="50" ${limit === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${limit === 100 ? 'selected' : ''}>100</option>
            </select>
        </div>
    `;

  paginationContainer.innerHTML = paginationHTML;
}

// Make functions globally accessible
window.goToBooksPage = goToBooksPage;
window.changeBooksPageSize = changeBooksPageSize;

function showBookForm(bookId = null) {
  const modal = document.getElementById('book-modal');
  const form = document.getElementById('book-form');
  const title = document.getElementById('book-modal-title');

  form.reset();
  document.getElementById('book-id').value = '';

  // Populate author dropdown
  const authorSelect = document.getElementById('book-author');
  authorSelect.innerHTML = '<option value="">Select Author</option>';
  authors.forEach((author) => {
    const option = document.createElement('option');
    option.value = author.id;
    option.textContent = `${author.firstName} ${author.lastName}`;
    authorSelect.appendChild(option);
  });

  if (bookId) {
    const book = books.find((b) => b.id === bookId);
    if (book) {
      title.textContent = 'Edit Book';
      document.getElementById('book-id').value = book.id;
      document.getElementById('book-title').value = book.title;
      document.getElementById('book-isbn').value = book.isbn;
      document.getElementById('book-author').value = book.authorId;
      document.getElementById('book-year').value = book.publishedYear;
      document.getElementById('book-genre').value = book.genre || '';
      document.getElementById('book-available').checked = book.available;
    }
  } else {
    title.textContent = 'Add New Book';
  }

  modal.classList.add('active');
}

function saveBook(event) {
  event.preventDefault();
  const id = document.getElementById('book-id').value;
  const bookData = {
    title: document.getElementById('book-title').value,
    isbn: document.getElementById('book-isbn').value,
    authorId: parseInt(document.getElementById('book-author').value),
    publishedYear: parseInt(document.getElementById('book-year').value),
    genre: document.getElementById('book-genre').value || undefined,
    available: document.getElementById('book-available').checked,
  };

  if (id) {
    updateBook(id, bookData);
  } else {
    createBook(bookData);
  }
}

function editBook(id) {
  showBookForm(id);
}

// API Functions - Authors
async function loadAuthors() {
  try {
    const response = await fetch(`${API_BASE}/authors`);
    authors = await response.json();
    renderAuthors(authors);
  } catch (error) {
    showAlert('Error loading authors: ' + error.message, 'error');
  }
}

async function createAuthor(authorData) {
  try {
    const response = await fetch(`${API_BASE}/authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authorData),
    });
    if (!response.ok) throw new Error('Failed to create author');
    await loadAuthors();
    await loadBooks(booksPagination.currentPage, booksPagination.limit); // Reload books to update author dropdown
    closeModal('author-modal');
    showAlert('Author created successfully!', 'success');
  } catch (error) {
    showAlert('Error creating author: ' + error.message, 'error');
  }
}

async function updateAuthor(id, authorData) {
  try {
    const response = await fetch(`${API_BASE}/authors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authorData),
    });
    if (!response.ok) throw new Error('Failed to update author');
    await loadAuthors();
    await loadBooks(booksPagination.currentPage, booksPagination.limit); // Reload books to update author info
    closeModal('author-modal');
    showAlert('Author updated successfully!', 'success');
  } catch (error) {
    showAlert('Error updating author: ' + error.message, 'error');
  }
}

async function deleteAuthor(id) {
  if (!confirm('Are you sure you want to delete this author? This will not delete their books.'))
    return;
  try {
    const response = await fetch(`${API_BASE}/authors/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete author');
    await loadAuthors();
    showAlert('Author deleted successfully!', 'success');
  } catch (error) {
    showAlert('Error deleting author: ' + error.message, 'error');
  }
}

function renderAuthors(authorsToRender) {
  const container = document.getElementById('authors-list');
  if (authorsToRender.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><h3>No authors found</h3><p>Add your first author to get started!</p></div>';
    return;
  }

  container.innerHTML = authorsToRender
    .map((author) => {
      const bookCount = books.filter((b) => b.authorId === author.id).length;
      const placeholderImage = generateAuthorPlaceholderImage(author);
      const authorImageUrl = getAuthorImageUrl(author);
      const authorId = author.id;
      const authorName = `${escapeHtml(author.firstName)} ${escapeHtml(author.lastName)}`;

      return `
            <div class="card author-card">
                <div class="author-avatar">
                    ${
                      authorImageUrl
                        ? `
                        <img 
                            src="${authorImageUrl}" 
                            alt="${authorName}" 
                            data-placeholder="${placeholderImage}"
                            data-author-id="${authorId}"
                            onerror="handleImageError(this)"
                            loading="lazy"
                        >
                    `
                        : `
                        <img 
                            src="${placeholderImage}" 
                            alt="${authorName}"
                            loading="lazy"
                        >
                    `
                    }
                </div>
                <div class="card-header" style="width: 100%; justify-content: center;">
                    <div style="text-align: center;">
                        <div class="card-title">${authorName}</div>
                        ${author.nationality ? `<div class="card-subtitle">${escapeHtml(author.nationality)}</div>` : ''}
                    </div>
                </div>
                <div class="card-info" style="text-align: center; margin-bottom: 16px;">
                    ${author.dateOfBirth ? `<div style="font-size: 14px; color: #717171;">Born ${new Date(author.dateOfBirth).getFullYear()}</div>` : ''}
                    <div style="font-size: 14px; color: #717171; margin-top: 4px;">${bookCount} ${bookCount === 1 ? 'book' : 'books'}</div>
                </div>
                <div class="card-actions" style="width: 100%; justify-content: center;">
                    <button class="btn btn-primary btn-small" onclick="editAuthor(${author.id})" style="flex: 1; max-width: 120px;">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteAuthor(${author.id})" style="flex: 1; max-width: 120px;">Delete</button>
                </div>
            </div>
        `;
    })
    .join('');
}

function filterAuthors() {
  const search = document.getElementById('author-search').value.toLowerCase();
  const filtered = authors.filter((author) => {
    const fullName = `${author.firstName} ${author.lastName}`.toLowerCase();
    return (
      fullName.includes(search) ||
      (author.nationality && author.nationality.toLowerCase().includes(search))
    );
  });
  renderAuthors(filtered);
}

function showAuthorForm(authorId = null) {
  const modal = document.getElementById('author-modal');
  const form = document.getElementById('author-form');
  const title = document.getElementById('author-modal-title');

  form.reset();
  document.getElementById('author-id').value = '';

  if (authorId) {
    const author = authors.find((a) => a.id === authorId);
    if (author) {
      title.textContent = 'Edit Author';
      document.getElementById('author-id').value = author.id;
      document.getElementById('author-firstname').value = author.firstName;
      document.getElementById('author-lastname').value = author.lastName;
      if (author.dateOfBirth) {
        const date = new Date(author.dateOfBirth);
        document.getElementById('author-dob').value = date.toISOString().split('T')[0];
      }
      document.getElementById('author-nationality').value = author.nationality || '';
      document.getElementById('author-biography').value = author.biography || '';
    }
  } else {
    title.textContent = 'Add New Author';
  }

  modal.classList.add('active');
}

function saveAuthor(event) {
  event.preventDefault();
  const id = document.getElementById('author-id').value;
  const authorData = {
    firstName: document.getElementById('author-firstname').value,
    lastName: document.getElementById('author-lastname').value,
    dateOfBirth: document.getElementById('author-dob').value || undefined,
    nationality: document.getElementById('author-nationality').value || undefined,
    biography: document.getElementById('author-biography').value || undefined,
  };

  if (id) {
    updateAuthor(id, authorData);
  } else {
    createAuthor(authorData);
  }
}

function editAuthor(id) {
  showAuthorForm(id);
}

// API Functions - Borrowings
async function loadBorrowings() {
  try {
    const response = await fetch(`${API_BASE}/borrowings`);
    borrowings = await response.json();
    renderBorrowings(borrowings);
    updateBorrowingFilters();
  } catch (error) {
    showAlert('Error loading borrowings: ' + error.message, 'error');
  }
}

async function borrowBook(borrowingData) {
  try {
    const response = await fetch(`${API_BASE}/borrowings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(borrowingData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to borrow book');
    }
    await loadBorrowings();
    await loadBooks(booksPagination.currentPage, booksPagination.limit); // Reload to update availability
    closeModal('borrow-modal');
    showAlert('Book borrowed successfully!', 'success');
  } catch (error) {
    showAlert('Error borrowing book: ' + error.message, 'error');
  }
}

async function returnBook(id) {
  try {
    const response = await fetch(`${API_BASE}/borrowings/${id}/return`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to return book');
    await loadBorrowings();
    await loadBooks(booksPagination.currentPage, booksPagination.limit); // Reload to update availability
    showAlert('Book returned successfully!', 'success');
  } catch (error) {
    showAlert('Error returning book: ' + error.message, 'error');
  }
}

function renderBorrowings(borrowingsToRender) {
  const container = document.getElementById('borrowings-list');
  if (borrowingsToRender.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><h3>No borrowings found</h3><p>Borrow a book to see it here!</p></div>';
    return;
  }

  // Sort borrowings: active (BORROWED/OVERDUE) first, then by due date
  const sortedBorrowings = [...borrowingsToRender].sort((a, b) => {
    if (a.status === 'RETURNED' && b.status !== 'RETURNED') return 1;
    if (a.status !== 'RETURNED' && b.status === 'RETURNED') return -1;
    return new Date(b.dueDate) - new Date(a.dueDate);
  });

  const tableHTML = `
    <div class="table-wrapper">
      <table class="borrowings-table">
        <thead>
          <tr>
            <th>Book</th>
            <th>Borrower</th>
            <th>Borrowed Date</th>
            <th>Due Date</th>
            <th>Returned Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${sortedBorrowings
            .map((borrowing) => {
              const book = books.find((b) => b.id === borrowing.bookId);
              const bookTitle = book ? book.title : 'Unknown Book';
              const dueDate = new Date(borrowing.dueDate);
              const borrowedDate = new Date(borrowing.borrowedDate);
              const isOverdue =
                borrowing.status === 'OVERDUE' ||
                (borrowing.status === 'BORROWED' && dueDate < new Date());
              const daysOverdue =
                isOverdue && borrowing.status !== 'RETURNED'
                  ? Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24))
                  : 0;

              return `
                <tr class="${isOverdue && borrowing.status !== 'RETURNED' ? 'row-overdue' : ''}">
                  <td>
                    <div class="table-book-title">${escapeHtml(bookTitle)}</div>
                  </td>
                  <td>
                    <div class="table-borrower">${escapeHtml(borrowing.borrowerName)}</div>
                  </td>
                  <td>
                    <div class="table-date">${borrowedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </td>
                  <td>
                    <div class="table-date ${isOverdue && borrowing.status !== 'RETURNED' ? 'date-overdue' : ''}">
                      ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      ${isOverdue && borrowing.status !== 'RETURNED' ? `<span class="days-overdue-badge">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</span>` : ''}
                    </div>
                  </td>
                  <td>
                    ${
                      borrowing.returnedDate
                        ? `<div class="table-date">${new Date(borrowing.returnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>`
                        : '<div class="text-muted">—</div>'
                    }
                  </td>
                  <td>
                    <span class="status-badge status-${borrowing.status.toLowerCase()}">
                      ${borrowing.status}
                    </span>
                  </td>
                  <td>
                    ${
                      borrowing.status !== 'RETURNED'
                        ? `<button class="btn btn-success btn-small btn-return" onclick="returnBook(${borrowing.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Return
                          </button>`
                        : '<span class="text-muted">—</span>'
                    }
                  </td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
}

function updateBorrowingFilters() {
  const bookFilter = document.getElementById('borrowing-book-filter');
  const bookOptions = ['<option value="">All Books</option>'];
  books.forEach((book) => {
    bookOptions.push(`<option value="${book.id}">${escapeHtml(book.title)}</option>`);
  });
  bookFilter.innerHTML = bookOptions.join('');
}

function filterBorrowings() {
  const bookId = document.getElementById('borrowing-book-filter').value;
  const status = document.getElementById('borrowing-status-filter').value;

  const filtered = borrowings.filter((borrowing) => {
    const matchesBook = !bookId || borrowing.bookId === parseInt(bookId);
    const matchesStatus = !status || borrowing.status === status;

    return matchesBook && matchesStatus;
  });

  renderBorrowings(filtered);
}

function showBorrowForm(bookId = null) {
  const modal = document.getElementById('borrow-modal');
  const form = document.getElementById('borrow-form');

  form.reset();

  // Populate book dropdown with available books
  const bookSelect = document.getElementById('borrow-book');
  bookSelect.innerHTML = '<option value="">Select Book</option>';
  books
    .filter((b) => b.available)
    .forEach((book) => {
      const option = document.createElement('option');
      option.value = book.id;
      option.textContent = book.title;
      if (bookId && book.id === bookId) {
        option.selected = true;
      }
      bookSelect.appendChild(option);
    });

  modal.classList.add('active');
}

function setupFormHandlers() {
  // Set up borrow form handler
  const borrowForm = document.getElementById('borrow-form');
  if (borrowForm) {
    borrowForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const borrowingData = {
        bookId: parseInt(document.getElementById('borrow-book').value),
        borrowerName: document.getElementById('borrower-name').value,
        borrowDays: parseInt(document.getElementById('borrow-days').value),
      };
      borrowBook(borrowingData);
    });
  }
}

// Utility Functions
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function showAlert(message, type) {
  // Create alert element if it doesn't exist
  let alert = document.querySelector('.alert');
  if (!alert) {
    alert = document.createElement('div');
    alert.className = 'alert';
    document.querySelector('main').insertBefore(alert, document.querySelector('main').firstChild);
  }

  alert.className = `alert alert-${type} show`;
  alert.textContent = message;

  setTimeout(() => {
    alert.classList.remove('show');
  }, 5000);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function handleImageError(img) {
  // First try fallback URL if available
  if (img.dataset.fallback && img.dataset.fallback !== img.src) {
    img.src = img.dataset.fallback;
    return; // Don't set onerror to null yet, let it try fallback first
  }

  // If fallback also fails or doesn't exist, use the placeholder
  if (img.dataset.placeholder) {
    img.src = img.dataset.placeholder;
    img.onerror = null; // Prevent infinite loop
  }
}

function checkImageLoaded(img) {
  // Use setTimeout to ensure dimensions are available
  setTimeout(() => {
    // Check if image is actually loaded and not a placeholder (1x1 pixel)
    // Open Library sometimes returns 1x1 pixel GIFs as placeholders
    if (img.complete && img.naturalWidth === 1 && img.naturalHeight === 1) {
      // This is likely a placeholder image, try fallback or use our generated one
      if (img.dataset.fallback && img.dataset.fallback !== img.src) {
        // Try the fallback URL first
        const fallbackSrc = img.dataset.fallback;
        img.src = fallbackSrc;
        // Check fallback after it loads
        img.onload = function () {
          setTimeout(() => {
            if (img.naturalWidth === 1 && img.naturalHeight === 1 && img.dataset.placeholder) {
              img.src = img.dataset.placeholder;
              img.onerror = null;
            }
          }, 100);
        };
      } else if (img.dataset.placeholder) {
        // Use our generated placeholder
        img.src = img.dataset.placeholder;
        img.onerror = null;
      }
    }
  }, 100);
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.classList.remove('active');
    }
  });
};

// Note: Form handler is set up via setupFormHandlers() on DOMContentLoaded
