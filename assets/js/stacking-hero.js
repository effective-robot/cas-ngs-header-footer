(function () {
	'use strict';

	function initializeStackingHeroes() {
		if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
			return;
		}

		window.gsap.registerPlugin(window.ScrollTrigger);
		document.querySelectorAll('.csh-root').forEach(function (root) {
			if (root.dataset.stackingHeroInitialized === 'true') return;
			root.dataset.stackingHeroInitialized = 'true';

			var stack = root.querySelector('.stack-container');
			var cards = window.gsap.utils.toArray(root.querySelectorAll('.bio-card'));

			cards.forEach(function (card, index) {
				if (index > 0) window.gsap.set(card, { yPercent: 100, opacity: 0 });
			});

			var timeline = window.gsap.timeline({
				scrollTrigger: {
					trigger: stack,
					start: 'top top',
					end: function () { return '+=' + (window.innerHeight * 3); },
					pin: true,
					scrub: 0.8,
					invalidateOnRefresh: true
				}
			});

			timeline.to(cards[1], { yPercent: 0, duration: 1, ease: 'none' }, 0)
				.to(cards[1], { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0);
			timeline.to(cards[2], { yPercent: 0, duration: 1, ease: 'none' }, '+=0.2')
				.to(cards[2], { opacity: 1, duration: 0.8, ease: 'power1.out' }, '<');
			timeline.to(cards[3], { yPercent: 0, duration: 1, ease: 'none' }, '+=0.2')
				.to(cards[3], { opacity: 1, duration: 0.8, ease: 'power1.out' }, '<');
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeStackingHeroes);
	} else {
		initializeStackingHeroes();
	}
})();