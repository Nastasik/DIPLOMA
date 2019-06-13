'use strict'

const menu = document.querySelector('.menu'),
      commentsForm = document.querySelector('.comments__form'),
      currentImage = document.querySelector('.current-image'),
      imageLoader = document.querySelector('.image-loader'),
      wrap = document.querySelector('.wrap'),
      draw = document.querySelector('.draw'),
      share = document.querySelector('.share'),
      comments = document.querySelector('.comments');


menu.dataset.state = 'initial';
commentsForm.classList.add('tool');
currentImage.classList.add('tool');

//---------------узел с универсальной ошибкой---------------------
const newError = document.querySelector('.error').cloneNode(true); 
console.log(newError);
newError.querySelector('.error__message').innerText = 'Чтобы загрузить новое изображение, пожалуйста, воспользуйтесь пунктом «Загрузить новое» в меню.'


//---------------------------ПЕРЕМЕЩЕНИЕ МЕНЮ--------------------------------
let moved = null,
    posX = null, 
    posY = null; 

document.addEventListener('mousedown', (event) => {
    if (event.target.classList.contains('drag')) {      
        //console.log(menu);  
        moved = event.target.parentNode;
        //console.log(event.target.parentNode);
        moved.style.pointerEvents = 'none';
        const bounds = event.target.getBoundingClientRect();
        posX = event.pageX - bounds.left - window.pageXOffset;
        posY = event.pageY - bounds.top - window.pageYOffset;      
    }
    //console.log( moved);
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
        //console.log( moved);
        menuMove(event);        
    } 
});

document.addEventListener('mouseup', (event) => {    
            if (moved != null) {
                moved.style.pointerEvents = '';
                menuMove(event);
            //console.log( moved);                  
            moved = null;
        }        
});

//-------------------=========== ЗАГРУЗКА ИЗОБРАЖЕНИЯ =============----------------------------------
//---------новая кнопка input-----------  
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

//---------------отображение изображения, проверка формата---------------
function updateFilesInfo(files) {
    const imageTypeRegExp =  /.(png|jpeg)+$/;
    
    Array.from(files).forEach((file) => {
       if (imageTypeRegExp.test(file.type)) {
            currentImage.src = URL.createObjectURL(file);
            currentImage.addEventListener('load', (event) => URL.revokeObjectURL(event.target.src));
            imgOnServer(file);            
       } 
        else {
            document.querySelector('.error').style.display = "";
            document.querySelector('.fileInput').addEventListener('change', () => document.querySelector('.error').style.display = "none");
        }
    });
}

document.querySelector('.fileInput').addEventListener('change', (event) => {   
       const files = event.currentTarget.files;
       updateFilesInfo(files);               
              
    
});

//-----------------загрузка перетаскиванием---------------
wrap.addEventListener('drop', (event) => {  
    event.preventDefault();    
    const files = Array.from(event.dataTransfer.files);
    updateFilesInfo(files);    
});

wrap.addEventListener('dragover', (event) => {event.preventDefault()});


//---------------========== ИЗОБРАЖЕНИЕ НА СЕРВЕР ============-----------------BAD PART



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
            console.log(date)
            currentImage.classList.remove('tool');
            menu.dataset.state = 'default';
            imageLoader.style.display = "none";
            Array.from(document.querySelectorAll('.comments__form'), (item) => item.classList.remove('tool'));
            document.querySelector('.comments__form').style.display = 'none';

            const socket = new WebSocket('wss://neto-api.herokuapp.com/pic/' + date.id);
            socket.addEventListener('open', () => {
                document.querySelector('.menu__url').value = window.location.protocol + '//' + window.location.host + window.location.pathname + '?id=' + window.imgID;             
                console.log('Вебсокет-соединение открыто');
                webSocket(socket);
            })

      .catch((error) => {
        alert('Ошибка при отправке изображения');           
      });
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
        dataStateClean();
        item.dataset.state = 'selected';
        item.style.display = 'inline-block';    
    });   
});

document.querySelector('.burger').addEventListener('click', () => {
    dataStateClean();
    document.querySelector('.menu').dataset.state = '';         
    [draw, comments, share].forEach((item) => item.style.display = 'inline-block');
    document.querySelector('.new').style.display = 'inline-block';  
});

//-----------------------------------переключатели inputs--------------------------------------------
 
function delChecked(arr) {
    arr.forEach(item => {
        if (item.hasAttribute('checked')) {
            item.removeAttribute('checked');
        }
    });
}

Array.from(document.querySelector('.draw-tools').children, (item) => {
    item.addEventListener('click', (event) => {
        delChecked(Array.from(document.querySelector('.draw-tools').children));
        event.target.setAttribute('checked', '');
        ctx.strokeStyle = event.target.getAttribute('value');      
    });
});



