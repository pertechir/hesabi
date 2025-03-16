let selectedCategories = new Set();

function openCategoryModal() {
    document.getElementById('categoryModal').classList.remove('hidden');
    document.getElementById('categoryModal').classList.add('flex');
    loadCategories();
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.add('hidden');
    document.getElementById('categoryModal').classList.remove('flex');
}

function showAddCategoryForm() {
    document.getElementById('categoryFormTitle').textContent = 'افزودن دسته‌بندی جدید';
    document.getElementById('categoryId').value = '';
    document.getElementById('addEditCategoryForm').reset();
    document.getElementById('categoryForm').classList.remove('hidden');
    document.getElementById('categoryForm').classList.add('flex');
    loadParentCategories();
}

function closeCategoryForm() {
    document.getElementById('categoryForm').classList.add('hidden');
    document.getElementById('categoryForm').classList.remove('flex');
}

function loadCategories(search = '') {
    $.get('get_categories.php', { search: search }, function(categories) {
        const list = document.getElementById('categoriesList');
        list.innerHTML = '';
        
        categories.forEach(category => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-2 border rounded hover:bg-gray-50';
            div.innerHTML = `
                <div class="flex items-center">
                    <input type="checkbox" 
                           value="${category.id}" 
                           ${selectedCategories.has(parseInt(category.id)) ? 'checked' : ''}
                           onchange="toggleCategory(${category.id}, '${category.name}')"
                           class="ml-2">
                    <span>${category.name}</span>
                    ${category.code ? `<span class="text-gray-500 text-sm mr-2">(${category.code})</span>` : ''}
                </div>
                <div class="flex gap-2">
                    <button onclick="editCategory(${category.id})" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            `;
            list.appendChild(div);
        });
    });
}

function generateCategoryCode() {
    $.get('generate_category_code.php', function(data) {
        document.getElementById('categoryCode').value = data.code;
    });
}

function toggleCategory(id, name) {
    id = parseInt(id);
    if (selectedCategories.has(id)) {
        selectedCategories.delete(id);
    } else {
        selectedCategories.add(id);
    }
    updateSelectedCategoriesDisplay();
}

function updateSelectedCategoriesDisplay() {
    const container = document.getElementById('selectedCategories');
    container.innerHTML = '';
    
    selectedCategories.forEach(id => {
        $.get('get_category.php', { id: id }, function(category) {
            const span = document.createElement('span');
            span.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center ml-2 mb-2';
            span.innerHTML = `
                ${category.name}
                <button onclick="toggleCategory(${id})" class="mr-1 hover:text-blue-900">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(span);
        });
    });

    document.getElementById('categoryIds').value = Array.from(selectedCategories).join(',');
}

function editCategory(id) {
    $.get('get_category.php', { id: id }, function(category) {
        document.getElementById('categoryFormTitle').textContent = 'ویرایش دسته‌بندی';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryCode').value = category.code;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description;
        
        loadParentCategories(category.id).then(() => {
            document.getElementById('categoryParent').value = category.parent_id || '';
        });

        document.getElementById('categoryForm').classList.remove('hidden');
        document.getElementById('categoryForm').classList.add('flex');
    });
}

function loadParentCategories(excludeId = null) {
    return new Promise((resolve) => {
        $.get('get_categories.php', { exclude: excludeId }, function(categories) {
            const select = document.getElementById('categoryParent');
            select.innerHTML = '<option value="">بدون والد</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
            resolve();
        });
    });
}

$(document).ready(function() {
    $('#categorySearch').on('input', function() {
        loadCategories($(this).val());
    });

    $('#addEditCategoryForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const url = document.getElementById('categoryId').value ? 'update_category.php' : 'save_category.php';

        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    closeCategoryForm();
                    loadCategories();
                    alert(response.message);
                } else {
                    alert(response.message || 'خطا در ذخیره‌سازی دسته‌بندی');
                }
            },
            error: function() {
                alert('خطا در ارتباط با سرور');
            }
        });
    });

    // بارگذاری اولیه دسته‌بندی‌های انتخاب شده
    const initialCategories = document.getElementById('categoryIds').value;
    if (initialCategories) {
        initialCategories.split(',').forEach(id => selectedCategories.add(parseInt(id)));
        updateSelectedCategoriesDisplay();
    }
});
function openCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.style.display = 'flex';
        loadCategories();
        return;
    }

    // ایجاد مودال اگر وجود نداشت
    const modalHtml = `
        <div id="categoryModal" class="category-modal" style="display: none;">
            <div class="category-modal-content">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">مدیریت دسته‌بندی‌ها</h3>
                    <button onclick="closeCategoryModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="flex gap-2 mb-4">
                    <input type="text" id="categorySearch" 
                           class="flex-1 px-3 py-2 border rounded-md" 
                           placeholder="جستجو در دسته‌بندی‌ها...">
                    <button onclick="showNewCategoryForm()" 
                            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
                        <i class="fas fa-plus ml-1"></i>
                        دسته‌بندی جدید
                    </button>
                </div>

                <div id="categoriesList" class="category-list"></div>

                <div class="mt-4 flex justify-end">
                    <button onclick="saveCategorySelections()" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md">
                        تایید
                    </button>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('categoryModal').style.display = 'flex';
    loadCategories();
}