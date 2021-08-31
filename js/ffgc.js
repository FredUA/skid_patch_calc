
const translate = {};
translate.en =
	{
		's0': 'meters',
		's5': 'inches',
		's10': 'imperial',
		's20': 'metric',
		's30': 'Settings',
		's40': 'Chain ring',
		's50': 'Rear sproket',
		's60': 'About',
		's70': 'Tire',
		's80': 'Ambidextrous skid',
		's90': 'Analysis',
		's100': 'Ratio',
		's110': 'Skid patch',
		's120': 'Development',
		's130': 'Equivalent gear &plusmn;2%',
		's140': 'Cadence &#47; Speed',
	};
translate.fr = 
	{
		's0': 'm&egrave;tres',
		's5': 'pouces',
		's10': 'imp&eacute;rial',
		's20': 'm&eacute;trique',
		's30': 'Param&egrave;tres',
		's40': 'Plateau',
		's50': 'Pignon',
		's60': '&Agrave; propos',
		's70': 'Pneu',
		's80': 'Skid ambidextre',
		's90': 'Analyse',
		's100': 'Ratio',
		's110': 'Skid patch',
		's120': 'D&eacute;veloppement',
		's130': 'Ratios &eacute;quivalents &plusmn;2%',
		's140': 'Cadence &#47; Vitesse',
	};
let lang = null;
let unit = null;
const multi = document.querySelectorAll('.multi');
const overlay = document.querySelector('.js-overlay');

if ( lang == "fr" ) {
	l1.removeAttribute('checked');
	l2.setAttribute('checked', 'checked');
	u1.removeAttribute('checked');
	u2.setAttribute('checked', 'checked');
}

const init = () => {
	for (let i = 0; i < multi.length; i++) {
		multi[i].innerHTML = translate[lang][multi[i].id]
	}
};

const changeLang = () => {
	if(document.querySelector('input[name="lang"]:checked')) {
		lang = document.querySelector('input[name="lang"]:checked').value;
	} else {
		lang = ( navigator.language == "fr" ) ? "fr" : "en";
		document.querySelector(`input[name="lang"][value=${lang}]`).checked = true
	}

	init();
	draw();
}

const changeUnit = (value = 'i') => {
	if(document.querySelector('input[name="unit"]:checked')) {
		unit = document.querySelector('input[name="unit"]:checked').value;
	} else {
		unit = value;
		document.querySelector(`input[name="unit"][value=${value}]`).checked = true
	}

	draw();
}

changeLang();
changeUnit();





// $('.dialog').dialog({ autoOpen: false, modal: true }); //TODO: remove jQuery dialog plugin

r.addEventListener('change', draw);
s.addEventListener('change', draw);
t.addEventListener('change', draw);
a.addEventListener('change', draw);
u1.addEventListener('change', changeUnit);
u2.addEventListener('change', changeUnit);
l1.addEventListener('change', changeLang);
l2.addEventListener('change', changeLang);


container.addEventListener('click', function(e) {
	if ( e.target.classList.contains('clickable') ) {
		const _id = `dialog-${e.target.id}-${lang}`;
		const modal = document.getElementById(_id);
		const close = modal.querySelector('.js-close');

		modal.setAttribute('open', true);
		close.addEventListener('click',function() {
			body.classList.toggle('show-dialog');
			modal.removeAttribute('open');
		}, {once: true});
		body.classList.toggle('show-dialog');

	}
});

overlay.addEventListener('click', function() {
	document.querySelector('.dialog[open="true"] .js-close').click();
})


function pgcd(a,b) { return ( b == 0 ) ? a : pgcd(b, a%b); }