Array.from(document.querySelectorAll('.menu__toggle'), (item) => {
    
    item.addEventListener('changed', (event) => {
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
//--------------=========== МАСКА CANVAS =============---------------
      const mask = document.createElement('canvas'),
            ctx = mask.getContext('2d');
      ctx.globalCompositeOperation = 'source-out';
      mask.width = wrap.offsetWidth;
      mask.height = wrap.offsetHeight;
      mask.style.position = 'relative'; 
      mask.style.zIndex = 200;    
      ctx.strokeStyle = 'green';
      wrap.appendChild(mask);
     


//-----------------------РИСОВАЛКА------------------------- новая линия липнет к старой


let currentAction = '',
    curves = [],
    needsRepaint = false;

 
mask.addEventListener("mouseleave", (event) => {
  curves = [];
  currentAction = '';
});

mask.addEventListener('mousedown', event => {
    if(draw.dataset.state === 'selected')  { 
        currentAction = 'down';
        curves.push(makeCurve(event.offsetX, event.offsetY));
    }
}); 

mask.addEventListener('mousemove', event => {
  if (! isButtonPressed(1, event.buttons)) { return; } 
  if (currentAction === 'down') {
    curves.push(makeCurve(event.offsetX, event.offsetY));     
    needsRepaint = true;
  }
});

const isButtonPressed = (buttonCode, pressed) => (pressed & buttonCode) === buttonCode;
const makeCurve = (x, y) => [x, y];


function repaint() {  
    ctx.beginPath();
    
    ctx.lineWidth = 4 +'px';
    ctx.lineJoin = 'round';
    ctx.lineCap  = 'round';   

    ctx.moveTo(curves[0], curves[1]);
    for (let i = 1; i <= curves.length - 1; i++) {
        ctx.lineTo(...curves[i]);    
    }
    ctx.stroke();
    ctx.closePath();  
}

function tick() {
  if (needsRepaint) {
    repaint();
    needsRepaint = false;
    //sendMask();
    debounce(sendMask, 2000);
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
 

//-------------------ОТПРАВКА РИСУНКА---------------------------
function sendMask() {

    // const sendPic = mask.toDataURL('image/png');    
    //  socket.send(sendPic.buffer)
	mask.toBlob(function (blob) {
		socket.send(blob);
		//ctx.clearRect(0, 0, mask.width, mask.height);
	});
}


//---------------ПОДЕЛИТЬСЯ----------------

document.querySelector('.menu_copy').addEventListener('click', function () {
    document.querySelector('.menu__url').select();
    document.execCommand('copy');
});


//-----------------------------КОММЕНТИРОВАНИЕ-----------------


const content = document.querySelector('.comment__message');//чужой коммент
const submit = document.querySelector('.comments__submit');//кнопка ответить
const close = document.querySelector('.comments__close');//кнопка закрыть
const status = document.getElementsByClassName('.comment__time')[0];//время отправки
const input = document.querySelector('.comments__input');//ввод
const comment = document.querySelector('.comment'), //оболочка сообщения и даты personal
      markerСheckbox = document.querySelector('.comments__marker-checkbox'),
      commentsForms = document.querySelectorAll('.comments__form'),
      marker = document.querySelector('.comments__marker');

marker.style.zIndex = 201;
markerСheckbox.style.zIndex = 202;
commentsForm.style.zIndex = 202;
document.querySelector('.comment .loader').style.display = 'none';

//----------------О ФАЙЛЕ------------------
function setReview(id) {
	const xhrGetInfo = new XMLHttpRequest();
	xhrGetInfo.open(
		'GET',
		`https://neto-api.herokuapp.com/pic/${id}`,
		false
	);
	xhrGetInfo.send();

	let dataGetParse = JSON.parse(xhrGetInfo.responseText);	

	updateCommentForm(dataGetParse.comments);
}

function updateCommentForm(newComment) {
    if (!newComment) return;
    let showComments = {};
	Object.keys(newComment).forEach(id => {		
			
        showComments[id] = newComment[id];
        console.log(showComments[id], 'showComments[id]');       
        //let needCreateNewForm = true;       

		Array.from(document.querySelectorAll('.comments__form'), (form) => {
			
			if (+form.dataset.left === showComments[id].left && +form.dataset.top === showComments[id].top) {
                form.querySelector('.loader').parentElement.style.display = 'none';
                console.log(form, 'form')
				createComment(newComment[id], form); 
                //needCreateNewForm = false;
                return;
            }            
        });
       // if (needCreateNewForm === true) {			
            // const result = createCommentForm();
			// createComment(newComment, result);
		//}
    });   
}

//------------------ВЫКЛ не активных форм комминтариев----------------------
document.addEventListener('click', (event) => {
    if (event.target.closest('.comments__marker-checkbox')) {
        Array.from(document.querySelectorAll('.comments__marker-checkbox'), (form) => {
            form.removeAttribute('checked');
        });
        event.target.closest('.comments__marker-checkbox').setAttribute('checked', '');
    }

});



markerСheckbox.addEventListener('click', (event) => {    
    event.stopPropagation(); 
    (event.target.hasAttribute('checked')) ? event.target.removeAttribute('checked') : event.target.setAttribute('checked', '');
});



mask.addEventListener('click', () => {
    if(comments.dataset.state === 'selected')  {        
       createCommentForm();
    }
}); 


function createCommentForm() {
   
    const newForm = commentsForm.cloneNode(true);
    newForm.style.display = 'block';
    delChecked(Array.from(document.querySelectorAll('.comments__marker-checkbox')));
   
    wrap.insertBefore(newForm, commentsForm);
    for (let i = 0; i < 3; i++) {            
        newForm.children[2].removeChild(newForm.children[2].querySelectorAll('.comment')[0]);        
    }
    newForm.style.left = (event.offsetX) - 20 + 'px';
    newForm.style.top = (event.offsetY) - 16 + 'px';
   
   commentOnOff();
   
   newForm.children[1].setAttribute('checked', '');

    newForm.querySelector('.comments__close').addEventListener('click', () => {
        newForm.querySelector('.comments__marker-checkbox').checked = false;
        wrap.removeChild(newForm);
    });

    newForm.addEventListener('submit',  (event) => {
        event.preventDefault();
        document.querySelector('.comment .loader').style.display = 'inline-block';    
        const commentData = {
            'message': newForm.querySelector('.comments__input').value,
            'left': parseInt(event.target.style.left),
            'top': parseInt(event.target.style.top),
            'timestamp': event.target.timestamp
        }
        createComment(commentData, event.target);
        sendComment(commentData);
        newForm.querySelector('.comments__input').value = '';
    });
    return newForm;
}   

function sendComment(commentData) {
        
    fetch('https://neto-api.herokuapp.com/pic/' + window.imgID + '/comments' , {
        method: 'POST',
        headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: `message=${encodeURIComponent(commentData.message)}&left=${encodeURIComponent(commentData.left)}&top=${encodeURIComponent(commentData.top)}`
     })
    .then(response => (200 <= response.status && response.status < 300) ? response : new Error(response.statusText))
   
    .then(response => response.json())
    .catch((error) => {        
        alert('Ошибка при отправке комментария');
   })
}

function createComment(data, item) {
    console.log(item, 'item');
    const newComment = comment.cloneNode(true),
          loader = item.querySelector('.loader').parentNode,
          newDateTime = newComment.children[0],
          newMessage = newComment.children[1];
    console.log(item.querySelector('.loader').parentNode, 'item.querySelectorparentNode');
    newComment.style.top = (data.top) + 'px';
    newComment.style.left = (data.left) + 'px';
    newComment.dataset.top = data.top;
    newComment.dataset.left = data.left;


    const date = new Date();
    const messageTime = data.timestamp || date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    newDateTime.textContent = messageTime;
    

    newMessage.style.whiteSpace = 'pre';
    newMessage.textContent = data.message;
    item.children[2].insertBefore(newComment, loader);
}


 //----------------------ВЕБСОКЕТ---------------------
function webSocket(socket) {
    
    socket.addEventListener('close', (event) => {
      alert('Соединение разорвано');
      
    });

    socket.addEventListener('message', event => {
        console.log(event.data);
      const data = JSON.parse(event.data);
      console.log(data);
      switch (data.event) {

        case 'pic':            
            currentImage.src = data.pic.url;
            
            currentImage.onload = function () {
                if (data.pic.mask) {
                    mask.src = data.pic.mask;            
                }
                if (data.pic.comments) {            
                        for (let comment in data.pic.comments) {
                            const loadedComment = {
                                message: comments[comment].message,
                                left: data.pic.comments[comment].left,
                                top: data.pic.comments[comment].top
                            }                
                            createComment(loadedComment, comment);
                        }                    
                }
            }
            break;

        case 'comment':
            const loadedCommentForm = {};    
            const loadedComment = data.comment;
            loadedCommentForm[loadedComment.id] = {};
            console.log(loadedCommentForm);
            loadedCommentForm[loadedComment.id].left = loadedComment.left;
            loadedCommentForm[loadedComment.id].message = loadedComment.message;
            loadedCommentForm[loadedComment.id].timestamp = loadedComment.timestamp;
            loadedCommentForm[loadedComment.id].top = loadedComment.top;
            updateCommentForm(loadedCommentForm);     
            break;

        case 'mask':
            mask.src = data.url;       
            break;
      }
      console.log(data);
    });

    socket.addEventListener('error', error => {
         console.log(`Произошла ошибка: ${error.data}`);
    });
}

