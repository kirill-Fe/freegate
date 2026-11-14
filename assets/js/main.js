/* ============================================================================
   FreeGate — вся интерактивность сайта. Без зависимостей, без трекеров.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var reducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ год -- */
  var year = $("#year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------- демо интерфейса -- */
  (function demo() {
    var root = $("#demo");
    if (!root) return;

    var btn = $("#powerBtn", root);
    var pill = $("[data-pill]", root);
    var label = $("[data-label]", root);
    var clock = $("[data-clock]", root);
    var timerState = $("[data-timer-state]", root);
    var hint = $("[data-hint]", root);
    var rxEl = $("[data-rx]", root);
    var txEl = $("[data-tx]", root);

    var OFF = "off";
    var CONNECTING = "connecting";
    var ON = "on";

    var state = OFF;
    var startedAt = 0;
    var rx = 0;
    var tx = 0;
    var tickId = null;
    var trafficId = null;
    var connectId = null;

    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function formatDuration(ms) {
      var total = Math.max(0, Math.floor(ms / 1000));
      var h = Math.floor(total / 3600);
      var m = Math.floor((total % 3600) / 60);
      var s = total % 60;
      return pad(h) + ":" + pad(m) + ":" + pad(s);
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return Math.round(bytes) + " Б";
      var units = ["КБ", "МБ", "ГБ"];
      var value = bytes / 1024;
      var i = 0;
      while (value >= 1024 && i < units.length - 1) {
        value /= 1024;
        i++;
      }
      var digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
      return value.toFixed(digits).replace(".", ",") + " " + units[i];
    }

    function setState(next) {
      state = next;
      root.classList.toggle("is-on", next === ON);
      root.classList.toggle("is-connecting", next === CONNECTING);

      // Вне состояния "on" часы всегда показывают нули — иначе после
      // выключения на долю секунды мелькает Date.now() - 0.
      if (next !== ON && clock) {
        clock.textContent = "00:00:00";
      }

      if (next === OFF) {
        label.textContent = "ВКЛЮЧИТЬ";
        pill.textContent = "НЕ ПОДКЛЮЧЕНО";
        timerState.textContent = "пауза";
        hint.textContent = "Таймер запустится после подключения";
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", "Включить VPN в демо");
      } else if (next === CONNECTING) {
        label.textContent = "ПОДКЛЮЧЕНИЕ";
        pill.textContent = "ПОДКЛЮЧЕНИЕ…";
        timerState.textContent = "подключение";
        hint.textContent = "Поднимаем туннель — это демо, поэтому мгновенно";
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", "Отменить подключение в демо");
      } else {
        label.textContent = "ВЫКЛЮЧИТЬ";
        pill.textContent = "ЗАЩИЩЕНО";
        timerState.textContent = "работает";
        hint.textContent = "Туннель работает — можно свернуть демо";
        btn.setAttribute("aria-pressed", "true");
        btn.setAttribute("aria-label", "Выключить VPN в демо");
      }
    }

    function renderClock() {
      if (!clock) return;
      clock.textContent = state === ON ? formatDuration(Date.now() - startedAt) : "00:00:00";
    }

    function renderTraffic() {
      if (rxEl) rxEl.textContent = formatBytes(rx);
      if (txEl) txEl.textContent = formatBytes(tx);
    }

    function stopTimer() {
      if (tickId) {
        window.clearInterval(tickId);
        tickId = null;
      }
    }

    function stopTraffic() {
      if (trafficId) {
        window.clearInterval(trafficId);
        trafficId = null;
      }
    }

    function disconnect() {
      if (connectId) {
        window.clearTimeout(connectId);
        connectId = null;
      }
      stopTimer();
      stopTraffic();
      startedAt = 0;
      rx = 0;
      tx = 0;
      setState(OFF);
      renderClock();
      renderTraffic();
    }

    function connect() {
      if (state !== OFF) return;
      setState(CONNECTING);
      connectId = window.setTimeout(function () {
        connectId = null;
        startedAt = Date.now();
        setState(ON);
        renderClock();

        tickId = window.setInterval(renderClock, 250);

        // Имитация трафика: цифры растут плавно, как в приложении.
        trafficId = window.setInterval(function () {
          rx += 900 + Math.round(Math.random() * 7400);
          tx += 260 + Math.round(Math.random() * 1500);
          renderTraffic();
        }, 900);
      }, 850);
    }

    btn.addEventListener("click", function () {
      if (state === ON) {
        disconnect();
      } else if (state === CONNECTING) {
        disconnect();
      } else {
        connect();
      }
    });

    // При уходе со страницы не копим таймеры.
    document.addEventListener("visibilitychange", function () {
      if (state !== ON) return;
      if (document.hidden) {
        stopTimer();
        stopTraffic();
      } else {
        renderClock();
        if (!tickId) tickId = window.setInterval(renderClock, 250);
        if (!trafficId) {
          trafficId = window.setInterval(function () {
            rx += 900 + Math.round(Math.random() * 7400);
            tx += 260 + Math.round(Math.random() * 1500);
            renderTraffic();
          }, 900);
        }
      }
    });

    setState(OFF);
    renderClock();
    renderTraffic();
  })();

  /* ------------------------------------------------------- мобильное меню -- */
  (function mobileNav() {
    var burger = $("#burger");
    var nav = $("#nav");
    if (!burger || !nav) return;

    var desktop = window.matchMedia("(min-width: 941px)");

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    }

    burger.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        burger.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || burger.contains(event.target)) return;
      setOpen(false);
    });

    if (desktop.addEventListener) {
      desktop.addEventListener("change", function (event) {
        if (event.matches) setOpen(false);
      });
    } else if (desktop.addListener) {
      desktop.addListener(function (event) {
        if (event.matches) setOpen(false);
      });
    }
  })();

  /* ---------------------------------------------------- появление блоков -- */
  (function reveal() {
    var items = $$(".reveal");
    if (!items.length) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  })();

  /* ------------------------------------------------------ активная ссылка -- */
  (function activeNav() {
    var nav = $("#nav");
    if (!nav) return;

    var pairs = $$("a[href^='#']", nav)
      .map(function (link) {
        var id = link.getAttribute("href").slice(1);
        var section = id ? document.getElementById(id) : null;
        return section ? { link: link, section: section } : null;
      })
      .filter(Boolean);

    if (!pairs.length) return;

    var header = $(".header");
    var pending = false;

    function update() {
      pending = false;
      var offset =
        (header ? header.offsetHeight : 68) + Math.min(140, window.innerHeight * 0.22);
      var current = null;
      var bestTop = -Infinity;

      // Берём секцию, которая ближе всего к линии отсчёта, а не последнюю
      // по порядку ссылок: в меню «ПК» стоит после «Скачать», хотя на
      // странице этот блок находится выше.
      pairs.forEach(function (pair) {
        var top = pair.section.getBoundingClientRect().top;
        if (top - offset <= 0 && top > bestTop) {
          bestTop = top;
          current = pair;
        }
      });

      if (!current) {
        var firstTop = Infinity;
        pairs.forEach(function (pair) {
          var top = pair.section.getBoundingClientRect().top;
          if (top < firstTop) {
            firstTop = top;
            current = pair;
          }
        });
      }

      pairs.forEach(function (pair) {
        pair.link.classList.toggle("is-active", pair === current);
      });
    }

    function onScroll() {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  })();

  /* ---------------------------------------------------------- копирование -- */
  (function copyButtons() {
    var buttons = $$(".copy");
    if (!buttons.length) return;

    function fallbackCopy(text) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (error) {
        ok = false;
      }
      document.body.removeChild(area);
      return ok;
    }

    function resolveText(button) {
      var targetId = button.getAttribute("data-copy-target");
      if (targetId) {
        var target = document.getElementById(targetId);
        return target ? target.textContent.trim() : "";
      }
      var codeBlock = button.closest(".code");
      if (codeBlock) {
        var code = $("pre code", codeBlock);
        if (code) return code.textContent.replace(/\s+$/, "");
      }
      return "";
    }

    buttons.forEach(function (button) {
      var original = button.textContent;

      button.addEventListener("click", function () {
        var text = resolveText(button);
        if (!text) return;

        function done(ok) {
          button.textContent = ok ? "Скопировано" : "Не вышло";
          button.classList.toggle("is-done", ok);
          window.setTimeout(function () {
            button.textContent = original;
            button.classList.remove("is-done");
          }, 1800);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () {
              done(true);
            },
            function () {
              done(fallbackCopy(text));
            }
          );
        } else {
          done(fallbackCopy(text));
        }
      });
    });
  })();

  /* ------------------------------------------------------------ лайтбокс -- */
  (function lightbox() {
    var dialog = $("#lightbox");
    var image = $("#lightboxImg");
    if (!dialog || !image || typeof dialog.showModal !== "function") return;

    var closeBtn = $(".lightbox__close", dialog);
    var lastFocused = null;

    function open(button) {
      var full = button.getAttribute("data-full");
      if (!full) return;
      var thumb = $("img", button);
      image.src = full;
      image.alt = thumb ? thumb.alt : "Скриншот FreeGate";
      lastFocused = button;
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    }

    function close() {
      if (dialog.open) dialog.close();
    }

    $$("[data-full]").forEach(function (button) {
      button.addEventListener("click", function () {
        open(button);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", close);
    }

    // Клик по затемнённому фону (самому dialog, не по картинке) закрывает.
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) close();
    });

    dialog.addEventListener("close", function () {
      document.documentElement.style.overflow = "";
      image.removeAttribute("src");
      if (lastFocused) lastFocused.focus();
    });
  })();

  /* ------------------------------------------------- подсказка про систему -- */
  (function osHint() {
    var node = $("[data-os-hint]");
    if (!node) return;

    var ua = navigator.userAgent || "";
    var message = "";

    if (/Android/i.test(ua)) {
      message =
        "Вы открыли страницу с Android — можно сразу скачивать APK и ставить. " +
        "Если файл откроется как текст, скачайте его ещё раз через Chrome.";
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      message =
        "Судя по устройству, у вас iPhone или iPad. FreeGate — приложение для Android, " +
        "на iOS его установить нельзя (нужен платный Apple Developer). " +
        "Можно поставить официальный WireGuard из App Store и импортировать туда конфиг из инструкции.";
    } else if (/Windows|Macintosh|Linux/i.test(ua)) {
      message =
        "Вы на компьютере: APK предназначен для Android и здесь не установится. " +
        "VPN для ПК ещё в разработке — прогресс в разделе «VPN для ПК». " +
        "Пока используйте официальный WireGuard для вашей системы с конфигом из инструкции.";
    }

    if (message) {
      node.textContent = message;
      node.hidden = false;
    }
  })();
})();
