document.addEventListener('DOMContentLoaded', () => {
    
    /* --- 1. KONFIGURACE A PROMĚNNÉ PRO NAVIGACI/FORMULÁŘ --- */
    const menuToggle = document.getElementById('mobile-menu');
    const menu = document.querySelector('.menu');
    const menuIcon = menuToggle?.querySelector('i');
    const menuLinks = document.querySelectorAll('.menu a');
    
    const form = document.getElementById("kontaktni-formular");
    const stav = document.getElementById("stav-odeslani");
    const btnOdeslat = document.getElementById("tlacitko-odeslat");

    // POZOR: Proměnné pro kalkulačku (plochaInput, dnyInput...) jsem odtud odstranil,
    // protože jsou definovány znovu níže v sekci 5. Tím se vyřešila chyba "already declared".

    /* --- 2. MOBILNÍ MENU --- */
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            if (menuIcon) {
                menuIcon.classList.toggle('fa-bars');
                menuIcon.classList.toggle('fa-xmark');
            }
        });

        // Zavření menu po kliknutí na odkaz
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                if (menuIcon) {
                    menuIcon.classList.add('fa-bars');
                    menuIcon.classList.remove('fa-xmark');
                }
            });
        });
    }

    /* --- 3. ANIMACE PŘI SKROLOVÁNÍ (Intersection Observer) --- */
    const observerOptions = { threshold: 0.1 };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('viditelny');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.anim-skrol').forEach(el => observer.observe(el));

    /* --- 4. LIGHTBOX (GALERIE) --- */
    if (typeof SimpleLightbox !== 'undefined') {
        new SimpleLightbox('.galerie-grid a', { 
            captionDelay: 250,
            captionsData: 'title',
            showCounter: false
        });
    } else {
        console.warn('SimpleLightbox knihovna nebyla nalezena.');
    }

/* --- 5. LOGISTICKÁ KALKULAČKA (Opravená pro tvé HTML) --- */
    const plochaInput = document.getElementById('plocha'); // V HTML máš id="plocha", ne "mnozstvi"
    const dnyInput = document.getElementById('dny');
    const vysledekSpan = document.getElementById('cena-vysledek');

    if (plochaInput && dnyInput && vysledekSpan) {

        function vypocitejCenu() {
    let plocha = parseFloat(plochaInput.value) || 0;
    let dny = parseFloat(dnyInput.value) || 0;
    
    // Ochrana proti záporným hodnotám
    plocha = Math.abs(plocha);
    dny = Math.abs(dny);

    // LOGIKA PRO "INDIVIDUÁLNĚ" (bez Kč)
    if (plocha > 500 || dny > 365) {
        vysledekSpan.innerText = "Individuálně"; // Tady Kč nepřidáme
        vysledekSpan.style.color = "#2c3e50"; 
        return; 
    } 

    // Reset stylu
    vysledekSpan.style.color = ""; 

    // VÝPOČET CENY
    let sazbaDen = 10;
    if (plocha > 100) sazbaDen = 18;

    const cenaSkladne = plocha * dny * sazbaDen;
    const cenaManipulace = plocha * 80; 
    const total = cenaSkladne + cenaManipulace;

    // VÝPIS CENY (Zde přidáme " Kč" programově)
    vysledekSpan.innerText = total.toLocaleString('cs-CZ') + " Kč";
}

        // Listenery - reagují na změnu
        plochaInput.addEventListener('input', vypocitejCenu);
        dnyInput.addEventListener('input', vypocitejCenu);
        
        // Init - spočítat hned po načtení stránky
        vypocitejCenu();
    }

    /* --- 6. FORMSPREE AJAX ODESLÁNÍ --- */
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            if (btnOdeslat) {
                btnOdeslat.disabled = true;
                btnOdeslat.innerText = "Odesílám...";
            }

            const data = new FormData(e.target);

            try {
                const response = await fetch(e.target.action, {
                    method: 'POST',
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    if(stav) {
                        stav.innerHTML = "Děkujeme! Vaše zpráva byla úspěšně odeslána.";
                        stav.style.color = "#2ecc71";
                    }
                    form.reset();
                    if(btnOdeslat) btnOdeslat.style.display = "none";
                } else {
                    if(stav) {
                        stav.innerHTML = "Došlo k chybě při odesílání. Zkuste to prosím znovu.";
                        stav.style.color = "#e74c3c";
                    }
                    if(btnOdeslat) {
                        btnOdeslat.disabled = false;
                        btnOdeslat.innerText = "Odeslat zprávu";
                    }
                }
            } catch (error) {
                if(stav) {
                    stav.innerHTML = "Chyba připojení k serveru.";
                    stav.style.color = "#e74c3c";
                }
                if(btnOdeslat) {
                    btnOdeslat.disabled = false;
                    btnOdeslat.innerText = "Odeslat zprávu";
                }
            }
        });
    }
});