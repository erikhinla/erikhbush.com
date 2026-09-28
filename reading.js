/* Intersection reveals only. ScrollCraft's data-sc-in class names, without
   the scroll listener in scrollcraft.js. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = [];

  document.querySelectorAll('[data-sc-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, index) {
      child.style.transitionDelay = reduce ? '0ms' : Math.min(index, 5) * 45 + 'ms';
      nodes.push(child);
    });
  });
  document.querySelectorAll('[data-sc-in]').forEach(function (el) {
    nodes.push(el);
  });

  function show(el) {
    el.classList.add('sc-in');
  }

  if (reduce) {
    document.querySelectorAll('.chapter-media video').forEach(function (video) {
      video.pause();
      video.removeAttribute('autoplay');
    });
  }

  if (reduce || !('IntersectionObserver' in window)) {
    nodes.forEach(show);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      show(entry.target);
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  nodes.forEach(function (el) { io.observe(el); });
})();
