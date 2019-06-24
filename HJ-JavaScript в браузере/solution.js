'use strict'

const menu = document.querySelector('.menu'),
      commentsForm = document.querySelector('.comments__form'),
      currentImage = document.querySelector('.current-image'),
      imageLoader = document.querySelector('.image-loader'),
      wrap = document.querySelector('.wrap'),
      draw = document.querySelector('.draw'),
      share = document.querySelector('.share'),
      comments = document.querySelector('.comments'),
      comment = document.querySelector('.comment'),
      markerСheckbox = document.querySelector('.comments__marker-checkbox'),
      commentsForms = document.querySelectorAll('.comments__form'),
      marker = document.querySelector('.comments__marker'),
      menuUrl = menu.querySelector('.menu__url');

let flag = '';

marker.style.zIndex = 205;
markerСheckbox.style.zIndex = 206;
commentsForm.style.zIndex = 206;

menu.dataset.state = 'initial';
commentsForm.classList.add('tool');
currentImage.classList.add('tool');
document.querySelector('.burger').style.display = 'none';

//---------------  узел с  ошибкой  ---------------------
document.querySelector('.error').style.zIndex = 300;
const newError = document.querySelector('.error').cloneNode(true); 
newError.querySelector('.error__message').innerText = 'Чтобы загрузить новое изображение, пожалуйста, воспользуйтесь пунктом «Загрузить новое» в меню.';
wrap.appendChild(newError);
//----------------------------  скрытие исходной формы  -----------------------
const cloakOfInvisibility = document.createElement('div'); 
cloakOfInvisibility.classList.add('tool');  
wrap.appendChild(cloakOfInvisibility);
cloakOfInvisibility.appendChild(commentsForm);

//--------------=========== МАСКА CANVAS =============---------------

const mask = document.createElement('canvas'),
      ctx = mask.getContext('2d');
//ctx.globalCompositeOperation = 'source-out';

