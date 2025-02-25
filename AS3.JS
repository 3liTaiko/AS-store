document.addEventListener("DOMContentLoaded", function () {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartButtons = document.querySelectorAll(".add-to-cart");
    const orderModal = document.getElementById("order-modal");
    const orderForm = document.getElementById("order-form");
    const cartItemsContainer = document.getElementById("cart-items");
    const orderTotal = document.getElementById("order-total");
    const openCartBtn = document.getElementById("open-cart");
    const closeCartBtn = document.getElementById("close-cart");
    const confirmOrderButton = document.getElementById("confirm-order");
    const whatsappNumber = "201124147741";    
function switchLanguage(language) {
    // تخزين اللغة المختارة في LocalStorage
    localStorage.setItem("language", language);

    // تغيير محتوى الصفحة بناءً على اللغة
    if (language === "ar") {
        document.body.setAttribute("dir", "rtl");
        document.body.classList.add("arabic");
    } else {
        document.body.setAttribute("dir", "ltr");
        document.body.classList.remove("arabic");
    }

    location.reload(); // إعادة تحميل الصفحة لتطبيق اللغة المختارة
}

// عند تحميل الصفحة، نحدد اللغة من LocalStorage
document.addEventListener("DOMContentLoaded", function () {
    const language = localStorage.getItem("language") || "en"; // تحديد اللغة الافتراضية (عربي)
    switchLanguage(language);
});

    // ✅ إضافة المنتجات للسلة مع تحديد الكمية
    cartButtons.forEach(button => {
        button.addEventListener("click", function () {
            const productCard = button.parentElement;
            const productName = productCard.querySelector("h3").textContent;
            const productPrice = parseInt(productCard.querySelector(".price").textContent.replace(" جنيه", ""));

            let existingProduct = cart.find(item => item.name === productName);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push({ name: productName, price: productPrice, quantity: 1 });
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            showCart();
        });
    });

    // ✅ فتح نافذة السلة
    openCartBtn.addEventListener("click", function () {
        showCart();
        orderModal.style.display = "block";
    });

    // ✅ إغلاق النافذة
    closeCartBtn.addEventListener("click", function () {
        orderModal.style.display = "none";
    });

    // ✅ عرض المنتجات في السلة مع إمكانية تعديل الكمية أو الحذف
    function showCart() {
        cartItemsContainer.innerHTML = "";
        let total = 0;
        const shippingCost = 50; // مصاريف شحن ثابتة مرة واحدة فقط
        let discount = 0; // المتغير الذي سيتم تخزين الخصم فيه

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>السلة فارغة! 🛒</p>";
            orderTotal.textContent = "";
            return;
        }

        cart.forEach((item, index) => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            itemElement.innerHTML = `
                <p>${item.name} - ${item.price} جنيه</p>
                <input type="number" value="${item.quantity}" min="1" data-index="${index}" class="quantity-input">
                <button class="remove-item" data-index="${index}">❌</button>
            `;
            cartItemsContainer.appendChild(itemElement);

            total += item.price * item.quantity;
        });

        // ✅ حساب الخصم إذا كانت الكمية أكثر من منتجين
        if (cart.length >= 3) {
            discount = total * 0.10; // خصم 10%
        }

        const finalTotal = total + shippingCost - discount;

        orderTotal.innerHTML = `
            <p>إجمالي المنتجات: ${total} جنيه</p>
            ${discount > 0 ? `<p>🎉 خصم 10%: -${discount} جنيه</p>` : ""}
            <p>📦 مصاريف الشحن: ${shippingCost} جنيه</p>
            <p><strong>💰 الإجمالي الكلي: ${finalTotal} جنيه</strong></p>
        `;

        // ✅ تحديث الكميات
        document.querySelectorAll(".quantity-input").forEach(input => {
            input.addEventListener("change", function () {
                const index = this.getAttribute("data-index");
                cart[index].quantity = parseInt(this.value);
                localStorage.setItem("cart", JSON.stringify(cart));
                showCart();
            });
        });

        // ✅ حذف منتج من السلة
        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                cart.splice(index, 1);
                localStorage.setItem("cart", JSON.stringify(cart));
                showCart();
            });
        });
    }

    // ✅ وظيفة لعرض تفاصيل الدفع بناءً على الاختيار
    window.showPaymentDetails = function() {
        const paymentMethod = document.getElementById("payment-method").value;
        const allPaymentDetails = document.querySelectorAll(".payment-details");

        // إخفاء جميع تفاصيل الدفع
        allPaymentDetails.forEach(detail => {
            detail.style.display = "none";
        });

        // إظهار التفاصيل بناءً على طريقة الدفع المحددة
        if (paymentMethod) {
            const paymentDetailsElement = document.getElementById(paymentMethod + "-details");
            if (paymentDetailsElement) {
                paymentDetailsElement.style.display = "block";
            }
        }

        // ✅ التحقق من الدفع عند اختيار طريقة الدفع
        const paymentProof = document.getElementById(`payment-proof-${paymentMethod}`);
        if (paymentMethod !== "cash") {
            if (paymentProof) {
                paymentProof.addEventListener("change", function () {
                    // ✅ تحقق من رفع إثبات الدفع
                    if (paymentProof.files.length > 0) {
                        confirmOrderButton.disabled = false;
                    } else {
                        confirmOrderButton.disabled = true;
                    }
                });
            }
        } else {
            confirmOrderButton.disabled = false;
        }
    };

    // ✅ تأكيد الطلب وإرساله تلقائيًا على واتساب
    orderForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("customer-name").value;
        const phone = document.getElementById("customer-phone").value;
        const address = document.getElementById("customer-address").value;
        const paymentMethod = document.getElementById("payment-method").value;

        if (!name || !phone || !address || !paymentMethod) {
            alert("❌ من فضلك أدخل جميع البيانات المطلوبة!");
            return;
        }

        // ✅ تحقق إذا العميل رفع إثبات الدفع
        const paymentProof = document.getElementById(`payment-proof-${paymentMethod}`);
        if (paymentMethod !== "cash" && !paymentProof.files.length) {
            alert("❌ من فضلك قم برفع إثبات الدفع قبل تأكيد الطلب!");
            return;
        }

        // ✅ تجهيز رسالة الطلب
        let paymentMessage = "";
        switch (paymentMethod) {
            case "visa":
                paymentMessage = `💳 الدفع عبر فيزا: [ضع تفاصيل الفيزا هنا]`;
                break;
            case "cash":
                paymentMessage = `💵 الدفع عند الاستلام`;
                break;
            case "wallet":
                paymentMessage = `💸 الدفع عبر محفظة إلكترونية: [ضع رابط المحفظة هنا]`;
                break;
            case "instapay":
                paymentMessage = `🔐 الدفع عبر إنستا باي: [ضع رابط إنستا باي هنا]`;
                break;
            default:
                paymentMessage = "❌ لم يتم تحديد طريقة الدفع!";
        }

        const message = `📢 طلب جديد من ${name}!\n📞 هاتف: ${phone}\n🏠 العنوان: ${address}\n\n🛍️ المنتجات:\n${cart.map(i => `${i.name} - ${i.price} جنيه × ${i.quantity}`).join("\n")}\n\n${discount > 0 ? `🎉 خصم 10%: -${discount} جنيه` : ""}\n📦 مصاريف الشحن: 50 جنيه\n💰 الإجمالي الكلي: ${cart.reduce((total, item) => total + item.price * item.quantity, 0) + 50 - discount} جنيه\n\n${paymentMessage}`;

        // ✅ إرسال الطلب على واتساب أوتوماتيك عبر الرابط
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, "_blank");

        // ✅ تأكيد الطلب
        alert(`✅ شكراً لك يا ${name}! تم إرسال طلبك وسيتم التواصل معك قريبًا.`);
        
        localStorage.removeItem("cart"); // مسح السلة بعد الطلب
        orderModal.style.display = "none";
    });
});
