'use strict'

const menu = document.querySelector('.menu'),
      menuToggle = document.querySelectorAll('.menu__toggle'),
      commentsForm = document.querySelector('.comments__form'),
      loadNew = document.querySelector('.new'),
      imageLoader = document.querySelector('.image-loader'),
      burger = document.querySelector('.burger'),
      wrap = document.querySelector('.wrap'),
      draw = document.querySelector('.draw'),
      share = document.querySelector('.share'),
      comments = document.querySelector('.comments'),
      comment = document.querySelector('.comment'),
      commentsOn = document.querySelector('#comments-on'),
      markerСheckbox = document.querySelector('.comments__marker-checkbox'),
      commentsForms = document.querySelectorAll('.comments__form'),
      marker = document.querySelector('.comments__marker'),
      menuUrl = menu.querySelector('.menu__url');     
let currentImage = document.querySelector('.current-image'),
    flag = '',
    socket,   
    imgWidth,
    imgHeight,    
    getData,
    isPic = '',
    showComments = {};
   
marker.style.zIndex = 205;
markerСheckbox.style.zIndex = 206;
commentsForm.style.zIndex = 206;
currentImage.src = '';

console.log(window.location.href, 'window.location.href'); 
console.log(window.location.pathname, 'window.location.pathname');
console.log(window.location.host, 'window.location.host');
console.log(window.location.host, 'window.location.host');
console.log(currentImage, 'currentImage');

//--------------=========== МАСКА CANVAS =============---------------

const mask = document.createElement('canvas'),
      ctx = mask.getContext('2d');
wrap.appendChild(mask);

//--------------=========== МАСКА CANVAS COMMENT =============---------------

const maskCommentDiv = document.createElement('div'),
      maskComment = document.createElement('canvas'),
      ctxComment = maskComment.getContext('2d');

wrap.appendChild(maskCommentDiv);
maskCommentDiv.appendChild(maskComment);

//----------------------------  скрытие исходной формы  -----------------------
const invisibility = document.createElement('div'); 
invisibility.classList.add('tool');  
wrap.appendChild(invisibility);
invisibility.appendChild(commentsForm);

//-------------------------  удаление исходных комментариев  -------------------
for (let i = 0; i < 3; i++) {            
    commentsForm.children[2].removeChild(commentsForm.children[2].querySelectorAll('.comment')[0]);        
}
//----------========== ОБНОВЛЕНИЕ СТРАНИЦЫ ===========---------------------------

