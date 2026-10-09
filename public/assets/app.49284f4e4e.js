(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const W = s => s.trim().split(/\s+/);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const blank = x => x.replace(/[^\n]/g, ' ');
const store = {
  get(k, d) { try { const v = localStorage.getItem('pip:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('pip:' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------------- dictionaries ---------------- */
const TAGLIST = W(`a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr svg path circle rect line ellipse polyline polygon g defs use text tspan lineargradient radialgradient stop clippath mask symbol pattern filter marker image foreignobject animate animatetransform center font marquee`);
const TAGS = new Set(TAGLIST);
const COMMON_TAGS = W('div p span a button img h1 h2 h3 ul ol li section header footer nav main input label form article strong');
const VOID = new Set(W('area base br col embed hr img input link meta source track wbr param'));
const INLINE = new Set(W('a abbr b bdi bdo cite code data dfn em i kbd label mark q s samp small span strong sub sup time u var title option h1 h2 h3 h4 h5 h6 p li td th dt dd figcaption summary legend caption textarea output rp rt'));
const OPTIONAL = new Set(W('li p td th tr dt dd option optgroup thead tbody tfoot colgroup html head body rp rt'));
const ATTRLIST = W(`accept accept-charset accesskey action allow allowfullscreen alt async autocapitalize autocomplete autofocus autoplay charset checked cite class cols colspan content contenteditable controls coords crossorigin data datetime decoding default defer dir dirname disabled download draggable enctype enterkeyhint for form formaction frameborder headers height hidden high href hreflang http-equiv id inert inputmode integrity is itemprop kind label lang list loading loop low max maxlength media method min minlength multiple muted name nonce novalidate open optimum pattern ping placeholder playsinline popover popovertarget poster preload readonly referrerpolicy rel required reversed role rows rowspan sandbox scope selected shape size sizes slot span spellcheck src srcdoc srclang srcset start step style tabindex target title translate type usemap value width wrap xmlns viewBox fill stroke stroke-width stroke-linecap stroke-linejoin d cx cy r rx ry x y x1 y1 x2 y2 points transform opacity fill-opacity stroke-dasharray offset stop-color preserveAspectRatio font-size text-anchor dominant-baseline onclick ondblclick oninput onchange onsubmit onreset onkeydown onkeyup onkeypress onload onfocus onblur onmouseover onmouseout onmouseenter onmouseleave onmousedown onmouseup onmousemove onscroll onresize ontouchstart ontouchend ontouchmove onerror onwheel oncontextmenu ondrag ondrop ondragover onpointerdown onpointerup onpointermove onanimationend ontransitionend`);
const ATTRS = new Set(ATTRLIST.map(a => a.toLowerCase()));
const BOOL = new Set(W('async autofocus autoplay checked controls default defer disabled hidden inert loop multiple muted novalidate open playsinline readonly required reversed selected'));
const GLOBAL_ATTRS = W('class id style title hidden tabindex onclick lang dir draggable contenteditable');
const TAG_ATTRS = {
  a: 'href target rel download', img: 'src alt width height loading', input: 'type name placeholder value required min max',
  button: 'type disabled', link: 'rel href', script: 'src defer type', meta: 'name content charset', form: 'action method',
  label: 'for', textarea: 'name rows cols placeholder', select: 'name multiple', option: 'value selected',
  video: 'src controls autoplay muted loop poster', audio: 'src controls autoplay loop', iframe: 'src title width height',
  source: 'src type', td: 'colspan rowspan', th: 'colspan rowspan scope', ol: 'start reversed type', canvas: 'width height',
  svg: 'viewBox width height xmlns fill', path: 'd fill stroke stroke-width', circle: 'cx cy r fill stroke', rect: 'x y width height rx fill',
  details: 'open', dialog: 'open', progress: 'value max', meter: 'value min max'
};
const ATTR_VALUES = {
  type: W('text email password number checkbox radio range date time color file submit button search tel url hidden reset datetime-local month week'),
  target: W('_blank _self _parent _top'), method: W('get post'), loading: W('lazy eager'), rel: W('stylesheet icon preconnect noopener noreferrer'),
  autocomplete: W('on off name email username current-password new-password'), dir: W('ltr rtl auto'), lang: W('en he es fr de ar')
};
const PROPLIST = W(`accent-color align-content align-items align-self all animation animation-delay animation-direction animation-duration animation-fill-mode animation-iteration-count animation-name animation-play-state animation-timing-function appearance aspect-ratio backdrop-filter backface-visibility background background-attachment background-blend-mode background-clip background-color background-image background-origin background-position background-repeat background-size block-size border border-block border-bottom border-bottom-color border-bottom-left-radius border-bottom-right-radius border-bottom-style border-bottom-width border-collapse border-color border-image border-inline border-left border-left-color border-left-style border-left-width border-radius border-right border-right-color border-right-style border-right-width border-spacing border-style border-top border-top-color border-top-left-radius border-top-right-radius border-top-style border-top-width border-width bottom box-shadow box-sizing break-inside caption-side caret-color clear clip clip-path color color-scheme column-count column-gap column-rule column-width columns contain container container-name container-type content counter-increment counter-reset cursor direction display empty-cells fill filter flex flex-basis flex-direction flex-flow flex-grow flex-shrink flex-wrap float font font-family font-feature-settings font-kerning font-size font-stretch font-style font-variant font-variant-numeric font-weight gap grid grid-area grid-auto-columns grid-auto-flow grid-auto-rows grid-column grid-column-end grid-column-start grid-row grid-row-end grid-row-start grid-template grid-template-areas grid-template-columns grid-template-rows height hyphens image-rendering inline-size inset inset-block inset-inline isolation justify-content justify-items justify-self left letter-spacing line-clamp line-height list-style list-style-image list-style-position list-style-type margin margin-block margin-block-end margin-block-start margin-bottom margin-inline margin-inline-end margin-inline-start margin-left margin-right margin-top mask mask-image max-block-size max-height max-inline-size max-width min-block-size min-height min-inline-size min-width mix-blend-mode object-fit object-position offset opacity order orphans outline outline-color outline-offset outline-style outline-width overflow overflow-wrap overflow-x overflow-y overscroll-behavior padding padding-block padding-block-end padding-block-start padding-bottom padding-inline padding-inline-end padding-inline-start padding-left padding-right padding-top perspective perspective-origin place-content place-items place-self pointer-events position quotes resize right rotate row-gap scale scroll-behavior scroll-margin scroll-padding scroll-snap-align scroll-snap-type scrollbar-color scrollbar-gutter scrollbar-width shape-outside stroke stroke-width stroke-dasharray stroke-dashoffset stroke-linecap tab-size table-layout text-align text-align-last text-decoration text-decoration-color text-decoration-line text-decoration-style text-decoration-thickness text-indent text-overflow text-rendering text-shadow text-transform text-underline-offset text-wrap top touch-action transform transform-origin transform-style transition transition-delay transition-duration transition-property transition-timing-function translate unicode-bidi user-select vertical-align visibility white-space widows width will-change word-break word-spacing word-wrap writing-mode z-index zoom`);
const PROPS = new Set(PROPLIST);
const COMMON_PROPS = W('display color background padding margin width height font-size border border-radius flex justify-content align-items gap position top left font-weight text-align box-shadow transition cursor grid-template-columns opacity transform background-color font-family line-height');
const CSS_ABBR = { bg: 'background', bgc: 'background-color', m: 'margin', p: 'padding', w: 'width', h: 'height', d: 'display', c: 'color', fs: 'font-size', fw: 'font-weight', ff: 'font-family', jc: 'justify-content', ai: 'align-items', br: 'border-radius', ta: 'text-align', pos: 'position', lh: 'line-height', bs: 'box-shadow', op: 'opacity', z: 'z-index', gtc: 'grid-template-columns', tr: 'transition', tf: 'transform' };
const COLORS = W(`aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen transparent currentcolor`);
const COLORSET = new Set(COLORS);
const COLOR_PROPS = new Set(W('color background background-color border-color border-top-color border-bottom-color border-left-color border-right-color outline-color fill stroke accent-color caret-color text-decoration-color'));
const GLOBAL_VALS = W('inherit initial unset revert none auto');
const VALS = {};
Object.entries({
  display: 'block inline inline-block flex inline-flex grid inline-grid none contents table list-item flow-root',
  position: 'static relative absolute fixed sticky',
  'justify-content': 'flex-start flex-end center space-between space-around space-evenly start end stretch',
  'justify-items': 'start end center stretch', 'justify-self': 'auto start end center stretch',
  'align-items': 'stretch flex-start flex-end center baseline start end',
  'align-content': 'flex-start flex-end center space-between space-around space-evenly stretch start end',
  'align-self': 'auto stretch flex-start flex-end center baseline start end',
  'place-items': 'center start end stretch', 'place-content': 'center start end space-between space-around space-evenly stretch', 'place-self': 'auto center start end stretch',
  'flex-direction': 'row row-reverse column column-reverse', 'flex-wrap': 'nowrap wrap wrap-reverse',
  'text-align': 'left right center justify start end', 'font-weight': 'normal bold bolder lighter', 'font-style': 'normal italic oblique',
  'text-decoration': 'none underline overline line-through', 'text-transform': 'none uppercase lowercase capitalize',
  overflow: 'visible hidden scroll auto clip', 'overflow-x': 'visible hidden scroll auto clip', 'overflow-y': 'visible hidden scroll auto clip',
  cursor: 'auto default pointer text move grab grabbing not-allowed wait help crosshair progress zoom-in zoom-out col-resize row-resize none',
  visibility: 'visible hidden collapse', 'box-sizing': 'border-box content-box', 'white-space': 'normal nowrap pre pre-wrap pre-line break-spaces',
  'object-fit': 'cover contain fill none scale-down', 'border-style': 'none solid dashed dotted double groove ridge inset outset hidden',
  float: 'left right none', clear: 'left right both none', 'user-select': 'none auto text all', 'pointer-events': 'auto none', resize: 'none both horizontal vertical',
  'background-size': 'cover contain auto', 'background-repeat': 'no-repeat repeat repeat-x repeat-y space round', 'background-position': 'center top bottom left right',
  'background-attachment': 'scroll fixed local', 'background-clip': 'border-box padding-box content-box text',
  'list-style-type': 'none disc circle square decimal lower-alpha upper-alpha lower-roman upper-roman',
  'animation-direction': 'normal reverse alternate alternate-reverse', 'animation-fill-mode': 'none forwards backwards both', 'animation-play-state': 'running paused',
  'transition-timing-function': 'ease ease-in ease-out ease-in-out linear', 'animation-timing-function': 'ease ease-in ease-out ease-in-out linear',
  'scroll-behavior': 'auto smooth', 'text-overflow': 'clip ellipsis', 'word-break': 'normal break-all keep-all break-word', 'overflow-wrap': 'normal break-word anywhere',
  'vertical-align': 'baseline top middle bottom sub super text-top text-bottom', 'table-layout': 'auto fixed', 'border-collapse': 'collapse separate',
  direction: 'ltr rtl', 'text-wrap': 'wrap nowrap balance pretty', appearance: 'none auto', isolation: 'auto isolate',
  'mix-blend-mode': 'normal multiply screen overlay darken lighten difference exclusion', 'image-rendering': 'auto pixelated crisp-edges',
  'grid-auto-flow': 'row column dense'
}).forEach(([k, v]) => VALS[k] = W(v));
const VALUE_HINTS = {
  width: ['100%', 'auto', 'fit-content', 'min(100%, 600px)'], height: ['100%', 'auto', '100vh'], 'min-height': ['100vh', '100%'], 'max-width': ['100%', '600px'],
  margin: ['0', '0 auto', 'auto'], padding: ['0', '16px', '12px 20px'], gap: ['8px', '16px', '24px'],
  'font-size': ['16px', '1rem', '1.5rem', '2rem', 'clamp(1.5rem, 4vw, 3rem)'], 'font-weight': ['400', '500', '600', '700', 'bold'], 'line-height': ['1.5', '1.2'],
  'font-family': ['system-ui, sans-serif', 'Georgia, serif', 'monospace'],
  'grid-template-columns': ['repeat(3, 1fr)', 'repeat(auto-fit, minmax(200px, 1fr))', '1fr 1fr'],
  transition: ['all 0.2s ease', 'transform 0.2s ease', 'opacity 0.3s'], 'box-shadow': ['0 4px 12px rgba(0, 0, 0, 0.15)', 'none'],
  border: ['1px solid #ddd', 'none', '2px solid currentColor'], 'border-radius': ['8px', '12px', '50%', '999px'],
  transform: ['translateY(-2px)', 'scale(1.05)', 'rotate(45deg)', 'none'], opacity: ['0', '0.5', '1'], 'z-index': ['1', '10', '100'],
  color: ['white', 'black', '#333', 'currentColor', 'transparent'], background: ['white', '#f5f5f5', 'linear-gradient(135deg, #ff8a3d, #8b7cff)', 'none'],
  'background-color': ['white', '#f5f5f5', 'transparent'], animation: ['spin 1s linear infinite'], 'aspect-ratio': ['1', '16 / 9'], inset: ['0']
};
const CSS_FN = {
  transform: 'translateX() translateY() translate() translateZ() translate3d() scale() scaleX() scaleY() rotate() rotateX() rotateY() rotateZ() skew() skewX() skewY() perspective() matrix()',
  filter: 'blur() brightness() contrast() grayscale() drop-shadow() hue-rotate() invert() opacity() saturate() sepia()',
  'backdrop-filter': 'blur() brightness() contrast() grayscale() saturate() sepia() invert()',
  'transition-timing-function': 'cubic-bezier() steps()', 'animation-timing-function': 'cubic-bezier() steps()', transition: 'cubic-bezier()', animation: 'cubic-bezier()',
  background: 'linear-gradient() radial-gradient() conic-gradient() url() rgb() hsl()', 'background-image': 'linear-gradient() radial-gradient() conic-gradient() url() repeating-linear-gradient()',
  'grid-template-columns': 'repeat() minmax() fit-content()', 'grid-template-rows': 'repeat() minmax() fit-content()',
  'clip-path': 'circle() ellipse() polygon() inset()', 'mask-image': 'linear-gradient() url()', 'list-style-image': 'url()', content: 'attr() counter() url()',
  'font-family': '', 'box-shadow': 'rgb() rgba() hsl()', 'text-shadow': 'rgb() rgba() hsl()'
};
const CSS_COLOR_FN = 'rgb() rgba() hsl() hsla() color-mix()';
const CSS_ANY_FN = 'calc() var() min() max() clamp()';
const TRANSITION_PROPS = W('all transform opacity color background background-color width height top left box-shadow filter border-color');
const JS_EVENTS = W('click dblclick input change submit keydown keyup load DOMContentLoaded mouseover mouseout mouseenter mouseleave mousemove mousedown mouseup touchstart touchmove touchend pointerdown pointermove pointerup scroll resize focus blur wheel contextmenu animationend transitionend ended play pause timeupdate');
const PSEUDOS = W('hover active focus focus-visible focus-within visited link checked disabled enabled required optional valid invalid placeholder-shown first-child last-child only-child nth-child nth-last-child nth-of-type nth-last-of-type first-of-type last-of-type only-of-type not is where has empty root target before after placeholder selection first-letter first-line marker backdrop any-link default indeterminate read-only read-write in-range out-of-range autofill file-selector-button host part slotted');
const PSEUDOSET = new Set(PSEUDOS);
const CSS_AT = [
  { label: '@media', insert: '@media (max-width: 600px) {\n\t$0\n}', detail: 'screen size rule' },
  { label: '@keyframes', insert: '@keyframes $0 {\n\tfrom {  }\n\tto {  }\n}', detail: 'animation' },
  { label: '@import', insert: "@import url('$0');", detail: 'import' },
  { label: '@font-face', insert: "@font-face {\n\tfont-family: '$0';\n\tsrc: url('');\n}", detail: 'custom font' },
  { label: '@supports', insert: '@supports ($0) {\n\t\n}', detail: 'feature test' },
  { label: '@container', insert: '@container (min-width: 400px) {\n\t$0\n}', detail: 'container rule' }
];
const JSLIST = W(`arguments async await boolean break case catch class const continue debugger default delete else enum export extends false finally function from implements import instanceof interface let null package private protected public return static super switch this throw true typeof undefined while with yield
console warn error info table clear debug group groupEnd time timeEnd assert document window navigator location history screen
getElementById getElementsByClassName getElementsByTagName querySelector querySelectorAll createElement createTextNode appendChild append prepend removeChild remove replaceChild insertBefore insertAdjacentHTML cloneNode closest matches
addEventListener removeEventListener dispatchEvent preventDefault stopPropagation target currentTarget code
innerHTML innerText textContent outerHTML value checked disabled style className classList dataset hidden
toggle contains replace setAttribute getAttribute removeAttribute hasAttribute
parentElement parentNode children firstChild lastChild firstElementChild lastElementChild nextElementSibling previousElementSibling childNodes
focus blur click submit reset scrollTo scrollIntoView getBoundingClientRect offsetWidth offsetHeight clientWidth clientHeight scrollTop scrollLeft scrollY scrollX innerWidth innerHeight
length push shift unshift slice splice concat join reverse sort indexOf lastIndexOf includes find findIndex filter forEach reduce some every flat flatMap fill keys values entries from isArray
toString toFixed toUpperCase toLowerCase trim trimStart trimEnd split substring startsWith endsWith padStart padEnd repeat charAt charCodeAt replaceAll match
Math random floor ceil round abs sqrt atan2 hypot sign trunc JSON parse stringify
Number String Boolean Array Object Date Promise Symbol Error RegExp parseInt parseFloat isNaN isFinite NaN Infinity
setTimeout setInterval clearTimeout clearInterval requestAnimationFrame cancelAnimationFrame
alert confirm prompt fetch then resolve reject json text localStorage sessionStorage getItem setItem removeItem
getTime getFullYear getMonth getDate getDay getHours getMinutes getSeconds toLocaleString toLocaleDateString toLocaleTimeString
assign freeze create defineProperty hasOwnProperty constructor prototype event
getContext fillRect strokeRect fillStyle strokeStyle beginPath closePath lineWidth moveTo lineTo stroke clearRect drawImage fillText
play pause currentTime volume duration Image Audio title body head width height`);
const JSW = new Set(JSLIST);
const JSLONG = JSLIST.filter(w => w.length >= 4);
const JSLOWER = new Map(JSLIST.map(w => [w.toLowerCase(), w]));
const JSKW = new Set(W('break case catch class const continue debugger default delete do else export extends finally for from function if import in instanceof let new of return static super switch throw try typeof var void while with yield async await'));
const JSLIT = new Set(W('true false null undefined this NaN Infinity'));
const JS_GLOBALS = W('document window console Math JSON localStorage sessionStorage setTimeout() setInterval() clearTimeout() clearInterval() requestAnimationFrame() cancelAnimationFrame() queueMicrotask() fetch() alert() confirm() prompt() parseInt() parseFloat() isNaN() isFinite() encodeURIComponent() decodeURIComponent() Number() String() Boolean() BigInt() Array Object Date Promise Map Set WeakMap Symbol Error TypeError RegExp Intl URL URLSearchParams FormData Image Audio CustomEvent IntersectionObserver ResizeObserver MutationObserver navigator location history performance crypto globalThis structuredClone()');
const camel = x => x.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const MEMBERS = {
  console: 'log() warn() error() info() table() clear() group() groupEnd() time() timeEnd() dir() count() assert() trace()',
  document: 'querySelector() querySelectorAll() getElementById() getElementsByClassName() getElementsByTagName() createElement() createTextNode() createDocumentFragment() addEventListener() removeEventListener() body head title documentElement activeElement cookie readyState forms images links',
  Math: 'random() floor() ceil() round() abs() max() min() sqrt() cbrt() pow() sin() cos() tan() asin() acos() atan() atan2() hypot() trunc() sign() log() log2() log10() exp() PI E',
  JSON: 'parse() stringify()', localStorage: 'getItem() setItem() removeItem() clear() key() length', sessionStorage: 'getItem() setItem() removeItem() clear() key() length',
  classList: 'add() remove() toggle() contains() replace() length',
  window: 'addEventListener() removeEventListener() innerWidth innerHeight outerWidth outerHeight scrollX scrollY scrollTo() scrollBy() alert() confirm() prompt() setTimeout() setInterval() clearTimeout() clearInterval() requestAnimationFrame() cancelAnimationFrame() location history navigator localStorage sessionStorage open() matchMedia() getComputedStyle() devicePixelRatio fetch()',
  Object: 'keys() values() entries() assign() freeze() fromEntries() create() defineProperty() hasOwn()', Array: 'from() isArray() of()',
  Number: 'parseInt() parseFloat() isInteger() isNaN() MAX_SAFE_INTEGER EPSILON', String: 'fromCharCode()', Date: 'now() parse()', Promise: 'all() allSettled() any() resolve() reject() race()',
  location: 'href reload() assign() replace() pathname hash search origin', history: 'back() forward() go() pushState() replaceState()',
  navigator: 'userAgent language clipboard onLine vibrate() share()',
  style: PROPLIST.map(camel).join(' ') + ' setProperty() getPropertyValue() removeProperty() cssText',
  dataset: ''
};
const DEFAULT_MEMBERS = [
  // elements
  'addEventListener() removeEventListener() textContent innerHTML innerText outerHTML classList style value id className dataset tagName src href alt title name type checked disabled selected placeholder hidden files width height',
  'querySelector() querySelectorAll() appendChild() append() prepend() before() after() remove() replaceWith() insertAdjacentHTML() insertAdjacentElement() cloneNode() contains() closest() matches()',
  'setAttribute() getAttribute() removeAttribute() hasAttribute() toggleAttribute() focus() blur() click() submit() reset() scrollIntoView() scrollTo() scrollBy() getBoundingClientRect() animate() requestFullscreen()',
  'parentElement parentNode children childNodes firstElementChild lastElementChild nextElementSibling previousElementSibling offsetWidth offsetHeight offsetTop offsetLeft clientWidth clientHeight scrollTop scrollLeft scrollHeight scrollWidth',
  // media
  'play() pause() load() currentTime duration volume muted paused loop',
  // events
  'preventDefault() stopPropagation() target currentTarget key code shiftKey ctrlKey altKey metaKey clientX clientY pageX pageY offsetX offsetY button deltaY touches changedTouches',
  // arrays
  'length push() pop() shift() unshift() map() filter() forEach() reduce() find() findIndex() findLast() some() every() includes() indexOf() lastIndexOf() join() slice() splice() sort() reverse() concat() flat() flatMap() fill() at() keys() values() entries()',
  // strings & numbers
  'split() trim() trimStart() trimEnd() toUpperCase() toLowerCase() startsWith() endsWith() replace() replaceAll() padStart() padEnd() repeat() charAt() charCodeAt() substring() match() matchAll() search() localeCompare() toFixed() toString() toLocaleString()',
  // promises, fetch, maps
  'then() catch() finally() json() text() ok status get() set() has() delete() clear() size',
  // canvas
  'getContext() fillRect() strokeRect() clearRect() fillStyle strokeStyle lineWidth font textAlign beginPath() closePath() moveTo() lineTo() arc() rect() fill() stroke() fillText() strokeText() drawImage() save() restore() translate() rotate() scale() globalAlpha'
].join(' ');
[DEFAULT_MEMBERS, ...Object.values(MEMBERS), JS_GLOBALS.join(' '), JS_EVENTS.join(' ')].join(' ').split(/\s+/).forEach(x => { if (x) JSW.add(x.replace('()', '')); });
const MEMBER_SNIPS = {
  addEventListener: "addEventListener('click', (e) => {\n\t$0\n});",
  forEach: 'forEach((item) => {\n\t$0\n});', map: 'map((item) => $0)', filter: 'filter((item) => $0)',
  find: 'find((item) => $0)', reduce: 'reduce((sum, item) => $0, 0)', then: 'then((res) => $0)'
};
const JS_SNIPS = [
  { name: 'log', detail: 'console.log()', body: 'console.log($0);' },
  { name: 'fn', detail: 'function', body: 'function $0() {\n\t\n}' },
  { name: 'af', detail: 'arrow function', body: '() => {\n\t$0\n}' },
  { name: 'for', detail: 'for loop', body: 'for (let i = 0; i < $0; i++) {\n\t\n}' },
  { name: 'forof', detail: 'for…of loop', body: 'for (const item of $0) {\n\t\n}' },
  { name: 'if', detail: 'if block', body: 'if ($0) {\n\t\n}' },
  { name: 'ifelse', detail: 'if / else', body: 'if ($0) {\n\t\n} else {\n\t\n}' },
  { name: 'qs', detail: 'document.querySelector', body: "document.querySelector('$0')" },
  { name: 'qsa', detail: 'document.querySelectorAll', body: "document.querySelectorAll('$0')" },
  { name: 'gid', detail: 'document.getElementById', body: "document.getElementById('$0')" },
  { name: 'ael', detail: 'click listener', body: "addEventListener('click', (e) => {\n\t$0\n});" },
  { name: 'timeout', detail: 'setTimeout', body: 'setTimeout(() => {\n\t$0\n}, 1000);' },
  { name: 'interval', detail: 'setInterval', body: 'setInterval(() => {\n\t$0\n}, 1000);' },
  { name: 'fetch', detail: 'fetch JSON', body: "fetch('$0')\n\t.then((res) => res.json())\n\t.then((data) => {\n\t\tconsole.log(data);\n\t});" },
  { name: 'try', detail: 'try / catch', body: 'try {\n\t$0\n} catch (err) {\n\tconsole.error(err);\n}' },
  { name: 'class', detail: 'class', body: 'class $0 {\n\tconstructor() {\n\t\t\n\t}\n}' }
];
const BOILER = '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>$0</title>\n</head>\n<body>\n\t\n</body>\n</html>';

/* ---------------- spelling helper ---------------- */
function dist(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length, n = b.length;
  let p2 = null, p = new Array(n + 1), c;
  for (let j = 0; j <= n; j++) p[j] = j;
  for (let i = 1; i <= m; i++) {
    c = new Array(n + 1); c[0] = i; let low = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      c[j] = v; if (v < low) low = v;
    }
    if (low > max) return max + 1;
    p2 = p; p = c;
  }
  return p[n];
}
function suggest(word, list, max) {
  if (!max) return null;
  const w = word.toLowerCase();
  let best = null, bd = max + 1, bscore = 99;
  for (const cand of list) {
    const lc = cand.toLowerCase();
    const d = dist(w, lc, max);
    if (d > max) continue;
    const score = d * 10 + (lc[0] === w[0] ? 0 : 3) + Math.abs(lc.length - w.length);
    if (d < bd || (d === bd && score < bscore)) { bd = d; best = cand; bscore = score; }
  }
  return best;
}
const lineOf = (v, pos) => { let n = 1; for (let i = 0; i < pos && i < v.length; i++) if (v.charCodeAt(i) === 10) n++; return n; };

/* ---------------- syntax highlighting ---------------- */
function fill(cls, a, b, c) { for (let i = a; i < b; i++) cls[i] = c; }
function hlHTML(t, cls, off) {
  const re = /(<!--[\s\S]*?(?:-->|$))|(<![^>]*>?)|(<\/?)([a-zA-Z][\w:-]*)((?:[^<>"']|"[^"]*"?|'[^']*'?)*)(\/?>)?|(&#?\w+;)/g;
  let m;
  while ((m = re.exec(t))) {
    const i = m.index;
    if (m[1]) { fill(cls, off + i, off + i + m[0].length, 'c'); continue; }
    if (m[2]) { fill(cls, off + i, off + i + m[0].length, 'k'); continue; }
    if (m[7]) { fill(cls, off + i, off + i + m[0].length, 'n'); continue; }
    let p = i;
    fill(cls, off + p, off + p + m[3].length, 'p'); p += m[3].length;
    fill(cls, off + p, off + p + m[4].length, 't'); p += m[4].length;
    const attrs = m[5]; const ar = /([^\s=\/"']+)|(=)|("[^"]*"?|'[^']*'?)/g; let a;
    while ((a = ar.exec(attrs))) {
      const s = off + p + a.index;
      fill(cls, s, s + a[0].length, a[1] ? (attrs[a.index - 1] === '=' ? 's' : 'a') : a[2] ? 'p' : 's');
    }
    p += attrs.length;
    if (m[6]) fill(cls, off + p, off + p + m[6].length, 'p');
    const ln = m[4].toLowerCase();
    if (!m[3].includes('/') && m[6] && (ln === 'style' || ln === 'script')) {
      const start = re.lastIndex; const endIdx = t.toLowerCase().indexOf('</' + ln, start);
      const stop = endIdx < 0 ? t.length : endIdx;
      (ln === 'style' ? hlCSS : hlJS)(t.slice(start, stop), cls, off + start);
      re.lastIndex = stop;
    }
  }
}
function hlCSS(t, cls, off) {
  const re = /(\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(@[\w-]+)|(#[\w-]+)|(-?(?:\d+\.?\d*|\.\d+)(?:[a-zA-Z%]+)?)|(!important)|([\w-]+)(\()?|([{};:,])/g;
  let m, depth = 0, decl = false;
  while ((m = re.exec(t))) {
    const s = off + m.index, e = s + m[0].length;
    if (m[1]) fill(cls, s, e, 'c');
    else if (m[2]) fill(cls, s, e, 's');
    else if (m[3]) fill(cls, s, e, 'at');
    else if (m[4] || m[5]) fill(cls, s, e, depth > 0 && decl ? 'n' : 'sl');
    else if (m[6]) fill(cls, s, e, 'k');
    else if (m[7]) {
      if (m[8]) { fill(cls, s, s + m[7].length, 'f'); fill(cls, e - 1, e, 'p'); }
      else fill(cls, s, e, depth > 0 ? (decl ? 'v' : 'pr') : 'sl');
    } else if (m[9]) {
      const c = m[9];
      if (c === '{') { depth++; decl = false; }
      else if (c === '}') { depth = Math.max(0, depth - 1); decl = false; }
      else if (c === ';') decl = false;
      else if (c === ':' && depth > 0) decl = true;
      fill(cls, s, e, 'p');
    }
  }
}
function hlJS(t, cls, off) {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\[\s\S]|[^`\\])*`?)|(\b(?:0[xX][\da-fA-F]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b)|([A-Za-z_$][\w$]*)(?=(\s*\()|)|([{}()[\];,.=+\-*/%!<>&|?:~^]+)/g;
  let m;
  while ((m = re.exec(t))) {
    const s = off + m.index, e = s + m[0].length;
    if (m[1]) fill(cls, s, e, 'c');
    else if (m[2]) {
      fill(cls, s, e, 's');
      if (m[2][0] === '`') {
        const ir = /\$\{([^}]*)\}/g; let x;
        while ((x = ir.exec(m[2]))) {
          const b = s + x.index;
          fill(cls, b, b + 2, 'p'); fill(cls, b + 2, b + 2 + x[1].length, null);
          hlJS(x[1], cls, b + 2); fill(cls, b + 2 + x[1].length, b + 3 + x[1].length, 'p');
        }
      }
    }
    else if (m[3]) fill(cls, s, e, 'n');
    else if (m[4]) {
      const w = m[4];
      const c = JSKW.has(w) ? 'k' : JSLIT.has(w) ? 'n' : m[5] ? 'f' : (/^[A-Z]/.test(w) && JSW.has(w)) ? 'pr' : null;
      if (c) fill(cls, s, e, c);
    } else fill(cls, s, e, 'p');
  }
}
function highlight(lang, t, errs) {
  const n = t.length, cls = new Array(n);
  (lang === 'html' ? hlHTML : lang === 'css' ? hlCSS : hlJS)(t, cls, 0);
  const er = new Uint8Array(n);
  for (const [s, e] of errs) for (let i = Math.max(0, s); i < Math.min(n, e); i++) er[i] = 1;
  const lines = [''];
  let i = 0;
  while (i < n) {
    const c = cls[i], e = er[i]; let j = i + 1;
    while (j < n && cls[j] === c && er[j] === e) j++;
    const cn = ((c || '') + (e ? ' err' : '')).trim();
    t.slice(i, j).split('\n').forEach((part, k) => {
      if (k > 0) lines.push('');
      if (part) lines[lines.length - 1] += cn ? `<span class="${cn}">${esc(part)}</span>` : esc(part);
    });
    i = j;
  }
  return lines.map(l => '<div class="ln">' + l + '</div>').join('');
}

/* ---------------- checks (Pip's brain) ---------------- */
const JS_STR_COMMENT = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\[\s\S]|[^`\\])*`?/g;
function checkHTML(src, add) {
  let s = src.replace(/<!--[\s\S]*?(?:-->|$)/g, blank);
  s = s.replace(/(<(script|style)\b[^>]*>)([\s\S]*?)(?=<\/\2\s*>|$)/gi, (m, a, b, c) => a + blank(c));
  const re = /<(\/?)([a-zA-Z][\w:-]*)((?:[^<>"']|"[^"]*"|'[^']*')*)>/g;
  const stack = []; let m;
  while ((m = re.exec(s))) {
    const closing = m[1] === '/', name = m[2], ln = name.toLowerCase();
    const ns = m.index + 1 + m[1].length, ne = ns + name.length;
    const known = TAGS.has(ln) || name.includes('-') || name.includes(':');
    if (!known) { const fix = suggest(ln, TAGLIST, ln.length <= 4 ? 1 : 2); if (fix) add('html', 'tag', name, fix, ns, ne); }
    if (!closing) {
      const attrs = m[3]; const ab = attrs.replace(/"[^"]*"|'[^']*'/g, x => x[0] + '_'.repeat(x.length - 2) + x[0]);
      const ar = /(^|\s)([^\s=\/]+)/g; let a;
      while ((a = ar.exec(ab))) {
        const an = a[2], l = an.toLowerCase();
        if (ATTRS.has(l) || /^(data-|aria-|x-|v-|hx-|@|:|#|\[|\()/.test(l) || l.includes(':')) continue;
        if (/=\s*$/.test(ab.slice(0, a.index + a[1].length))) continue;
        if (!/^[a-z][\w-]*$/.test(l)) continue;
        const as = ne + a.index + a[1].length;
        const fix = suggest(l, ATTRLIST, l.length <= 4 ? 1 : 2);
        if (fix) add('html', 'attr', an, fix, as, as + an.length);
      }
      const selfClose = /\/\s*$/.test(attrs);
      if (known && !VOID.has(ln) && !selfClose) stack.push({ name: ln, s: ns, e: ne });
    } else {
      let k = stack.length - 1;
      while (k >= 0 && stack[k].name !== ln) k--;
      if (k < 0) {
        if (known && !OPTIONAL.has(ln)) add('html', 'stray', ln, '', m.index, m.index + m[0].length, { mark: [ns, ne], text: '' });
      } else {
        for (let j = stack.length - 1; j > k; j--) { const t = stack[j]; if (!OPTIONAL.has(t.name)) add('html', 'unclosed', t.name, null, t.s, t.e); }
        stack.length = k;
      }
    }
  }
  for (const t of stack) if (!OPTIONAL.has(t.name)) add('html', 'unclosed', t.name, null, t.s, t.e);
}
function checkCSS(src, add) {
  const s = src.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, blank).replace(/"[^"\n]*"|'[^'\n]*'/g, x => x[0] + blank(x.slice(1, -1)) + x[x.length - 1]);
  const re = /([^{};]*)([{};]|$)/g; let m, depth = 0, kf = 0;
  while ((m = re.exec(s))) {
    if (!m[0].length) break;
    const seg = m[1], st = m.index, d = m[2];
    if (d === '{') {
      if (/^\s*@/.test(seg)) { if (/@(-\w+-)?keyframes/i.test(seg)) kf = depth + 1; }
      else if (!(kf && depth === kf)) checkSel(seg, st, add);
      depth++;
    } else {
      if (depth > 0) checkDecl(seg, st, add);
      if (d === '}') { depth = Math.max(0, depth - 1); if (depth < kf) kf = 0; }
    }
    if (!d) break;
  }
  if (depth > 0) {
    const trimmed = src.replace(/\s+$/, '');
    add('css', 'brace', '}', '}', trimmed.length, trimmed.length, { text: '\n}', mark: [Math.max(0, trimmed.length - 1), trimmed.length] });
  }
}
function checkSel(seg, st, add) {
  const tr = /(^|[\s,>+~(])([a-zA-Z][\w-]*)/g; let a;
  while ((a = tr.exec(seg))) {
    const w = a[2], l = w.toLowerCase();
    if (TAGS.has(l) || w.includes('-') || /^(from|to|and|or|not|only|screen|print)$/.test(l)) continue;
    const pre = seg.slice(0, a.index + a[1].length);
    if ((pre.match(/\[/g) || []).length > (pre.match(/\]/g) || []).length) continue;
    if (/\([^()]*$/.test(pre) && !/:(not|is|where|has)\([^()]*$/.test(pre)) continue;
    const fix = suggest(l, TAGLIST, l.length <= 4 ? 1 : 2);
    if (fix) { const s = st + a.index + a[1].length; add('css', 'sel', w, fix, s, s + w.length); }
  }
  const pr = /(::?)([a-zA-Z][\w-]*)/g;
  while ((a = pr.exec(seg))) {
    const w = a[2], l = w.toLowerCase();
    if (PSEUDOSET.has(l) || l.startsWith('-')) continue;
    const fix = suggest(l, PSEUDOS, l.length <= 4 ? 1 : 2);
    if (fix) { const s = st + a.index + a[1].length; add('css', 'pseudo', w, fix, s, s + w.length); }
  }
}
function checkDecl(seg, st, add) {
  const d = /^(\s*)(-{0,2}[a-zA-Z][\w-]*)(\s*):([\s\S]*)$/.exec(seg);
  if (!d) return;
  const prop = d[2], l = prop.toLowerCase(), ps = st + d[1].length;
  if (l.startsWith('-')) return;
  const valStart = ps + prop.length + d[3].length + 1, val = d[4];
  const mm = /\n([ \t]*)(-?[a-zA-Z][\w-]*)\s*:(?!:)/.exec(val);
  const nextOk = mm && (PROPS.has(mm[2].toLowerCase()) || suggest(mm[2], PROPLIST, 2));
  if (!PROPS.has(l)) {
    const fix = suggest(l, PROPLIST, l.length <= 4 ? 1 : 2);
    if (fix) add('css', 'prop', prop, fix, ps, ps + prop.length);
  } else {
    const v = (nextOk ? val.slice(0, mm.index) : val).replace(/!important/i, '').trim();
    if (/^[a-zA-Z]+$/.test(v)) {
      const lv = v.toLowerCase();
      const list = COLOR_PROPS.has(l) ? COLORS : VALS[l];
      if (list && !list.includes(lv) && !GLOBAL_VALS.includes(lv)) {
        const fix = suggest(lv, list, lv.length <= 4 ? 1 : 2);
        if (fix) { const vs = valStart + val.indexOf(v); add('css', 'val', v, fix, vs, vs + v.length, { prop: l }); }
      }
    }
  }
  if (nextOk) {
    let k = mm.index; while (k > 0 && /[ \t]/.test(val[k - 1])) k--;
    if (k > 0 && val.slice(0, k).trim()) {
      const pos = valStart + k;
      add('css', 'semi', prop, ';', pos, pos, { mark: [pos - 1, pos] });
    }
    checkDecl(val.slice(mm.index + 1), valStart + mm.index + 1, add);
  }
}
function jsNames(s) {
  const names = new Set();
  for (const m of s.matchAll(/\b(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of s.matchAll(/\b(?:const|let|var)\s*[{[]([^=]*)[}\]]\s*=/g)) m[1].split(/[^\w$]+/).forEach(w => w && names.add(w));
  for (const m of s.matchAll(/\(([^()]*)\)\s*(?:=>|\{)/g)) m[1].split(/[^\w$]+/).forEach(w => /^[A-Za-z_$]/.test(w) && names.add(w));
  for (const m of s.matchAll(/([A-Za-z_$][\w$]*)\s*=>/g)) names.add(m[1]);
  for (const m of s.matchAll(/^\s*(?:async\s+|static\s+|get\s+|set\s+)*([A-Za-z_$][\w$]*)\s*\([^()]*\)\s*\{/gm)) names.add(m[1]);
  return names;
}
function checkJS(src, add, ids) {
  const s = src.replace(JS_STR_COMMENT, blank);
  const declared = jsNames(s);
  ids.forEach(i => declared.add(i));
  for (const m of s.matchAll(/([A-Za-z_$][\w$]*)\s*:(?!:)/g)) declared.add(m[1]);
  for (const m of s.matchAll(/\.([A-Za-z_$][\w$]*)\s*=(?!=)/g)) declared.add(m[1]);
  const re = /[A-Za-z_$][\w$]*/g; let m;
  while ((m = re.exec(s))) {
    const w = m[0];
    if (w.length < 4) continue;
    const prev = s[m.index - 1];
    if (prev && /[\w$]/.test(prev)) continue;
    if (JSW.has(w) || declared.has(w)) continue;
    const cm = JSLOWER.get(w.toLowerCase());
    if (cm && cm !== w) { add('js', 'case', w, cm, m.index, m.index + w.length); continue; }
    const fix = suggest(w, JSLONG, w.length <= 5 ? 1 : 2);
    if (fix && fix !== w) add('js', 'ident', w, fix, m.index, m.index + w.length);
  }
}

/* ---------------- editors ---------------- */
const KIND = { html: 'HTML', css: 'CSS', js: 'JavaScript' };
const KIND_WORD = { html: 'page', css: 'CSS', js: 'JavaScript' };
const EXT = { html: '.html', css: '.css', js: '.js' };
const langOf = name => /\.html?$/i.test(name) ? 'html' : /\.css$/i.test(name) ? 'css' : /\.m?js$/i.test(name) ? 'js' : null;
const M = { cw: 8.1, lh: 21, padT: 14, padL: 6 };
const eds = {};
let files = [], folders = [], active = null, page = null, uid = 0, linkMode = 'auto';
const newId = () => 'f' + Date.now().toString(36) + (uid++).toString(36);
const fileById = id => files.find(f => f.id === id);
const fileByName = name => files.find(f => f.name === name);
const baseName = n => n.slice(n.lastIndexOf('/') + 1);
const dirName = n => n.includes('/') ? n.slice(0, n.lastIndexOf('/')) : '';
const htmlFiles = () => files.filter(f => f.lang === 'html');
const app = $('#app'), work = $('#work');

const SAMPLE = { folders: [], files: [
  { name: 'index.html', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My website</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <h1>Hi, I'm Pip!</h1>
    <p>Edit the code and watch this page change.
    I'll point out typos as you go.</p>
    <button id="btn">Clicked 0 times</button>
  </div>

  <script src="script.js"></script>
</body>
</html>` },
  { name: 'style.css', content: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #ffe1c7, #e4dcff);
}

.card {
  background: white;
  padding: 32px;
  boder-radius: 20px;
  box-shadow: 0 12px 40px rgba(60, 40, 120, 0.18);
  text-align: center;
  max-width: 320px;
}

button {
  font: inherit;
  padding: 12px 22px;
  border: 0;
  border-radius: 999px;
  background: #ff8a3d;
  color: white;
  cursor: pointer;
}` },
  { name: 'script.js', content: `const btn = document.querySelector('#btn');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  btn.textContent = \`Clicked \${count} times\`;
  console.log('click number', count);
});` }
] };
const BLANK = { linkMode: 'auto', folders: [], files: [{ name: 'index.html', content: '' }, { name: 'style.css', content: '' }, { name: 'script.js', content: '' }] };

function createEditor(file) {
  const lang = file.lang;
  const host = document.createElement('div');
  host.className = 'ed'; host.dataset.id = file.id; host.hidden = true;
  host.innerHTML = `<div class="gutter" aria-hidden="true"><div class="gnums"></div></div><div class="code"><div class="aline"></div><pre class="hl" aria-hidden="true"></pre><textarea class="ta" id="ta-${file.id}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="${esc(file.name)}"></textarea></div>`;
  $('#eds').appendChild(host);
  const ed = { id: file.id, lang, host, ta: $('.ta', host), hl: $('.hl', host), gn: $('.gnums', host), al: $('.aline', host), code: $('.code', host), errs: [], lines: 0, len: 0, cur: -1, suppress: false, selB: 0, selE: 0, pending: null, escTab: false };
  ed.ta._ed = ed;
  const ta = ed.ta;
  const remember = () => { ed.selB = ta.selectionStart; ed.selE = ta.selectionEnd; };
  ta.addEventListener('scroll', () => { sync(ed); if (AC.open && AC.ed === ed) placeAC(); });
  ta.addEventListener('keydown', e => onKey(ed, e));
  ta.addEventListener('beforeinput', e => {
    remember();
    if (ed.suppress) return;
    if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') {
      e.preventDefault();
      queueMicrotask(() => { if (AC.open && AC.ed === ed && !AC.tabOnly) acceptAC(AC.i); else smartEnter(ed); });
      return;
    }
    if (e.inputType === 'insertText' && e.data && e.data.length === 1 && !e.isComposing) {
      const act = planChar(ed, e.data);
      if (act) { e.preventDefault(); queueMicrotask(() => { act(); updateAC(ed); }); }
    }
  });
  ta.addEventListener('input', e => {
    onEdit(ed);
    if (ed.suppress) return;
    const t = e.inputType || '';
    if (t.startsWith('insert') && t !== 'insertLineBreak' && t !== 'insertFromPaste' && t !== 'insertParagraph') updateAC(ed);
    else if (t === 'deleteContentBackward' && AC.open) updateAC(ed);
    else hideAC();
  });
  ta.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== ta && AC.ed === ed) hideAC(); }, 120));
  ta.addEventListener('mousedown', () => hideAC());
  return ed;
}

function render(ed) {
  const v = ed.ta.value;
  ed.len = v.length;
  if (ed.host.hidden) { ed.dirty = true; return; }
  ed.dirty = false;
  ed.hl.innerHTML = highlight(ed.lang, v, ed.errs);
  const n = ed.hl.children.length;
  if (n !== ed.lines) {
    ed.lines = n; let h = '';
    for (let i = 1; i <= n; i++) h += '<div>' + i + '</div>';
    ed.gn.innerHTML = h; ed.cur = -1;
  }
  if (Wrap.on) fitGutter(ed);
  sync(ed); caretUI(ed);
}
const Wrap = { on: false };
function fitGutter(ed) {
  if (ed.host.hidden) return;
  const ls = ed.hl.children, gs = ed.gn.children;
  for (let i = 0; i < gs.length; i++) {
    const h = (ls[i] && ls[i].offsetHeight) || M.lh;
    const v = h + 'px';
    if (gs[i].style.height !== v) gs[i].style.height = v;
  }
}
function layoutEd(ed) {
  if (ed.host.hidden) return;
  ed.hl.style.width = Wrap.on ? ed.ta.clientWidth + 'px' : '';
  render(ed);
}
function setWrap(on) {
  Wrap.on = on; store.set('wrap', on);
  files.forEach(f => {
    const ed = eds[f.id];
    ed.host.classList.toggle('wrap', on);
    ed.ta.setAttribute('wrap', on ? 'soft' : 'off');
    if (!on) { ed.hl.style.width = ''; [...ed.gn.children].forEach(g => g.style.height = ''); }
    ed.ta.scrollLeft = 0;
  });
  $('#wrapStatus').textContent = 'Wrap: ' + (on ? 'On' : 'Off');
  $('#wrapToggle span').textContent = 'Wrap long lines: ' + (on ? 'On' : 'Off');
  files.forEach(f => eds[f.id].host.hidden ? render(eds[f.id]) : layoutEd(eds[f.id]));
}
function lineTop(ed, line) { const d = ed.hl.children[line]; return d ? d.offsetTop : M.padT + line * M.lh; }
function caretRect(ed, pos) {
  const v = ed.ta.value; let line = 0, ls = 0;
  for (let i = 0; i < pos; i++) if (v.charCodeAt(i) === 10) { line++; ls = i + 1; }
  const div = ed.hl.children[line], col = pos - ls;
  if (div) {
    let rem = col; const w = document.createTreeWalker(div, NodeFilter.SHOW_TEXT); let node;
    while ((node = w.nextNode())) {
      if (rem <= node.length) {
        const r = document.createRange(); r.setStart(node, rem); r.setEnd(node, rem);
        const rs = r.getClientRects(); const b = rs.length ? rs[rs.length - 1] : r.getBoundingClientRect();
        if (b && (b.height || b.left)) return { left: b.left, top: b.top, bottom: b.top + M.lh };
        break;
      }
      rem -= node.length;
    }
    const d = div.getBoundingClientRect();
    return { left: d.left + col * M.cw, top: d.top, bottom: d.top + M.lh };
  }
  const r = ed.code.getBoundingClientRect();
  return { left: r.left + M.padL, top: r.top, bottom: r.top + M.lh };
}
function sync(ed) {
  const x = ed.ta.scrollLeft, y = ed.ta.scrollTop;
  ed.hl.style.transform = `translate(${Wrap.on ? 0 : -x}px,${-y}px)`;
  ed.gn.style.transform = `translateY(${-y}px)`;
  ed.al.style.transform = `translateY(${-y}px)`;
}
function caretUI(ed) {
  const ta = ed.ta, p = ta.selectionStart, v = ta.value;
  let line = 0, ls = 0;
  for (let i = 0; i < p; i++) if (v.charCodeAt(i) === 10) { line++; ls = i + 1; }
  const ld = ed.hl.children[line];
  ed.al.style.top = (ld ? ld.offsetTop : M.padT + line * M.lh) + 'px';
  ed.al.style.height = ((ld && ld.offsetHeight) || M.lh) + 'px';
  if (ed.cur !== line) {
    const kids = ed.gn.children;
    if (kids[ed.cur]) kids[ed.cur].classList.remove('cur');
    if (kids[line]) kids[line].classList.add('cur');
    ed.cur = line;
  }
  if (ed.id === active) $('#pos').textContent = `Ln ${line + 1}, Col ${p - ls + 1}`;
}
function measure() {
  const ta = eds[active].ta, cs = getComputedStyle(ta);
  M.lh = parseFloat(cs.lineHeight) || 21; M.padT = parseFloat(cs.paddingTop) || 14; M.padL = parseFloat(cs.paddingLeft) || 6;
  const sp = document.createElement('span');
  sp.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-size:${cs.fontSize};font-family:${cs.fontFamily};font-variant-ligatures:none`;
  sp.textContent = 'x'.repeat(100);
  document.body.appendChild(sp); M.cw = sp.getBoundingClientRect().width / 100 || 8.1; sp.remove();
}

function shiftMarks(ed, start, rem, ins) {
  const d = ins - rem, end = start + rem, out = [];
  for (const m of ed.errs) {
    if (m[1] < start) out.push(m);
    else if (m[0] >= end) out.push([m[0] + d, m[1] + d]);
  }
  ed.errs = out;
}
function onEdit(ed) {
  const nl = ed.ta.value.length;
  if (ed.errs.length) {
    if (ed.pending) { const p = ed.pending; shiftMarks(ed, p.s, p.rem, p.ins); }
    else {
      const d = nl - ed.len;
      const start = Math.min(ed.selB, ed.ta.selectionStart);
      const rem = ed.selE > ed.selB ? ed.selE - ed.selB : (d < 0 ? -d : 0);
      shiftMarks(ed, d < 0 && ed.selE === ed.selB ? ed.ta.selectionStart : start, rem, d + rem);
    }
  }
  ed.pending = null;
  render(ed);
  ed.selB = ed.ta.selectionStart; ed.selE = ed.ta.selectionEnd;
  saveSoon(); scheduleCheck();
  markStale();
  if ($('#autorun').checked) schedulePreview();
}

function replaceRange(ta, s, e, text) {
  const ed = ta._ed;
  const want = ta.value.slice(0, s) + text + ta.value.slice(e);
  if (ed) ed.pending = { s, rem: e - s, ins: text.length };
  let ok = false;
  if (document.activeElement === ta && ed && !ed.host.hidden) {
    ta.setSelectionRange(s, e);
    try { ok = text ? document.execCommand('insertText', false, text) : (s === e ? true : document.execCommand('delete', false)); } catch (_) { ok = false; }
  }
  if (!ok || ta.value !== want) {
    if (ta.value !== want) {
      if (ed) ed.pending = { s, rem: e - s, ins: text.length };
      ta.value = want;
    }
    ta.setSelectionRange(s + text.length, s + text.length);
    ta.dispatchEvent(new Event('input'));
  }
}
function insertSnippet(ed, from, to, text) {
  const v = ed.ta.value;
  const ls = v.lastIndexOf('\n', from - 1) + 1;
  const indent = /^[ \t]*/.exec(v.slice(ls, from))[0];
  let t = text.replace(/\t/g, '  ').replace(/\n/g, '\n' + indent);
  let k = t.indexOf('$0');
  if (k >= 0) t = t.slice(0, k) + t.slice(k + 2); else k = t.length;
  ed.suppress = true;
  replaceRange(ed.ta, from, to, t);
  ed.suppress = false;
  ed.ta.setSelectionRange(from + k, from + k);
  caretUI(ed);
}
function insertAt(ed, text) { const ta = ed.ta; insertSnippet(ed, ta.selectionStart, ta.selectionEnd, text); }

/* ---------------- typing intelligence ---------------- */
const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSERS = ')]}"\'`';
const OPEN_TAG_END = /<([a-zA-Z][\w-]*)((?:\s(?:[^<>"']|"[^"]*"|'[^']*')*)?)$/;
function inTag(v, s) {
  const before = v.slice(Math.max(0, s - 2000), s);
  const lt = before.lastIndexOf('<'), gt = before.lastIndexOf('>');
  return lt > gt && /^<[a-zA-Z]/.test(before.slice(lt));
}
function inQuotes(str) { return ((str.match(/"/g) || []).length % 2) || ((str.match(/'/g) || []).length % 2); }

function planChar(ed, ch) {
  const ta = ed.ta, v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
  const next = v[e] || '', prev = v[s - 1] || '';
  if (ed.overtype) {
    const o = ed.overtype;
    if (s === e && s === o.pos && ch === o.str[0]) return () => { o.str = o.str.slice(1); if (!o.str) ed.overtype = null; };
    ed.overtype = null;
  }
  const lang = regionAt(ed, s).lang;
  const tagCtx = lang === 'html' && inTag(v, s);
  const pairOK = lang !== 'html' || (tagCtx && '"\''.includes(ch));
  // wrap a selection
  if (s !== e && PAIRS[ch] && pairOK) {
    return () => { const sel = v.slice(s, e); ed.suppress = true; replaceRange(ta, s, e, ch + sel + PAIRS[ch]); ed.suppress = false; ta.setSelectionRange(s + 1, s + 1 + sel.length); };
  }
  // step over a closer
  if (s === e && CLOSERS.includes(ch) && next === ch) return () => { ta.setSelectionRange(s + 1, s + 1); caretUI(ed); };
  if (lang === 'html' && s === e) {
    if (ch === '>') {
      const before = v.slice(Math.max(0, s - 2000), s);
      const lt = before.lastIndexOf('<');
      if (lt < 0) return null;
      const m = OPEN_TAG_END.exec(before.slice(lt));
      if (!m) return null;
      const tag = m[1], lt2 = tag.toLowerCase();
      if (VOID.has(lt2) || /\/\s*$/.test(m[2]) || v.slice(e).startsWith('</' + tag)) return null;
      const ls = v.lastIndexOf('\n', s - 1) + 1;
      const lineBefore = v.slice(ls, s - (before.length - lt));
      const indent = /^[ \t]*/.exec(v.slice(ls))[0];
      const block = !INLINE.has(lt2) && /^\s*$/.test(lineBefore) && lt2 !== 'html';
      return () => block ? insertAt(ed, '>\n\t$0\n</' + tag + '>') : insertAt(ed, '>$0</' + tag + '>');
    }
    if (ch === '/' && prev === '<') {
      const open = openTagsBefore(v.slice(0, s - 1));
      const t = open[open.length - 1];
      const closing = t ? '</' + t + '>' : '';
      if (t && v.slice(e, e + closing.length).toLowerCase() === closing) return () => {
        // the closing tag is already there: step over it instead of writing a second one
        ed.suppress = true; replaceRange(ta, s - 1, s, ''); ed.suppress = false;
        const np = s - 1 + closing.length;
        ta.setSelectionRange(np, np); caretUI(ed);
        ed.overtype = { str: t + '>', pos: np };
      };
      if (t) return () => {
        insertAt(ed, '/' + t + '>');
        // line up with the matching open tag when the line is otherwise empty
        const v2 = ta.value, p2 = ta.selectionStart, ls = v2.lastIndexOf('\n', p2 - 1) + 1;
        const pre = v2.slice(ls, p2 - t.length - 3);
        if (/^[ \t]+$/.test(pre) && pre.length >= 2) {
          ed.suppress = true; replaceRange(ta, ls, ls + 2, ''); ed.suppress = false;
          ta.setSelectionRange(p2 - 2, p2 - 2);
        }
      };
    }
    if (ch === '=' && tagCtx) {
      const before = v.slice(Math.max(0, s - 400), s);
      if (/\s[\w:-]+$/.test(before) && !inQuotes(before.slice(before.lastIndexOf('<')))) return () => insertAt(ed, '="$0"');
    }
  }
  if (s === e && PAIRS[ch] && pairOK) {
    const isQ = '"\'`'.includes(ch);
    if (isQ && /[\w$]/.test(prev)) return null;
    if (next && !/[\s)\]};,>:]/.test(next)) return null;
    if (lang === 'html' && tagCtx && isQ && inQuotes(v.slice(v.lastIndexOf('<', s), s))) return null;
    return () => insertAt(ed, ch + '$0' + PAIRS[ch]);
  }
  return null;
}
function openTagsBefore(t) {
  const s = t.replace(/<!--[\s\S]*?(?:-->|$)/g, '').replace(/(<(script|style)\b[^>]*>)[\s\S]*?(<\/\2\s*>)/gi, '$1$3');
  const st = [];
  for (const m of s.matchAll(/<(\/?)([a-zA-Z][\w:-]*)((?:[^<>"']|"[^"]*"|'[^']*')*)>/g)) {
    const n = m[2].toLowerCase();
    if (m[1]) { const k = st.lastIndexOf(n); if (k >= 0) st.length = k; }
    else if (!VOID.has(n) && !/\/\s*$/.test(m[3])) st.push(n);
  }
  return st;
}
function smartEnter(ed) {
  const ta = ed.ta, v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
  hideAC();
  const ls = v.lastIndexOf('\n', s - 1) + 1;
  const indent = /^[ \t]*/.exec(v.slice(ls, s))[0];
  const pc = v[s - 1], nc = v[e];
  const close = { '{': '}', '[': ']', '(': ')' };
  let openTag = false;
  if (ed.lang === 'html' && pc === '>') {
    const before = v.slice(Math.max(0, s - 2000), s - 1);
    const lt = before.lastIndexOf('<');
    if (lt >= 0) { const m = OPEN_TAG_END.exec(before.slice(lt)); if (m && !VOID.has(m[1].toLowerCase()) && !/\/\s*$/.test(m[2])) openTag = true; }
  }
  if ((close[pc] && nc === close[pc]) || (openTag && v.slice(e, e + 2) === '</')) {
    insertSnippet(ed, s, e, '\n\t$0\n');
  } else if (close[pc] || openTag) {
    insertSnippet(ed, s, e, '\n\t$0');
  } else {
    ed.suppress = true; replaceRange(ta, s, e, '\n' + indent); ed.suppress = false;
  }
  ensureCaretVisible(ed);
}
function smartBackspace(ed) {
  const ta = ed.ta, v = ta.value, s = ta.selectionStart;
  if (s !== ta.selectionEnd || s === 0) return false;
  const pc = v[s - 1], nc = v[s];
  if (PAIRS[pc] && PAIRS[pc] === nc) { ed.suppress = true; replaceRange(ta, s - 1, s + 1, ''); ed.suppress = false; return true; }
  const ls = v.lastIndexOf('\n', s - 1) + 1, pre = v.slice(ls, s);
  if (pre.length >= 2 && /^ +$/.test(pre) && pre.length % 2 === 0) { ed.suppress = true; replaceRange(ta, s - 2, s, ''); ed.suppress = false; return true; }
  return false;
}
function expandAbbr(ab) {
  const m = /^([a-zA-Z][\w-]*)?((?:[.#][\w-]+)*)(?:\*(\d+))?$/.exec(ab);
  if (!m) return null;
  let tag = m[1] || ''; const rest = m[2] || ''; const n = Math.min(parseInt(m[3] || '1', 10), 50);
  if (!tag && !rest) return null;
  if (!tag) tag = 'div';
  const lt = tag.toLowerCase();
  if (!TAGS.has(lt)) return null;
  const cls = [...rest.matchAll(/\.([\w-]+)/g)].map(x => x[1]);
  const id = (/#([\w-]+)/.exec(rest) || [])[1];
  const at = (id ? ` id="${id}"` : '') + (cls.length ? ` class="${cls.join(' ')}"` : '');
  const one = first => {
    const c = first ? '$0' : '';
    if (lt === 'a') return `<a href="${c}"${at}></a>`;
    if (lt === 'img') return `<img src="${c}" alt=""${at}>`;
    if (lt === 'input') return `<input type="${first ? '$0' : 'text'}"${at}>`;
    if (lt === 'link') return `<link rel="stylesheet" href="${c}">`;
    if (lt === 'script') return `<script src="${c}"><\/script>`;
    if (VOID.has(lt)) return `<${tag}${at}>${c}`;
    if (n === 1 && !INLINE.has(lt)) return `<${tag}${at}>\n\t${c}\n</${tag}>`;
    return `<${tag}${at}>${c}</${tag}>`;
  };
  return Array.from({ length: n }, (_, i) => one(i === 0)).join('\n');
}
function regionAt(ed, pos) {
  const v = ed.ta.value;
  if (ed.lang !== 'html') return { lang: ed.lang, start: 0, end: v.length };
  const low = v.toLowerCase(), before = low.slice(0, pos);
  const so = before.lastIndexOf('<style'), sc = before.lastIndexOf('<\/style');
  const jo = before.lastIndexOf('<script'), jc = before.lastIndexOf('<\/script');
  if (so > sc && so > jo) {
    const gt = v.indexOf('>', so);
    if (gt >= 0 && gt < pos) { const end = low.indexOf('<\/style', pos); return { lang: 'css', start: gt + 1, end: end < 0 ? v.length : end }; }
  }
  if (jo > jc && jo > so) {
    const gt = v.indexOf('>', jo);
    if (gt >= 0 && gt < pos && !/\bsrc\s*=/i.test(v.slice(jo, gt))) { const end = low.indexOf('<\/script', pos); return { lang: 'js', start: gt + 1, end: end < 0 ? v.length : end }; }
  }
  return { lang: 'html', start: 0, end: v.length };
}
function embeddedRegions(src) {
  const out = [], re = /<(style|script)\b([^>]*)>([\s\S]*?)(?:<\/\1\s*>|$)/gi; let m;
  while ((m = re.exec(src))) {
    if (m[1].toLowerCase() === 'script' && /\bsrc\s*=/i.test(m[2])) continue;
    const start = m.index + m[0].indexOf('>') + 1;
    out.push({ lang: m[1].toLowerCase() === 'style' ? 'css' : 'js', start, end: start + m[3].length });
    if (!m[0].length) break;
  }
  return out;
}
const ABBR_RE = /(?:^|[\s>])(!|[a-zA-Z][\w-]*(?:[.#][\w-]*)*(?:\*\d+)?|[.#][\w-]+(?:[.#][\w-]*)*(?:\*\d+)?)$/;
function doTab(ed, shift) {
  const ta = ed.ta, v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
  if (shift || (s !== e && v.slice(s, e).includes('\n'))) { indentLines(ed, shift); return; }
  const rg = regionAt(ed, s);
  if (s === e && rg.lang === 'html' && !inTag(v, s)) {
    const m = ABBR_RE.exec(v.slice(Math.max(0, s - 200), s));
    if (m) { const exp = m[1] === '!' ? BOILER : expandAbbr(m[1]); if (exp) { insertSnippet(ed, s - m[1].length, s, exp); scheduleCheck(); return; } }
  }
  if (s === e && rg.lang === 'js') {
    const m = /(?:^|[^\w$.])([a-z]+)$/.exec(v.slice(Math.max(0, s - 40), s));
    const sn = m && JS_SNIPS.find(x => x.name === m[1]);
    if (sn) { insertSnippet(ed, s - m[1].length, s, sn.body); return; }
  }
  if (s === e && rg.lang === 'css') {
    const m = /(?:^|[\s;{])([a-z]+)$/.exec(v.slice(Math.max(0, s - 40), s));
    if (m && CSS_ABBR[m[1]] && cssDepth(v.slice(rg.start, s)) > 0) { insertSnippet(ed, s - m[1].length, s, CSS_ABBR[m[1]] + ': $0;'); updateAC(ed); return; }
  }
  ed.suppress = true; replaceRange(ta, s, e, '  '); ed.suppress = false;
}
function indentLines(ed, out) {
  const ta = ed.ta, v = ta.value, s = ta.selectionStart; let e = ta.selectionEnd;
  if (e > s && v[e - 1] === '\n') e--;
  const ls = v.lastIndexOf('\n', s - 1) + 1;
  let le = v.indexOf('\n', e); if (le < 0) le = v.length;
  const block = v.slice(ls, le);
  const nb = block.split('\n').map(l => out ? l.replace(/^ {1,2}/, '') : (l.length ? '  ' + l : l)).join('\n');
  ed.suppress = true; replaceRange(ta, ls, le, nb); ed.suppress = false;
  if (s === e && out) { const p = Math.max(ls, s - (block.length - nb.length)); ta.setSelectionRange(p, p); }
  else ta.setSelectionRange(ls, ls + nb.length);
}
function toggleComment(ed) {
  const ta = ed.ta, v = ta.value, s = ta.selectionStart; let e = ta.selectionEnd;
  if (e > s && v[e - 1] === '\n') e--;
  const ls = v.lastIndexOf('\n', s - 1) + 1;
  let le = v.indexOf('\n', e); if (le < 0) le = v.length;
  const block = v.slice(ls, le); let nb;
  const cl = regionAt(ed, s).lang;
  if (cl === 'js') {
    const lines = block.split('\n');
    const all = lines.filter(l => l.trim()).every(l => /^\s*\/\//.test(l));
    const minI = Math.min(...lines.filter(l => l.trim()).map(l => /^\s*/.exec(l)[0].length), 999);
    nb = lines.map(l => !l.trim() ? l : all ? l.replace(/^(\s*)\/\/ ?/, '$1') : l.slice(0, minI) + '// ' + l.slice(minI)).join('\n');
  } else {
    const [o, c] = cl === 'html' ? ['<!--', '-->'] : ['/*', '*/'];
    const t = block.trim(), lead = /^\s*/.exec(block)[0], trail = /\s*$/.exec(block)[0];
    nb = t.startsWith(o) && t.endsWith(c) ? lead + t.slice(o.length, t.length - c.length).trim() + trail : lead + o + ' ' + t + ' ' + c + trail;
  }
  ed.suppress = true; replaceRange(ta, ls, le, nb); ed.suppress = false;
  ta.setSelectionRange(ls, ls + nb.length);
}
function ensureCaretVisible(ed) {
  const ta = ed.ta, v = ta.value, p = ta.selectionStart;
  const c = caretRect(ed, p), r = ed.code.getBoundingClientRect();
  if (c.bottom > r.bottom - 8) ta.scrollTop += c.bottom - r.bottom + M.lh;
  else if (c.top < r.top) ta.scrollTop -= r.top - c.top + M.lh;
}

function onKey(ed, e) {
  const mod = e.ctrlKey || e.metaKey;
  ed.selB = ed.ta.selectionStart; ed.selE = ed.ta.selectionEnd;
  if (e.key.length > 1 && e.key !== 'Shift') ed.overtype = null;
  if (AC.open && AC.ed === ed) {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveAC(1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); moveAC(-1); return; }
    if (e.key === 'Enter' && !AC.tabOnly && !e.shiftKey && !mod) { e.preventDefault(); acceptAC(AC.i); return; }
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); acceptAC(AC.i); return; }
    if (e.key === 'Escape') { e.preventDefault(); hideAC(); return; }
  }
  if (mod && e.key === 'Enter') { e.preventDefault(); if (app.dataset.view === 'code') setView('split'); run(); toast('Ran your code'); return; }
  if (mod && (e.key === 's' || e.key === 'S')) {
    e.preventDefault(); saveNow(true); run();
    if (GH.token && GH.user && ghCfg.repo) { toast('Saved. Committing to GitHub…'); ghCommit(); } else toast('Saved in this browser');
    return;
  }
  if (mod && e.key === '/') { e.preventDefault(); toggleComment(ed); return; }
  if (mod && e.key === ' ') { e.preventDefault(); updateAC(ed, true); return; }
  if (e.key === 'Escape') { ed.escTab = true; return; }
  if (e.key === 'Tab' && !mod && !e.altKey) {
    if (ed.escTab) { ed.escTab = false; return; }
    e.preventDefault(); hideAC(); doTab(ed, e.shiftKey); return;
  }
  ed.escTab = false;
  if (e.isComposing) return;
  if (e.key === 'Enter' && !mod && !e.altKey && !e.shiftKey) { e.preventDefault(); smartEnter(ed); return; }
  if (e.key === 'Backspace' && !mod && !e.altKey) { if (smartBackspace(ed)) { e.preventDefault(); if (AC.open) updateAC(ed); } return; }
  if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) { hideAC(); return; }
  if (e.key.length === 1 && !mod && !e.altKey) {
    const act = planChar(ed, e.key);
    if (act) { e.preventDefault(); act(); updateAC(ed); }
  }
}

/* ---------------- autocomplete ---------------- */
const AC = { el: $('#ac'), list: $('#acList'), open: false, items: [], i: 0, ed: null, from: 0, tabOnly: false, prefix: '' };
let AC_DIR = '', AC_FILE = null;
const KIND_LETTER = { tag: '<>', attr: 'a', prop: 'p', val: 'v', kw: 'k', snip: '✦', emmet: '✦', var: 'x', fn: 'ƒ' };
function cssDepth(pre) {
  const s = pre.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, '');
  let d = 0; for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === '{') d++; else if (c === '}') d = Math.max(0, d - 1); }
  return d;
}
function rankFilter(cands, w, getLabel = c => c.label) {
  const lw = w.toLowerCase();
  return cands.filter(c => { const l = getLabel(c); const ll = l.toLowerCase(); return ll.startsWith(lw) && (l !== w || c.kind === 'snip' || c.kind === 'emmet'); });
}
function suggestHTML(v, p) {
  const before = v.slice(Math.max(0, p - 600), p);
  if (before.lastIndexOf('<!--') > before.lastIndexOf('-->')) return null;
  let m = /<(\/?)([a-zA-Z][\w-]*)?$/.exec(before);
  if (m) {
    const pre = (m[2] || '').toLowerCase();
    if (m[1]) {
      const open = [...new Set(openTagsBefore(v.slice(0, p - m[0].length)).reverse())];
      const items = open.filter(n => n.startsWith(pre)).map(n => ({ label: '/' + n, insert: n + '>', kind: 'tag', detail: 'close tag' }));
      return { items, from: p - pre.length, prefix: pre };
    }
    const pool = pre ? TAGLIST.filter(t => t.startsWith(pre) && t !== pre) : COMMON_TAGS;
    const ordered = pre ? [...pool.filter(t => COMMON_TAGS.includes(t)), ...pool.filter(t => !COMMON_TAGS.includes(t))] : pool;
    return { items: ordered.map(t => ({ label: t, insert: t, kind: 'tag', detail: VOID.has(t) ? 'no closing tag' : '' })), from: p - pre.length, prefix: pre };
  }
  const lt = before.lastIndexOf('<'), gt = before.lastIndexOf('>');
  if (lt > gt) {
    const inT = before.slice(lt);
    const tm = /^<([a-zA-Z][\w-]*)\s/.exec(inT);
    if (!tm) return null;
    const tag = tm[1].toLowerCase();
    if (inQuotes(inT)) {
      const stm = /\bstyle=["']([^"']*)$/i.exec(inT);
      if (stm) {
        const sub = '{' + stm[1];
        const r = suggestCSS(sub, sub.length, false);
        if (r) { r.from = p - stm[1].length + (r.from - 1); r.items = r.items.map(it => it.kind === 'prop' ? { ...it, insert: it.label + ': $0;' } : it); }
        return r;
      }
      const pm = /\b(href|src)=["']([\w.\/-]*)$/i.exec(inT);
      if (pm) {
        const isSrc = pm[1].toLowerCase() === 'src';
        const list = files.filter(f => f.id !== AC_FILE && (isSrc ? f.lang === 'js' : f.lang !== 'js')).map(f => relPath(AC_DIR, f.name)).filter(x => x.startsWith(pm[2]) && x !== pm[2]);
        return list.length ? { items: list.map(x => ({ label: x, insert: x, kind: 'val', detail: 'your file' })), from: p - pm[2].length, prefix: pm[2] } : null;
      }
      const vm = /\b([\w-]+)=["']([\w-]*)$/.exec(inT);
      if (vm && ATTR_VALUES[vm[1].toLowerCase()]) {
        const list = ATTR_VALUES[vm[1].toLowerCase()].filter(x => x.startsWith(vm[2]) && x !== vm[2]);
        return { items: list.map(x => ({ label: x, insert: x, kind: 'val', detail: vm[1] })), from: p - vm[2].length, prefix: vm[2] };
      }
      return null;
    }
    const am = /(?:^|\s)([\w:-]*)$/.exec(inT);
    if (!am) return null;
    const pre = am[1].toLowerCase();
    const present = new Set([...inT.matchAll(/\s([\w:-]+)(?==|\s|$)/g)].map(x => x[1].toLowerCase()));
    let pool = [...(TAG_ATTRS[tag] ? W(TAG_ATTRS[tag]) : []), ...GLOBAL_ATTRS];
    if (pre) pool = pool.concat(ATTRLIST);
    pool = [...new Set(pool)].filter(a => a.toLowerCase().startsWith(pre) && a.toLowerCase() !== pre && !present.has(a.toLowerCase()));
    return { items: pool.slice(0, 40).map(a => ({ label: a, insert: BOOL.has(a) ? a : a + '="$0"', kind: 'attr', detail: (TAG_ATTRS[tag] || '').split(' ').includes(a) ? '<' + tag + '>' : '' })), from: p - pre.length, prefix: pre };
  }
  m = ABBR_RE.exec(before);
  if (m) {
    const word = m[1];
    const ls = before.lastIndexOf('\n') + 1;
    const linePre = before.slice(ls, before.length - word.length);
    if (!/^\s*$/.test(linePre) && !/>\s*$/.test(linePre)) return null;
    if (word === '!') return { items: [{ label: '!', insert: BOILER, kind: 'emmet', detail: 'full page skeleton' }], from: p - 1, tabOnly: true, prefix: '!' };
    const parts = /^([a-zA-Z][\w-]*)?(.*)$/.exec(word);
    const tagPart = (parts[1] || '').toLowerCase(), rest = parts[2];
    let items = [];
    if (rest) { const exp = expandAbbr(word); if (exp) items.push({ label: word, insert: exp, kind: 'emmet', detail: exp.split('\n')[0].replace('$0', '') }); }
    else if (tagPart.length >= 1) {
      const pool = TAGLIST.filter(t => t.startsWith(tagPart));
      const ordered = [...pool.filter(t => COMMON_TAGS.includes(t)), ...pool.filter(t => !COMMON_TAGS.includes(t))];
      items = ordered.slice(0, 20).map(t => ({ label: t, insert: expandAbbr(t), kind: 'emmet', detail: '<' + t + '>' }));
    }
    return items.length ? { items, from: p - word.length, tabOnly: true, prefix: tagPart || word } : null;
  }
  return null;
}
function suggestCSS(v, p, force) {
  const preAll = v.slice(0, p);
  if (preAll.lastIndexOf('/*') > preAll.lastIndexOf('*/')) return null;
  const depth = cssDepth(preAll);
  const segStart = Math.max(preAll.lastIndexOf('{'), preAll.lastIndexOf('}'), preAll.lastIndexOf(';')) + 1;
  const seg = preAll.slice(segStart);
  if (depth > 0) {
    const cm = /^\s*([\w-]+)\s*:\s*([^]*)$/.exec(seg);
    if (cm) {
      const prop = cm[1].toLowerCase();
      const wm = /([\w#.-]*)$/.exec(seg); const w = wm[1];
      if (!w && !force && !/:\s*$/.test(seg)) return null;
      const vm = /var\(\s*(-[\w-]*)?$/.exec(seg);
      if (vm) {
        const pre = vm[1] || '';
        const vars = [...new Set([...v.matchAll(/(--[\w-]+)\s*:/g)].map(x => x[1]))].filter(x => x.startsWith(pre) && x !== pre);
        return vars.length ? { items: vars.map(x => ({ label: x, insert: x, kind: 'var', detail: 'your variable' })), from: p - pre.length, prefix: pre } : null;
      }
      let pool = [...(VALUE_HINTS[prop] || []), ...(VALS[prop] || [])];
      if (prop === 'transition-property' || prop === 'transition') pool = pool.concat(TRANSITION_PROPS);
      if (prop === 'animation' || prop === 'animation-name') pool = pool.concat([...v.matchAll(/@keyframes\s+([\w-]+)/g)].map(x => x[1]));
      if (COLOR_PROPS.has(prop) && w.length >= 1) pool = pool.concat(COLORS);
      pool = [...new Set(pool)].filter(x => x.toLowerCase().startsWith(w.toLowerCase()) && x !== w);
      const fns = W([CSS_FN[prop] || '', COLOR_PROPS.has(prop) ? CSS_COLOR_FN : '', w.length >= 1 ? CSS_ANY_FN : ''].join(' ') || ' ').filter(Boolean)
        .filter(x => x.toLowerCase().startsWith(w.toLowerCase()) && x.slice(0, -2) !== w);
      if (w.length >= 1) pool.push(...GLOBAL_VALS.filter(x => x.startsWith(w) && x !== w && !pool.includes(x)));
      const items = [
        ...fns.map(x => ({ label: x.slice(0, -2), insert: x.slice(0, -2) + '($0)', kind: 'fn', detail: 'function' })),
        ...pool.map(x => ({ label: x, insert: x, kind: 'val', detail: prop }))
      ];
      if (w) items.sort((a, b) => (b.label.startsWith(w) - a.label.startsWith(w)) || a.label.length - b.label.length);
      return { items: items.slice(0, 40), from: p - w.length, prefix: w };
    }
    if (/[&.#>]/.test(seg)) return null;
    const wm = /(-?[a-zA-Z][\w-]*)$/.exec(seg);
    if (!wm) return null;
    const w = wm[1].toLowerCase();
    let pool = PROPLIST.filter(x => x.startsWith(w) && x !== w);
    pool = [...pool.filter(x => COMMON_PROPS.includes(x)).sort((a, b) => COMMON_PROPS.indexOf(a) - COMMON_PROPS.indexOf(b)), ...pool.filter(x => !COMMON_PROPS.includes(x))];
    if (CSS_ABBR[w] && !pool.includes(CSS_ABBR[w])) pool.unshift(CSS_ABBR[w]);
    else if (CSS_ABBR[w]) { pool = pool.filter(x => x !== CSS_ABBR[w]); pool.unshift(CSS_ABBR[w]); }
    const hasColon = v[p] === ':';
    return { items: pool.slice(0, 40).map(x => ({ label: x, insert: hasColon ? x : x + ': $0;', kind: 'prop', detail: CSS_ABBR[w] === x ? w + ' →' : '', chain: !hasColon })), from: p - wm[1].length, prefix: w };
  }
  let m;
  if ((m = /@([\w-]*)$/.exec(seg))) {
    const items = CSS_AT.filter(a => a.label.startsWith('@' + m[1])).map(a => ({ ...a, kind: 'snip' }));
    return { items, from: p - m[0].length, prefix: '@' + m[1] };
  }
  if ((m = /(^|[\s,>+~(\w\]])([.#])([\w-]*)$/.exec(seg))) {
    const kind = m[2], pre = m[3];
    const set = new Set();
    htmlFiles().forEach(f => {
      const t = eds[f.id].ta.value;
      if (kind === '#') for (const x of t.matchAll(/\bid\s*=\s*["']([\w-]+)/g)) set.add(x[1]);
      else for (const x of t.matchAll(/\bclass\s*=\s*["']([^"']*)/g)) x[1].split(/\s+/).forEach(c => c && set.add(c));
    });
    const items = [...set].filter(x => x.startsWith(pre) && x !== pre).sort().map(x => ({ label: x, insert: x, kind: 'var', detail: kind === '#' ? 'id in your HTML' : 'class in your HTML' }));
    return items.length ? { items, from: p - pre.length, prefix: pre } : null;
  }
  if ((m = /::?([\w-]*)$/.exec(seg))) {
    const items = PSEUDOS.filter(x => x.startsWith(m[1].toLowerCase()) && x !== m[1]).map(x => ({ label: x, insert: /^(not|is|where|has|nth-child|nth-of-type|nth-last-child)$/.test(x) ? x + '($0)' : x, kind: 'kw', detail: 'pseudo' }));
    return { items, from: p - m[1].length, prefix: m[1] };
  }
  if ((m = /(^|[\s,>+~(])([a-zA-Z][\w-]*)$/.exec(seg))) {
    const w = m[2].toLowerCase();
    const items = TAGLIST.filter(t => t.startsWith(w) && t !== w).map(t => ({ label: t, insert: t, kind: 'tag', detail: 'element' }));
    return { items, from: p - m[2].length, prefix: w };
  }
  return null;
}
function suggestJS(v, p, force) {
  const ls = v.lastIndexOf('\n', p - 1) + 1, linePre = v.slice(ls, p);
  let sm = /addEventListener\(\s*['"]([\w]*)$/.exec(linePre);
  if (sm) {
    const items = JS_EVENTS.filter(x => x.toLowerCase().startsWith(sm[1].toLowerCase()) && x !== sm[1]).map(x => ({ label: x, insert: x, kind: 'val', detail: 'event' }));
    return items.length ? { items, from: p - sm[1].length, prefix: sm[1] } : null;
  }
  sm = /(querySelector(?:All)?|getElementById|getElementsByClassName|closest|matches)\(\s*['"]([#.\w-]*)$/.exec(linePre);
  if (sm) {
    const fn = sm[1], pre = sm[2], set = new Set();
    htmlFiles().forEach(f => {
      const t = eds[f.id].ta.value;
      for (const x of t.matchAll(/\bid\s*=\s*["']([\w-]+)/g)) set.add(fn === 'getElementById' ? x[1] : '#' + x[1]);
      if (fn !== 'getElementById') for (const x of t.matchAll(/\bclass\s*=\s*["']([^"']*)/g)) x[1].split(/\s+/).forEach(c => c && set.add(fn === 'getElementsByClassName' ? c : '.' + c));
      if (/^(querySelector|querySelectorAll|closest|matches)$/.test(fn)) for (const x of t.matchAll(/<([a-zA-Z][\w-]*)/g)) set.add(x[1].toLowerCase());
    });
    const items = [...set].filter(x => x.startsWith(pre) && x !== pre).sort((a, b) => (a[0] === '#' ? 0 : a[0] === '.' ? 1 : 2) - (b[0] === '#' ? 0 : b[0] === '.' ? 1 : 2) || a.localeCompare(b))
      .map(x => ({ label: x, insert: x, kind: 'var', detail: 'in your HTML' }));
    return items.length ? { items, from: p - pre.length, prefix: pre } : null;
  }
  const lb = linePre.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, '');
  if (/\/\/|["'`]/.test(lb)) return null;
  const head = v.slice(0, ls);
  if (head.lastIndexOf('/*') > head.lastIndexOf('*/')) return null;
  let m = /([\w$]+|[\])])\s*\.\s*([\w$]*)$/.exec(linePre);
  if (m) {
    if (/^\d+$/.test(m[1])) return null;
    const obj = m[1], w = m[2];
    const raw = W(MEMBERS[obj] || DEFAULT_MEMBERS);
    const items = raw.map(x => { const fn = x.endsWith('()'); const n = fn ? x.slice(0, -2) : x; return { label: n, insert: MEMBER_SNIPS[n] || (fn ? n + '($0)' : n), kind: fn ? 'fn' : 'var', detail: fn ? 'method' : 'property' }; });
    return { items: rankFilter(items, w).slice(0, 40), from: p - w.length, prefix: w };
  }
  m = /[A-Za-z_$][\w$]*$/.exec(linePre);
  if (!m) return null;
  const w = m[0];
  if (/\d/.test(linePre[linePre.length - w.length - 1] || '')) return null;
  const names = jsNames(v.replace(JS_STR_COMMENT, blank));
  const cnt = (v.match(new RegExp('\\b' + w.replace(/\$/g, '\\$') + '\\b', 'g')) || []).length;
  if (cnt <= 1) names.delete(w);
  const cands = [];
  names.forEach(n => cands.push({ label: n, insert: n, kind: 'var', detail: 'yours', r: 0 }));
  JS_SNIPS.forEach(s => cands.push({ label: s.name, insert: s.body, kind: 'snip', detail: s.detail, r: 1 }));
  JSKW.forEach(k => cands.push({ label: k, insert: k, kind: 'kw', detail: 'keyword', r: 2 }));
  JSLIT.forEach(k => cands.push({ label: k, insert: k, kind: 'kw', detail: '', r: 2 }));
  JS_GLOBALS.forEach(g => { const fn = g.endsWith('()'); const n = fn ? g.slice(0, -2) : g; cands.push({ label: n, insert: fn ? n + '($0)' : n, kind: fn ? 'fn' : 'var', detail: 'built-in', r: 3 }); });
  const seen = new Set();
  const items = rankFilter(cands, w).filter(c => { const k = c.label + c.kind; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => a.r - b.r || (b.label.startsWith(w) - a.label.startsWith(w)) || a.label.length - b.label.length);
  return { items: items.slice(0, 40), from: p - w.length, prefix: w };
}
function updateAC(ed, force) {
  const ta = ed.ta;
  if (ta.selectionStart !== ta.selectionEnd) { hideAC(); return; }
  const v = ta.value, p = ta.selectionStart;
  const cf = fileById(ed.id); AC_DIR = cf ? dirName(cf.name) : ''; AC_FILE = ed.id;
  const rg = regionAt(ed, p);
  let r;
  if (rg.lang === 'html') r = suggestHTML(v, p);
  else {
    const sub = v.slice(rg.start, rg.end), sp = p - rg.start;
    r = rg.lang === 'css' ? suggestCSS(sub, sp, force) : suggestJS(sub, sp, force);
    if (r) r.from += rg.start;
  }
  if (!r || !r.items.length) { hideAC(); return; }
  Object.assign(AC, { open: true, items: r.items, i: 0, ed, from: r.from, tabOnly: !!r.tabOnly, prefix: r.prefix || '' });
  renderAC(); placeAC();
}
function renderAC() {
  const pl = AC.prefix.length;
  AC.list.innerHTML = AC.items.map((it, i) => {
    const lab = esc(it.label);
    const hl = pl && it.label.toLowerCase().startsWith(AC.prefix.toLowerCase()) ? `<b>${esc(it.label.slice(0, pl))}</b>${esc(it.label.slice(pl))}` : lab;
    return `<li role="option" id="aco-${i}" data-i="${i}" aria-selected="${i === AC.i}"><span class="k k-${it.kind}">${KIND_LETTER[it.kind] || '·'}</span><span class="lbl">${hl}</span>${it.detail ? `<span class="det">${esc(it.detail)}</span>` : ''}</li>`;
  }).join('');
  $('#acFoot').innerHTML = AC.tabOnly ? '<kbd>Tab</kbd> to expand · <kbd>Esc</kbd> to close' : '<kbd>Enter</kbd> or <kbd>Tab</kbd> to insert · <kbd>↑</kbd><kbd>↓</kbd> to pick';
  AC.el.hidden = false;
  AC.ed.ta.setAttribute('aria-activedescendant', 'aco-' + AC.i);
}
function placeAC() {
  if (!AC.open) return;
  const ed = AC.ed, r = ed.code.getBoundingClientRect();
  const c = caretRect(ed, AC.from);
  const x = c.left - 30, y = c.bottom + 2;
  const el = AC.el; el.style.left = '0px'; el.style.top = '0px';
  const w = el.offsetWidth, h = el.offsetHeight;
  let left = Math.min(Math.max(8, x), innerWidth - w - 8);
  let top = y;
  if (top + h > innerHeight - 8) top = y - M.lh - h - 4;
  if (top < 8) top = 8;
  el.style.left = left + 'px'; el.style.top = top + 'px';
  if (y < r.top || y > r.bottom + M.lh) hideAC();
}
function moveAC(d) {
  AC.i = (AC.i + d + AC.items.length) % AC.items.length;
  $$('#acList li').forEach((li, i) => li.setAttribute('aria-selected', i === AC.i));
  const li = $('#aco-' + AC.i); if (li) li.scrollIntoView({ block: 'nearest' });
  AC.ed.ta.setAttribute('aria-activedescendant', 'aco-' + AC.i);
}
function acceptAC(i) {
  const it = AC.items[i], ed = AC.ed; if (!it) return;
  const from = AC.from, to = ed.ta.selectionStart;
  hideAC();
  insertSnippet(ed, from, to, it.insert);
  if (it.chain) setTimeout(() => updateAC(ed, true), 0);
}
function hideAC() { if (!AC.open) return; AC.open = false; AC.el.hidden = true; if (AC.ed) AC.ed.ta.removeAttribute('aria-activedescendant'); }
AC.list.addEventListener('pointerdown', e => e.preventDefault());
AC.list.addEventListener('click', e => { const li = e.target.closest('li'); if (li) { AC.ed.ta.focus(); acceptAC(+li.dataset.i); } });

/* ---------------- preview ---------------- */
const frame = $('#frame');
let previewTimer = 0, stale = false;
const SHIM = '<script>(' + function () {
  var P = parent;
  function fmt(v) {
    try {
      if (v instanceof Error) return v.name + ': ' + v.message;
      if (v && typeof v === 'object') {
        if (v.nodeType === 1) return '<' + v.tagName.toLowerCase() + (v.id ? '#' + v.id : '') + (typeof v.className === 'string' && v.className.trim() ? '.' + v.className.trim().split(/\s+/).join('.') : '') + '>';
        if (v.nodeType) return '[' + v.nodeName + ']';
        return JSON.stringify(v, null, 2);
      }
      if (typeof v === 'undefined') return 'undefined';
      if (typeof v === 'function') return 'ƒ ' + (v.name || 'anonymous') + '()';
      return String(v);
    } catch (e) { return String(v); }
  }
  function send(t, args) { try { P.postMessage({ __pip: 1, t: t, a: Array.prototype.map.call(args, fmt) }, '*'); } catch (e) {} }
  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (k) {
    var o = console[k];
    console[k] = function () { send(k, arguments); try { o.apply(console, arguments); } catch (e) {} };
  });
  window.addEventListener('error', function (ev) { try { P.postMessage({ __pip: 1, t: 'runtime', a: [ev.message || 'Error'], line: ev.lineno || 0 }, '*'); } catch (e) {} });
  window.addEventListener('unhandledrejection', function (ev) { var r = ev.reason; send('error', ['Unhandled promise rejection: ' + (r && r.message || r)]); });
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a || ev.defaultPrevented) return;
    var h = a.getAttribute('href') || '';
    if (!h || h.charAt(0) === '#' || /^([a-z][\w+.-]*:|\/\/)/i.test(h)) return;
    ev.preventDefault();
    try { P.postMessage({ __pip: 1, t: 'nav', href: h }, '*'); } catch (e) {}
  });
}.toString() + ')();<\/script>';

/* ---------------- paths ---------------- */
function resolvePath(dir, href) {
  href = href.split(/[?#]/)[0];
  const parts = href.startsWith('/') ? [] : (dir ? dir.split('/') : []);
  href.replace(/^\/+/, '').split('/').forEach(seg => { if (!seg || seg === '.') return; if (seg === '..') parts.pop(); else parts.push(seg); });
  return parts.join('/');
}
function relPath(fromDir, to) {
  const a = fromDir ? fromDir.split('/') : [], b = to.split('/');
  let i = 0;
  while (i < a.length && i < b.length - 1 && a[i] === b[i]) i++;
  return '../'.repeat(a.length - i) + b.slice(i).join('/');
}

/* ---------------- building a page ---------------- */
let jsMap = [];
function buildPage(pid, forExport) {
  const pf = fileById(pid) || htmlFiles()[0];
  const dir = dirName(pf.name);
  const used = { css: new Set(), js: new Set() };
  const deferred = [];
  const code = f => eds[f.id].ta.value;
  const scriptTag = f => `<script>${forExport ? '' : '/*pip:' + f.id + '*/'}\n${code(f)}\n<\/script>`;
  let h = code(pf);
  const outside = (str, fn) => str.split(/(<!--[\s\S]*?-->)/).map((part, i) => i % 2 ? part : fn(part)).join('');
  h = outside(h, part => part.replace(/<link\b[^>]*>/gi, m => {
    const hm = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(m);
    if (!hm || !/stylesheet/i.test(m)) return m;
    const f = fileByName(resolvePath(dir, hm[1] ?? hm[2] ?? hm[3]));
    if (!f || f.lang !== 'css') return m;
    used.css.add(f.id);
    return `<style>\n${code(f)}\n</style>`;
  }).replace(/<script\b([^>]*)>\s*<\/script>/gi, (m, attrs) => {
    const sm = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
    if (!sm) return m;
    const f = fileByName(resolvePath(dir, sm[1] ?? sm[2] ?? sm[3]));
    if (!f || f.lang !== 'js') return m;
    used.js.add(f.id);
    if (/\bdefer\b/i.test(attrs)) { deferred.push(f); return ''; }
    return scriptTag(f);
  }));
  const autoCss = linkMode === 'auto' && !used.css.size ? files.filter(f => f.lang === 'css') : [];
  const autoJs = linkMode === 'auto' && !used.js.size ? files.filter(f => f.lang === 'js') : [];
  const head = [forExport ? '' : SHIM, ...autoCss.map(f => `<style>\n${code(f)}\n</style>`)].filter(Boolean).join('\n');
  const tail = autoJs.concat(deferred).map(scriptTag).join('\n');
  let doc;
  if (/<html[\s>]|<body[\s>]|<head[\s>]/i.test(h)) {
    doc = h;
    if (head) {
      if (/<\/head>/i.test(doc)) doc = doc.replace(/<\/head>/i, () => head + '\n</head>');
      else if (/<body[^>]*>/i.test(doc)) doc = doc.replace(/<body[^>]*>/i, x => head + '\n' + x);
      else doc = head + '\n' + doc;
    }
    if (tail) { const bi = doc.toLowerCase().lastIndexOf('</body>'); doc = bi >= 0 ? doc.slice(0, bi) + tail + '\n' + doc.slice(bi) : doc + '\n' + tail; }
  } else {
    const title = baseName(pf.name).replace(/\.html?$/i, '');
    doc = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${esc(title)}</title>\n${head}\n</head>\n<body>\n${h}\n${tail}\n</body>\n</html>`;
  }
  if (!forExport) {
    jsMap = [];
    files.filter(f => f.lang === 'js').forEach(f => {
      const idx = doc.indexOf('/*pip:' + f.id + '*/');
      if (idx >= 0) jsMap.push({ id: f.id, start: lineOf(doc, idx) + 1, lines: code(f).split('\n').length });
    });
  }
  return doc;
}
function run() {
  clearTimeout(previewTimer);
  runtimeIssues = [];
  clearConsole();
  frame.srcdoc = buildPage(page, false);
  stale = false; $('#live').classList.remove('stale');
  $('#urlTxt').textContent = $('#autorun').checked ? 'live' : 'ran';
  refreshPet();
}
const idle = window.requestIdleCallback ? fn => requestIdleCallback(fn, { timeout: 700 }) : fn => setTimeout(fn, 1);
function autoRun() {
  if (app.dataset.view === 'code') { stale = true; $('#live').classList.add('stale'); return; }
  run();
}
function schedulePreview() { clearTimeout(previewTimer); previewTimer = setTimeout(() => idle(autoRun), 450); }
function markStale() {
  if (!$('#autorun').checked && !stale) { stale = true; $('#live').classList.add('stale'); $('#urlTxt').textContent = 'press Run'; }
}

/* console */
let logCount = 0, errCount = 0;
function clearConsole() { logCount = 0; errCount = 0; $('#clog').innerHTML = '<div class="empty">Nothing logged yet. Try <code>console.log("hi")</code> in a .js file.</div>'; updCount(); }
function updCount() { const c = $('#cCount'); c.textContent = logCount; c.classList.toggle('err', errCount > 0); }
function logRow(type, text) {
  const box = $('#clog');
  const empty = $('.empty', box); if (empty) empty.remove();
  if (box.children.length > 300) box.firstElementChild.remove();
  const row = document.createElement('div');
  row.className = 'row ' + (type === 'warn' ? 'warn' : type === 'error' || type === 'runtime' ? 'error' : '');
  const tg = document.createElement('span'); tg.className = 'tg'; tg.textContent = type === 'runtime' ? 'error' : type;
  const tx = document.createElement('span'); tx.textContent = text;
  row.append(tg, tx); box.appendChild(row);
  box.scrollTop = box.scrollHeight;
  logCount++; if (type === 'error' || type === 'runtime') errCount++;
  updCount();
}
function navTo(href) {
  const cur = fileById(page);
  const target = resolvePath(dirName(cur ? cur.name : ''), href);
  const f = fileByName(target) || fileByName((target ? target + '/' : '') + 'index.html');
  if (f && f.lang === 'html') { setPage(f.id); toast('Opened ' + f.name); }
  else logRow('warn', `The link "${href}" goes to ${target || 'nothing'}, which isn't a page in this project.`);
}
addEventListener('message', e => {
  if (e.source !== frame.contentWindow) return;
  const d = e.data; if (!d || !d.__pip) return;
  if (d.t === 'nav') { navTo(String(d.href || '')); return; }
  if (d.t === 'runtime') {
    const msg = String(d.a[0] || 'Error');
    if (msg === 'Script error.') return;
    const hit = jsMap.find(m => d.line >= m.start && d.line < m.start + m.lines);
    const fid = hit ? hit.id : page, uline = hit ? d.line - hit.start + 1 : 0;
    const f = fileById(fid); if (!f) return;
    logRow('runtime', msg + (uline ? `  (${f.name} line ${uline})` : ''));
    if (!runtimeIssues.some(r => r.word === msg)) {
      const v = eds[fid].ta.value; let off = 0;
      if (uline) { let k = 0; for (let i = 1; i < uline; i++) { k = v.indexOf('\n', k); if (k < 0) break; k++; off = k; } }
      runtimeIssues.push({ key: 'rt|' + fid + '|' + msg, file: fid, lang: f.lang, kind: 'runtime', word: msg, line: uline, first: off, marks: [], edits: [] });
      refreshPet();
    }
  } else logRow(d.t, (d.a || []).join(' '));
});

/* ---------------- Pip ---------------- */
let runtimeIssues = [], typoIssues = [], checkTimer = 0, counts = {};
const Ignored = new Set();
const Pet = { list: [], key: null, open: false, mode: 'issue', known: new Set(), on: store.get('pet', true), fixes: store.get('fixes', 0), greeted: store.get('greeted', false), msgTimer: 0 };
const petWrap = $('#petWrap'), petBtn = $('#pet'), bubble = $('#bubble'), bIn = $('#bIn');
const TIPS = [
  'Type <code>!</code> then <kbd>Tab</kbd> in an .html file for a full page skeleton.',
  'Type <code>li*3</code> then <kbd>Tab</kbd> to make three list items at once.',
  'Type <code>.card</code> then <kbd>Tab</kbd> for a div with that class.',
  'In a .js file, type <code>log</code> then <kbd>Tab</kbd> for console.log().',
  'In CSS, type <code>bg</code> and pick background from the list.',
  '<kbd>Ctrl</kbd> + <kbd>/</kbd> turns the current line into a comment.',
  'Tap <b>+</b> next to your tabs to add another page, or open the folder button to make folders.',
  'Links like <code>&lt;a href="about.html"&gt;</code> work inside the preview.',
  'Phone and tablet buttons above the preview show your page at those widths.'
];
function scheduleCheck() { clearTimeout(checkTimer); checkTimer = setTimeout(runChecks, 650); }
function checkLinks(f, add) {
  const src = eds[f.id].ta.value.replace(/<!--[\s\S]*?(?:-->|$)/g, blank);
  const dir = dirName(f.name);
  const re = /\b(href|src)\s*=\s*(["'])([^"'#?\n]*)/gi; let m;
  while ((m = re.exec(src))) {
    const val = m[3];
    if (!val || /^([a-z][\w+.-]*:|\/\/)/i.test(val)) continue;
    const lang = langOf(val); if (!lang) continue;
    if (fileByName(resolvePath(dir, val))) continue;
    const s = m.index + m[0].length - val.length;
    const cands = files.filter(x => x.lang === lang).map(x => relPath(dir, x.name));
    const fix = suggest(val, cands, Math.max(2, Math.ceil(val.length / 4)));
    add('link', val, fix || null, s, s + val.length);
  }
}
function runChecks() {
  clearTimeout(checkTimer);
  if (!eds[active]) return;
  const groups = new Map();
  const mk = f => (kind, word, fix, s, e, extra = {}) => {
    const key = f.id + '|' + kind + '|' + word + '|' + (fix || '') + (/unclosed|stray|semi|link/.test(kind) ? '|' + s : '');
    let g = groups.get(key);
    if (!g) { g = { key, file: f.id, lang: f.lang, kind, word, fix, edits: [], marks: [], first: s, prop: extra.prop }; groups.set(key, g); }
    if (fix != null) g.edits.push({ s, e, text: extra.text != null ? extra.text : fix });
    g.marks.push(extra.mark || [s, e]);
    g.first = Math.min(g.first, s);
  };
  const ids = [];
  htmlFiles().forEach(f => { for (const m of eds[f.id].ta.value.matchAll(/\bid\s*=\s*["']?([\w-]+)/g)) ids.push(m[1]); });
  files.forEach(f => {
    const add = mk(f), viaLang = (lang, ...rest) => add(...rest), src = eds[f.id].ta.value;
    try {
      if (f.lang === 'html') {
        checkHTML(src, viaLang); checkLinks(f, add);
        embeddedRegions(src).forEach(r => {
          const sub = src.slice(r.start, r.end);
          const offAdd = (lang, kind, word, fix, a, b, extra = {}) => add(kind, word, fix, a + r.start, b + r.start, extra.mark ? { ...extra, mark: [extra.mark[0] + r.start, extra.mark[1] + r.start] } : extra);
          if (r.lang === 'css') checkCSS(sub, offAdd); else checkJS(sub, offAdd, ids);
        });
      }
      else if (f.lang === 'css') checkCSS(src, viaLang);
      else checkJS(src, viaLang, ids);
    } catch (e) {}
  });
  const ed = eds[active], caret = ed.ta.selectionStart, typing = document.activeElement === ed.ta;
  const list = [...groups.values()].filter(g => {
    if (Ignored.has(g.file + '|' + g.word)) return false;
    if (typing && g.file === active && /^(tag|attr|prop|sel|pseudo|ident|case|val|link)$/.test(g.kind) && g.marks.some(m => m[1] === caret)) return false;
    return true;
  });
  list.forEach(g => { g.line = lineOf(eds[g.file].ta.value, g.first); });
  const order = id => files.findIndex(f => f.id === id);
  list.sort((a, b) => order(a.file) - order(b.file) || a.first - b.first);
  files.forEach(f => {
    const ed = eds[f.id], errs = list.filter(g => g.file === f.id).flatMap(g => g.marks);
    const same = errs.length === ed.errs.length && errs.every((m, i) => m[0] === ed.errs[i][0] && m[1] === ed.errs[i][1]);
    ed.errs = errs;
    if (!same) render(ed);
  });
  typoIssues = list;
  refreshPet();
}
function updateCounts() {
  $$('#tabs .file[data-id]').forEach(b => { const n = counts[b.dataset.id] || 0, c = $('.cnt', b); if (c) { c.hidden = !n; c.textContent = n; } });
  $$('#exTree .file-row').forEach(r => { const n = counts[r.dataset.id] || 0, c = $('.cnt', r); if (c) { c.hidden = !n; c.textContent = n; } });
}
function refreshPet() {
  const list = typoIssues.filter(g => fileById(g.file)).concat(runtimeIssues.filter(g => fileById(g.file)));
  counts = {}; list.forEach(g => { counts[g.file] = (counts[g.file] || 0) + 1; });
  updateCounts();
  const st = $('#pipStatus');
  st.textContent = list.length ? `Pip found ${list.length} ${list.length === 1 ? 'issue' : 'issues'}` : 'Pip: all clean';
  st.className = list.length ? 'bad' : 'good';
  const fresh = list.filter(g => !Pet.known.has(g.key) && g.kind !== 'runtime');
  const hadOpenIssue = Pet.open && Pet.mode === 'issue';
  Pet.list = list; Pet.known = new Set(list.map(g => g.key));
  const badge = $('#petBadge'); badge.hidden = !list.length; badge.textContent = list.length;
  if (Pet.mode !== 'msg') setMood(list.length ? 'worried' : 'happy');
  if (!Pet.on) return;
  if (Pet.mode === 'msg' && Pet.open) return;
  if (fresh.length) { Pet.key = fresh[0].key; showIssue(); bump('shake'); }
  else if (hadOpenIssue) {
    if (!list.length) showMsg('<p class="b-msg">All clean now. Nice work.</p>', 2600, 'cheer');
    else showIssue();
  }
}
function setMood(m) { petBtn.dataset.mood = m; }
function bump(cls) {
  petBtn.classList.remove('jump', 'shake'); void petBtn.offsetWidth; petBtn.classList.add(cls);
  setTimeout(() => petBtn.classList.remove(cls), 800);
}
function issueMsg(g) {
  const c = w => `<code>${esc(w)}</code>`, bad = w => `<code class="bad">${esc(w)}</code>`, good = w => `<code class="good">${esc(w)}</code>`;
  switch (g.kind) {
    case 'tag': return `${bad('<' + g.word + '>')} isn't an HTML tag. Did you mean ${good('<' + g.fix + '>')}?`;
    case 'attr': return `There's no ${bad(g.word)} attribute. Did you mean ${good(g.fix)}?`;
    case 'prop': return `CSS has no ${bad(g.word)} property, so this line is ignored. Did you mean ${good(g.fix)}?`;
    case 'val': return `${c(g.prop)} doesn't understand ${bad(g.word)}. Did you mean ${good(g.fix)}?`;
    case 'sel': return `Your selector uses ${bad(g.word)}, which isn't an HTML tag. Did you mean ${good(g.fix)}?`;
    case 'pseudo': return `${bad(':' + g.word)} isn't a real pseudo-class. Did you mean ${good(':' + g.fix)}?`;
    case 'semi': return `A ${good(';')} is missing after ${c(g.word)} on line ${g.line}. Without it, the next line gets swallowed too.`;
    case 'brace': return `This CSS is missing a closing ${good('}')} at the end.`;
    case 'case': return `JavaScript cares about capital letters. It's ${good(g.fix)}, not ${bad(g.word)}.`;
    case 'ident': return `${bad(g.word)} looks misspelled. Did you mean ${good(g.fix)}?`;
    case 'unclosed': return `${c('<' + g.word + '>')} on line ${g.line} is never closed. Add ${good('</' + g.word + '>')} where it should end.`;
    case 'stray': return `${bad('</' + g.word + '>')} on line ${g.line} has no opening tag to close.`;
    case 'link': return g.fix ? `${bad(g.word)} isn't a file in this project. Did you mean ${good(g.fix)}?` : `${bad(g.word)} isn't a file in this project yet. Make it with the ${c('+')} button, or fix the name.`;
    case 'runtime': return `Your script crashed${g.line ? ' on line ' + g.line : ''}: ${c(g.word)}`;
  }
  return '';
}
function fixLabel(g) {
  if (g.kind === 'stray') return 'Remove it';
  if (g.kind === 'semi' || g.kind === 'brace') return 'Add it';
  return g.edits.length > 1 ? `Fix all ${g.edits.length}` : 'Fix it';
}
function showIssue() {
  const list = Pet.list;
  if (!list.length) { closeBubble(); return; }
  let i = list.findIndex(g => g.key === Pet.key); if (i < 0) i = 0;
  const g = list[i]; Pet.key = g.key; Pet.mode = 'issue';
  const canFix = g.edits.length > 0;
  const f = fileById(g.file);
  const intro = !Pet.greeted ? '<p class="b-intro">Hi, I\'m Pip! I read your code as you type and catch typos.</p>' : '';
  bIn.innerHTML = `
    <div class="b-head"><span class="who">Pip</span><span class="file-l">${esc(f ? f.name : '')}${g.line ? ' · line ' + g.line : ''}</span><span class="sp"></span>
      ${list.length > 1 ? `<span class="nav"><button data-b="prev" aria-label="Previous issue">‹</button>${i + 1}/${list.length}<button data-b="next" aria-label="Next issue">›</button></span>` : ''}
      <button data-b="close" aria-label="Close">×</button></div>
    ${intro}<p class="b-msg">${issueMsg(g)}</p>
    <div class="b-acts">${canFix ? `<button class="btn primary" data-b="fix">${fixLabel(g)}</button>` : ''}<button class="btn${canFix ? '' : ' primary'}" data-b="go">Show me</button>${g.kind !== 'runtime' ? '<button class="btn" data-b="ignore">Ignore</button>' : ''}</div>`;
  if (!Pet.greeted) { Pet.greeted = true; store.set('greeted', true); }
  openBubble();
}
function showMsg(html, ms, mood) {
  clearTimeout(Pet.msgTimer);
  Pet.mode = 'msg';
  bIn.innerHTML = `<div class="b-head"><span class="who">Pip</span><span class="sp"></span><button data-b="close" aria-label="Close">×</button></div>${html}`;
  openBubble();
  if (mood) { setMood(mood); bump('jump'); }
  if (ms) Pet.msgTimer = setTimeout(() => {
    Pet.mode = 'issue';
    setMood(Pet.list.length ? 'worried' : 'happy');
    if (Pet.list.length && Pet.on) showIssue(); else closeBubble();
  }, ms);
}
function openBubble() { bubble.hidden = false; Pet.open = true; placePet(); }
function closeBubble() { bubble.hidden = true; Pet.open = false; clearTimeout(Pet.msgTimer); if (Pet.mode === 'msg') { Pet.mode = 'issue'; setMood(Pet.list.length ? 'worried' : 'happy'); } }
function cleanMsg() {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  return `<p class="b-msg">No typos in your ${files.length} ${files.length === 1 ? 'file' : 'files'}.${Pet.fixes ? ` We've fixed ${Pet.fixes} together so far.` : ''}</p><p class="b-tip">Tip: ${tip}</p>`;
}
function reveal(id, s, e) {
  if (!eds[id]) return;
  setActive(id, true);
  if (app.dataset.view === 'preview') setView('split');
  const ed = eds[id], ta = ed.ta, v = ta.value;
  ta.focus({ preventScroll: true });
  ta.setSelectionRange(s, e);
  const line = lineOf(v, s) - 1, top = lineTop(ed, line) - M.padT;
  if (top < ta.scrollTop || top > ta.scrollTop + ta.clientHeight - M.lh * 3) ta.scrollTop = Math.max(0, top - ta.clientHeight / 3);
  const col = s - (v.lastIndexOf('\n', s - 1) + 1), x = col * M.cw;
  if (!Wrap.on) {
    if (x > ta.scrollLeft + ta.clientWidth - 60) ta.scrollLeft = x - ta.clientWidth / 2;
    else if (x < ta.scrollLeft) ta.scrollLeft = Math.max(0, x - 40);
  }
  sync(ed); caretUI(ed);
}
function applyFix(key) {
  runChecks();
  const g = Pet.list.find(x => x.key === key);
  if (!g || !g.edits.length) return;
  setActive(g.file, true);
  const ed = eds[g.file], ta = ed.ta;
  if (app.dataset.view !== 'preview') ta.focus({ preventScroll: true });
  const edits = [...g.edits].sort((a, b) => b.s - a.s);
  ed.suppress = true;
  edits.forEach(x => replaceRange(ta, x.s, x.e, x.text));
  ed.suppress = false;
  const last = edits[edits.length - 1];
  ta.setSelectionRange(last.s + last.text.length, last.s + last.text.length);
  caretUI(ed);
  Pet.fixes++; store.set('fixes', Pet.fixes);
  const lines = ['Fixed!', 'Nice, that one is gone.', 'All better.', 'Done. Good catch.'];
  runChecks();
  const left = Pet.list.length;
  showMsg(`<p class="b-msg">${lines[Pet.fixes % lines.length]} That's <b>${Pet.fixes}</b> ${Pet.fixes === 1 ? 'fix' : 'fixes'} together.${left ? ` ${left} more to look at.` : ''}</p>`, left ? 1600 : 2400, 'cheer');
}
bubble.addEventListener('click', e => {
  const b = e.target.closest('[data-b]'); if (!b) return;
  const act = b.dataset.b, list = Pet.list;
  let i = list.findIndex(g => g.key === Pet.key);
  const g = list[i];
  if (act === 'close') closeBubble();
  else if (act === 'next' || act === 'prev') { i = (i + (act === 'next' ? 1 : -1) + list.length) % list.length; Pet.key = list[i].key; showIssue(); }
  else if (act === 'fix' && g) applyFix(g.key);
  else if (act === 'go' && g) {
    const m = g.marks[0];
    if (m) reveal(g.file, m[0], m[1]);
    else if (g.kind === 'runtime') { const v = eds[g.file].ta.value; const s = g.first || 0; let e2 = v.indexOf('\n', s); if (e2 < 0) e2 = v.length; reveal(g.file, s, g.line ? e2 : s); }
  }
  else if (act === 'ignore' && g) { Ignored.add(g.file + '|' + g.word); runChecks(); if (!Pet.list.length) closeBubble(); else showIssue(); }
});
petBtn.addEventListener('click', () => {
  if (Pet.open) { closeBubble(); return; }
  if (Pet.list.length) showIssue(); else showMsg(cleanMsg(), 7000);
  bump('jump');
});
$('#wrapStatus').addEventListener('click', () => setWrap(!Wrap.on));
$('#pipStatus').addEventListener('click', () => {
  if (!Pet.on) setPetOn(true);
  if (Pet.list.length) showIssue(); else showMsg(cleanMsg(), 7000);
});
function setPetOn(on) {
  Pet.on = on; store.set('pet', on);
  petWrap.hidden = !on;
  $('#petToggle span').textContent = on ? 'Hide Pip' : 'Show Pip';
  if (on) placePet(); else closeBubble();
}
function placePet() {
  if (!Pet.on) return;
  const view = app.dataset.view;
  const pane = view === 'preview' ? $('#pvPane') : $('#edPane');
  const r = pane.getBoundingClientRect();
  const size = petWrap.offsetWidth || 64;
  let below;
  if (view === 'preview') below = $('.chead').offsetHeight + ($('#clog').hidden ? 0 : $('#clog').offsetHeight);
  else below = $('.status').offsetHeight + ($('#keybar').offsetHeight || 0);
  petWrap.style.left = Math.max(8, r.right - size - 18) + 'px';
  const top = Math.max(8, r.bottom - below - size - 12);
  petWrap.style.top = top + 'px';
  const avail = top - work.getBoundingClientRect().top - 14;
  bIn.style.maxHeight = Math.max(110, Math.min(avail, 340)) + 'px';
}

/* ---------------- tabs, pages, files panel ---------------- */
const IC = {
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  folder: '<svg class="fic" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4l2 2.5h7A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  eye: '<svg class="eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><title>In the preview</title><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
};
const LANG_ORDER = { html: 0, css: 1, js: 2 };
const collapsed = new Set(store.get('collapsed', []));
function allFolders() {
  const s = new Set(folders);
  files.forEach(f => { let d = dirName(f.name); while (d) { s.add(d); d = dirName(d); } });
  return [...s];
}
function renderTabs() {
  $('#tabs').innerHTML = files.map(f => {
    const d = dirName(f.name);
    return `<button class="file" role="tab" data-id="${f.id}" aria-selected="${f.id === active}" title="${esc(f.name)}"><i class="dot" data-lang="${f.lang}"></i>${d ? `<span class="dir">${esc(d)}/</span>` : ''}${esc(baseName(f.name))}<span class="cnt" hidden></span></button>`;
  }).join('') + `<button class="file add" id="addTab" type="button" title="New file" aria-label="New file">${IC.plus}</button>`;
  updateCounts();
}
function renderTree() {
  const all = allFolders();
  const rows = (dir, depth) => {
    let h = '';
    all.filter(d => dirName(d) === dir).sort().forEach(d => {
      const open = !collapsed.has(d);
      h += `<div class="ex-row folder" data-folder="${esc(d)}" style="--d:${depth}" role="treeitem" aria-expanded="${open}"><button class="ex-main" data-act="toggle" type="button">${IC.chev}${IC.folder}<span class="nm">${esc(baseName(d))}</span></button><button class="ex-a" data-act="newin" type="button" title="New file in ${esc(d)}" aria-label="New file in ${esc(d)}">${IC.plus}</button><button class="ex-a del" data-act="delfolder" type="button" title="Delete folder" aria-label="Delete folder ${esc(d)}">${IC.trash}</button></div>`;
      if (open) h += rows(d, depth + 1);
    });
    files.filter(f => dirName(f.name) === dir).sort((a, b) => LANG_ORDER[a.lang] - LANG_ORDER[b.lang] || a.name.localeCompare(b.name)).forEach(f => {
      h += `<div class="ex-row file-row${f.id === active ? ' on' : ''}" data-id="${f.id}" style="--d:${depth}" role="treeitem" aria-selected="${f.id === active}"><button class="ex-main" data-act="open" type="button"><span class="chev-sp"></span><i class="dot" data-lang="${f.lang}"></i><span class="nm">${esc(baseName(f.name))}</span>${f.id === page ? IC.eye : ''}<span class="cnt" hidden></span></button><button class="ex-a" data-act="rename" type="button" title="Rename" aria-label="Rename ${esc(f.name)}">${IC.pen}</button><button class="ex-a del" data-act="del" type="button" title="Delete" aria-label="Delete ${esc(f.name)}">${IC.trash}</button></div>`;
    });
    return h;
  };
  $('#exTree').innerHTML = rows('', 0);
  updateCounts();
}
function renderPageSel() {
  const s = $('#pageSel');
  s.innerHTML = htmlFiles().map(f => `<option value="${f.id}">${esc(f.name)}</option>`).join('');
  s.value = page;
}
function setPage(id) {
  const f = fileById(id); if (!f || f.lang !== 'html') return;
  page = id; renderPageSel();
  $$('#exTree .eye').forEach(x => x.remove());
  const row = $(`#exTree .file-row[data-id="${id}"] .nm`); if (row) row.insertAdjacentHTML('afterend', IC.eye);
  saveSoon(); run();
}
function setActive(id, skipPage) {
  const f = fileById(id) || files[0]; if (!f) return;
  active = f.id;
  files.forEach(x => { eds[x.id].host.hidden = x.id !== active; });
  $$('#tabs .file[data-id]').forEach(b => b.setAttribute('aria-selected', b.dataset.id === active));
  const tab = $(`#tabs .file[data-id="${active}"]`);
  if (tab) { const nav = $('#tabs'); const l = tab.offsetLeft, r = l + tab.offsetWidth; if (l < nav.scrollLeft) nav.scrollLeft = l - 8; else if (r > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = r - nav.clientWidth + 8; }
  $$('#exTree .file-row').forEach(r => { const on = r.dataset.id === active; r.classList.toggle('on', on); r.setAttribute('aria-selected', on); });
  $('#langLbl').textContent = KIND[f.lang];
  hideAC();
  layoutEd(eds[active]);
  saveSoon();
  if (f.lang === 'html' && f.id !== page && !skipPage) setPage(f.id);
}
function afterProjectChange() {
  renderTabs(); renderTree(); renderPageSel();
  setActive(active, true);
  saveNow(); runChecks(); run();
}
function addFile(name, content, id) {
  const f = { id: id || newId(), name, lang: langOf(name) };
  files.push(f);
  const ed = eds[f.id] = createEditor(f);
  ed.host.hidden = true;
  ed.ta.value = content || '';
  ed.host.classList.toggle('wrap', Wrap.on);
  ed.ta.setAttribute('wrap', Wrap.on ? 'soft' : 'off');
  render(ed);
  return f;
}
function cleanPath(p) { return p.trim().replace(/\\/g, '/').replace(/^\.?\/+/, '').replace(/\/+/g, '/').replace(/\/$/, ''); }
function checkPath(p, opts = {}) {
  if (!p) return 'Give it a name.';
  if (p.split('/').some(seg => !seg || seg === '.' || seg === '..' || !/^[\w.\- ]+$/.test(seg))) return 'Use letters, numbers, dashes, dots or underscores.';
  const l = langOf(p);
  if (!l) return 'End the name with .html, .css or .js.';
  if (opts.lang && l !== opts.lang) return `A ${KIND_WORD[opts.lang]} file has to end with ${EXT[opts.lang]}.`;
  const other = fileByName(p);
  if (other && other.id !== opts.exceptId) return `${p} already exists.`;
  if (allFolders().includes(p)) return 'A folder already has that name.';
  return null;
}
function renameFile(id, raw) {
  const f = fileById(id); if (!f) return null;
  const name = cleanPath(raw);
  const err = checkPath(name, { exceptId: id }); if (err) return err;
  const nl = langOf(name);
  if (f.lang === 'html' && nl !== 'html' && htmlFiles().length === 1) return 'Keep at least one HTML page.';
  f.name = name;
  if (nl !== f.lang) { f.lang = nl; eds[id].lang = nl; if (page === id) page = htmlFiles()[0].id; }
  eds[id].ta.setAttribute('aria-label', name);
  afterProjectChange();
  toast('Renamed to ' + name);
  return null;
}
function deleteFile(id) {
  const f = fileById(id); if (!f) return;
  if (f.lang === 'html' && htmlFiles().length === 1) { toast('Keep at least one HTML page.'); renderTree(); return; }
  eds[id].host.remove(); delete eds[id];
  files = files.filter(x => x.id !== id);
  const dir = dirName(f.name);
  if (dir && !folders.includes(dir)) folders.push(dir);
  if (page === id) page = (fileByName('index.html') || htmlFiles()[0]).id;
  if (active === id) active = page;
  afterProjectChange();
  toast('Deleted ' + f.name);
}
function deleteFolder(d) {
  const inside = files.filter(f => f.name.startsWith(d + '/'));
  if (htmlFiles().every(f => inside.includes(f))) { toast('That folder has all your pages. Keep at least one.'); renderTree(); return; }
  inside.forEach(f => { eds[f.id].host.remove(); delete eds[f.id]; });
  files = files.filter(f => !inside.includes(f));
  folders = folders.filter(x => x !== d && !x.startsWith(d + '/'));
  if (!fileById(page)) page = (fileByName('index.html') || htmlFiles()[0]).id;
  if (!fileById(active)) active = page;
  afterProjectChange();
  toast(`Deleted ${d}` + (inside.length ? ` and ${inside.length} ${inside.length === 1 ? 'file' : 'files'}` : ''));
}
function pageLinks(f) {
  const v = eds[f.id].ta.value.replace(/<!--[\s\S]*?-->/g, ''), dir = dirName(f.name), css = new Set(), js = new Set();
  for (const m of v.matchAll(/<link\b[^>]*>/gi)) {
    const hm = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(m[0]);
    if (hm && /stylesheet/i.test(m[0])) { const t = fileByName(resolvePath(dir, hm[1] ?? hm[2] ?? hm[3])); if (t && t.lang === 'css') css.add(t.id); }
  }
  for (const m of v.matchAll(/<script\b([^>]*)>/gi)) {
    const sm = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(m[1]);
    if (sm) { const t = fileByName(resolvePath(dir, sm[1] ?? sm[2] ?? sm[3])); if (t && t.lang === 'js') js.add(t.id); }
  }
  return { css, js };
}
const linkTag = (page, f) => f.lang === 'css' ? `<link rel="stylesheet" href="${relPath(dirName(page.name), f.name)}">` : `<script src="${relPath(dirName(page.name), f.name)}"><\/script>`;
function insertTags(page, list) {
  if (!list.length) return false;
  let v = eds[page.id].ta.value;
  const css = list.filter(f => f.lang === 'css').map(f => linkTag(page, f));
  const js = list.filter(f => f.lang === 'js').map(f => linkTag(page, f));
  if (css.length) {
    const hi = v.search(/<\/head>/i);
    v = hi >= 0 ? v.slice(0, hi) + css.map(t => '  ' + t + '\n').join('') + v.slice(hi) : css.join('\n') + '\n' + v;
  }
  if (js.length) {
    const bi = v.toLowerCase().lastIndexOf('</body>');
    v = bi >= 0 ? v.slice(0, bi) + js.map(t => '  ' + t + '\n').join('') + v.slice(bi) : v.replace(/\s*$/, '') + '\n' + js.join('\n') + '\n';
  }
  const ed = eds[page.id];
  ed.ta.value = v; ed.errs = []; render(ed);
  return true;
}
function linkIntoPages(list, pages) {
  let n = 0;
  (pages || htmlFiles()).forEach(pg => {
    const have = pageLinks(pg);
    if (insertTags(pg, list.filter(f => !(f.lang === 'css' ? have.css : have.js).has(f.id)))) n++;
  });
  return n;
}
function renderLinkMode() {
  $$('#linkSeg button').forEach(b => b.setAttribute('aria-checked', b.dataset.mode === linkMode));
  $('#linkNote').innerHTML = linkMode === 'auto'
    ? 'Every page gets all your CSS and JS. A page that links its own files with <code>&lt;link&gt;</code> or <code>&lt;script src&gt;</code> gets only those.'
    : 'Like real VS Code: a page only gets the files it links, with <code>&lt;link rel="stylesheet" href="style.css"&gt;</code> and <code>&lt;script src="script.js"&gt;</code>.';
  $('#linkMenu span').textContent = 'CSS & JS: ' + (linkMode === 'auto' ? 'all pages' : 'linked only');
}
function setLinkMode(mode) {
  if (mode === linkMode) return;
  linkMode = mode;
  renderLinkMode();
  if (mode === 'manual') {
    // pages that relied on the automatic files would lose their styles, so link those files in for them
    const css = files.filter(f => f.lang === 'css'), js = files.filter(f => f.lang === 'js');
    let n = 0;
    htmlFiles().forEach(pg => {
      const have = pageLinks(pg);
      const add = [...(have.css.size ? [] : css), ...(have.js.size ? [] : js)];
      if (insertTags(pg, add)) n++;
    });
    toast(n ? `Linked only: added <link> and <script> tags to ${n} ${n === 1 ? 'page' : 'pages'} so they keep working` : 'Linked only: pages get just the files they link');
  } else toast('All pages: every page gets your CSS and JS');
  saveNow(); runChecks(); run();
}
function templateFor(name, kind) {
  if (kind === 'html') {
    const pg = { name };
    const t = baseName(name).replace(/\.\w+$/, '').replace(/[-_]+/g, ' ');
    const title = t.charAt(0).toUpperCase() + t.slice(1);
    const css = files.filter(f => f.lang === 'css'), js = files.filter(f => f.lang === 'js');
    const cssTags = (css.length ? css : [{ name: 'style.css', lang: 'css' }]).map(f => linkTag(pg, f));
    const jsTags = (js.length ? js : [{ name: 'script.js', lang: 'js' }]).map(f => linkTag(pg, f));
    const real = linkMode === 'manual' && $('#nfLinkPage').checked;
    const head = real ? cssTags.map(x => '  ' + x + '\n').join('')
      : '  <!-- Connect your CSS: uncomment the line below (Ctrl+/ or the // key) -->\n' + cssTags.map(x => '  <!-- ' + x + ' -->\n').join('');
    const tail = real ? jsTags.map(x => '  ' + x + '\n').join('')
      : '  <!-- Connect your JavaScript: uncomment the line below -->\n' + jsTags.map(x => '  <!-- ' + x + ' -->\n').join('');
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${esc(title)}</title>\n${head}</head>\n<body>\n  \n\n${tail}</body>\n</html>`;
  }
  if (kind === 'css') return `/* ${baseName(name)} */\n`;
  return `// ${baseName(name)}\n`;
}
function startRename(row) {
  const f = fileById(row.dataset.id); if (!f) return;
  const main = $('.ex-main', row);
  const inp = document.createElement('input');
  inp.value = f.name; inp.spellcheck = false;
  inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocomplete', 'off');
  inp.setAttribute('aria-label', 'New name for ' + f.name);
  main.replaceWith(inp);
  $$('.ex-a', row).forEach(b => { b.hidden = true; });
  inp.focus();
  const sl = f.name.lastIndexOf('/') + 1, dot = f.name.lastIndexOf('.');
  inp.setSelectionRange(sl, dot > sl ? dot : f.name.length);
  let done = false;
  const finish = ok => {
    if (done) return; done = true;
    if (ok && cleanPath(inp.value) !== f.name) { const err = renameFile(f.id, inp.value); if (err) { toast(err); renderTree(); } }
    else renderTree();
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); finish(true); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); } });
  inp.addEventListener('blur', () => finish(true));
}
let pendingDel = null, pendingTimer = 0;
$('#exTree').addEventListener('click', e => {
  const btn = e.target.closest('[data-act]'); if (!btn) return;
  const row = btn.closest('.ex-row'), act = btn.dataset.act;
  if (act === 'toggle') {
    const d = row.dataset.folder;
    if (collapsed.has(d)) collapsed.delete(d); else collapsed.add(d);
    store.set('collapsed', [...collapsed]); renderTree(); return;
  }
  if (act === 'newin') { openNew('html', row.dataset.folder); return; }
  if (act === 'open') {
    setActive(row.dataset.id);
    if (app.dataset.view === 'preview') setView('split');
    if (narrow.matches) setExplorer(false);
    return;
  }
  if (act === 'rename') { startRename(row); return; }
  if (act === 'del' || act === 'delfolder') {
    const key = act + ':' + (row.dataset.id || row.dataset.folder);
    if (pendingDel !== key) {
      pendingDel = key;
      $$('#exTree .confirm').forEach(r => r.classList.remove('confirm'));
      row.classList.add('confirm');
      toast('Tap the red trash again to delete');
      clearTimeout(pendingTimer);
      pendingTimer = setTimeout(() => { pendingDel = null; row.classList.remove('confirm'); }, 3000);
      return;
    }
    pendingDel = null;
    if (act === 'del') deleteFile(row.dataset.id); else deleteFolder(row.dataset.folder);
  }
});
function setExplorer(on) {
  app.classList.toggle('ex-open', on);
  if (on && narrow.matches) closeBubble();
  $('#exBtn').setAttribute('aria-pressed', on);
  if (!narrow.matches) store.set('explorer', on);
  requestAnimationFrame(() => { if (eds[active]) layoutEd(eds[active]); placePet(); });
}
$('#exBtn').addEventListener('click', () => {
  const on = !app.classList.contains('ex-open');
  if (on && app.dataset.view === 'preview') setView('split');
  setExplorer(on);
});
$('#exClose').addEventListener('click', () => setExplorer(false));
$('#linkSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setLinkMode(b.dataset.mode); });
$('#exNewFile').addEventListener('click', () => openNew('html'));
$('#exNewFolder').addEventListener('click', () => openNew('folder'));
$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('.file'); if (!b) return;
  if (b.id === 'addTab') { openNew('html'); return; }
  setActive(b.dataset.id);
  if (app.dataset.view === 'preview') setView('split');
  if (!narrow.matches) eds[active].ta.focus({ preventScroll: true });
});
$('#tabs').addEventListener('keydown', e => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const i = files.findIndex(f => f.id === active);
  const n = files[(i + (e.key === 'ArrowRight' ? 1 : files.length - 1)) % files.length];
  setActive(n.id); const t = $(`#tabs .file[data-id="${n.id}"]`); if (t) t.focus();
});
$('#pageSel').addEventListener('change', e => setPage(e.target.value));

/* new file / folder sheet */
let nfKind = 'html';
function suggestName(kind, folder) {
  const base = { html: 'page', css: 'styles', js: 'app', folder: 'pages' }[kind];
  const full = n => (folder ? folder + '/' : '') + n;
  const taken = n => fileByName(full(n)) || allFolders().includes(full(n));
  for (let i = kind === 'folder' ? 1 : 2; i < 200; i++) {
    const n = kind === 'folder' ? (i === 1 ? base : base + i) : base + i + EXT[kind];
    if (!taken(n)) return n;
  }
  return base;
}
function setKind(k, resetName) {
  nfKind = k;
  $$('#nfKinds button').forEach(b => b.setAttribute('aria-checked', b.dataset.kind === k));
  $('#nfTitle').textContent = k === 'folder' ? 'New folder' : 'New file';
  $('#nfCreate').textContent = k === 'folder' ? 'Create folder' : 'Create file';
  $('#nfNote').innerHTML = {
    html: 'Starts with the full page structure, plus your CSS and JS links written as notes. Uncomment a note line to connect that file. Link to the page with <code>&lt;a href&gt;</code>.',
    css: linkMode === 'auto' ? 'Every page picks this up automatically, unless the page links its own CSS.' : 'Pages only use it if they link it with <code>&lt;link rel="stylesheet"&gt;</code>.',
    js: linkMode === 'auto' ? 'Every page runs this automatically, unless the page links its own JS.' : 'Pages only run it if they link it with <code>&lt;script src&gt;</code>.',
    folder: 'Folders keep pages tidy, like <code>pages/about.html</code>.'
  }[k];
  const inp = $('#nfName');
  if (resetName || inp.dataset.auto === '1' || !inp.value.trim()) { inp.value = suggestName(k, $('#nfFolder').value); inp.dataset.auto = '1'; }
  else if (k !== 'folder') inp.value = inp.value.trim().replace(/\.(html?|css|m?js)$/i, '') + EXT[k];
  else inp.value = inp.value.trim().replace(/\.(html?|css|m?js)$/i, '');
  $('#nfErr').textContent = '';
  $('#nfLinkWrap').hidden = !(linkMode === 'manual' && (k === 'css' || k === 'js'));
  $('#nfLinkPageWrap').hidden = !(linkMode === 'manual' && k === 'html');
  $('#nfLinkAllTxt').textContent = k === 'css' ? 'Add a <link> to it in every page' : 'Add a <script src> for it in every page';
}
function openNew(kind, folder) {
  if (folder == null) { const af = fileById(active); folder = af ? dirName(af.name) : ''; }
  const sel = $('#nfFolder');
  sel.innerHTML = ['', ...allFolders().sort()].map(d => `<option value="${esc(d)}">${d ? esc(d) + '/' : 'Top level'}</option>`).join('');
  sel.value = folder;
  setKind(kind, true);
  $('#newSheet').hidden = false;
  closeMenu();
  setTimeout(() => { const i = $('#nfName'); i.focus(); const dot = i.value.lastIndexOf('.'); i.setSelectionRange(0, dot > 0 ? dot : i.value.length); }, 30);
}
function closeNew() { $('#newSheet').hidden = true; }
$('#nfName').addEventListener('input', e => { e.target.dataset.auto = '0'; $('#nfErr').textContent = ''; });
$('#nfKinds').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setKind(b.dataset.kind); });
$('#nfFolder').addEventListener('change', () => { if ($('#nfName').dataset.auto === '1') $('#nfName').value = suggestName(nfKind, $('#nfFolder').value); });
$('#nfCancel').addEventListener('click', closeNew);
$('#newSheet').addEventListener('click', e => { if (e.target.id === 'newSheet') closeNew(); });
$('#newForm').addEventListener('submit', e => {
  e.preventDefault();
  const folder = $('#nfFolder').value;
  let n = $('#nfName').value.trim();
  if (nfKind !== 'folder' && n && !langOf(n) && !/\.\w+$/.test(n)) n += EXT[nfKind];
  const full = cleanPath((folder ? folder + '/' : '') + n);
  if (nfKind === 'folder') {
    if (!n || full.split('/').some(seg => !seg || !/^[\w.\- ]+$/.test(seg))) { $('#nfErr').textContent = 'Use letters, numbers, dashes or underscores.'; return; }
    if (allFolders().includes(full) || fileByName(full)) { $('#nfErr').textContent = full + ' already exists.'; return; }
    folders.push(full); collapsed.delete(full);
    closeNew(); setExplorer(true); afterProjectChange();
    toast('Folder ' + full + ' is ready. Add files with its + button.');
    return;
  }
  const err = checkPath(full, { lang: nfKind });
  if (err) { $('#nfErr').textContent = err; return; }
  const f = addFile(full, templateFor(full, nfKind));
  let linked = 0;
  if (nfKind !== 'html' && linkMode === 'manual' && $('#nfLinkAll').checked) linked = linkIntoPages([f]);
  closeNew();
  active = f.id;
  if (nfKind === 'html') page = f.id;
  afterProjectChange();
  if (nfKind === 'html') {
    const ta = eds[f.id].ta, i = ta.value.indexOf('<body>\n  ');
    if (i >= 0) { const c = i + 9; ta.setSelectionRange(c, c); if (!narrow.matches && app.dataset.view !== 'preview') ta.focus({ preventScroll: true }); caretUI(eds[f.id]); }
  }
  if (linked) { toast(`Created ${full} and linked it in ${linked} ${linked === 1 ? 'page' : 'pages'}`); return; }
  if (app.dataset.view === 'preview') setView('split');
  toast('Created ' + full);
});

/* ---------------- views, preview controls ---------------- */
function setView(v) {
  if (!['code', 'split', 'preview'].includes(v)) v = 'split';
  app.dataset.view = v;
  $$('.views button').forEach(b => b.setAttribute('aria-checked', b.dataset.view === v));
  store.set('view', v);
  hideAC();
  if (v !== 'code' && stale && ($('#autorun').checked || !frame.srcdoc)) run();
  requestAnimationFrame(() => { placePet(); if (eds[active]) layoutEd(eds[active]); });
}
let split = 50;
function setSplit(p) { split = Math.min(85, Math.max(15, p)); work.style.setProperty('--split', split + '%'); placePet(); }
$$('.views button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
$('#runBtn').addEventListener('click', () => { if (app.dataset.view === 'code') setView('split'); run(); });
$('#reload').addEventListener('click', run);
$('#autorun').addEventListener('change', e => { store.set('autorun', e.target.checked); if (e.target.checked) run(); else $('#urlTxt').textContent = 'press Run'; });
$$('#sizes button').forEach(b => b.addEventListener('click', () => {
  $('#stage').dataset.size = b.dataset.size;
  $$('#sizes button').forEach(x => x.setAttribute('aria-pressed', x === b));
  store.set('size', b.dataset.size);
}));
$('#cToggle').addEventListener('click', () => {
  const log = $('#clog'); log.hidden = !log.hidden;
  $('#console').classList.toggle('open', !log.hidden);
  $('#cToggle').setAttribute('aria-expanded', !log.hidden);
  placePet();
});
$('#cClear').addEventListener('click', clearConsole);

// divider
const divider = $('#divider');
const narrow = matchMedia('(max-width:760px)');
function syncDividerOrientation() { divider.setAttribute('aria-orientation', narrow.matches ? 'horizontal' : 'vertical'); }
if (narrow.addEventListener) narrow.addEventListener('change', () => { syncDividerOrientation(); placePet(); });
syncDividerOrientation();
divider.addEventListener('pointerdown', e => {
  e.preventDefault();
  divider.setPointerCapture(e.pointerId);
  app.classList.add('dragging');
  const r = work.getBoundingClientRect();
  const move = ev => setSplit(narrow.matches ? (ev.clientY - r.top) / r.height * 100 : (ev.clientX - r.left) / r.width * 100);
  const up = () => {
    divider.removeEventListener('pointermove', move); divider.removeEventListener('pointerup', up); divider.removeEventListener('pointercancel', up);
    app.classList.remove('dragging'); store.set('split', split);
    if (eds[active]) layoutEd(eds[active]);
  };
  divider.addEventListener('pointermove', move); divider.addEventListener('pointerup', up); divider.addEventListener('pointercancel', up);
});
divider.addEventListener('keydown', e => {
  const d = { ArrowLeft: -5, ArrowUp: -5, ArrowRight: 5, ArrowDown: 5 }[e.key];
  if (d) { e.preventDefault(); setSplit(split + d); store.set('split', split); }
});
divider.addEventListener('dblclick', () => { setSplit(50); store.set('split', 50); });

// mobile key bar
const KEYS = ['Tab', '<', '>', '/', '=', '"', "'", '{', '}', '(', ')', ';', ':', '.', '#', '!', '//', '←', '→'];
$('#keybar').innerHTML = KEYS.map(k => `<button type="button" data-k="${esc(k)}" aria-label="${k === '←' ? 'Move left' : k === '→' ? 'Move right' : k === 'Tab' ? 'Tab, expand' : k === '//' ? 'Comment or uncomment line' : 'Type ' + esc(k)}">${esc(k)}</button>`).join('');
$('#keybar').addEventListener('pointerdown', e => { if (e.target.closest('button')) e.preventDefault(); });
$('#keybar').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const ed = eds[active], ta = ed.ta, k = b.dataset.k;
  if (document.activeElement !== ta) ta.focus({ preventScroll: true });
  if (k === 'Tab') { if (AC.open && AC.ed === ed) acceptAC(AC.i); else doTab(ed, false); return; }
  if (k === '//') { toggleComment(ed); hideAC(); return; }
  if (k === '←' || k === '→') { const p = Math.max(0, Math.min(ta.value.length, ta.selectionStart + (k === '→' ? 1 : -1))); ta.setSelectionRange(p, p); caretUI(ed); hideAC(); return; }
  ed.selB = ta.selectionStart; ed.selE = ta.selectionEnd;
  const act = planChar(ed, k);
  if (act) act(); else { ed.suppress = true; replaceRange(ta, ta.selectionStart, ta.selectionEnd, k); ed.suppress = false; }
  updateAC(ed);
});

// menu
const menu = $('#menu'), menuBtn = $('#menuBtn');
const confirmState = {};
function openMenu() {
  const r = menuBtn.getBoundingClientRect();
  menu.hidden = false;
  menu.style.top = (r.bottom + 6) + 'px';
  menu.style.left = Math.max(16, Math.min(r.right - menu.offsetWidth, innerWidth - menu.offsetWidth - 16)) + 'px';
  menuBtn.setAttribute('aria-expanded', 'true');
  resetConfirms();
}
function closeMenu() { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); resetConfirms(); }
function resetConfirms() { confirmState.sample = confirmState.clear = false; }
menuBtn.addEventListener('click', e => { e.stopPropagation(); if (menu.hidden) openMenu(); else closeMenu(); });
document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) closeMenu(); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!menu.hidden) closeMenu();
  if (!$('#sheet').hidden) closeSheet();
  if (!$('#newSheet').hidden) closeNew();
  if (!$('#projSheet').hidden && !e.target.closest('.pj-rename')) closeProjects();
  if (!$('#ghSheet').hidden) closeGh();
  if (narrow.matches && app.classList.contains('ex-open') && !e.target.closest('.ta')) setExplorer(false);
});
menu.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act;
  if (act === 'run') { run(); closeMenu(); if (app.dataset.view === 'code') setView('split'); }
  else if (act === 'newfile') openNew('html');
  else if (act === 'projects') openProjects();
  else if (act === 'publish') openGh();
  else if (act === 'zip') { closeMenu(); downloadProjectZip(curProject.id); }
  else if (act === 'newfolder') openNew('folder');
  else if (act === 'export') { closeMenu(); openSheet(); }
  else if (act === 'wrap') { setWrap(!Wrap.on); closeMenu(); }
  else if (act === 'linkmode') { setLinkMode(linkMode === 'auto' ? 'manual' : 'auto'); closeMenu(); }
  else if (act === 'pet') { setPetOn(!Pet.on); closeMenu(); toast(Pet.on ? 'Pip is back' : 'Pip is taking a nap. Squiggles stay on.'); }
  else if (act === 'sample' || act === 'clear') {
    if (!confirmState[act]) { confirmState[act] = true; $('span', b).textContent = 'Tap again to replace all files'; return; }
    openProject(act === 'sample' ? SAMPLE : BLANK);
    saveNow(); run(); runChecks();
    closeMenu(); toast(act === 'sample' ? 'Example project loaded' : 'Blank project ready');
  }
});

// export sheet
function fillExport() {
  const f = fileById($('#exportPage').value) || fileById(page);
  $('#exportTxt').value = buildPage(f.id, true);
  $('#sheetTitle').textContent = baseName(f.name) + ' as one file';
}
function openSheet() {
  const s = $('#exportPage');
  s.innerHTML = htmlFiles().map(f => `<option value="${f.id}">${esc(f.name)}</option>`).join('');
  s.value = page;
  fillExport();
  $('#sheet').hidden = false; $('#sheetCopy').focus();
}
function closeSheet() { $('#sheet').hidden = true; }
$('#exportPage').addEventListener('change', fillExport);
$('#sheetClose').addEventListener('click', closeSheet);
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
$('#sheetCopy').addEventListener('click', () => {
  const t = $('#exportTxt'), f = fileById($('#exportPage').value);
  const done = () => toast('Copied. Save it as ' + (f ? baseName(f.name) : 'index.html'));
  const fallback = () => { t.focus(); t.select(); toast('Selected. Press Ctrl+C (or long-press and Copy).'); };
  try { navigator.clipboard.writeText(t.value).then(done, fallback); } catch (e) { fallback(); }
});

let toastTimer = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2400); }

// saving
let saveTimer = 0;
function saveNow(skipCommit) {
  clearTimeout(saveTimer);
  if (!curProject.id) return;
  PJ.put(curProject.id, snapshot());
  const list = PJ.index(), it = list.find(x => x.id === curProject.id);
  if (it) { it.updated = Date.now(); PJ.saveIndex(list); }
  if (!skipCommit) ghScheduleCommit();
}
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 500); }

document.addEventListener('selectionchange', () => {
  const ed = eds[active]; if (!ed) return;
  if (document.activeElement === ed.ta) { caretUI(ed); if (!ed.suppress) { ed.selB = ed.ta.selectionStart; ed.selE = ed.ta.selectionEnd; } scheduleCheck(); }
});
addEventListener('resize', () => { hideAC(); placePet(); });
// save right away when the app or tab goes to the background, so nothing typed is lost
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveNow(true); });
addEventListener('pagehide', () => saveNow(true));
if (window.ResizeObserver) {
  let lastW = 0;
  const ro = new ResizeObserver(() => {
    placePet();
    const ed = eds[active]; if (!ed) return;
    const w = ed.ta.clientWidth;
    if (Wrap.on && w && w !== lastW) { lastW = w; layoutEd(ed); }
  });
  ro.observe(work); ro.observe($('#eds'));
}

/* ---------------- helpers: time, slug, hash, zip ---------------- */
function ago(t) {
  if (!t) return 'never';
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return Math.round(s / 60) + ' min ago';
  if (s < 86400) return Math.round(s / 3600) + ' h ago';
  return new Date(t).toLocaleDateString();
}
const slug = n => (n || '').toLowerCase().trim().replace(/[^a-z0-9._-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '').slice(0, 90) || 'my-site';
function hashStr(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(36) + (h1 >>> 0).toString(36);
}
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function makeZip(entries) {
  const enc = new TextEncoder(), parts = [], central = [];
  const d = new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  let offset = 0;
  for (const e of entries) {
    const name = enc.encode(e.name), data = typeof e.data === 'string' ? enc.encode(e.data) : e.data, crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
    c.setUint16(12, time, true); c.setUint16(14, date, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
    central.push(new Uint8Array(c.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const size = central.reduce((n, p) => n + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
  end.setUint32(12, size, true); end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}
function saveBlob(blob, filename) {
  // inside the iPhone app: hand the file to the share sheet (Save to Files, AirDrop, …)
  const share = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.pipShare;
  if (share) {
    const r = new FileReader();
    r.onload = () => share.postMessage({ name: filename, data: String(r.result).split(',')[1] || '' });
    r.readAsDataURL(blob);
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function downloadProjectZip(id) {
  if (id === curProject.id) saveNow();
  const d = PJ.get(id); const meta = PJ.index().find(x => x.id === id);
  if (!d) return;
  const entries = (d.files || []).map(f => ({ name: f.name, data: f.content || '' }));
  saveBlob(makeZip(entries), slug(meta ? meta.name : 'site') + '.zip');
  toast('Downloading ' + slug(meta ? meta.name : 'site') + '.zip');
}

/* ---------------- projects ---------------- */
const PJ = {
  index() { return store.get('projects', []); },
  saveIndex(list) { store.set('projects', list); },
  get(id) { return store.get('proj:' + id, null); },
  put(id, data) { store.set('proj:' + id, data); },
  del(id) { try { localStorage.removeItem('pip:proj:' + id); } catch (e) {} }
};
let curProject = { id: null, name: '' };
let ghCfg = {};
function snapshot() {
  return { files: files.map(f => ({ id: f.id, name: f.name, content: eds[f.id].ta.value })), folders, active, page, linkMode, gh: ghCfg };
}
function initProjects() {
  let list = PJ.index();
  if (!list.length) {
    const old = store.get('project', null);
    const id = newId();
    PJ.put(id, old && Array.isArray(old.files) ? old : JSON.parse(JSON.stringify(SAMPLE)));
    list = [{ id, name: 'My website', updated: Date.now() }];
    PJ.saveIndex(list);
    store.set('current', id);
  }
  const cur = list.find(x => x.id === store.get('current', null)) || list[0];
  curProject = { id: cur.id, name: cur.name };
  store.set('current', cur.id);
  return PJ.get(cur.id) || JSON.parse(JSON.stringify(SAMPLE));
}
function loadIntoEditor(data) {
  ghCfg = data.gh && typeof data.gh === 'object' ? data.gh : {};
  openProject(data);
  renderProjectName();
  ghRenderChip();
}
function renderProjectName() { $('#projName').textContent = curProject.name; document.title = curProject.name + ' · Pip Playground'; }
function switchProject(id) {
  if (id === curProject.id) { closeProjects(); return; }
  saveNow();
  const meta = PJ.index().find(x => x.id === id); if (!meta) return;
  curProject = { id, name: meta.name };
  store.set('current', id);
  loadIntoEditor(PJ.get(id) || JSON.parse(JSON.stringify(BLANK)));
  saveNow(); run(); runChecks();
  closeProjects();
  toast('Opened ' + meta.name);
}
function createProject(name, start) {
  saveNow();
  const id = newId();
  const base = JSON.parse(JSON.stringify(start === 'sample' ? SAMPLE : BLANK));
  if (start !== 'sample') {
    base.files[0].content = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>' + esc(name) + '</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>' + esc(name) + '</h1>\n\n  <script src="script.js"><\/script>\n</body>\n</html>';
  }
  PJ.put(id, base);
  const list = PJ.index(); list.push({ id, name, updated: Date.now() }); PJ.saveIndex(list);
  switchProject(id);
}
function renderProjects() {
  const list = PJ.index().slice().sort((a, b) => (b.updated || 0) - (a.updated || 0));
  $('#pjList').innerHTML = list.map(it => {
    const d = PJ.get(it.id) || {};
    const n = (d.files || []).length, g = d.gh || {};
    const meta = [`${n} ${n === 1 ? 'file' : 'files'}`, 'edited ' + ago(it.updated), g.repo ? 'GitHub: ' + g.repo : '', g.pagesUrl ? 'online' : ''].filter(Boolean).join(' · ');
    return `<li class="pj-item${it.id === curProject.id ? ' cur' : ''}" data-id="${it.id}">
      <button class="pj-main" type="button" data-pj="open"><span class="pj-name">${esc(it.name)}${it.id === curProject.id ? ' <small>open now</small>' : ''}</span><span class="pj-meta">${esc(meta)}</span></button>
      <div class="pj-acts">
        <button type="button" data-pj="rename" title="Rename" aria-label="Rename ${esc(it.name)}">${IC.pen}</button>
        <button type="button" data-pj="dup" title="Duplicate" aria-label="Duplicate ${esc(it.name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></button>
        <button type="button" data-pj="zip" title="Download .zip" aria-label="Download ${esc(it.name)} as zip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button>
        <button type="button" data-pj="del" class="del" title="Delete" aria-label="Delete ${esc(it.name)}">${IC.trash}</button>
      </div></li>`;
  }).join('');
}
function openProjects() { saveNow(); renderProjects(); $('#pjName').value = ''; $('#projSheet').hidden = false; closeMenu(); }
function closeProjects() { $('#projSheet').hidden = true; }
let pjPending = null, pjTimer = 0;
$('#pjList').addEventListener('click', e => {
  const b = e.target.closest('[data-pj]'); if (!b) return;
  const li = b.closest('.pj-item'), id = li.dataset.id, act = b.dataset.pj;
  const list = PJ.index(), meta = list.find(x => x.id === id);
  if (act === 'open') switchProject(id);
  else if (act === 'zip') downloadProjectZip(id);
  else if (act === 'dup') {
    if (id === curProject.id) saveNow();
    const nid = newId(), d = JSON.parse(JSON.stringify(PJ.get(id) || BLANK));
    d.gh = {}; (d.files || []).forEach(f => { f.id = newId(); });
    d.active = null; d.page = null;
    PJ.put(nid, d); list.push({ id: nid, name: meta.name + ' copy', updated: Date.now() }); PJ.saveIndex(list);
    renderProjects(); toast('Made a copy of ' + meta.name);
  } else if (act === 'rename') {
    const main = $('.pj-main', li);
    const inp = document.createElement('input');
    inp.value = meta.name; inp.setAttribute('aria-label', 'Project name'); inp.className = 'pj-rename';
    main.replaceWith(inp); inp.focus(); inp.select();
    let done = false;
    const finish = ok => {
      if (done) return; done = true;
      const v = inp.value.trim();
      if (ok && v && v !== meta.name) {
        meta.name = v.slice(0, 80); PJ.saveIndex(list);
        if (id === curProject.id) { curProject.name = meta.name; renderProjectName(); }
      }
      renderProjects();
    };
    inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') finish(true); if (ev.key === 'Escape') { ev.stopPropagation(); finish(false); } });
    inp.addEventListener('blur', () => finish(true));
  } else if (act === 'del') {
    if (list.length === 1) { toast('This is your only project. Make another one first.'); return; }
    if (pjPending !== id) {
      pjPending = id; $$('#pjList .confirm').forEach(x => x.classList.remove('confirm')); li.classList.add('confirm');
      toast('Tap the red trash again to delete ' + meta.name + ' from this browser');
      clearTimeout(pjTimer); pjTimer = setTimeout(() => { pjPending = null; li.classList.remove('confirm'); }, 3000);
      return;
    }
    pjPending = null;
    PJ.del(id); PJ.saveIndex(list.filter(x => x.id !== id));
    if (id === curProject.id) { const next = PJ.index()[0]; curProject = { id: null, name: '' }; switchProject(next.id); openProjects(); }
    else renderProjects();
    toast('Deleted ' + meta.name);
  }
});
$('#pjCreateForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#pjName').value.trim() || 'Untitled site';
  createProject(name.slice(0, 80), $('#pjStart').value);
});
$('#projBtn').addEventListener('click', openProjects);
$('#pjClose').addEventListener('click', closeProjects);
$('#projSheet').addEventListener('click', e => { if (e.target.id === 'projSheet') closeProjects(); });

/* ---------------- GitHub: commit, auto-commit, Pages ---------------- */
const GH = { oauth: false, token: store.get('gh_token', ''), user: store.get('gh_user', null), busy: false, queued: false, timer: 0, state: 'off', msg: '' };
const b64 = str => btoa(unescape(encodeURIComponent(str)));
async function ghApi(path, opts = {}) {
  let res;
  try {
    res = await fetch('https://api.github.com' + path, {
      method: opts.method || 'GET',
      headers: Object.assign({ Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + GH.token, 'X-GitHub-Api-Version': '2022-11-28' }, opts.body ? { 'Content-Type': 'application/json' } : {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
  } catch (e) { const err = new Error('network'); err.status = 0; throw err; }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) { const err = new Error((data && data.message) || res.statusText); err.status = res.status; err.data = data; throw err; }
  return data;
}
function ghErrorText(e) {
  if (e.status === 0) return "Can't reach GitHub. Check your internet connection.";
  if (e.status === 401) return "GitHub didn't accept your token. Paste a new one in Publish.";
  if (e.status === 403) return 'Your token is missing a permission. Give it Contents, Pages and Administration (read and write).';
  if (e.status === 404) return 'GitHub says the repository was not found. Check the name, or give your token access to it.';
  if (e.status === 422) return 'GitHub refused: ' + (e.data && e.data.errors && e.data.errors[0] && (e.data.errors[0].message || e.data.errors[0].code) || e.message);
  return 'GitHub error: ' + e.message;
}
const ghRepoName = () => ghCfg.repo || slug(curProject.name);
const ghBranch = () => ghCfg.branch || 'main';
function ghSetState(state, msg) {
  GH.state = state; GH.msg = msg || '';
  ghRenderChip();
  const st = $('#ghStatus'); if (st) { st.textContent = GH.msg; st.className = 'gh-status ' + state; }
}
function ghRenderChip() {
  const b = $('#ghBtn');
  const connected = !!(GH.token && GH.user);
  let state = GH.state;
  if (!connected) state = 'off';
  else if (state === 'off') state = ghCfg.lastCommit ? 'ok' : 'idle';
  b.dataset.state = state;
  const tip = !connected ? 'Publish your site with GitHub' : state === 'busy' ? 'Committing to GitHub…' : state === 'err' ? GH.msg : ghCfg.lastCommit ? `Last commit ${ago(ghCfg.lastCommit.at)} to ${GH.user.login}/${ghRepoName()}` : 'Connected to GitHub. Nothing committed yet.';
  b.title = tip; b.setAttribute('aria-label', 'Publish. ' + tip);
}
function ghScheduleCommit(delay = 6000) {
  if (!GH.token || !GH.user || !ghCfg.auto) return;
  clearTimeout(GH.timer);
  GH.timer = setTimeout(() => ghCommit(), delay);
}
async function ghEnsureRepo() {
  const owner = GH.user.login, repo = ghRepoName();
  try { return await ghApi(`/repos/${owner}/${repo}`); }
  catch (e) {
    if (e.status !== 404) throw e;
    const r = await ghApi('/user/repos', { method: 'POST', body: { name: repo, description: curProject.name + ' (made with Pip Playground)', auto_init: true, private: false } });
    await new Promise(res => setTimeout(res, 1500));
    toast('Created the repository ' + r.full_name);
    return r;
  }
}
function ghTree() {
  const cur = {};
  files.forEach(f => { cur[f.name] = eds[f.id].ta.value; });
  if (!cur['README.md']) cur['README.md'] = `# ${curProject.name}\n\nMade with Pip Playground.\n`;
  cur['.nojekyll'] = '';
  return cur;
}
async function ghCommit(message) {
  clearTimeout(GH.timer);
  if (!GH.token || !GH.user) return false;
  if (GH.busy) { GH.queued = true; return false; }
  const cur = ghTree();
  const hashes = {}; Object.keys(cur).forEach(k => { hashes[k] = hashStr(cur[k]); });
  const last = ghCfg.last || {};
  const changed = Object.keys(hashes).filter(k => last[k] !== hashes[k] && files.some(f => f.name === k));
  const removed = Object.keys(last).filter(k => !(k in hashes));
  if (ghCfg.lastCommit && ghCfg.repoCommitted === ghRepoName() && !changed.length && !removed.length) { ghSetState('ok', 'Everything is already on GitHub.'); return true; }
  GH.busy = true; ghSetState('busy', 'Committing…');
  try {
    const owner = GH.user.login, repo = ghRepoName(), br = ghBranch();
    const info = await ghEnsureRepo();
    const branch = ghCfg.branch || info.default_branch || 'main';
    let baseSha = null;
    try { baseSha = (await ghApi(`/repos/${owner}/${repo}/git/ref/heads/${branch}`)).object.sha; }
    catch (e) { if (e.status !== 404 && e.status !== 409) throw e; }
    if (!baseSha) baseSha = (await ghApi(`/repos/${owner}/${repo}/contents/README.md`, { method: 'PUT', body: { message: 'Start project', content: b64(cur['README.md']), branch } })).commit.sha;
    const tree = await ghApi(`/repos/${owner}/${repo}/git/trees`, { method: 'POST', body: { tree: Object.entries(cur).map(([path, content]) => ({ path, mode: '100644', type: 'blob', content })) } });
    const msg = message || (!ghCfg.lastCommit || ghCfg.repoCommitted !== repo ? 'Upload ' + curProject.name : changed.length === 1 && !removed.length ? 'Update ' + changed[0]
      : changed.length || removed.length ? [changed.length ? `Update ${changed.length} ${changed.length === 1 ? 'file' : 'files'}` : '', removed.length ? 'delete ' + removed.join(', ') : ''].filter(Boolean).join(', ') : 'Save project');
    const commit = await ghApi(`/repos/${owner}/${repo}/git/commits`, { method: 'POST', body: { message: msg, tree: tree.sha, parents: [baseSha] } });
    await ghApi(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, { method: 'PATCH', body: { sha: commit.sha, force: true } });
    ghCfg.branch = branch; ghCfg.repo = repo; ghCfg.repoCommitted = repo;
    ghCfg.last = hashes; ghCfg.lastCommit = { sha: commit.sha, at: Date.now(), msg, url: commit.html_url };
    saveNow(true);
    ghSetState('ok', `Committed "${msg}" to ${owner}/${repo}.`);
    if (!$('#ghSheet').hidden) ghLoadCommits();
    return true;
  } catch (e) {
    ghSetState('err', ghErrorText(e));
    return false;
  } finally {
    GH.busy = false;
    if (GH.queued) { GH.queued = false; ghScheduleCommit(1500); }
  }
}
async function ghPublishPages() {
  if (!files.some(f => f.name === 'index.html')) { ghSetState('err', 'Add an index.html at the top level first. That is the page people see when they open your site.'); return; }
  const ok = await ghCommit(); if (!ok) return;
  ghSetState('busy', 'Turning on GitHub Pages…');
  const owner = GH.user.login, repo = ghRepoName();
  try {
    let r;
    try { r = await ghApi(`/repos/${owner}/${repo}/pages`, { method: 'POST', body: { source: { branch: ghBranch(), path: '/' } } }); }
    catch (e) { if (e.status === 409) r = await ghApi(`/repos/${owner}/${repo}/pages`); else throw e; }
    ghCfg.pagesUrl = (r && r.html_url) || `https://${owner}.github.io/${repo}/`;
    saveNow(true);
    ghSetState('ok', 'Your site is going online. The first build takes about a minute.');
    ghRender();
  } catch (e) { ghSetState('err', ghErrorText(e)); }
}
async function ghLoadCommits() {
  const box = $('#ghCommits'); if (!box || !GH.user) return;
  try {
    const list = await ghApi(`/repos/${GH.user.login}/${ghRepoName()}/commits?per_page=5`);
    box.innerHTML = list.map(c => `<li><code>${esc(c.sha.slice(0, 7))}</code><a href="${esc(c.html_url)}" target="_blank" rel="noopener">${esc(c.commit.message.split('\n')[0])}</a><span>${esc(ago(Date.parse(c.commit.author.date)))}</span></li>`).join('') || '<li>No commits yet.</li>';
  } catch (e) { box.innerHTML = `<li>${e.status === 404 || e.status === 409 ? 'No commits yet. Press Commit now to make the first one.' : esc(ghErrorText(e))}</li>`; }
}
function ghRender() {
  const connected = !!(GH.token && GH.user);
  $('#ghConnect').hidden = connected;
  $('#ghProject').hidden = !connected;
  $('#ghOauth').hidden = !GH.oauth;
  $('#ghOauthNote').textContent = GH.oauth
    ? "You'll go to GitHub, it asks if you allow Pip Playground to use your repositories, and then you come straight back here."
    : "GitHub sign-in isn't set up on this server, so use a token below. The README explains how to turn on the Connect with GitHub button.";
  if (!GH.oauth && !connected) $('#ghTokenWay').open = true;
  if (connected) {
    if (GH.user.avatar_url) $('#ghAvatar').src = GH.user.avatar_url + (GH.user.avatar_url.includes('?') ? '&' : '?') + 's=64';
    $('#ghLogin').textContent = GH.user.login;
    $('#ghOwner').textContent = GH.user.login + '/';
    $('#ghRepo').value = ghRepoName();
    $('#ghAuto').checked = !!ghCfg.auto;
    $('#ghLive').hidden = !ghCfg.pagesUrl;
    if (ghCfg.pagesUrl) { $('#ghUrl').href = ghCfg.pagesUrl; $('#ghUrl').textContent = ghCfg.pagesUrl; }
    $('#ghRepoLink').href = `https://github.com/${GH.user.login}/${ghRepoName()}`;
    const st = $('#ghStatus'); st.textContent = GH.msg || (ghCfg.lastCommit ? `Last commit ${ago(ghCfg.lastCommit.at)}: "${ghCfg.lastCommit.msg}"` : 'Nothing committed yet.'); st.className = 'gh-status ' + GH.state;
    ghLoadCommits();
  }
  ghRenderChip();
}
function openGh() { saveNow(); $('#ghErr').textContent = ''; ghRender(); $('#ghSheet').hidden = false; closeMenu(); }
function closeGh() { $('#ghSheet').hidden = true; }
$('#ghBtn').addEventListener('click', openGh);
$('#ghClose').addEventListener('click', closeGh);
$('#ghSheet').addEventListener('click', e => { if (e.target.id === 'ghSheet') closeGh(); });
$('#ghOauth').addEventListener('click', () => {
  saveNow(true);
  $('#ghOauth').textContent = 'Opening GitHub…';
  location.href = '/auth/github';
});
async function ghBoot() {
  let result = null;
  try { result = JSON.parse(localStorage.getItem('pip:gh_result')); localStorage.removeItem('pip:gh_result'); } catch (e) {}
  GH.token = store.get('gh_token', '');
  if (GH.token && !GH.user) {
    try { const u = await ghApi('/user'); GH.user = { login: u.login, avatar_url: u.avatar_url, name: u.name }; store.set('gh_user', GH.user); }
    catch (e) { if (e.status === 401) { GH.token = ''; store.set('gh_token', ''); if (result && result.ok) result = { error: "GitHub didn't accept the connection. Try again." }; } }
  }
  try { const r = await fetch('/api/config', { cache: 'no-store' }); GH.oauth = r.ok && (await r.json()).oauth === true; } catch (e) { GH.oauth = false; }
  ghRenderChip();
  if (result) {
    openGh();
    if (result.error) $('#ghErr').textContent = result.error;
    else if (GH.user) { toast('Connected to GitHub as ' + GH.user.login); bump('jump'); }
  }
}
$('#ghConnectForm').addEventListener('submit', async e => {
  e.preventDefault();
  const tok = $('#ghToken').value.trim();
  if (!tok) { $('#ghErr').textContent = 'Paste your token first.'; return; }
  GH.token = tok; $('#ghErr').textContent = ''; $('#ghConnectBtn').textContent = 'Checking…';
  try {
    const u = await ghApi('/user');
    GH.user = { login: u.login, avatar_url: u.avatar_url, name: u.name };
    store.set('gh_token', tok); store.set('gh_user', GH.user);
    $('#ghToken').value = '';
    GH.state = 'off'; ghRender(); toast('Connected to GitHub as ' + u.login);
  } catch (err) {
    GH.token = ''; $('#ghErr').textContent = err.status === 401 ? "That token didn't work. Check you copied all of it." : ghErrorText(err);
  } finally { $('#ghConnectBtn').textContent = 'Connect'; }
});
$('#ghLogout').addEventListener('click', () => {
  GH.token = ''; GH.user = null; store.set('gh_token', ''); store.set('gh_user', null);
  GH.state = 'off'; GH.msg = ''; ghRender(); toast('Disconnected. To remove Pip completely, revoke it in GitHub Settings > Applications.');
});
$('#ghRepo').addEventListener('change', e => {
  const r = slug(e.target.value); e.target.value = r;
  if (r !== ghCfg.repo) { ghCfg.repo = r; ghCfg.last = {}; ghCfg.lastCommit = null; ghCfg.pagesUrl = null; ghCfg.branch = null; ghCfg.repoCommitted = null; GH.msg = ''; saveNow(true); ghRender(); }
});
$('#ghAuto').addEventListener('change', e => { ghCfg.auto = e.target.checked; saveNow(true); if (ghCfg.auto) { toast('Every change will be committed a few seconds after you stop typing'); ghCommit(); } });
$('#ghDeploy').addEventListener('click', () => { saveNow(true); ghCommit(); });
$('#ghPages').addEventListener('click', () => { saveNow(true); ghPublishPages(); });
$('#ghZip').addEventListener('click', () => downloadProjectZip(curProject.id));
setInterval(ghRenderChip, 60000);

/* ---------------- boot ---------------- */
function openProject(p) {
  files.forEach(f => { if (eds[f.id]) eds[f.id].host.remove(); });
  Object.keys(eds).forEach(k => { delete eds[k]; });
  files = [];
  folders = (p.folders || []).filter(d => typeof d === 'string' && d);
  (p.files || []).forEach(x => { if (x && typeof x.name === 'string' && langOf(x.name) && !fileByName(x.name)) addFile(x.name, typeof x.content === 'string' ? x.content : '', x.id); });
  if (!htmlFiles().length) addFile('index.html', '');
  const pp = fileById(p.page);
  page = pp && pp.lang === 'html' ? pp.id : (fileByName('index.html') || htmlFiles()[0]).id;
  runtimeIssues = []; typoIssues = []; Ignored.clear(); Pet.known = new Set();
  linkMode = p.linkMode === 'manual' ? 'manual' : 'auto';
  renderLinkMode();
  active = fileById(p.active) ? p.active : page;
  renderTabs(); renderTree(); renderPageSel();
  setActive(active, true);
}
function loadProject() {
  const p = store.get('project', null);
  if (p && Array.isArray(p.files) && p.files.some(f => f && typeof f.name === 'string' && langOf(f.name) === 'html')) return p;
  const old = store.get('code', null);
  if (old && typeof old.html === 'string') return { files: [{ name: 'index.html', content: old.html }, { name: 'style.css', content: old.css || '' }, { name: 'script.js', content: old.js || '' }], folders: [] };
  return SAMPLE;
}
$('#autorun').checked = store.get('autorun', true);
const size = store.get('size', 'full');
$('#stage').dataset.size = size;
$$('#sizes button').forEach(x => x.setAttribute('aria-pressed', x.dataset.size === size));
loadIntoEditor(initProjects());
setView(store.get('view', 'split'));
setSplit(store.get('split', 50));
setPetOn(Pet.on);
setExplorer(narrow.matches ? false : store.get('explorer', innerWidth > 1000));
measure();
setWrap(store.get('wrap', matchMedia('(max-width:760px), (pointer:coarse)').matches));
autoRun();
ghBoot();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}
requestAnimationFrame(() => setTimeout(() => { runChecks(); placePet(); requestAnimationFrame(() => petWrap.classList.add('ready')); }, 0));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { const cw = M.cw; measure(); if (Math.abs(cw - M.cw) > 0.01 && eds[active]) { layoutEd(eds[active]); placePet(); } });
})();
