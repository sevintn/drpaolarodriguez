/* =============================================
   main.js — Dra. Paola Rodríguez Ramos
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------
     1. NAVBAR — Scroll shadow + active link
  ------------------------------------------- */
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Mark active nav link based on current page
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a, .navbar__mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* -------------------------------------------
     2. MOBILE MENU — Hamburger toggle
  ------------------------------------------- */
  const toggle = document.querySelector('.navbar__toggle');
  const mobileMenu = document.querySelector('.navbar__mobile');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });
  }

  /* -------------------------------------------
     3. SMOOTH SCROLL for anchor links
  ------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* -------------------------------------------
     4. APPOINTMENT FORM — Validation + mailto
  ------------------------------------------- */
  const citaForm = document.getElementById('citaForm');

  if (citaForm) {
    citaForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fields = [
        { id: 'nombre',  msg: 'Por favor ingresa tu nombre completo.' },
        { id: 'telefono', msg: 'Por favor ingresa tu número de teléfono.' },
        { id: 'email',   msg: 'Por favor ingresa un correo electrónico válido.', isEmail: true },
        { id: 'motivo',  msg: 'Por favor selecciona el motivo de consulta.' },
        { id: 'fecha',   msg: 'Por favor selecciona una fecha preferida.' },
      ];

      let valid = true;

      fields.forEach(({ id, msg, isEmail }) => {
        const group = document.getElementById(id)?.closest('.form-group');
        const input = document.getElementById(id);
        const errEl = group?.querySelector('.error-msg');

        if (!input || !group) return;

        group.classList.remove('error');
        if (errEl) errEl.textContent = '';

        const val = input.value.trim();
        let fieldOk = val !== '';

        if (isEmail && fieldOk) {
          fieldOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        }

        if (!fieldOk) {
          group.classList.add('error');
          if (errEl) errEl.textContent = msg;
          valid = false;
        }
      });

      if (!valid) return;

      // Build mailto
      const nombre   = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const email    = document.getElementById('email').value.trim();
      const motivo   = document.getElementById('motivo').value;
      const fecha    = document.getElementById('fecha').value;
      const hora     = document.getElementById('hora')?.value || '';
      const mensaje  = document.getElementById('mensaje')?.value.trim() || '';

      const subject = encodeURIComponent(`Solicitud de Cita — ${nombre}`);
      const body = encodeURIComponent(
        `Nombre: ${nombre}\n` +
        `Teléfono: ${telefono}\n` +
        `Correo: ${email}\n` +
        `Motivo de consulta: ${motivo}\n` +
        `Fecha preferida: ${fecha}\n` +
        `Hora preferida: ${hora || 'Sin preferencia'}\n` +
        `Mensaje adicional:\n${mensaje || 'Ninguno'}`
      );

      window.location.href = `mailto:pao.rodriguezra@gmail.com?subject=${subject}&body=${body}`;

      // Success feedback
      const btn = citaForm.querySelector('.btn-submit');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = '¡Solicitud enviada!';
        btn.style.background = '#2E7D32';
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
        }, 3000);
      }
    });
  }

  /* -------------------------------------------
     5. SCROLL REVEAL — Fade-in on scroll
  ------------------------------------------- */
  const revealEls = document.querySelectorAll(
    '.service-card, .service-full-card, .blog-card, .article-full, .timeline-item, .stat-item'
  );

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      io.observe(el);
    });
  }

});