let oldDataID;
let oldDataURL;
if (window.location.hash != '#open') {
    menu.dataset.state = 'initial';
    commentsForm.classList.add('tool');
    currentImage.classList.add('tool');
    burger.style.display = 'none';   
    oldDataID = null;
    oldDataURL = null;
    
} else {
    oldDataID = window.localStorage.getItem('getDataID');
    oldDataURL = window.localStorage.getItem('getDataURL');
    imgWidth = window.localStorage.getItem('imgWidth');
    imgHeight = window.localStorage.getItem('imgHeight');
    console.log( window.localStorage.getItem('imgHeight'), ' window.localStorage.getItem(imgHeight)');    
  
    menuUrl.value = window.location.protocol + '//' + window.location.host + window.location.pathname + '?id=' + oldDataID; 
    webSocket(oldDataID, oldDataURL);
    setReview(oldDataID);   
    isPic = 'yes';  
}
//--------------- размер масок при загрузке новых изображений -------------------
function reloadCanvasSize(imgWidth, imgHeight) {     
    mask.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 200;`    
    mask.width =  imgWidth * 3;
    mask.height =  imgHeight * 3;
    maskCommentDiv.width = imgWidth;
    maskCommentDiv.height = imgHeight;
    maskCommentDiv.style.cssText = `position: absolute; width: ${imgWidth}px; height: ${imgHeight}px; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 202;`
    maskComment.style.cssText = 'position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 202;'
    ctx.strokeStyle = getComputedStyle(document.querySelector(`.menu__color.green + span`)).backgroundColor; 
    console.log(currentImage, 'currentImagecurrentImage2');
console.log(currentImage.width, 'Width2');
}
//------------------ сброс прогресса при загрузке нового изображения -----------------------------------
function reloadImage()  {    
    oldDataID = null;
    oldDataURL = null; 
    
    ctx.clearRect(0, 0, currentImage.width, currentImage.height);     
    ctx.strokeStyle = getComputedStyle(document.querySelector(`.menu__color.green + span`)).backgroundColor;  
    Array.from(maskCommentDiv.querySelectorAll('.comments__form'), (form) => maskCommentDiv.removeChild(form));
}
//---------------  узел с  ошибкой  ---------------------
document.querySelector('.error').style.zIndex = 300;
const newError = document.querySelector('.error').cloneNode(true); 
newError.querySelector('.error__message').innerText = 'Чтобы загрузить новое изображение, пожалуйста, воспользуйтесь пунктом «Загрузить новое» в меню.';
wrap.appendChild(newError);

 //----------------------============== ВЕБСОКЕТ ===============---------------------

function webSocket(id, url) {
     socket = new WebSocket('wss://neto-api.herokuapp.com/pic/' + id);
            socket.addEventListener('open', () => {
                console.log(id, 'id');
                console.log(url, 'url');
                menuUrl.value = window.location.protocol + '//' + window.location.host + window.location.pathname + '?id=' + id; 
                
                if (oldDataURL == null) {
                    window.localStorage.setItem('getDataURL', `${url}`);
                }
                if (oldDataID == null) {
                    window.localStorage.setItem('getDataID', `${id}`);
                }
                console.log('Вебсокет-соединение открыто');                     
            })
    socket.addEventListener('close', (e) => {
      alert('Соединение разорвано');
      console.log('CLOSE: code: ' + e.code);
      
    });

    socket.addEventListener('message', event => {
       
      const data = JSON.parse(event.data);     
      switch (data.event) {

        case 'pic':           
           
                if (data.pic.mask) {                            
                    mask.style.background = `url(${data.pic.mask})`;    
                }
                if (data.pic.comments) {                               
                        for (let comment in data.pic.comments) {
                            const loadedComment = {
                                message: comment.message,
                                left: comment.left,
                                top: comment.top
                            }                               
                        }                    
                }
           
            break;

        case 'comment':
            const loadedCommentForm = {};    
            const loadedComment = data.comment;
            loadedCommentForm[loadedComment.id] = {};
            console.log(loadedCommentForm, 'loadedCommentForm');
            loadedCommentForm[loadedComment.id].left = loadedComment.left;
            loadedCommentForm[loadedComment.id].message = loadedComment.message;
            loadedCommentForm[loadedComment.id].timestamp = loadedComment.timestamp;
            loadedCommentForm[loadedComment.id].top = loadedComment.top;
            updateCommentForm(loadedCommentForm);             
            break;

        case 'mask':           
            mask.style.background = `url(${data.url})`;                 
            break;
      }
      console.log(data);
    });

    socket.addEventListener('error', error => {
         console.log(`Произошла ошибка: ${error.data}`);
    });
}


//---------------------========== ПЕРЕМЕЩЕНИЕ МЕНЮ ===========--------------------------------
let moved = null,
    posX = null, 
    posY = null; 

document.addEventListener('mousedown', (event) => {
    if (event.target.classList.contains('drag')) {  
        moved = event.target.parentNode;
        moved.style.pointerEvents = 'none';
        const bounds = event.target.getBoundingClientRect();
        posX = event.pageX - bounds.left - window.pageXOffset;
        posY = event.pageY - bounds.top - window.pageYOffset;      
    }
});

function menuMove(event) {
    let x = event.pageX - posX;
    let y = event.pageY - posY;
    const maxX = wrap.offsetLeft + wrap.offsetWidth - moved.offsetWidth,
          maxY = wrap.offsetTop + wrap.offsetHeight - moved.offsetHeight,
          minX = wrap.offsetLeft,
          minY = wrap.offsetTop;
    x = Math.min(x, maxX);
    y = Math.min(y, maxY);
    x = Math.max(x, minX);
    y = Math.max(y, minY);
    document.documentElement.style.setProperty('--menu-left', x + "px");
    document.documentElement.style.setProperty('--menu-top', y + "px");
}


document.addEventListener('mousemove', (event) => {
    if (moved != null) {
        event.preventDefault();        
        menuMove(event);        
    } 
});

document.addEventListener('mouseup', (event) => {    
            if (moved != null) {
                moved.style.pointerEvents = '';
                menuMove(event);                                  
                moved = null;
        }        
});

//-------------------=========== ЗАГРУЗКА ИЗОБРАЖЕНИЯ =============----------------------------------
//---------  новая кнопка input  -----------  
const fileLoad = document.createElement('input');
fileLoad.setAttribute('accept', "image/jpeg, image/png");
fileLoad.setAttribute('type', "file");
fileLoad.style.opacity = 0;
fileLoad.style.left = 0;
fileLoad.style.top = 0;
fileLoad.style.position = 'absolute';
fileLoad.style.width = '100%';
fileLoad.style.height = '100%';

fileLoad.classList.add('fileInput');
loadNew.insertBefore(fileLoad, document.querySelector('new-icon'));

//---------------  отображение изображения, проверка формата  ---------------


function updateFilesInfo(files) {
    const imageTypeRegExp =  /.(png|jpeg)+$/;
    
    Array.from(files).forEach((file) => {
       if (imageTypeRegExp.test(file.type)) {       
            currentImage.src = URL.createObjectURL(file);
            reloadCanvasSize(currentImage.width, currentImage.height);
            reloadImage();          
            currentImage.addEventListener('load', (event) => { 
                reloadImage();              
                URL.revokeObjectURL(event.target.src);                  
                
                window.localStorage.setItem('imgWidth', `${currentImage.width}`);
                window.localStorage.setItem('imgHeight', `${currentImage.height}`);                      
            });
            
            imgOnServer(file);          
            isPic = 'yes';           
       } 
        else {
            document.querySelector('.error').style.display = "";     
            isPic = '';      
        }
    });
}

Array.from(document.querySelectorAll('.error'), (err) => err.addEventListener('click', (event) => event.currentTarget.style.display = "none"));

document.querySelector('.fileInput').addEventListener('change', (event) => {   
       const files = event.currentTarget.files;
       updateFilesInfo(files);               
});
console.log(isPic, 'isPic');

//-----------------  загрузка перетаскиванием  ---------------

document.addEventListener('drop', (event) => {  
    event.preventDefault(); 
    if (isPic === 'yes') {        
        return newError.style.display = '';
    } 
    const files = Array.from(event.dataTransfer.files);   
    updateFilesInfo(files);        
});

wrap.addEventListener('dragover', (event) => {
    event.preventDefault();
});


//---------------========== ИЗОБРАЖЕНИЕ НА СЕРВЕР ============-----------------

function imgOnServer(file) {
    console.log(file, 'file');
    window.location.hash = 'open';
  let formData = new FormData();
       formData.append('title', file.name);
       formData.append('image', file);
       imageLoader.style.display = "";
    fetch('https://neto-api.herokuapp.com/pic', {
        method: 'POST',
        body: formData
    }).then(response => 
        (200 <= response.status && response.status < 300) ? response : new Error(response.statusText))
        
      .then(response =>  response.json())         
      .then((date) =>  {
            window.imgID = date.id;
         	setReview(date.id);	            
            mask.src = '';
            console.log(date);          
            
            menu.dataset.state = 'default';
            imageLoader.style.display = "none";
            
            webSocket(date.id, date.url);
            currentImage.classList.remove('tool');
        })
      .catch(() => {
            alert('Ошибка при отправке изображения');           
      });
    
} 


//---------------============== КНОПКИ МЕНЮ =================--------------------

function dataStateClean() {
    menu.dataset.state = 'initial';   
    document.querySelectorAll('.menu__item').forEach(item => {
        item.dataset.state = '';        
    });
    [draw, comments, share].forEach((item) => item.style.display = 'none');     
    loadNew.style.display = 'none';
}

let lastItem;
[draw, comments, share].forEach((item) => {    
    item.addEventListener('click', () => {
        burger.style.display = '';
        dataStateClean();
        item.dataset.state = 'selected';
        item.style.display = 'inline-block';  
        (draw.dataset.state === 'selected') ?  mask.style.zIndex = 203 : mask.style.zIndex = 200;   
    });   
});

burger.addEventListener('click', () => {
    dataStateClean();
    burger.style.display = 'none';
    menu.dataset.state = '';         
    [draw, comments, share].forEach((item) => item.style.display = 'inline-block');
    (JSON.stringify(window.location.href).indexOf('?id') != -1) ? loadNew.style.display = 'none' : loadNew.style.display = '';     
});

//-----------------------------------  переключатели inputs  --------------------------------------------
 
function delChecked(arr) {
    arr.forEach(item => {
        if (item.hasAttribute('checked')) {
            item.removeAttribute('checked');
        }
    });
}

//---------------------------------  выбор кисти  -----------------------------------------------------
Array.from(document.querySelector('.draw-tools').children, (item) => {
    if (item.hasAttribute('checked')) {              
        ctx.strokeStyle = getComputedStyle(document.querySelector(`.menu__color.green + span`)).backgroundColor;
    }
    item.addEventListener('click', (event) => {
        delChecked(Array.from(document.querySelector('.draw-tools').children));
        event.target.setAttribute('checked', '');        
        let color = '.' + event.target.getAttribute('value');        
        ctx.strokeStyle = getComputedStyle(document.querySelector(`.menu__color${color} + span`)).backgroundColor;         
    });
});

//--------------------------------  показать/скрыть комментарии  -----------------------------------------
function commentOnOff() {
    Array.from(menuToggle, (item) => {        
        item.addEventListener('click', (event) => {
            delChecked(Array.from(menuToggle));
            event.target.setAttribute('checked', '');
            
                if (item.value === 'on') {        
                    Array.from(document.querySelectorAll('.comments__form'), (item) => item.classList.remove('tool'));          
                } 
                if (item.value === 'off') {                
                    Array.from(document.querySelectorAll('.comments__form'), (item) => item.classList.add('tool'));
                }       
        });   
    });
}
commentOnOff();

//-----------------============ РИСОВАЛКА =============------------------------- 

let curves = [],
    drawing = false,
    needsRepaint = false;

const brush = 4;

function makePoint(x, y) {
	return [x, y];
};

mask.addEventListener("mousedown", (event) => {
	if (draw.dataset.state !== 'selected') return;
	drawing = true;

	const curve = []; 
	curve.color = ctx.strokeStyle;

	curve.push(makePoint(event.offsetX, event.offsetY)); 
	curves.push(curve); 
	needsRepaint = true;
});

mask.addEventListener("mouseup", () => { 
    drawing = false;
});

mask.addEventListener("mouseleave", () => {
	drawing = false;
});

mask.addEventListener("mousemove", () => {
	if (drawing) {
		const point = makePoint(event.offsetX, event.offsetY)
		curves[curves.length - 1].push(point);
		needsRepaint = true;
		debounced();
	}
});

const debounced = debounce(sendMask, 1000);

function repaint () {
	ctx.clearRect(0, 0, mask.width, mask.height);

	curves.forEach((curve) => {
		ctx.strokeStyle = curve.color;
		ctx.fillStyle = curve.color;

        ctx.beginPath();
        ctx.arc(...curve[0], brush / 2, 0, 2 * Math.PI);
        ctx.fill();
        
		smooth(curve);
	});
}

function smooth(points) {
	ctx.beginPath();
	ctx.lineWidth = brush;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	ctx.moveTo(...points[0]);

	for(let i = 1; i < points.length - 1; i++) {
        const cp = points[i].map((coord, idx) => (coord + points[i + 1][idx]) / 2);
	    ctx.quadraticCurveTo(...points[i], ...cp);       
	}
	ctx.stroke();
}

function tick() {
  if (needsRepaint) {
    repaint();
    needsRepaint = false;    
  }
  window.requestAnimationFrame(tick);
}
tick();

function debounce(callback, delay) {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(function() {
            timeout = null;
            callback();
      }, delay)
    }
  }
 
  function throttle(callback, delay) {
	let isWaiting = false;
	return function () {
		if (!isWaiting) {
			isWaiting = true;
			setTimeout(() => {
				callback();
				isWaiting = false;
			}, delay);
		}
	}
}

//--------------------------  ОТПРАВКА РИСУНКА  ---------------------------
function sendMask() {    
	mask.toBlob(function (blob) {
		socket.send(blob);
		ctx.clearRect(0, 0, mask.width, mask.height);
	});
}

//------------------------============= ПОДЕЛИТЬСЯ ===============-------------------------------------

document.querySelector('.menu_copy').addEventListener('click', function () {
    menuUrl.select();
    document.execCommand('copy');
});

let url = new URL(`${window.location.href}`);
console.log(url, 'url');
let newId = url.searchParams.get('id');
console.log(newId, 'newId');
urlId();

function urlId() {
	if (!newId) { return; }
    setReview(newId);

	menu.dataset.state = 'default';
	Array.from(menu.querySelectorAll('.mode')).forEach(mode => {
		if (!mode.classList.contains('comments')) return; 
			
		menu.dataset.state = 'selected';
		mode.dataset.state = 'selected';
    });
}

//=============================  КОММЕНТИРОВАНИЕ  ====================================

//----------------  О ФАЙЛЕ  ------------------

function setReview(id) {
	const xhrGetInfo = new XMLHttpRequest();
	xhrGetInfo.open(
		'GET',
		`https://neto-api.herokuapp.com/pic/${id}`,
		false
    );   
	xhrGetInfo.send();

    getData = JSON.parse(xhrGetInfo.responseText);
    console.log(getData,'getData');
    webSocket(getData.id, getData.url);
   
    currentImage.src = getData.url;

    imgWidth = window.localStorage.getItem('imgWidth');
    imgHeight = window.localStorage.getItem('imgHeight');
    ctx.strokeStyle = getComputedStyle(document.querySelector(`.menu__color.green + span`)).backgroundColor;  
    reloadCanvasSize(imgWidth, imgHeight); 
   
    currentImage.classList.remove('tool');
    burger.style.display = '';   
    console.log(getData.comments, 'getData.comments');  
  
    updateCommentForm(getData.comments); 
       
}

