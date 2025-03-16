window.CategoryManager = (function() {
    // متغیرهای خصوصی
    let selectedCategories = new Set();
    let mainCategoryId = null;

    // مقداردهی اولیه
    document.addEventListener('DOMContentLoaded', () => {
        console.log('CategoryManager initialized');
        initializeEvents();
        loadInitialCategories();
    });

    function initializeEvents() {
        // جستجو در دسته‌بندی‌ها
        const searchInput = document.getElementById('category-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => loadCategories(e.target.value));
        }
    }

    function loadInitialCategories() {
        const categoryIdsInput = document.getElementById('category-ids');
        if (categoryIdsInput?.value) {
            categoryIdsInput.value.split(',')
                .filter(id => id.trim())
                .forEach(id => selectedCategories.add(parseInt(id)));
            updateDisplay();
        }
    }

    // نمایش مدال
    function openModal() {
        console.log('Opening category modal');
        const modal = document.getElementById('category-modal');
        if (modal) {
            modal.classList.remove('hidden');
            loadCategories();
        } else {
            console.error('Modal element not found');
        }
    }

    // بستن مدال
    function closeModal() {
        const modal = document.getElementById('category-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // بارگذاری دسته‌بندی‌ها
    function loadCategories(search = '') {
        console.log('Loading categories with search:', search);
        fetch(`/hesabfa/categories/get_categories.php${search ? '?search=' + encodeURIComponent(search) : ''}`)
            .then(response => response.json())
            .then(categories => {
                const list = document.getElementById('categories-list');
                if (!list) {
                    console.error('Categories list element not found');
                    return;
                }
                
                list.innerHTML = '';
                categories.forEach(category => {
                    list.appendChild(createCategoryElement(category));
                });
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                alert('خطا در بارگذاری دسته‌بندی‌ها');
            });
    }

    // ساخت المان دسته‌بندی
    function createCategoryElement(category) {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-2 hover:bg-gray-50 rounded';
        div.innerHTML = `
            <div class="flex items-center">
                <input type="checkbox" 
                       id="cat-${category.id}"
                       ${selectedCategories.has(parseInt(category.id)) ? 'checked' : ''}
                       class="ml-2">
                <label for="cat-${category.id}" class="cursor-pointer">${category.name}</label>
            </div>
            <button class="text-blue-500 hover:text-blue-700" onclick="CategoryManager.setMain(${category.id})">
                <i class="fas fa-star ${mainCategoryId === category.id ? 'text-yellow-500' : 'text-gray-300'}"></i>
            </button>
        `;

        const checkbox = div.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => toggleCategory(category.id, category.name));

        return div;
    }

    // تغییر وضعیت انتخاب دسته‌بندی
    function toggleCategory(id, name) {
        id = parseInt(id);
        if (selectedCategories.has(id)) {
            selectedCategories.delete(id);
            if (mainCategoryId === id) {
                mainCategoryId = null;
            }
        } else {
            selectedCategories.add(id);
        }
        updateDisplay();
    }

    // تنظیم دسته‌بندی اصلی
    function setMain(id) {
        id = parseInt(id);
        if (!selectedCategories.has(id)) {
            selectedCategories.add(id);
        }
        mainCategoryId = mainCategoryId === id ? null : id;
        updateDisplay();
    }

    // بروزرسانی نمایش
    function updateDisplay() {
        const selectedContainer = document.getElementById('selected-categories');
        const displayContainer = document.getElementById('person-categories');
        const inputElement = document.getElementById('category-ids');

        if (selectedContainer) selectedContainer.innerHTML = '';
        if (displayContainer) displayContainer.innerHTML = '';
        if (inputElement) inputElement.value = Array.from(selectedCategories).join(',');

        selectedCategories.forEach(id => {
            fetch(`/hesabfa/categories/get_category.php?id=${id}`)
                .then(response => response.json())
                .then(category => {
                    if (selectedContainer) {
                        selectedContainer.appendChild(createSelectedCategoryElement(category));
                    }
                    if (displayContainer) {
                        displayContainer.appendChild(createDisplayCategoryElement(category));
                    }
                })
                .catch(error => console.error('Error fetching category details:', error));
        });
    }

    // ساخت المان دسته‌بندی انتخاب شده
    function createSelectedCategoryElement(category) {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-2 bg-blue-50 rounded';
        div.innerHTML = `
            <span>${category.name}</span>
            <div class="flex gap-2">
                ${mainCategoryId === category.id ? '<i class="fas fa-star text-yellow-500"></i>' : ''}
                <button onclick="CategoryManager.toggleCategory(${category.id})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        return div;
    }

    // ساخت المان نمایشی دسته‌بندی
    function createDisplayCategoryElement(category) {
        const span = document.createElement('span');
        span.className = 'inline-flex items-center bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm m-1';
        span.innerHTML = `
            ${mainCategoryId === category.id ? '<i class="fas fa-star text-yellow-500 ml-1"></i>' : ''}
            ${category.name}
        `;
        return span;
    }

    // ذخیره انتخاب‌ها
    function saveSelections() {
        updateDisplay();
        closeModal();
    }

    // توابع عمومی
    return {
        openModal,
        closeModal,
        toggleCategory,
        setMain,
        saveSelections
    };
})();