$(document).ready(function() {
    // تغییر وضعیت فیلد کد حسابداری
    $('#autoAccountingCode').change(function() {
        $('#accountingCode').prop('disabled', this.checked);
    });

    // مدیریت تب‌ها
    $('#productTabs a').on('click', function (e) {
        e.preventDefault()
        $(this).tab('show')
    });

    // ذخیره دسته‌بندی جدید
    $('#saveCategoryButton').on('click', function() {
        saveCategory();
    });

    // تنظیمات انتخاب دسته‌بندی
    $('#categoryModal').on('show.bs.modal', function (e) {
        // باز کردن پنجره انتخاب دسته‌بندی
    });

    $('#categoryModal').on('hidden.bs.modal', function (e) {
        // بستن پنجره انتخاب دسته‌بندی
    });

    $('ul.dx-treeview-node-container').on('click', 'li.dx-treeview-node', function () {
        var categoryId = $(this).data('item-id');
        $('#selectedCategoryId').val(categoryId);
        $('#categoryModal').modal('hide');
    });

    $('dx-button[aria-label="تایید"]').on('click', function () {
        var selectedCategoryId = $('#selectedCategoryId').val();
        if (selectedCategoryId) {
            $('#categoryModal').modal('hide');
        } else {
            alert('لطفاً یک دسته‌بندی انتخاب کنید.');
        }
    });

    $('dx-button[aria-label="انصراف"]').on('click', function () {
        $('#categoryModal').modal('hide');
    });
});

function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#productImagePreview').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function removeImage() {
    $('#productImagePreview').attr('src', '/uploads/default-image/default-person.png.png');
    $('#productImage').val(''); // پاک کردن مقدار فیلد فایل
}

function saveCategory() {
    var categoryName = $('#categoryName').val();
    $.ajax({
        url: '../categories/save_category.php', // آدرس فایل PHP برای ذخیره دسته‌بندی
        type: 'POST',
        data: { name: categoryName },
        success: function(response) {
            if (response.success) {
                alert(response.message); // نمایش پیام موفقیت
                $('#categoryModal').modal('hide'); // بستن modal
                location.reload(); // رفرش صفحه
            } else {
                alert('خطا: ' + response.message); // نمایش پیام خطا
            }
        },
        error: function(xhr, status, error) {
            console.error(xhr.responseText);
            alert('خطا در ذخیره دسته‌بندی: ' + error);
        }
    });
}

// تنظیمات اولیه و متغیرهای جهانی
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupSidebarNavigation();
    setupContentHeight();
}

function setupSidebarNavigation() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if(sidebarToggle && sidebar) {
        // مدیریت کلیک روی دکمه منو
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // بستن منو با کلیک خارج از آن در حالت موبایل
        document.addEventListener('click', (e) => {
            if(window.innerWidth <= 768 && 
               !e.target.closest('.sidebar') && 
               !e.target.closest('#sidebar-toggle')) {
                sidebar.classList.remove('active');
            }
        });
    }
}

function setupContentHeight() {
    function adjustHeight() {
        const navbar = document.querySelector('.navbar');
        const mainContent = document.querySelector('.main-content');
        
        if(navbar && mainContent) {
            const navbarHeight = navbar.offsetHeight;
            mainContent.style.minHeight = `calc(100vh - ${navbarHeight}px)`;
        }
    }

    // تنظیم اولیه ارتفاع
    adjustHeight();
    
    // تنظیم مجدد ارتفاع با تغییر سایز پنجره
    window.addEventListener('resize', adjustHeight);
}

// مدیریت روت‌ها و نمایش صفحات
function showPage(pageName) {
    // پنهان کردن همه صفحات
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none');
    
    // نمایش صفحه مورد نظر
    const targetPage = document.getElementById(`page-${pageName}`);
    if(targetPage) {
        targetPage.style.display = 'block';
    }
}

// مدیریت فرم‌ها
function handleFormSubmit(event, formType) {
    event.preventDefault();
    // پیاده‌سازی منطق ثبت فرم بر اساس نوع آن
    console.log(`در حال پردازش فرم ${formType}`);
}