//mask.style.position = 'relative'; 
mask.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 200;`
//mask.style.zIndex = 200;    
ctx.strokeStyle = 'green';
wrap.appendChild(mask);
//width: ${currentImage.width * 2}px; height: ${currentImage.height * 2}px;
mask.width =  currentImage.width  * 3;
mask.height =  currentImage.height * 3;
//document.addEventListener('')

//--------------=========== МАСКА CANVAS COMMENT =============---------------

const maskCommentDiv = document.createElement('div'),
      maskComment = document.createElement('canvas'),
      ctxComment = maskComment.getContext('2d');
//ctxComment.globalCompositeOperation = 'source-out';

maskCommentDiv.width = currentImage.width;
maskCommentDiv.height = currentImage.height;
//maskCommentDiv.style.userSelect = 'none';

maskCommentDiv.style.cssText = `position: absolute; width: ${currentImage.width}px; height: ${currentImage.height}px; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 202;`
maskComment.style.cssText = 'position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 202;'
    
wrap.appendChild(maskCommentDiv);
maskCommentDiv.appendChild(maskComment);

 //----------------------============== ВЕБСОКЕТ ===============---------------------
 let socket;
function webSocket() {
     socket = new WebSocket('wss://neto-api.herokuapp.com/pic/' + getData.id);
            socket.addEventListener('open', () => {
                menuUrl.value = window.location.protocol + '//' + window.location.host + window.location.pathname + '?id=' + getData.id;             
                console.log('Вебсокет-соединение открыто');
                            
            })
    socket.addEventListener('close', () => {
      alert('Соединение разорвано');
      
    });

    socket.addEventListener('message', event => {
       // console.log(event.data, event.target, 'aaaaaaaaaaaaaaaas');
      const data = JSON.parse(event.data);
      //console.log(data);
      switch (data.event) {

        case 'pic':            
            currentImage.src = data.pic.url;
            
            currentImage.addEventListener('load',  function (e) {
               //console.log(e, 'eeee');
                if (data.pic.mask) {
                    //mask.src = data.pic.mask.url;        
                    mask.style.background = `url(${data.pic.mask})`;    
                }
                if (data.pic.comments) {   
                   // console.log(data.pic.comments, 'data.pic.comments');         
                        for (let comment in data.pic.comments) {
                            const loadedComment = {
                                message: comment.message,
                                left: comment.left,
                                top: comment.top
                            }                
                            //createComment(loadedComment, comment.parentNode.parentNode);
                        }                    
                }
            })
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
           //
            mask.style.background = `url(${data.url})`;
           // mask.src = data.url;       
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
document.querySelector('.new').insertBefore(fileLoad, document.querySelector('new-icon'));
//console.log(fileLoad);

//---------------  отображение изображения, проверка формата  ---------------
let isPic = '';
function updateFilesInfo(files) {
    const imageTypeRegExp =  /.(png|jpeg)+$/;
    
    Array.from(files).forEach((file) => {
       if (imageTypeRegExp.test(file.type)) {
            currentImage.src = URL.createObjectURL(file);
            currentImage.addEventListener('load', (event) => URL.revokeObjectURL(event.target.src));
            imgOnServer(file); 
            isPic = 'ok';           
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

//-----------------  загрузка перетаскиванием  ---------------

wrap.addEventListener('drop', (event) => {  
    event.preventDefault(); 
    if (isPic === 'ok') {        
        return newError.style.display = '';
    } 
    const files = Array.from(event.dataTransfer.files);   
    updateFilesInfo(files);        
});

wrap.addEventListener('dragover', (event) => {
    event.preventDefault();
});


//---------------========== ИЗОБРАЖЕНИЕ НА СЕРВЕР ============-----------------

let getData;

function imgOnServer(file) {
  
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
           // console.log(date);
            currentImage.classList.remove('tool');
            menu.dataset.state = 'default';
            imageLoader.style.display = "none";
            
            webSocket();
            
        })
      .catch(() => {
            alert('Ошибка при отправке изображения');           
      });
    
} 


//---------------============== КНОПКИ МЕНЮ =================--------------------

function dataStateClean() {
    document.querySelector('.menu').dataset.state = 'initial';   
    document.querySelectorAll('.menu__item').forEach(item => {
        item.dataset.state = '';        
    });
    [draw, comments, share].forEach((item) => item.style.display = 'none');     
    document.querySelector('.new').style.display = 'none';
}

let lastItem;
[draw, comments, share].forEach((item) => {    
    item.addEventListener('click', () => {
        document.querySelector('.burger').style.display = '';
        dataStateClean();
        item.dataset.state = 'selected';
        item.style.display = 'inline-block';  
        (draw.dataset.state === 'selected') ?  mask.style.zIndex = 203 : mask.style.zIndex = 200;   
    });   
});

document.querySelector('.burger').addEventListener('click', () => {
    dataStateClean();
    document.querySelector('.burger').style.display = 'none';
    document.querySelector('.menu').dataset.state = '';         
    [draw, comments, share].forEach((item) => item.style.display = 'inline-block');
    document.querySelector('.new').style.display = 'inline-block';  
});

//-----------------------------------  переключатели inputs  --------------------------------------------
 
function delChecked(arr) {
    arr.forEach(item => {
        if (item.hasAttribute('checked')) {
            item.removeAttribute('checked');
        }
    });
}

//---------------------------------  выбор кисти  ---------------------------
Array.from(document.querySelector('.draw-tools').children, (item) => {
    item.addEventListener('click', (event) => {
        delChecked(Array.from(document.querySelector('.draw-tools').children));
        event.target.setAttribute('checked', '');
        ctx.strokeStyle = event.target.getAttribute('value');      
    });
});

//--------------------------------  показать/скрыть комментарии  -----------------------------------------
function commentOnOff() {
Array.from(document.querySelectorAll('.menu__toggle'), (item) => {
    
    item.addEventListener('click', (event) => {
        delChecked(Array.from(document.querySelectorAll('.menu__toggle')));
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

//-------------------ОТПРАВКА РИСУНКА---------------------------
function sendMask() {    
	mask.toBlob(function (blob) {
		socket.send(blob);
		ctx.clearRect(0, 0, mask.width, mask.height);
	});
}

//----------========== ОБНОВЛЕНИЕ СТРАНИЦЫ ===========----------------------




//------------------------============= ПОДЕЛИТЬСЯ ===============-------------------------------------

document.querySelector('.menu_copy').addEventListener('click', function () {
    menuUrl.select();
    document.execCommand('copy');
});


let url = new URL(`${window.location.href}`);
let newId = url.searchParams.get('id');
urlId();

function urlId() {
	if (!newId) { return; }
    setReview(newId);

	menu.dataset.state = 'default';
	Array.from(menu.querySelectorAll('.mode')).forEach(mode => {
		if (!mode.classList.contains('comments')) { return; }
			
		menu.dataset.state = 'selected';
		mode.dataset.state = 'selected';
});
}


//=============================  КОММЕНТИРОВАНИЕ  ====================================

const content = document.querySelector('.comment__message');//чужой коммент
const submit = document.querySelector('.comments__submit');//кнопка ответить
const close = document.querySelector('.comments__close');//кнопка закрыть
const status = document.getElementsByClassName('.comment__time')[0];//время отправки
const input = document.querySelector('.comments__input');//ввод

document.querySelector('.comment .loader').style.display = 'none';

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
   
   webSocket();
   //var WebSocket = require('wss');
    currentImage.src = getData.url;
    currentImage.classList.remove('tool');
    document.querySelector('.burger').style.display = '';
   //// console.log(currentImage, 'currentImage');

    console.log(getData, 'getData');
	updateCommentForm(getData.comments);
}

function updateCommentForm(newComment) {
    if (!newComment) return;
    let showComments = {};
    console.log(newComment, 'new')
	Object.keys(newComment).forEach(id => {		
		console.log(newComment,'newComment');	
        showComments[id] = newComment[id];
        //console.log(showComments[id], 'showComments[id]');             

		Array.from(document.querySelectorAll('.comments__form'), (form) => {
			
			if (+form.dataset.left === showComments[id].left && +form.dataset.top === showComments[id].top) {
                form.querySelector('.loader').parentElement.style.display = 'none';
                //console.log(form, 'form')
				createComment(newComment[id], form);                 
                return;
            } 
           console.log(newComment[id], 'newComment[id]');
           createComment(newComment[id], createCommentForm(newComment[id].left + 20, newComment[id].top + 16));
           flag = 'ok';			     
        });
    });   
}

//------------------ВЫКЛ не активных форм комминтариев----------------------
// document.addEventListener('click', (event) => {
//     if (event.target.closest('.comments__marker-checkbox')) {
//         delChecked(document.querySelectorAll('.comments__marker-checkbox'));
//         event.target.setAttribute('checked', 's');
//     }
// });

maskComment.addEventListener('click', (event) => { 
    //console.log(event);    
    if(comments.dataset.state === 'selected' && document.querySelector('.menu__toggle').hasAttribute('checked'))  {        
       createCommentForm(event.offsetX, event.offsetY);//event.clientX, event.clientY);
    }
}); 

let count = 0;

function createCommentForm(left, top) {
   
    const newForm = commentsForm.cloneNode(true),
          newMarker = newForm.querySelector('.comments__marker-checkbox');
   
    newForm.classList.remove('tool');
    delChecked(Array.from(document.querySelectorAll('.comments__marker-checkbox')));   
    //wrap.insertBefore(newForm, cloakOfInvisibility);
    maskCommentDiv.appendChild(newForm);
    
    for (let i = 0; i < 3; i++) {            
        newForm.children[2].removeChild(newForm.children[2].querySelectorAll('.comment')[0]);        
    }
    newForm.style.left = left - 20 + 'px';
    newForm.style.top = top - 16 + 'px';
    //newForm.style.position = 'relative';
   commentOnOff();
   
   
   
   maskComment.addEventListener('click', () => {
        if(newForm && flag !== 'ok')  {        
            wrap.removeChild(newForm);
        }
    });     
      
   newForm.children[1].setAttribute('checked', '');
   
    newForm.querySelector('.comments__close').addEventListener('click', () => {
        newMarker.checked = false;
        if(flag !== 'ok') {
            wrap.removeChild(newForm);
        }
    });

    
    newMarker.addEventListener('click', (event) => {    
    event.stopPropagation(); 
    (event.target.hasAttribute('checked')) ? event.target.removeAttribute('checked') : (event.target.setAttribute('checked', '') && ++count);
    //if (event.target.closest('.comments__marker-checkbox')) {
    //     if(count > 1) {
    //         delChecked(Array.from(document.querySelectorAll('.comments__marker-checkbox').not(event.target)));
    //    }
    //     event.target.setAttribute('checked', '');
    // }
    });

    // newMarker.addEventListener('focus',  (event) => {
    //     event.target.setAttribute('checked', '');
    // });

    // newMarker.addEventListener('blur',  (event) => {
    //     event.target.removeAttribute('checked');
    // });

    newForm.addEventListener('submit',  (event) => {
        event.preventDefault();
        flag = 'ok';
        document.querySelector('.comment .loader').style.display = 'inline-block'; 
       // const date = new Date();   
        const commentData = {
            'message': newForm.querySelector('.comments__input').value,
            'left': parseInt(event.target.style.left),
            'top': parseInt(event.target.style.top),
            'timestamp': event.target.timestamp
        }
        
        //createComment(commentData, event.target);
        sendComment(commentData);
        newForm.querySelector('.comments__input').value = '';
    });
    return newForm;
}   

function sendComment(commentData) {
        
    fetch('https://neto-api.herokuapp.com/pic/' + getData.id + '/comments' , {
        method: 'POST',
        headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: `message=${encodeURIComponent(commentData.message)}&left=${encodeURIComponent(commentData.left)}&top=${encodeURIComponent(commentData.top)}`
     })
    .then(response => (200 <= response.status && response.status < 300) ? response : new Error(response.statusText))
   
    .then(response => response.json())
    .then(res => {
       // updateCommentForm(res);
        console.log(res,'resssssssssssssssss'); //nen
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
}




