/* =============================================
   main.js — Dra. Paola Rodríguez Ramos
   ============================================= */

/* -------------------------------------------
   EMAILJS — Reemplaza estos tres valores con
   los que obtengas en emailjs.com
------------------------------------------- */
const EMAILJS_PUBLIC_KEY  = 'HkDaIX200DNToqFUb';
const EMAILJS_SERVICE_ID  = 'service_3ojrbth';
const EMAILJS_TEMPLATE_ID = 'template_nz5sva2';
const EMAILJS_TEMPLATE_PACIENTE_ID = 'template_xt7vfh8'

document.addEventListener('DOMContentLoaded', () => {

  // Inicializar EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

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
     4. APPOINTMENT FORM — Horas dinámicas + EmailJS
  ------------------------------------------- */

  // Horarios según día de la semana
  const SLOTS = {
    // Lunes(1) a Viernes(5): 2 pm – 6 pm
    weekday: ['2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm'],
    // Sábado(6): 8 am – 12 pm
    saturday: ['8:00 am', '9:00 am', '10:00 am', '11:00 am'],
  };

  const fechaInput = document.getElementById('fecha');
  const horaSelect = document.getElementById('hora');
  const horaMsgEl  = document.getElementById('hora-msg');

  // Bloquear fechas anteriores a hoy
  if (fechaInput) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd   = String(hoy.getDate()).padStart(2, '0');
    fechaInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
  }

  function actualizarHoras(fechaVal) {
    if (!horaSelect) return;

    // Limpiar opciones y mensaje previo
    horaSelect.innerHTML = '';
    if (horaMsgEl) {
      horaMsgEl.textContent = '';
      horaMsgEl.style.color = '';
    }

    if (!fechaVal) {
      horaSelect.innerHTML = '<option value="">— Selecciona primero una fecha —</option>';
      horaSelect.disabled = true;
      return;
    }

    // Parsear fecha en hora local (evita desfase UTC)
    const [y, m, d] = fechaVal.split('-').map(Number);
    const diaSemana = new Date(y, m - 1, d).getDay(); // 0=Dom,1=Lun,...,6=Sáb

    let slots = [];

    if (diaSemana === 0) {
      // Domingo — sin atención
      horaSelect.innerHTML = '<option value="">— Sin atención los domingos —</option>';
      horaSelect.disabled = true;
      if (horaMsgEl) {
        horaMsgEl.textContent = 'No hay atención los domingos. Por favor elige otro día.';
        horaMsgEl.style.color = '#c0392b';
      }
      return;
    } else if (diaSemana >= 1 && diaSemana <= 5) {
      slots = SLOTS.weekday;   // Lun – Vie
    } else if (diaSemana === 6) {
      slots = SLOTS.saturday;  // Sábado
    }

    // Construir opciones
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '— Sin preferencia —';
    horaSelect.appendChild(defaultOpt);

    slots.forEach(slot => {
      const opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = slot;
      horaSelect.appendChild(opt);
    });

    horaSelect.disabled = false;
  }

  if (fechaInput) {
    fechaInput.addEventListener('change', () => actualizarHoras(fechaInput.value));
  }

  // --- Formulario ---
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

      // Validar que no sea domingo
      if (fechaInput && fechaInput.value) {
        const [y, m, d] = fechaInput.value.split('-').map(Number);
        if (new Date(y, m - 1, d).getDay() === 0) {
          valid = false;
          const group = fechaInput.closest('.form-group');
          if (group) group.classList.add('error');
        }
      }

      if (!valid) return;

      const nombre   = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const email    = document.getElementById('email').value.trim();
      const motivo   = document.getElementById('motivo').value;
      const fecha    = document.getElementById('fecha').value;
      const hora     = document.getElementById('hora')?.value || '';
      const mensaje  = document.getElementById('mensaje')?.value.trim() || '';

      const btn = citaForm.querySelector('.btn-submit');

      // Enviar con EmailJS
      if (typeof emailjs !== 'undefined' &&
          EMAILJS_PUBLIC_KEY  !== 'TU_PUBLIC_KEY' &&
          EMAILJS_SERVICE_ID  !== 'TU_SERVICE_ID' &&
          EMAILJS_TEMPLATE_ID !== 'TU_TEMPLATE_ID') {

        if (btn) {
          btn.textContent = 'Enviando…';
          btn.disabled = true;
        }

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          nombre:           nombre,
          telefono:         telefono,
          email_paciente:   email,
          motivo:           motivo,
          fecha_preferida:  fecha,
          hora_preferida:   hora || 'Sin preferencia',
          mensaje:          mensaje || 'Ninguno',
        })
        .then(() => {
          // Enviar confirmación al paciente
          return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_PACIENTE_ID, {
            nombre:          nombre,
            email_paciente:  email,
            fecha_preferida: fecha,
            hora_preferida:  hora || 'Sin preferencia',
          });
        })
        .then(() => {
          if (btn) {
            btn.textContent = '¡Solicitud enviada!';
            btn.style.background = '#2E7D32';
            btn.disabled = false;
            setTimeout(() => {
              btn.textContent = 'Enviar Solicitud de Cita';
              btn.style.background = '';
            }, 4000);
          }
          citaForm.reset();
          actualizarHoras('');
        })
        .catch((err) => {
          console.error('EmailJS error:', err);
          if (btn) {
            btn.textContent = 'Error al enviar. Intenta de nuevo.';
            btn.style.background = '#c0392b';
            btn.disabled = false;
            setTimeout(() => {
              btn.textContent = 'Enviar Solicitud de Cita';
              btn.style.background = '';
            }, 4000);
          }
        });

      } else {
        // Fallback mailto (mientras no estén configuradas las claves de EmailJS)
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

        if (btn) {
          const original = btn.textContent;
          btn.textContent = '¡Solicitud enviada!';
          btn.style.background = '#2E7D32';
          setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
          }, 3000);
        }
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
