// ================= NAVBAR MOBILE =================
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("mainNav");

if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

// ================= ACTIVE MENU ON SCROLL =================
const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");

window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY || document.documentElement.scrollTop;

    sections.forEach(section => {
        const id = section.getAttribute("id");
        const offsetTop = section.offsetTop - 130;
        const offsetBottom = offsetTop + section.offsetHeight;

        if (scrollPos >= offsetTop && scrollPos < offsetBottom) {
            navLinks.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${id}`) {
                    link.classList.add("active");
                }
            });
        }
    });
});

// ================= SMOOTH SCROLL LINK =================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId && targetId.length > 1) {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: "smooth" });
            }
        }
    });
});

// ================= BACK TO TOP =================
const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    if (!backToTopBtn) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y > 350) {
        backToTopBtn.classList.add("show");
    } else {
        backToTopBtn.classList.remove("show");
    }
});

if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ================= CART LOGIC =================
const cart = [];
const cartCountEl = document.getElementById("cartCount");
const cartListEl = document.getElementById("cartList");
const emptyCartText = document.getElementById("emptyCartText");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartShippingEl = document.getElementById("cartShipping");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutAlert = document.getElementById("checkoutAlert");

function formatRupiah(num) {
    return "Rp " + num.toLocaleString("id-ID");
}

function updateCartCount() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = totalQty;
}

function updateCartUI() {
    if (!cartListEl) return;

    cartListEl.innerHTML = "";

    if (cart.length === 0) {
        emptyCartText.style.display = "block";
        checkoutBtn.disabled = true;
    } else {
        emptyCartText.style.display = "none";
        checkoutBtn.disabled = false;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.qty;

        const li = document.createElement("li");
        li.className = "cart-item";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = item.name;

        const priceSpan = document.createElement("span");
        priceSpan.textContent = formatRupiah(item.price);

        const qtySpan = document.createElement("span");
        qtySpan.className = "cart-item-qty";
        qtySpan.textContent = `x${item.qty}`;

        const removeBtn = document.createElement("button");
        removeBtn.className = "cart-item-remove";
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener("click", () => {
            cart.splice(index, 1);
            updateCartCount();
            updateCartUI();
        });

        li.appendChild(nameSpan);
        li.appendChild(priceSpan);
        li.appendChild(qtySpan);
        li.appendChild(removeBtn);
        cartListEl.appendChild(li);
    });

    cartSubtotalEl.textContent = formatRupiah(subtotal);

    const shipping = subtotal === 0 ? 0 : (subtotal > 500000 ? 0 : 20000);
    cartShippingEl.textContent = shipping === 0 ? "Rp 0 (Free)" : formatRupiah(shipping);

    const total = subtotal + shipping;
    cartTotalEl.textContent = formatRupiah(total);
}

document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".product-card");
        if (!card) return;

        const name = card.dataset.name;
        const price = parseInt(card.dataset.price, 10);

        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ name, price, qty: 1 });
        }

        updateCartCount();
        updateCartUI();

        showAlert(checkoutAlert, "success", `Produk "${name}" ditambahkan ke keranjang.`);
    });
});

// ================= ALERT HELPER =================
function showAlert(el, type, message) {
    if (!el) return;
    el.className = "alert show " + type;
    el.textContent = message;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ================= SHIPPING FORM =================
const shippingForm = document.getElementById("shippingForm");
const shippingResult = document.getElementById("shippingResult");

if (shippingForm && shippingResult) {
    shippingForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = shippingForm.querySelector("#buyerName").value.trim();
        const city = shippingForm.querySelector("#city").value.trim();
        const postal = shippingForm.querySelector("#postal").value.trim();
        const method = shippingForm.querySelector("#shippingMethod").value;

        let errors = [];
        if (!name) errors.push("Nama penerima wajib diisi.");
        if (!city) errors.push("Kota/kabupaten wajib diisi.");
        if (!postal || postal.length < 5) errors.push("Kode pos tidak valid.");

        if (errors.length > 0) {
            showAlert(shippingResult, "error", errors.join(" "));
            return;
        }

        let eta = "";
        let extra = "";
        if (method === "reg") {
            eta = "2–4 hari kerja";
        } else if (method === "yes") {
            eta = "1–2 hari kerja";
            extra = " (berlaku di kota besar tertentu)";
        } else {
            eta = "di hari yang sama (Same Day)";
            extra = " (hanya area dalam kota gudang)";
        }

        const msg = `Estimasi pengiriman ke ${city} (${postal}) dengan layanan ` +
            `${method.toUpperCase()} sekitar ${eta}${extra}. ` +
            `Detail ongkir akan disesuaikan berat paket dan ditampilkan saat checkout.`;

        showAlert(shippingResult, "success", msg);
    });
}

// ================= CHECKOUT SIMULATION (REDIRECT) =================
if (checkoutBtn && checkoutAlert) {
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            showAlert(checkoutAlert, "error", "Keranjang masih kosong, pilih produk terlebih dahulu.");
            return;
        }

        const subtotalText = cartSubtotalEl.textContent;
        const totalText = cartTotalEl.textContent;

        const summary = cart.map(item => `- ${item.name} x${item.qty}`).join("\n");

        const confirmMsg =
            "Ringkasan pesanan:\n\n" +
            summary +
            `\n\nSubtotal: ${subtotalText}\nTotal (estimasi): ${totalText}\n\n` +
            "Apakah pesanan sudah benar dan ingin diselesaikan?";

        const ok = window.confirm(confirmMsg);

        if (!ok) {
            showAlert(checkoutAlert, "error", "Checkout dibatalkan. Silakan cek kembali keranjang.");
            return;
        }

        showAlert(
            checkoutAlert,
            "success",
            "Transaksi simulasi berhasil! Mengarahkan ke halaman terima kasih..."
        );

        setTimeout(() => {
            window.location.href = "thankyou.html";
        }, 1200);
    });
}

// ================= WHATSAPP BUTTON (KIRIM PESAN) =================
const whatsAppBtn = document.getElementById("whatsAppBtn");
if (whatsAppBtn) {
    whatsAppBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            showAlert(checkoutAlert, "error", "Keranjang masih kosong, tidak ada yang dikirim ke WhatsApp.");
            return;
        }

        const summary = cart
            .map(item => `• ${item.name} x${item.qty}`)
            .join("%0A");

        const totalText = cartTotalEl.textContent.replace(/\s/g, "%20");

        const message =
            `Halo HomeComfort,%0ASaya ingin pesan:%0A${summary}%0A%0A` +
            `Total estimasi: ${totalText}%0A%0AMohon info lanjut soal stok & pengiriman.`;

        const phone = "6281200000000"; // ganti nomor WA
        const url = `https://wa.me/${phone}?text=${message}`;

        window.open(url, "_blank");
    });
}