function draw(){
	let R = r.value;
	let S = s.value;
	let thispgcd=pgcd(R,S);
	let sp = S/thispgcd;
	let simp_den = R/thispgcd;
	const canvas = wheel;

	if (canvas.getContext){
		let posx = 80,
			posy = 80,
			ctx = canvas.getContext('2d');

		ctx.clearRect(0,0,300,300);

		// Roue
		ctx.beginPath();
		ctx.strokeStyle = "#333333";
		ctx.lineWidth=4;
		ctx.arc(posx,posy,72,0,Math.PI*2,true);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = "#AAAAAA";
		ctx.lineWidth=3;
		ctx.arc(posx,posy,67,0,Math.PI*2,true);
		ctx.stroke();

		// Rayons
		ctx.strokeStyle = "#BBBBBB";
		ctx.lineWidth=1;
		for (var i=0; i<32; i++) {
			ctx.beginPath();
			ctx.arc(posx,posy,67,i*(Math.PI*2/32),((i+0.2)*Math.PI*2/32),false);
			ctx.lineTo(posx,posy);
			ctx.stroke();
		}

		// Skid patchs
		ctx.strokeStyle = "#FF0055";
		ctx.lineWidth=8;
		for (let i=0; i<sp; i++) {
			ctx.beginPath();
			ctx.arc(posx,posy,70,i*(Math.PI*2/sp),((i+0.2)*Math.PI*2/sp),false);
			ctx.stroke();
		}

		if ( a.checked && simp_den%2 > 0 ) {
			ctx.strokeStyle = "#0088FF";
			let offset = Math.PI/sp;
			for (let i=0; i<sp; i++) {
				ctx.beginPath();
				ctx.arc(posx,posy,70,i*(Math.PI*2/sp)+offset,((i+0.2)*Math.PI*2/sp)+offset,false);
				ctx.stroke();
			}
		}

		// Plateau et pignon
		cog(ctx,S,posx,posy);
		cog(ctx,R,posx+100,posy);

		// Chaine
		ctx.beginPath();
		ctx.strokeStyle = "#888888";
		ctx.lineWidth=2;
		ctx.moveTo(posx,posy-S/2);
		ctx.lineTo(posx+100,posy-R/2+2);
		ctx.arc(posx+100,posy,R/2-2,-Math.PI/2,Math.PI/2,false);
		ctx.lineTo(posx,posy+S/2);
		ctx.arc(posx,posy,S/2,Math.PI/2,-Math.PI/2,false);
		ctx.stroke();
	}

	ratio.innerHTML = nformat( Math.round(R/S*100)/100, lang );

	var rsp = ( a.checked && simp_den%2 > 0 ) ? sp*2 : sp;
	skidpatch.innerHTML = rsp;

	var thisFactor = 1;
	var thisUnit = '';
	if ( unit == "m" ) {
		thisUnit = translate[lang]['s0'];
	} else {
		thisFactor = 0.0254;
		thisUnit = translate[lang]['s5'];
	}

	var _dev = (R/S) * t.value/1000; // developpement en m�tres
	dev.innerHTML = `${nformat( Math.round(_dev*100/thisFactor)/100, lang )} ${thisUnit}`;

	var _near = '';
	var _ratio = R/S;
	for (var i=28; i<60; i++) {
		for (var j=9; j<24; j++) {
			if ( Math.abs(_ratio - i/j) < _ratio*0.02 ) {
				_near = `${_near}<button class="equivalent"
						onclick="r.value = '${i}', s.value = '${j}', draw(${i}, ${j})"
						title="${Math.round(i/j*100)/100}">
							${i}&times;${j}
						</button>`;
			}
		}
	}

	near.innerHTML = _near;

	var _speeds = '<dl>';
	var thisFactor = 1;
	var thisUnit = ' km/h';
	var thisUnit2 = '@';
	var thisUnit3 = ' rpm';
	if ( unit == "i" ) {
		thisFactor = 1.609;
		thisUnit = ' mph';
	}
	if ( lang == "fr" ) {
		thisUnit2 = '';
		thisUnit3 = ' tr/mn';
	}
	for (var i=50; i<=130; i= i+10) {
		_speeds = `${_speeds}<div class="cadence">
					<dd>${nformat( Math.round(_dev*i/100*60/thisFactor)/10, lang )} ${thisUnit}</dd>
					<dt>${thisUnit2 + i + thisUnit3}</dt>
				</div>`;
	}
	_speeds = _speeds + '</dl>'
	speeds.innerHTML = _speeds;
}

function cog(ctx,teeth,x,y) {
	ctx.beginPath();
	ctx.arc(x,y,teeth/2.5,0,Math.PI*2,true); // Cercle ext�rieur
	ctx.fillStyle = "#333333";
	ctx.fill();
	for (var i=0; i<teeth; i++) {
		ctx.beginPath();
		ctx.arc(x,y,teeth/2.5+2,i*(Math.PI*2/teeth),((i+0.5)*Math.PI*2/teeth),false);
		ctx.lineTo(x,y);
		ctx.fill();
	}
	for (var i=0; i<5; i++) {
		ctx.beginPath();
		ctx.fillStyle = "#fafafa";
		ctx.arc(x,y,(teeth-5)/3.5,i*(Math.PI*2/5),((i+0.7)*Math.PI*2/5),false);
		ctx.lineTo(x,y);
		ctx.fill();
	}
} 

function nformat(num,lang) {
	var str = String(num);
	if ( lang == "fr" ) {
		return (str.replace(/\./g, ','));
	} else {
		return (str);
	}
}