// توابع کمکی برای فرمت‌کردن اعداد و تاریخ
function formatNumber(number) {
    return new Intl.NumberFormat('fa-IR').format(number);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('fa-IR');
}

// تابع تولید کد حسابداری
function generateCode() {
    try {
        // تولید یک عدد 6 رقمی تصادفی با پیشوند سال
        let prefix = new Date().getFullYear().toString().substr(-2);
        let random = Math.floor(Math.random() * 9000) + 1000;
        let code = prefix + random.toString();
        
        let codeInput = document.getElementById("code_hesabdari");
        if (!codeInput) {
            console.error("فیلد کد حسابداری پیدا نشد");
            return;
        }

        // اعمال کد جدید با افکت بصری
        codeInput.value = code;
        codeInput.classList.add('highlight');
        
        setTimeout(() => {
            codeInput.classList.remove('highlight');
        }, 1000);

        console.log('کد جدید تولید شد:', code);

    } catch (error) {
        console.error('خطا در تولید کد:', error);
    }
}

// عملکرد مربوط به انتخاب دسته‌بندی در صفحه افزودن محصول
function setupCategorySelector() {
    const categoryButton = document.getElementById('categoryButton');
    const categoryModal = document.getElementById('categoryModal');

    if (categoryButton && categoryModal) {
        categoryButton.addEventListener('click', () => {
            // کد لازم برای باز کردن پنجره دسته‌بندی
            categoryModal.style.display = 'block';
        });

        // بستن پنجره با کلیک خارج از آن
        window.addEventListener('click', (event) => {
            if (event.target == categoryModal) {
                categoryModal.style.display = 'none';
            }
        });
    }
}
$(document).ready(function() {
    // تغییر وضعیت فیلد کد حسابداری
    $('#autoAccountingCode').change(function() {
        $('#accountingCode').prop('disabled', this.checked);
    });

    // مدیریت تب‌ها
    $('#productTabs a').on('click', function (e) {
        e.preventDefault()
        $(this).tab('show')
    });

    // ذخیره دسته‌بندی جدید
    $('#saveCategoryButton').on('click', function() {
        saveCategory();
    });

    // تنظیمات انتخاب دسته‌بندی
    $('#categoryModal').on('show.bs.modal', function (e) {
        // باز کردن پنجره انتخاب دسته‌بندی
    });

    $('#categoryModal').on('hidden.bs.modal', function (e) {
        // بستن پنجره انتخاب دسته‌بندی
    });

    $('ul.dx-treeview-node-container').on('click', 'li.dx-treeview-node', function () {
        var categoryId = $(this).data('item-id');
        $('#selectedCategoryId').val(categoryId);
        $('#categoryModal').modal('hide');
    });

    $('dx-button[aria-label="تایید"]').on('click', function () {
        var selectedCategoryId = $('#selectedCategoryId').val();
        if (selectedCategoryId) {
            $('#categoryModal').modal('hide');
        } else {
            alert('لطفاً یک دسته‌بندی انتخاب کنید.');
        }
    });

    $('dx-button[aria-label="انصراف"]').on('click', function () {
        $('#categoryModal').modal('hide');
    });
});

function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#productImagePreview').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function removeImage() {
    $('#productImagePreview').attr('src', 'uploads/default-image/default person.png');
    $('#productImage').val(''); // پاک کردن مقدار فیلد فایل
}

function saveCategory() {
    var categoryName = $('#categoryName').val();
    $.ajax({
        url: '../categories/save_category.php', // آدرس فایل PHP برای ذخیره دسته‌بندی
        type: 'POST',
        data: { name: categoryName },
        success: function(response) {
            if (response.success) {
                alert(response.message); // نمایش پیام موفقیت
                $('#categoryModal').modal('hide'); // بستن modal
                location.reload(); // رفرش صفحه
            } else {
                alert('خطا: ' + response.message); // نمایش پیام خطا
            }
        },
        error: function(xhr, status, error) {
            console.error(xhr.responseText);
            alert('خطا در ذخیره دسته‌بندی: ' + error);
        }
    });
}

// فراخوانی تابع
setupCategorySelector();