// ================= KLIK IKON KERANJANG =================
const cartIconBtn = document.querySelector(".cart-icon");
if (cartIconBtn) {
    cartIconBtn.addEventListener("click", () => {
        const cartSection = document.getElementById("cart-section");
        if (cartSection) {
            cartSection.scrollIntoView({ behavior: "smooth" });
        }
    });
}

// ================= PRODUCT SEARCH =================
const productSearchInput = document.getElementById("productSearch");
const productCards = document.querySelectorAll(".product-card");

if (productSearchInput && productCards.length > 0) {
    productSearchInput.addEventListener("input", () => {
        const query = productSearchInput.value.toLowerCase().trim();

        productCards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            const text = card.textContent.toLowerCase();

            if (!query || name.includes(query) || text.includes(query)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    });
}

// ================= NEWSLETTER SUBSCRIBE =================
const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");
const newsletterAlert = document.getElementById("newsletterAlert");

if (newsletterForm && newsletterEmail && newsletterAlert) {
    newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = newsletterEmail.value.trim();

        if (!email || !email.includes("@") || !email.includes(".")) {
            showAlert(newsletterAlert, "error", "Email tidak valid. Pastikan format email benar.");
            return;
        }

        showAlert(
            newsletterAlert,
            "success",
            "Terima kasih! Email kamu sudah terdaftar untuk menerima info promo HomeComfort."
        );
        newsletterEmail.value = "";
    });
}
