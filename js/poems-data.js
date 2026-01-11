let poems = [];

async function loadPoems() {
    try {
        const response = await fetch('data/poems.json');
        const data = await response.json();
        poems = data.poems;
        return poems;
    } catch (error) {
        console.error('هەڵە لە بارکردنی شیعرەکان:', error);
        return [];
    }
}

function updateStats() {
    const totalPoemsEl = document.getElementById('totalPoems');
    const totalAuthorsEl = document.getElementById('totalAuthors');
    const favoriteCountEl = document.getElementById('favoriteCount');
    
    if (totalPoemsEl) totalPoemsEl.textContent = poems.length;
    if (totalAuthorsEl) {
        const uniqueAuthors = [...new Set(poems.map(p => p.author))].length;
        totalAuthorsEl.textContent = uniqueAuthors;
    }
    if (favoriteCountEl) favoriteCountEl.textContent = favorites.length;
}

function toggleFavorite(poemId, event) {
    if (event) event.stopPropagation();
    
    const poem = poems.find(p => p.id === poemId);
    if (!poem) return;
    
    const index = favorites.indexOf(poemId);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('لە دڵخوازەکان لابرا');
    } else {
        favorites.push(poemId);
        showToast('زیادکرا بۆ دڵخوازەکان');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateStats();
    
    // نوێکردنەوەی UI
    if (typeof renderPoems === 'function') renderPoems();
    if (typeof renderFavorites === 'function') renderFavorites();
}

function getPoemCard(poem) {
    const isFavorite = favorites.includes(poem.id);
    return `
        <div class="poem-card glass rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer relative" onclick="window.location.href='poem-detail.html?id=${poem.id}'">
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.preventDefault(); event.stopPropagation(); toggleFavorite(${poem.id}, event)">
                <svg class="icon-heart" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
            <div class="text-white relative z-0">
                <div class="mb-2 sm:mb-3">
                    <span class="category-badge">${poem.category}</span>
                </div>
                <h4 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">${poem.title}</h4>
                <p class="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">${poem.author}</p>
                <p class="text-sm sm:text-base text-gray-300 italic">${poem.preview}</p>
                <div class="mt-3 sm:mt-4 text-indigo-400 text-xs sm:text-sm flex items-center gap-2">
                    <span>کلیک بکە بۆ خوێندنەوە</span>
                    <span>→</span>
                </div>
            </div>
        </div>
    `;
}