function updateCommentForm(newComment) {
    if (!newComment) return;    
    console.log(newComment, 'new');
	Object.keys(newComment).forEach(id => {	       		
        if (id in showComments) return;
        document.querySelector('.comments__form').style.left === (newComment[id].left + 'px');
        let needForm;
        Array.from(document.querySelectorAll('.comments__form')).forEach((form) => {
			if (form.style.left === (newComment[id].left + 'px') && form.style.top === (newComment[id].top + 'px')) {                
				needForm = form;
            } 
         });
         (needForm != undefined) ? createComment(newComment[id],  needForm) : createComment(newComment[id], createCommentForm(newComment[id].left + 20, newComment[id].top + 16));        
         return showComments[id] = newComment[id];
    });     
}

//------------------  ВЫКЛ не активных форм комминтариев  ----------------------
maskComment.addEventListener('click', (event) => {   
    removeForm();   
    if(comments.dataset.state === 'selected' && document.querySelector('.menu__toggle').hasAttribute('checked'))  {        
       createCommentForm(event.offsetX, event.offsetY);//event.clientX, event.clientY);    
    }
}); 


function removeForm() {
    let prevForm;    
    (maskCommentDiv.childNodes.length > 1) ? prevForm = maskCommentDiv.childNodes[maskCommentDiv.childNodes.length - 1] : prevForm = maskCommentDiv.lastChild.querySelector('.comments__form');   
    if(prevForm != null) {
        if(prevForm.flag !== 'ok')  {        
            maskCommentDiv.removeChild(prevForm);
        }        
        else { 
            prevForm.querySelector('.comments__marker-checkbox').checked = false;           
        }
    }
}

