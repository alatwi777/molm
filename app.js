// app.js - ملف التطبيق الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة التبويبات
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // إزالة النشاط من جميع الأزرار
            tabBtns.forEach(b => b.classList.remove('active'));
            // إخفاء جميع المحتويات
            tabContents.forEach(c => c.style.display = 'none');
            
            // تفعيل التبويب المحدد
            this.classList.add('active');
            document.getElementById(tabId).style.display = 'block';
        });
    });
    
    // تفعيل التبويب الأول تلقائياً
    if (tabBtns.length > 0) {
        tabBtns[0].click();
    }
    
    // تهيئة التاريخ العربي
    initializeArabicDate();
    
    // تهيئة أي دوال أخرى
    initializeApp();
});

// دالة تهيئة التاريخ
function initializeArabicDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Asia/Riyadh'
    };
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('ar-SA', options);
    }
}

// دالة تهيئة التطبيق
function initializeApp() {
    console.log('التطبيق جاهز للاستخدام');
    
    // يمكنك إضافة أي تهيئة إضافية هنا
    loadInitialData();
    
    // إضافة تبويب المزامنة إذا لم يكن موجوداً
    addSyncTabIfNeeded();
}

// دالة تحميل البيانات الأولية
function loadInitialData() {
    // تحميل الطلاب من التخزين المحلي
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    console.log(`تم تحميل ${students.length} طالب`);
    
    // تحميل الاختبارات
    const tests = JSON.parse(localStorage.getItem('tests') || '[]');
    console.log(`تم تحميل ${tests.length} اختبار`);
}

// دالة إضافة تبويب المزامنة
function addSyncTabIfNeeded() {
    // إضافة محتوى تبويب المزامنة
    const syncTabContent = document.getElementById('syncTabContent');
    if (syncTabContent) {
        syncTabContent.innerHTML = `
            <div class="tab-content" id="sync" style="display: none;">
                <div class="card">
                    <h2><i class="fas fa-cloud-upload-alt"></i> مزامنة البيانات مع السحابة</h2>
                    <p class="subtitle">مزامنة بياناتك مع السحابة للوصول إليها من أي جهاز</p>
                    
                    <div class="sync-container">
                        <div class="sync-card">
                            <div class="sync-header">
                                <i class="fas fa-cloud"></i>
                                <h3>حالة المزامنة</h3>
                            </div>
                            <div class="sync-body">
                                <div class="sync-status" id="syncDetails">
                                    <p><strong>الحالة:</strong> <span id="syncState">جاري التحقق...</span></p>
                                    <p><strong>آخر تحديث:</strong> <span id="lastUpdate">غير معروف</span></p>
                                    <p><strong>عدد الطلاب:</strong> <span id="studentCount">0</span></p>
                                    <p><strong>عدد الاختبارات:</strong> <span id="testCount">0</span></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="sync-actions">
                            <button onclick="manualSync()" class="btn-primary" id="syncBtn">
                                <i class="fas fa-sync-alt"></i> مزامنة الآن
                            </button>
                            <button onclick="checkSyncStatus()" class="btn-secondary">
                                <i class="fas fa-redo"></i> تحديث الحالة
                            </button>
                            <button onclick="clearLocalData()" class="btn-danger">
                                <i class="fas fa-trash"></i> مسح المحلي
                            </button>
                        </div>
                        
                        <div class="sync-instructions">
                            <h4><i class="fas fa-info-circle"></i> كيف تعمل المزامنة:</h4>
                            <ol>
                                <li>بياناتك تخزن محلياً على جهازك</li>
                                <li>عند المزامنة، ترسل إلى السحابة (Firebase)</li>
                                <li>يمكنك الوصول للبيانات من أي جهاز</li>
                                <li>التغييرات تظهر تلقائياً على جميع الأجهزة</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// دالة التحقق من حالة المزامنة
function checkSyncStatus() {
    const syncState = document.getElementById('syncState');
    const studentCount = document.getElementById('studentCount');
    const testCount = document.getElementById('testCount');
    const lastUpdate = document.getElementById('lastUpdate');
    
    if (typeof isOnline !== 'undefined' && isOnline) {
        syncState.textContent = 'متصل بالسحابة';
        syncState.className = 'online-status';
    } else {
        syncState.textContent = 'غير متصل - وضع محلي';
        syncState.className = 'offline-status';
    }
    
    // تحديث الأرقام
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const tests = JSON.parse(localStorage.getItem('tests') || '[]');
    
    studentCount.textContent = students.length;
    testCount.textContent = tests.length;
    lastUpdate.textContent = new Date().toLocaleString('ar-SA');
}

// دالة المزامنة اليدوية
async function manualSync() {
    const syncBtn = document.getElementById('syncBtn');
    const originalText = syncBtn.innerHTML;
    
    try {
        syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المزامنة...';
        syncBtn.disabled = true;
        
        if (typeof saveToCloud === 'function') {
            // حفظ الطلاب
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            await saveToCloud('students', students);
            
            // حفظ الاختبارات
            const tests = JSON.parse(localStorage.getItem('tests') || '[]');
            await saveToCloud('tests', tests);
            
            // حفظ النتائج
            const results = JSON.parse(localStorage.getItem('results') || '[]');
            await saveToCloud('results', results);
            
            alert('✅ تمت المزامنة بنجاح!');
        } else {
            alert('⚠️ ميزة المزامنة غير مفعلة بعد. تأكد من إعدادات Firebase.');
        }
        
        // تحديث الحالة
        checkSyncStatus();
        
    } catch (error) {
        console.error('❌ خطأ في المزامنة:', error);
        alert('❌ فشلت المزامنة: ' + error.message);
    } finally {
        syncBtn.innerHTML = originalText;
        syncBtn.disabled = false;
    }
}

// دالة مسح البيانات المحلية
function clearLocalData() {
    if (confirm('⚠️ هل أنت متأكد من مسح جميع البيانات المحلية؟\n\nهذا سيحذف البيانات من هذا الجهاز فقط، لكنها ستبقى في السحابة إذا كنت قد مازلتها سابقاً.')) {
        localStorage.clear();
        alert('✅ تم مسح البيانات المحلية');
        location.reload(); // إعادة تحميل الصفحة
    }
}

// تهيئة عند تحميل الصفحة
window.addEventListener('load', function() {
    // التحقق من حالة المزامنة بعد ثانيتين
    setTimeout(checkSyncStatus, 2000);
});
