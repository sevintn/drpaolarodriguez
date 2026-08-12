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
const EMAILJS_TEMPLATE_PACIENTE_ID = 'template_xt7vfh8';

document.addEventListener('DOMContentLoaded', () => {

  const trackEvent = (eventName, params = {}) => {
    if (typeof gtag !== 'function') return;

    gtag('event', eventName, {
      page_path: window.location.pathname,
      page_title: document.title,
      transport_type: 'beacon',
      ...params,
    });
  };

  const sanitizeLinkUrl = (href, absoluteHref) => {
    if (href.startsWith('tel:')) return 'tel';
    if (href.startsWith('mailto:')) return 'mailto';

    if (href.startsWith('https://wa.me/') || href.startsWith('http://wa.me/')) {
      return absoluteHref.split('?')[0];
    }

    return absoluteHref.split('?')[0];
  };

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
    const setMenuOpen = (isOpen) => {
      toggle.classList.toggle('open', isOpen);
      mobileMenu.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    };

    toggle.addEventListener('click', () => {
      setMenuOpen(!mobileMenu.classList.contains('open'));
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
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
     4. GA4 EVENTS — Contact and appointment CTAs
  ------------------------------------------- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    const linkText = link.textContent.trim().replace(/\s+/g, ' ');
    const params = {
      link_url: sanitizeLinkUrl(href, link.href),
      link_text: linkText,
    };

    if (href.startsWith('https://wa.me/') || href.startsWith('http://wa.me/')) {
      trackEvent('click_whatsapp', {
        ...params,
        contact_method: 'whatsapp',
      });
      return;
    }

    if (href.startsWith('tel:')) {
      trackEvent('click_phone', {
        ...params,
        contact_method: 'phone',
      });
      return;
    }

    if (href.startsWith('mailto:')) {
      trackEvent('click_email', {
        ...params,
        contact_method: 'email',
      });
      return;
    }

    if (href.includes('g.page/r/') || href.includes('/review')) {
      trackEvent('click_google_review', params);
      return;
    }

    if (href === 'cita.html' || href.endsWith('/cita.html') || link.classList.contains('btn-cita')) {
      trackEvent('click_appointment_cta', params);
    }
  });

  /* -------------------------------------------
     5. APPOINTMENT FORM — Horas dinámicas + EmailJS
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
    const btn = citaForm.querySelector('.btn-submit');
    const formStatus = document.createElement('p');
    formStatus.className = 'form-status';
    formStatus.setAttribute('aria-live', 'polite');
    if (btn) {
      btn.insertAdjacentElement('afterend', formStatus);
    }

    const setFormStatus = (message, type = '') => {
      formStatus.textContent = message;
      formStatus.className = `form-status${type ? ` form-status--${type}` : ''}`;
    };

    const setButtonState = (text, type = '') => {
      if (!btn) return;
      btn.textContent = text;
      btn.classList.toggle('btn-submit--success', type === 'success');
      btn.classList.toggle('btn-submit--error', type === 'error');
    };

    const resetButtonState = () => {
      setButtonState('Enviar Solicitud de Cita');
      if (btn) btn.disabled = false;
    };

    citaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      trackEvent('appointment_form_submit_attempt', {
        form_location: 'cita',
      });
      setFormStatus('');

      const fields = [
        { id: 'nombre',  msg: 'Por favor ingresa tu nombre completo.' },
        { id: 'telefono', msg: 'Por favor ingresa un teléfono válido.', isPhone: true },
        { id: 'email',   msg: 'Por favor ingresa un correo electrónico válido.', isEmail: true },
        { id: 'motivo',  msg: 'Por favor selecciona el motivo de consulta.' },
        { id: 'fecha',   msg: 'Por favor selecciona una fecha preferida.' },
      ];

      let valid = true;

      fields.forEach(({ id, msg, isEmail, isPhone }) => {
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

        if (isPhone && fieldOk) {
          fieldOk = val.replace(/\D/g, '').length >= 8;
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

      if (!valid) {
        setFormStatus('Revisa los campos marcados antes de enviar la solicitud.', 'error');
        return;
      }

      const nombre   = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const email    = document.getElementById('email').value.trim();
      const motivo   = document.getElementById('motivo').value;
      const fecha    = document.getElementById('fecha').value;
      const hora     = document.getElementById('hora')?.value || '';
      const mensaje  = document.getElementById('mensaje')?.value.trim() || '';

      // Enviar con EmailJS
      if (typeof emailjs !== 'undefined' &&
          EMAILJS_PUBLIC_KEY  !== 'TU_PUBLIC_KEY' &&
          EMAILJS_SERVICE_ID  !== 'TU_SERVICE_ID' &&
          EMAILJS_TEMPLATE_ID !== 'TU_TEMPLATE_ID') {

        if (btn) {
          setButtonState('Enviando...');
          btn.disabled = true;
        }
        setFormStatus('Enviando tu solicitud de cita...', 'pending');

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
          trackEvent('appointment_form_submit_success', {
            form_location: 'cita',
            conversion: true,
          });
          if (btn) {
            setButtonState('¡Solicitud enviada!', 'success');
            btn.disabled = false;
            setTimeout(() => {
              resetButtonState();
              setFormStatus('');
            }, 4000);
          }
          setFormStatus('Solicitud enviada correctamente. Te contactaremos para confirmar disponibilidad.', 'success');
          citaForm.reset();
          actualizarHoras('');
        })
        .catch((err) => {
          console.error('EmailJS error:', err);
          trackEvent('appointment_form_submit_error', {
            form_location: 'cita',
            error_type: 'emailjs',
          });
          if (btn) {
            setButtonState('Error al enviar. Intenta de nuevo.', 'error');
            btn.disabled = false;
            setTimeout(() => {
              resetButtonState();
            }, 4000);
          }
          setFormStatus('No se pudo enviar la solicitud. Intenta de nuevo o escribe por WhatsApp al 9946-1535.', 'error');
        });

      } else {
        trackEvent('appointment_form_mailto_fallback', {
          form_location: 'cita',
          conversion: true,
        });
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
          setButtonState('Abriendo correo...', 'success');
          setTimeout(() => {
            resetButtonState();
          }, 3000);
        }
        setFormStatus('Se abrió tu cliente de correo para enviar la solicitud.', 'success');
      }
    });
  }

  /* -------------------------------------------
     6. SCROLL REVEAL — Fade-in on scroll
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
