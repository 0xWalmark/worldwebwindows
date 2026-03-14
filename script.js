const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let greenSlots = [];
let bannerImage = new Image();
let currentToken = 0;

// scala tra canvas visualizzato e reale
function getCanvasScale() {
    return canvas.clientWidth / canvas.width;
}

function loadBanner(){
  let id = parseInt(document.getElementById("tokenId").value);
  if(isNaN(id) || id < 1 || id > 2400){
    alert("Token ID must be between 1 and 2400");
    return;
  }
  currentToken = id;

  bannerImage = new Image();
  bannerImage.onload = function(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(bannerImage,0,0);
    detectGreenSquares();
  };
  bannerImage.src = "images/"+id+".png";
}

function detectGreenSquares(){
  greenSlots = [];
  let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
  let data = imageData.data;

  for(let y=0;y<canvas.height;y+=96){
    for(let x=0;x<canvas.width;x+=96){
      let index = (y*canvas.width + x) * 4;
      let r = data[index];
      let g = data[index+1];
      let b = data[index+2];

      if(r===0 && g===255 && b===30){
        greenSlots.push({x,y});
      }
    }
  }
  createUploadInputs();
}

function createUploadInputs() {
  let area = document.getElementById("uploadArea");
  area.innerHTML = "";

  greenSlots.forEach((slot,i)=>{
    let container = document.createElement("div");

    let label = document.createElement("p");
    label.innerText = "Slot "+(i+1);

    let input = document.createElement("input");
    input.type = "file";

    input.onchange = (e)=>{
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.onload=function(ev){
        let img = new Image();
        img.onload = function(){
          let scale = getCanvasScale();
          // disegna sempre sulle coordinate originali, proporzionate alla scala del canvas visualizzato
          ctx.clearRect(slot.x, slot.y, 96, 96); // pulisce eventuali precedenti
          ctx.drawImage(img, slot.x, slot.y, 96, 96);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    container.appendChild(label);
    container.appendChild(input);
    area.appendChild(container);
  });
}

function downloadBanner(){
  // ricrea un canvas temporaneo reale per il download
  let tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = canvas.width;
  tmpCanvas.height = canvas.height;
  let tmpCtx = tmpCanvas.getContext("2d");

  // disegna il banner originale
  tmpCtx.drawImage(bannerImage,0,0);

  // ridisegna tutte le immagini caricate sui riquadri verdi
  let inputs = document.querySelectorAll("#uploadArea input");
  greenSlots.forEach((slot,i)=>{
    if(inputs[i] && inputs[i].files[0]){
      let file = inputs[i].files[0];
      let reader = new FileReader();
      reader.onload = function(ev){
        let img = new Image();
        img.onload = function(){
          tmpCtx.drawImage(img, slot.x, slot.y, 96, 96);
          // quando ultima immagine caricata, scarica
          if(i===greenSlots.length-1){
            let link = document.createElement("a");
            link.download = "worldwebwindows.png";
            link.href = tmpCanvas.toDataURL();
            link.click();
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    } else if(i===greenSlots.length-1){
      // se ultimi slot vuoti, scarica comunque
      let link = document.createElement("a");
      link.download = "worldwebwindows.png";
      link.href = tmpCanvas.toDataURL();
      link.click();
    }
  });
}
      if(r===0 && g===255 && b===30){
        greenSlots.push({x,y});
      }
    }
  }

  createUploadInputs();
}

function createUploadInputs() {
  let area = document.getElementById("uploadArea");
  area.innerHTML = "";

  greenSlots.forEach((slot, i) => {
    let container = document.createElement("div"); // div per griglia

    let label = document.createElement("p");
    label.innerText = "Slot " + (i+1);

    let input = document.createElement("input");
    input.type = "file";

    input.onchange = (e) => {
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.onload = function(ev) {
        let img = new Image();
        img.onload = function() {
          ctx.drawImage(img, slot.x, slot.y, 96, 96);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    container.appendChild(label);
    container.appendChild(input);
    area.appendChild(container);
  });
}

function downloadBanner(){
  let link = document.createElement("a");
  link.download = "worldwebwindows.png";
  link.href = canvas.toDataURL();
  link.click();
}
