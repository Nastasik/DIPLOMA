'use strict'

const menu = document.querySelector('.menu'),
      commentsForm = document.querySelector('.comments__form'),
      currentImage = document.querySelector('.current-image'),
      imageLoader = document.querySelector('.image-loader'),
      wrap = document.querySelector('.wrap');
//menu.classList.add('tool');
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
      // moved.classList.add('moving');
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

//-------------------ЗАГРУЗКА ИЗОБРАЖЕНИЯ----------------------------------
//---------кнопка input-----------  
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
            // currentImage.classList.remove('tool');
            // menu.dataset.state = 'default';
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


//---------------ИЗОБРАЖЕНИЕ НА СЕРВЕР-----------------BAD PART


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
        
      .then(response => {
          response.json();
          console.log(response.json);         
       })  
       
      .then(() =>  {
            currentImage.classList.remove('tool');
            menu.dataset.state = 'default';
            imageLoader.style.display = "none";
            webSoket();
      })

      .catch(() => {
           //imgLoader.style.display = "none";
            newError.style.display = "";
      })
} 


//---------------КНОПКИ МЕНЮ--------------------
function dataStateClean() {
    document.querySelector('.menu').dataset.state = 'initial';   
    document.querySelectorAll('.menu__item').forEach(item => item.dataset.state = '');
    document.querySelector('.menu').dataset.state = 'initial';   
    document.querySelector('.new').style.display = 'none';
}

// document.querySelectorAll('.comments .draw').forEach(item => item.addEventListener('click', (event) => {
//     dataStateClean();   
//     event.target.dataset.state = 'selected';
//     event.target.style.display = 'inline-block';   
// }))


document.querySelector('.comments').addEventListener('click', () => {
    dataStateClean();   
    document.querySelector('.comments').dataset.state = 'selected';
    document.querySelector('.comments').style.display = 'inline-block';   
});

document.querySelector('.draw').addEventListener('click', () => {
    dataStateClean();   
    document.querySelector('.draw').dataset.state = 'selected';
    document.querySelector('.draw').style.display = 'inline-block';   
});

document.querySelector('.share').addEventListener('click', () => {
    dataStateClean();   
    document.querySelector('.share').dataset.state = 'selected';
    document.querySelector('.share').style.display = 'inline-block';   
});

document.querySelector('.burger').addEventListener('click', () => {
    dataStateClean();
    document.querySelector('.menu').dataset.state = '';       
    document.querySelector('.new').style.display = 'inline-block';  
});


//--------------МАСКА CANVAS---------------
      const mask = document.createElement('canvas'),
            ctx = mask.getContext('2d');
      ctx.globalCompositeOperation = 'source-out';
      mask.width = wrap.offsetWidth;
      mask.height = wrap.offsetHeight;
      mask.style.zIndex = 100;      
      document.querySelector('.wrap').appendChild(mask);
     // ctx.drawImage(wrap, 0, 0);
      //mask.toBlob(done);
     //preview.src = URL.createObjectURL(mask);


//-----------------------РИСОВАЛКА-------------------------не доделала выбор кисти, картинка почему-то мешает рисовать

let currentAction = '',
    curves = [],
    needsRepaint = false;


Array.from(document.querySelectorAll('menu__color')).forEach(item => item.addEventListener('click', 
            (event) => {
                ctx.strokeStyle = event.target.getAttribute('value');                
            }, false));

mask.addEventListener("mouseleave", (event) => {
  curves = [];
  currentAction = '';
});

mask.addEventListener('mousedown', event => {
  currentAction = 'down';
  curves.push(makeCurve(event.offsetX, event.offsetY));
}); 

mask.addEventListener('mousemove', event => {
  if (! isButtonPressed(1, event.buttons)) { return; } 
  if (currentAction === 'down') {
    curves.push(makeCurve(event.offsetX, event.offsetY));     
    needsRepaint = true;
  }
});

const isButtonPressed = (buttonCode, pressed) => (pressed & buttonCode) === buttonCode;
const makeCurve = (x, y, reflect = false) => [x, y];


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
    sendPic();
  }
  window.requestAnimationFrame(tick);
}

tick();

//-------------------ОТПРАВКА РИСУНКА---------------------------

function sendPic() {    
    const sendPic = mask.toDataURL('image/png');    
    webSocket.send(sendPic.buffer);
}

//---------------ПОДЕЛИТЬСЯ----------------не работает пока, ссылка странная 

document.querySelector('.menu_copy').addEventListener('click', function () {
    document.querySelector('.menu__url').select();
    document.execCommand('copy');
});

//-----------------------------КОММЕНТИРОВАНИЕ-----------------

// const webSocket = new WebSocket('wss://neto-api.herokuapp.com/pic/${id}/comments');
// webSocket.addEventListener('open', open);
// webSocket.addEventListener('message', message);

// const content = document.querySelector('.comment__message');//чужой коммент
// const submit = document.querySelector('.comments__submit');//кнопка ответить
// const close = document.querySelector('.comments__close');//кнопка закрыть
// const status = document.getElementsByClassName('.comment__time')[0];//время отправки
// const input = document.querySelector('.comments__input');//ввод
// const personal = document.querySelector('.comment'); //оболочка сообщения и даты


