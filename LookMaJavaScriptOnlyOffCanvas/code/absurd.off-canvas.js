var absurd = Absurd();
absurd.component('OffCanvas', {
	isOpen: false,
	links: [
		{ label: 'The library', url: 'http://absurdjs.com/'},
		{ label: 'Documentation', url: 'http://absurdjs.com/pages/documentation/'},
		{ label: 'Download', url: 'http://absurdjs.com/pages/builds/'},
		{ label: 'Contribute', url: 'http://absurdjs.com/#contribute'},
		{ label: 'Testing', url: 'http://absurdjs.com/#testing'}
	],
	styleIt: function(animateToggle) {
		this.css = {
			'.menu': {
				pos: 'a', top: 0, left: '100%', hei: '100%',
				mar: '0 0 0 ' + (this.isOpen ? -380 : -80) + 'px',
				'-wmo-trs': 'all 800ms', '-wm-bxz': 'bb',
				'.toggle': { 					
					ted: 'n', d: 'b', ta: 'c', mar: '20px 0 0 0',
					color: this.isOpen ? '#BDBDBD': '#6E6E6E',
					wid: '60px', va: 'm',
					'-wmo-trs': 'all 400ms',
					bdb: 'dotted 1px #FFF',
					'&:hover': { color: '#000', bdb: 'dotted 1px #333' }
				},
				'.menu-content': {
					pos: 'a', top: 0, left: '80px', wid: '300px', bg: '#565656', hei: '100%',
					p: { pad: '20px', mar: 0, color: '#FFF', fz: '30px' },
					a: {
						d: 'b', color: '#FFF', ted: 'n', '-wm-bxz': 'bb',
						wid: '100%', pad: '6px 20px',
						bdt: 'dotted 1px #999', bdb: 'dotted 1px #333',
						'-wmo-trs': 'all 200ms',
						'&:hover': { pad: '6px 20px 6px 30px', bg: '#848484' }
					}
				}
			}
		}
		if(animateToggle) {
			this.css['.menu']['.toggle'].animate = 'bounceInDown';
		}
		return this;
	},
	buildIt: function() {
		this.html = {
			'.menu': {
				'a.toggle[href="#" data-absurd-event="click:toggle"]': this.isOpen ? 'Close' : 'Menu',
				'.menu-content': {
					p: 'Wow ... it works!',
					'.links': [
						'<% for(var i=0, link; i<links.length, link=links[i]; i++) { %>',
						{ 'a[href="#"]': '<% link.label %>' },
						'<% } %>'
					]
				}
			}
		}
		return this;
	},
	toggle: function(e) {
		this.isOpen = !this.isOpen;
		this.styleIt(this.isOpen).buildIt().populate();
	},
	ready: function(dom) {
		this
		.set('parent', dom('body').el)
		.styleIt().buildIt().populate();
	}
})();