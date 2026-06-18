const databaseURL = "https://jewelarry-24f04-default-rtdb.firebaseio.com/";


// ডাটা সেভ করার ফাংশন
async function saveMemo() {
    const name = document.getElementById('customerName').value;
    const item = document.getElementById('itemName').value;
    const weight = document.getElementById('weight').value;
    const amount = document.getElementById('totalAmount').value;

    if(!name || !item || !amount) {
        alert("অনুগ্রহ করে সব তথ্য পূরণ করুন!");
        return;
    }

    const memoData = {
        customerName: name,
        itemName: item,
        weight: weight,
        totalAmount: amount,
        date: new Date().toLocaleString('bn-BD')
    };

    try {
        await fetch(databaseURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memoData)
        });
        alert("মেমো সফলভাবে ডাটাবেজে সেভ হয়েছে!");
        document.getElementById('customerName').value = '';
        document.getElementById('itemName').value = '';
        document.getElementById('weight').value = '';
        document.getElementById('totalAmount').value = '';
        loadMemos();
    } catch (error) {
        alert("ডাটা সেভ করতে সমস্যা হয়েছে।");
    }
}

// ডাটাবেজ থেকে ডাটা লোড করার ফাংশন
async function loadMemos() {
    const container = document.getElementById('memoContainer');
    try {
        const response = await fetch(databaseURL);
        const data = await response.json();
        container.innerHTML = "";
        
        if (!data) {
            container.innerHTML = "<p style='text-align:center;'>কোনো মেমো পাওয়া যায়নি।</p>";
            return;
        }

        Object.keys(data).reverse().forEach(key => {
            const memo = data[key];
            container.innerHTML += `
                <div class="memo-card">
                    <p><strong>তারিখ:</strong> ${memo.date}</p>
                    <p><strong>গ্রাহক:</strong> ${memo.customerName}</p>
                    <p><strong>পণ্য:</strong> ${memo.itemName} (${memo.weight || 'ওজন নেই'})</p>
                    <p><strong>মোট মূল্য:</strong> ${memo.totalAmount} টাকা</p>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = "<p style='color:red;'>ডাটা লোড করা যাচ্ছে না।</p>";
    }
}

loadMemos();
