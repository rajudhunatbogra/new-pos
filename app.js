// IndexedDB ডাটাবেজ তৈরি এবং ওপেন করা
let db;
const request = indexedDB.open("JewelryPOSDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("memos")) {
        db.createObjectStore("memos", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadMemos(); // ডাটাবেজ সফলভাবে খুললে মেমো লোড হবে
};

request.onerror = function() {
    alert("ডাটাবেজ খুলতে সমস্যা হয়েছে।");
};

// মেমো সেভ অথবা আপডেট করার ফাংশন
function saveMemo() {
    const name = document.getElementById('customerName').value;
    const item = document.getElementById('itemName').value;
    const weight = document.getElementById('weight').value;
    const amount = document.getElementById('totalAmount').value;
    const editId = document.getElementById('saveMemoBtn').getAttribute('data-edit-id');

    if (!name || !item || !amount) {
        alert("অনুগ্রহ করে সব তথ্য পূরণ করুন!");
        return;
    }

    const transaction = db.transaction(["memos"], "readwrite");
    const store = transaction.objectStore("memos");

    const memoData = {
        customerName: name,
        itemName: item,
        weight: weight,
        totalAmount: amount,
        date: new Date().toLocaleString('bn-BD')
    };

    if (editId) {
        // যদি এডিট মোড হয়, তবে পুরোনো মেমো আপডেট হবে
        memoData.id = parseInt(editId);
        store.put(memoData);
        alert("মেমো সফলভাবে আপডেট করা হয়েছে!");
        document.getElementById('saveMemoBtn').removeAttribute('data-edit-id');
        document.getElementById('saveMemoBtn').innerText = "মেমো সেভ করুন";
    } else {
        // নতুন মেমো যোগ হবে
        store.add(memoData);
        alert("মেমো সফলভাবে সেভ হয়েছে!");
    }

    transaction.oncomplete = function() {
        // ইনপুট ফিল্ড খালি করা
        document.getElementById('customerName').value = '';
        document.getElementById('itemName').value = '';
        document.getElementById('weight').value = '';
        document.getElementById('totalAmount').value = '';
        loadMemos();
    };
}

// ডাটাবেজ থেকে ডাটা এনে দেখানোর ফাংশন
function loadMemos() {
    const container = document.getElementById('memoContainer');
    container.innerHTML = "";

    const transaction = db.transaction(["memos"], "readonly");
    const store = transaction.objectStore("memos");
    const requestCursor = store.openCursor();
    
    let hasData = false;
    const tempMemos = [];

    requestCursor.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            tempMemos.push(cursor.value);
            hasData = true;
            cursor.continue();
        } else {
            if (!hasData) {
                container.innerHTML = "<p style='text-align:center;'>কোনো মেমো পাওয়া যায়নি।</p>";
                return;
            }
            // নতুন মেমোগুলো উপরে দেখানোর জন্য উল্টো করে সাজানো
            tempMemos.reverse().forEach(memo => {
                container.innerHTML += `
                    <div class="memo-card" style="border-left: 5px solid #28a745; margin-bottom: 12px; padding: 10px; background: #fff; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p><strong>তারিখ:</strong> ${memo.date}</p>
                        <p><strong>গ্রাহক:</strong> ${memo.customerName}</p>
                        <p><strong>পণ্য:</strong> ${memo.itemName} (${memo.weight || 'ওজন নেই'})</p>
                        <p><strong>মোট মূল্য:</strong> ${memo.totalAmount} টাকা</p>
                        <div style="margin-top: 10px; display: flex; gap: 10px;">
                            <button onclick="editMemo(${memo.id}, '${memo.customerName}', '${memo.itemName}', '${memo.weight}', ${memo.totalAmount})" style="padding: 5px 10px; background: #ffc107; color: #000; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; width: auto; margin-top: 0;">এডিট করুন</button>
                            <button onclick="deleteMemo(${memo.id})" style="padding: 5px 10px; background: #dc3545; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; width: auto; margin-top: 0;">ডিলিট</button>
                        </div>
                    </div>
                `;
            });
        }
    };
}

// এডিট করার জন্য ডাটা ইনপুট বক্সে পাঠানোর ফাংশন
function editMemo(id, name, item, weight, amount) {
    document.getElementById('customerName').value = name;
    document.getElementById('itemName').value = item;
    document.getElementById('weight').value = weight;
    document.getElementById('totalAmount').value = amount;
    
    const saveBtn = document.getElementById('saveMemoBtn');
    saveBtn.setAttribute('data-edit-id', id);
    saveBtn.innerText = "মেমো আপডেট করুন";
    window.scrollTo(0, 0); // স্ক্রিন একদম উপরে নিয়ে যাওয়া
}

// মেমো ডিলিট করার ফাংশন
function deleteMemo(id) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই মেমোটি ডিলিট করতে চান?")) {
        const transaction = db.transaction(["memos"], "readwrite");
        const store = transaction.objectStore("memos");
        store.delete(id);
        transaction.oncomplete = function() {
            alert("মেমো ডিলিট করা হয়েছে।");
            loadMemos();
        };
    }
}
