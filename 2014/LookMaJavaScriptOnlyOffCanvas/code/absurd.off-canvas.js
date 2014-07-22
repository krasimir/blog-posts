var absurd = Absurd();
var Menu = absurd.component('OffCanvas', {
	links: [],
	content: null,
	position: null,
	isOpen: false,
	styleIt: function() {
		var x = this.position == 'right' ? (this.isOpen ? -380 : -80) : (this.isOpen ? 300 : 0);
		var leftMenu = this.position == 'right' ? '100%' : '10px';
		var leftMenuContent = this.position == 'right' ? '80px' : '-310px';
		this.css = {
			'.menu': {
				pos: 'f', 
				top: 0, 
				left: leftMenu, 
				hei: '100%',
				mar: '0 0 0 ' + x + 'px',
				'-wmo-trs': 'all 400ms',				
				'.toggle': {
					ted: 'n', 
					d: 'b', 
					ta: 'c', 
					mar: '20px 0 0 0',
					color: this.isOpen ? '#BDBDBD': '#6E6E6E',
					wid: '60px',
					'-wmo-trs': 'all 400ms',
					bdb: 'dotted 1px #FFF',
					'&:hover': { color: '#000', bdb: 'dotted 1px #333' }
				},
				'.menu-content': {
					pos: 'a', 
					top: 0, 
					left: leftMenuContent, 
					wid: '300px', 
					bg: '#565656', 
					hei: '100%',
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
		this.css[this.content] = { '-wmo-trs': 'all 400ms' };
		if(this.isOpen) {
			this.css[this.content][this.position == 'left' ? 'pl' : 'pr'] = '320px';
		}
		if(this.isOpen) {
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
	toggle: function(e, dom) {
		e.preventDefault();
		this.isOpen = !this.isOpen;
		this.styleIt().buildIt().populate();
	},
	ready: function(dom) {
		this
		.set('parent', dom('body').el)
		.styleIt().buildIt().populate();
	},
	constructor: function(links, content, position) {
		this.links = links;
		this.content = content;
		this.position = position;
	}
});

Menu([
	{ label: 'The library', url: 'http://absurdjs.com/'},
	{ label: 'Documentation', url: 'http://absurdjs.com/pages/documentation/'},
	{ label: 'Download', url: 'http://absurdjs.com/pages/builds/'},
	{ label: 'Contribute', url: 'http://absurdjs.com/#contribute'},
	{ label: 'Testing', url: 'http://absurdjs.com/#testing'}
], '.content', 'right');