$(document).ready(function() {
    // تنظیمات select2 برای دسته‌بندی
    $('#category').select2({
        placeholder: 'دسته‌بندی را انتخاب کنید',
        ajax: {
            url: 'fetch_categories.php',
            dataType: 'json',
            delay: 250,
            processResults: function (data) {
                return {
                    results: data.items
                };
            },
            cache: true
        },
        minimumInputLength: 1
    });

    // مدیریت باز و بسته شدن زیرمنوها
    const menuItems = document.querySelectorAll('#sidebar li.menu-item');
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        const submenu = item.querySelector('.submenu');
        if (submenu) {
            link.addEventListener('click', function(e) {
                e.preventDefault(); // جلوگیری از عملکرد پیش‌فرض لینک
                menuItems.forEach(i => {
                    if (i !== item) {
                        i.classList.remove('active');
                        const sub = i.querySelector('.submenu');
                        if (sub) {
                            sub.style.display = 'none';
                        }
                    }
                });
                item.classList.toggle('active');
                submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
            });
        }
    });

    // تنظیم آیتم های فعال در منو
    var currentPage = window.location.pathname;
    var menuLinks = document.querySelectorAll("#sidebar a");
    menuLinks.forEach(link => {
        var linkPath = link.getAttribute('href');
        if (linkPath === currentPage) {
            link.classList.add('active-menu');
            const parentMenuItem = link.closest('.menu-item');
            if (parentMenuItem) {
                parentMenuItem.classList.add('active');
                const parentSubmenu = link.closest('.submenu');
                if (parentSubmenu) {
                    parentSubmenu.style.display = 'block';
                    link.classList.add('active-submenu');
                }
            }
        }
    });

    // نمایش پاپ‌آپ لیست قیمت
    $('#showPriceList').on('click', function() {
        $('#priceListModal').modal('show');
    });
});

function generateAccountingCode() {
    var category = $('#category').select2('data');
    if (category.length === 0) {
        alert('لطفاً ابتدا دسته‌بندی را انتخاب کنید.');
        return;
    }
    var categoryName = category[0].text;
    var accountingCodePrefix = toEnglish(categoryName.substring(0, 4));
    $('#accountingCode').val(accountingCodePrefix + '-' + Math.floor(Math.random() * 1000000));
}

function generateProductCode() {
    $('#productCode').val('PRD-' + Math.floor(Math.random() * 1000000));
}

function generateBarcode() {
    $('#barcode').val('BRCD-' + Math.floor(Math.random() * 1000000));
}

function generateMainBarcode() {
    $('#mainBarcode').val('MBRCD-' + Math.floor(Math.random() * 1000000));
}

function toggleBarcodeGeneration() {
    if ($('#noBarcode').is(':checked')) {
        $('#barcodeGenerationGroup').show();
    } else {
        $('#barcodeGenerationGroup').hide();
    }
}

function toEnglish(text) {
    var persianToEnglishMap = {
        'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z',
        'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l',
        'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'y'
    };
    return text.split('').map(function(char) {
        return persianToEnglishMap[char] || char;
    }).join('');
}


$(document).ready(function() {
    // تنظیمات تغییر وضعیت فیلدهای واحد فرعی
    $('#hasMultipleUnits').change(function() {
        if (this.checked) {
            $('#multipleUnitsFields').show();
        } else {
            $('#multipleUnitsFields').hide();
        }
    });

    // تنظیمات select2 برای دسته‌بندی
    $('#category').select2({
        ajax: {
            url: '/hesabfa/product/add_product/fetch_categories.php',
            dataType: 'json',
            delay: 250,
            data: function(params) {
                return {
                    term: params.term // متن جستجو
                };
            },
            processResults: function(data) {
                return {
                    results: data.items
                };
            },
            cache: true
        },
        placeholder: 'یک دسته‌بندی انتخاب کنید',
        minimumInputLength: 1,
        language: {
            inputTooShort: function() {
                return 'لطفاً یک حرف یا بیشتر وارد کنید';
            },
            searching: function() {
                return 'در حال جستجو...';
            },
            noResults: function() {
                return 'نتیجه‌ای یافت نشد';
            }
        }
    });
});

