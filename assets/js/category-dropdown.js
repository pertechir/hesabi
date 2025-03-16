document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('category-select');
    const dropdown = document.getElementById('category-select');
    const selectedContainer = document.getElementById('selectedCategories');
    const categoryIdsInput = document.getElementById('categoryIds');
    
    let selectedCategories = new Set();
    let mainCategoryId = null;
    let categories = [];
    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const searchTerm = e.target.value.trim();
            
            searchTimeout = setTimeout(() => {
                fetchCategories(searchTerm);
            }, 300);
        });

        searchInput.addEventListener('focus', function() {
            fetchCategories();
            showDropdown();
        });
    }

    document.addEventListener('click', function(e) {
        if (!searchInput?.contains(e.target) && !dropdown?.contains(e.target)) {
            hideDropdown();
        }
    });

    async function fetchCategories(search = '') {
        const apiUrl = '/hesabfa/person/categories/get_categories.php' + (search ? `?search=${encodeURIComponent(search)}` : '');

        if (dropdown) {
            dropdown.innerHTML = '<div class="p-2 text-gray-500">در حال بارگذاری...</div>';
        }

        try {
            const response = await fetch(apiUrl);
            const result = await response.json();

            if (!response.ok) {
                throw new Error('خطا در دریافت داده‌ها');
            }

            categories = result.data;
            renderDropdown();
        } catch (error) {
            console.error('خطا در دریافت داده‌ها', error);
            showError('خطا در دریافت داده‌ها');
        }
    }

    function showError(message) {
        if (dropdown) {
            dropdown.innerHTML = `<div class="p-2 text-red-500">${message}</div>`;
        }
    }

    function showDropdown() {
        if (dropdown) {
            dropdown.classList.remove('hidden');
        }
    }

    function hideDropdown() {
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }

    function renderDropdown() {
        if (!dropdown) return;

        if (categories.length === 0) {
            dropdown.innerHTML = '<div class="p-2 text-gray-500">هیچ دسته‌بندی پیدا نشد</div>';
            return;
        }

        dropdown.innerHTML = categories.map(category => {
            const isSelected = selectedCategories.has(category.id);
            return `
                <div class="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${isSelected ? 'bg-blue-100' : ''}" onclick="toggleCategory(${category.id})">
                    <span>${category.name}</span>
                    ${category.code ? `<small class="text-gray-500">(${category.code})</small>` : ''}
                    ${isSelected ? '<i class="fas fa-check text-blue-500"></i>' : ''}
                </div>
            `;
        }).join('');
    }

    function toggleCategory(categoryId) {
        if (selectedCategories.has(categoryId)) {
            selectedCategories.delete(categoryId);
            if (mainCategoryId === categoryId) {
                mainCategoryId = null;
            }
        } else {
            selectedCategories.add(categoryId);
            if (mainCategoryId === null) {
                mainCategoryId = categoryId;
            }
        }
        updateSelectedCategories();
        renderDropdown();
    }

    function updateSelectedCategories() {
        if (!selectedContainer) return;

        selectedContainer.innerHTML = '';
        categoryIdsInput.value = Array.from(selectedCategories).join(',');

        selectedCategories.forEach(id => {
            const category = categories.find(cat => cat.id === id);
            if (category) {
                const tag = document.createElement('span');
                tag.className = `inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium mt-1 mr-1 rounded-full px-2 py-1 ${mainCategoryId === id ? 'font-bold' : ''}`;
                tag.innerHTML = `
                    ${mainCategoryId === id ? '<i class="fas fa-star mr-1"></i>' : ''}
                    ${category.name}
                    <button type="button" class="ml-2 focus:outline-none" onclick="removeCategory(${id})">&times;</button>
                `;
                selectedContainer.appendChild(tag);
            }
        });
    }

    window.toggleCategory = toggleCategory;
    window.removeCategory = function(categoryId) {
        selectedCategories.delete(categoryId);
        if (mainCategoryId === categoryId) {
            mainCategoryId = null;
        }
        updateSelectedCategories();
        renderDropdown();
    }
});