console.log(commentsForm, 'commentsForm');

function createCommentForm(left, top) {    
    const newForm = commentsForm.cloneNode(true),
          formLoader = newForm.querySelector('.comment .loader'),
          newMarker = newForm.querySelector('.comments__marker-checkbox');
    newForm.flag = '';
    console.log(newForm.flag, 'newForm.flag')
    formLoader.style.display = 'none';
    newForm.classList.remove('tool');    
    delChecked(Array.from(document.querySelectorAll('.comments__marker-checkbox')));       
    
    maskCommentDiv.appendChild(newForm);
   
    newForm.style.left = left - 20 + 'px';
    newForm.style.top = top - 16 + 'px';
    
    commentOnOff();
    (commentsOn.hasAttribute('checked')) ?  newForm.classList.remove('tool') : newForm.classList.add('tool');      
    newMarker.setAttribute('checked', '');
   
    newForm.querySelector('.comments__close').addEventListener('click', () => {
        newMarker.checked = false;
        if(newForm.flag !== 'ok') {
            maskCommentDiv.removeChild(newForm);
        }       
    });
    
    newMarker.addEventListener('click', (event) => {         
        (event.target.hasAttribute('checked')) ? event.target.removeAttribute('checked') : removeForm() && event.target.setAttribute('checked', '');
        maskCommentDiv.appendChild(newForm);    
    });
    
    newForm.addEventListener('submit',  (event) => {
        event.preventDefault();       
        formLoader.style.display = '';          
        const commentData = {
            'message': newForm.querySelector('.comments__input').value,
            'left': parseInt(event.target.style.left),
            'top': parseInt(event.target.style.top),
            'timestamp': event.target.timestamp
        }        
        sendComment(commentData);
        newForm.querySelector('.comments__input').value = '';        
        commentOnOff();
    });
    return newForm;
}   

function sendComment(commentData) {        
    fetch('https://neto-api.herokuapp.com/pic/' + (window.localStorage.getItem('getDataID') || getData.id) + '/comments' , {
        method: 'POST',
        headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: `message=${encodeURIComponent(commentData.message)}&left=${encodeURIComponent(commentData.left)}&top=${encodeURIComponent(commentData.top)}`
     })
    .then(response => (200 <= response.status && response.status < 300) ? response : new Error(response.statusText))   
    .then(response => response.json())
    .then(res => {       
        console.log(res,'sendComment_result'); 
    })
    .catch(() => {        
        alert('Ошибка при отправке комментария');
   })
}

function createComment(data, item) {
    const newComment = comment.cloneNode(true),
          loader = item.querySelector('.loader').parentNode,
          newDateTime = newComment.children[0],
          newMessage = newComment.children[1];

    newComment.style.top = (data.top) + 'px';
    newComment.style.left = (data.left) + 'px';
    newComment.dataset.top = data.top;
    newComment.dataset.left = data.left;
    let date;
    (data.timestamp != undefined) ? date = new Date(data.timestamp) : date = new Date();    

    const messageTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();    
    newDateTime.textContent = messageTime;

    newMessage.style.whiteSpace = 'pre';
    newMessage.textContent = data.message;
    

    item.children[2].insertBefore(newComment, loader);
    loader.style.display = 'none'; 
    item.flag = 'ok';
}




